import firebase from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import messaging from '@react-native-firebase/messaging';
import firestore from '@react-native-firebase/firestore';

async function getFCMToken()
{
    return await messaging().getToken();
}

export { firebase, auth, messaging, firestore, getFCMToken };