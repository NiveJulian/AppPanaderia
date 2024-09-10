// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBDTUVxIDzowD27wZgrmOzfv5QUnA-4kUE",
  authDomain: "zeppelinstore-64f16.firebaseapp.com",
  projectId: "zeppelinstore-64f16",
  storageBucket: "zeppelinstore-64f16.appspot.com",
  messagingSenderId: "1005264134005",
  appId: "1:1005264134005:web:49a4b49076f4a49111bd3c",
  measurementId: "G-J7X2JRT79R"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app)