import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  }),
});

console.log(process.env.FIREBASE_PROJECT_ID);
console.log(process.env.FIREBASE_CLIENT_EMAIL);

const db = admin.firestore();

async function test() {
  const collections = await db.listCollections();

  console.log(
    "Collections:",
    collections.map(c => c.id)
  );
}

test();