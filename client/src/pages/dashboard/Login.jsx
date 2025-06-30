import { useDispatch } from "react-redux";
import { doSignInWithGoogle } from "../../firebase/auth";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { FormLogin } from "../../componentes/Dashboard/Users/FormLogin";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const dispatch = useDispatch();
  const onGoogleSignIn = async (e) => {
    e.preventDefault();
    dispatch(doSignInWithGoogle());
  };
  return (
    <div className="bg-gray-100 flex justify-center items-center h-screen">
      <div className="w-1/2 hidden lg:inline-flex h-full text-white">
        <div className="w-[550px] shadow-md shadow-gray-400 h-full bg-gray-800 px-10 flex flex-col gap-6 justify-center">
          <div className="flex flex-row justify-center items-center gap-2 border-b">
            <div className="flex flex-col">
              <h1 className="font-titleFont text-2xl font-bold">Bienvenido!</h1>
              <p className="text-base">
                Crea una cuenta para disfrutar de todos los beneficios
              </p>
            </div>
          </div>
          <div className="w-[300px] flex items-start gap-3">
            <span className="mt-1"></span>
            <p className="text-base text-gray-300">
              <span className="text-white font-semibold font-titleFont">
                Inicio rápido
              </span>
              <br />
              Regístrate y comienza a comprar en minutos.
            </p>
          </div>
          <div className="w-[300px] flex items-start gap-3">
            <span className="text-green-500 mt-1"></span>
            <p className="text-base text-gray-300">
              <span className="text-white font-semibold font-titleFont">
                Acceso a todos los servicios
              </span>
              <br />
              Disfruta de todos los servicios que ofrecemos.
            </p>
          </div>
          <div className="w-[300px] flex items-start gap-3">
            <span className="text-green-500 mt-1"></span>
            <p className="text-base text-gray-300">
              <span className="text-white font-semibold font-titleFont">
                Confiado por miles
              </span>
              <br />
              Únete a una comunidad de clientes satisfechos.
            </p>
          </div>
          <div className="w-[300px] flex items-start gap-3">
            <span className="text-green-500 mt-1"></span>
            <p className="text-base text-gray-300">
              <span className="text-white font-semibold font-titleFont">
                Historial de compras
              </span>
              <br />
              Accede a tus compras anteriores fácilmente.
            </p>
          </div>
          <div className="w-[300px] flex items-start gap-3">
            <span className="text-green-500 mt-1"></span>
            <p className="text-base text-gray-300">
              <span className="text-white font-semibold font-titleFont">
                Ofertas y descuentos exclusivos
              </span>
              <br />
              Recibe promociones y descuentos solo para miembros.
            </p>
          </div>
          <div className="flex items-center justify-between gap-2 mb-6">
            <Link to="/">
              <p className="text-sm font-semibold text-gray-300 hover:text-secondary cursor-pointer duration-300">
                © 2024 Espiga de oro.
              </p>
            </Link>
            <p className="text-sm font-semibold text-gray-300 hover:text-secondary cursor-pointer duration-300">
              Términos
            </p>
            <p className="text-sm font-semibold text-gray-300 hover:text-secondary cursor-pointer duration-300">
              Privacidad
            </p>
            <p className="text-sm font-semibold text-gray-300 hover:text-secondary cursor-pointer duration-300">
              Seguridad
            </p>
          </div>
        </div>
      </div>
      <div className="lg:p-36 md:p-52 sm:20 p-8 w-full h-full lg:w-1/2 flex justify-center gap-2 items-center flex-col">
        <h1 className="text-2xl font-semibold mb-4 text-center">Login</h1>
        <div className="mt-6 ml-10 mr-10 w-full">
          <FormLogin />
        </div>
        <div className="border p-0 border-gray-300 w-full mt-6"></div>
        <div className="mt-6 ml-10 mr-10 w-full">
          <button
            onClick={onGoogleSignIn}
            className="group h-12 w-full px-6 border-2 border-gray-300 rounded-full transition duration-300 hover:border-primary focus:bg-beige active:bg-beige"
          >
            <div className="relative flex items-center space-x-4 justify-center">
              <LazyLoadImage
                src="/google.webp"
                className="absolute left-0 w-5"
                alt="google logo"
              />
              <span className="flex w-max ml-1 font-semibold tracking-wide text-gray-700 text-sm transition duration-300 group-hover:text-blue-600 sm:text-base">
                Google
              </span>
            </div>
          </button>
        </div>
        {/* <div
          className="flex w-full mt-4
         justify-center items-center gap-2"
        >
          <span className="border border-gray-400 w-full"></span>
          <h3 className="text-sm text-gray-500 w-full text-center">
            O bien registrate
          </h3>
          <span className="border border-gray-400 w-full"></span>
        </div>
        <div className="mt-6 ml-10 mr-10 w-full">
          <button
            onClick={() => navigate("/register")}
            className="group h-12 w-full px-6 border-2 border-gray-300 rounded-full transition duration-300 hover:border-primary focus:bg-beige active:bg-beige"
          >
            <div className="relative flex items-center space-x-4 justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="absolute left-0 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z"
                />
              </svg>

              <span className="flex w-max ml-1 font-semibold tracking-wide text-gray-700 text-sm transition duration-300 group-hover:text-blue-600 sm:text-base">
                Registrate
              </span>
            </div>
          </button>
        </div>
        <div className="flex w-full mt-2  justify-center items-center gap-2">
          <span className="border border-gray-400 w-full"></span>

          <Link
            to={"/"}
            className="text-sm border border-gray-200 hover:border-beige hover:animate-pulse p-2 rounded-md text-gray-500 flex justify-center items-center gap-2 w-full text-nowrap"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="size-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m19.5 19.5-15-15m0 0v11.25m0-11.25h11.25"
              />
            </svg>
            Ir a la pagina principal
          </Link>
          <span className="border border-gray-400 w-full"></span>
        </div> */}
      </div>
    </div>
  );
};

export default Login;
