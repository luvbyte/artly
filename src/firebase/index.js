// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyChMjVbul3qBRNjcNGzIWt2GrD2HDDFXNI",
  authDomain: "artly-b7037.firebaseapp.com",
  projectId: "artly-b7037",
  storageBucket: "artly-b7037.firebasestorage.app",
  messagingSenderId: "988673885181",
  appId: "1:988673885181:web:ce9030a47491ca8d6a8f94"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
