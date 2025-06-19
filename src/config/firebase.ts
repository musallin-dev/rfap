import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyBh-RaVPc6MfeqtbOEvOg1Oc8bBoP4bmno",
  authDomain: "rfap-d5ed5.firebaseapp.com",
  databaseURL: "https://rfap-d5ed5-default-rtdb.firebaseio.com",
  projectId: "rfap-d5ed5",
  storageBucket: "rfap-d5ed5.firebasestorage.app",
  messagingSenderId: "212321923250",
  appId: "1:212321923250:web:99be7a90e88483d93059ab",
  measurementId: "G-LL0K9Z24GN"
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
export default app;