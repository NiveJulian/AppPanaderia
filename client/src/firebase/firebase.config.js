// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA2KDqwpiLd0gotq6-IbYM6lLhyHixwPmo",
  authDomain: "apppanaderia-f9f34.firebaseapp.com",
  projectId: "apppanaderia-f9f34",
  storageBucket: "apppanaderia-f9f34.appspot.com",
  messagingSenderId: "719123312352",
  appId: "1:719123312352:web:38e2025a1a121a6b62aa85",
  measurementId: "G-2DNWFNWQMH"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app)