/* 
  Delhi Private Tutors - Admin Setup Script 
  Run this from your terminal to grant admin access.
  Usage: node set-admin.js <UID> <EMAIL>
*/

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

const TARGET_UID = process.argv[2];
const TARGET_EMAIL = process.argv[3];

if (!TARGET_UID || !TARGET_EMAIL) {
  console.error('❌ ERROR: Missing arguments.');
  console.error('Usage: node set-admin.js <UID> <EMAIL>');
  process.exit(1);
}

// 1. Initialize the Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function grantAdmin() {
  console.log(`Attempting to grant admin access to: ${TARGET_EMAIL}...`);

  try {
    await db.collection('admins').doc(TARGET_UID).set({
      role: 'admin',
      email: TARGET_EMAIL,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log('--------------------------------------------------');
    console.log('✅ SUCCESS: Admin access granted!');
    console.log('You can now log in at the admin dashboard.');
    console.log('--------------------------------------------------');
    process.exit(0);
  } catch (error) {
    console.error('❌ ERROR granting admin access:', error.message);
    process.exit(1);
  }
}

grantAdmin();
