import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBEYvzyPg-PFLYmnKBS-9d0Ej-0VPEkWWk",
  authDomain: "hsfinance-df2bd.firebaseapp.com",
  projectId: "hsfinance-df2bd",
  storageBucket: "hsfinance-df2bd.firebasestorage.app",
  messagingSenderId: "162603673945",
  appId: "1:162603673945:web:18462f1550e1d3a051c448",
  measurementId: "G-06Q3RKZG51"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);


