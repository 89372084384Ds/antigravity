// js/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBwCT_-Hi_gcL_wIhZoQwGnJ5fGdjt1m7s",
    authDomain: "report-8e1ff.firebaseapp.com",
    projectId: "report-8e1ff",
    storageBucket: "report-8e1ff.firebasestorage.app",
    messagingSenderId: "759119356704",
    appId: "1:759119356704:web:2985510863dcab511eed45"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
