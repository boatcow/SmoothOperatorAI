import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/messaging';
import 'firebase/compat/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyDfsMZhRIP-LlkZMHT5BzhsSwj84sfY1r0",
    authDomain: "smooth-operator-715d9.firebaseapp.com",
    projectId: "smooth-operator-715d9",
    storageBucket: "smooth-operator-715d9.firebasestorage.app",
    messagingSenderId: "64633355371",
    appId: "1:64633355371:web:d19225ef20e85c351b052e",
    measurementId: "G-L6Q9NWL7NX"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging;
const firestore = firebase.firestore;
const auth = firebase.auth;

async function getFCMToken()
{
    const vapidKey = '';
    return await messaging().getToken({ vapidKey });
}

export { firebase, auth, messaging, firestore, getFCMToken };