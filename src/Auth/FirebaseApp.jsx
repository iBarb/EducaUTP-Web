import { initializeApp } from "firebase/app";

const firebaseConfig = {
    apiKey: "AIzaSyB_RlB_FCQQg1-n59UNXzB9duiHZfLGLdA",
    authDomain: "educautp.firebaseapp.com",
    projectId: "educautp",
    storageBucket: "educautp.appspot.com",
    messagingSenderId: "804707948008",
    appId: "1:804707948008:web:987cae001948e0a880405d"
};

// Initialize Firebase
const FirebaseApp = initializeApp(firebaseConfig);

export default FirebaseApp;