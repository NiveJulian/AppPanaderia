import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { auth } from "./firebase.config";
import store from "../redux/store";
import {
  createSeller,
  createUser,
  loginWithGoogle,
} from "../redux/actions/authActions";
import CryptoJS from "crypto-js";
import toast from "react-hot-toast";

export const doSignInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const token = await result.user.getIdToken();

    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/login/third`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      // body: JSON.stringify({ token: token }), // Ya no es necesario
    });

    if (response.ok) {
      toast.success("Ingreso exitoso, redirigiendo..");
      const { user } = await response.json(); // El backend responde con { user }
      const { photoURL } = result.user;
      const userInfo = {
        uid: user.id, // el campo es 'id' en MySQL/Prisma
        email: user.email,
        name: user.name,
        picture: photoURL,
        rol: user.role, // el campo es 'role' en MySQL/Prisma
      };
      const secretKey = import.meta.env.VITE_SECRET_KEY_BYCRYPT;

      const hashedUserInfo = CryptoJS.AES.encrypt(
        JSON.stringify(userInfo),
        secretKey
      ).toString();

      sessionStorage.setItem("user", hashedUserInfo);
      localStorage.setItem("authToken", token);

      store.dispatch(loginWithGoogle(userInfo));

      setTimeout(() => {
        if (user.role === "vendedor" || user.role === "admin") {
          window.location.replace(`/dashboard/${user.id}`);
        } else {
          window.location.replace("/");
        }
      }, 2000);
    } else {
      toast.error("Error al ingresar");
      throw new Error("Error al enviar el token al backend");
    }
  } catch (error) {
    console.error("Error:", error.message);
    toast.error("Error al ingresar");
  }
};

export const doSignInWithEmailAndPassword = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    const token = await user.getIdToken();

    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/login/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token: token }),
    });

    if (response.ok) {
      toast.success("Ingreso exitoso, redirigiendo..");
      const sellerData = await response.json();
      console.log(sellerData);
      let userInfo;
      if (sellerData.role === "admin") {
        userInfo = {
          uid: sellerData.id,
          email: sellerData.email,
          name: sellerData.name,
          address: sellerData.address,
          province: sellerData.province,
          postalCode: sellerData.postalCode,
          rol: sellerData.role,
        };
      } else {
        userInfo = {
          uid: sellerData.id,
          email: sellerData.email,
          name: sellerData.name,
          rol: sellerData.role,
        };
      }

      const secretKey = import.meta.env.VITE_SECRET_KEY_BYCRYPT;

      const hashedUserInfo = CryptoJS.AES.encrypt(
        JSON.stringify(userInfo),
        secretKey
      ).toString();

      sessionStorage.setItem("user", hashedUserInfo);
      localStorage.setItem("authToken", token);

      store.dispatch(loginWithGoogle(userInfo));

      console.log(sellerData);

      setTimeout(() => {
        if (sellerData.role === "seller" || sellerData.role === "admin") {
          window.location.replace(`/dashboard/${sellerData.id}`);
        } else {
          window.location.replace("/");
        }
      }, 2000);
    } else {
      toast.error("Error al ingresar");
      throw new Error("Error al enviar el token al backend");
    }
  } catch (error) {
    console.error("Error al ingresar:", error);
    toast.error("Error al ingresar");
  }
};

export const createNewSeller = async (newSeller) => {
  try {
    const { email, nombre, password, role } = newSeller;
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Despacha la acción para crear el usuario en tu backend y guardarlo en Google Sheets
    store.dispatch(createSeller(user.email, nombre, user.uid, role));

    toast.success("Usuario creado exitosamente");
  } catch (error) {
    console.log("Error al crear nuevo vendedor:", error);
    toast.error("Error al crear nuevo vendedor");
  }
};

export const createNewUser = async (newUser) => {
  try {
    const { name, state, postalCode, address, email, password, role } = newUser;
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    let data = {
      uid: user.uid,
      email: user.email,
      name,
      address,
      state,
      postalCode,
      role,
    };
    // Despacha la acción para crear el usuario en tu backend y guardarlo en Google Sheets
    store.dispatch(createUser(data));

    toast.success("Usuario creado exitosamente");
  } catch (error) {
    console.log(error);
    toast.error("Error al crear nuevo usuario");
  }
};

export const doSignOut = async () => {
  try {
    // Eliminar datos de sessionStorage y localStorage
    sessionStorage.removeItem("user");
    localStorage.removeItem("authToken");

    // Cerrar la sesión con Firebase Auth
    await signOut(auth)
      .then(() => {
        // Sign-out successful.
        toast.success("Saliendo...");
      })
      .catch((error) => {
        // An error happened.
        toast.error("Error");
        console.log(error);
      });
    // Redireccionar a la página de inicio de sesión u otra página
    window.location.replace("/");
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
  }
};
