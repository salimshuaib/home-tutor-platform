/* 
  Delhi Private Tutors - Admin Setup Script 
  Run this from your terminal to grant admin access.
*/

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// 1. Initialize the Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// ━━━ UPDATE THESE TWO VALUES ━━━
const TARGET_UID = 'rAvulUH4dSPo2iDgWxpTMbfiLso2'; 
const TARGET_EMAIL = 'support@delhiprivatetutor.com';
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

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
    console.log('You can now log in at your-site.com/login.html');
    console.log('--------------------------------------------------');
  } catch (error) {
    console.error('❌ ERROR granting admin access:', error.message);
  } finally {
    process.exit();
  }
}

grantAdmin();
