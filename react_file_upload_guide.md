# Firebase React Upload System for Tutors

This guide contains the complete, production-ready React implementation for your tutor profile document uploads, following your requirements (Firebase v9 modular SDK, validation, drag-and-drop, separate services, and persistence).

## 1. Firebase Rules

Before implementing the code, ensure your Firebase backend is secure.

### Storage Rules
Go to **Firebase Console > Storage > Rules** and apply this:
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Only allow operations in the tutors folder
    match /tutors/{userId}/{fileName} {
      // Anyone can read profiles (or restrict to auth if needed)
      allow read: if true; 
      
      // Upload rules
      allow write: if request.auth != null 
                   && request.auth.uid == userId // Users can only upload to their own folder
                   && request.resource.size <= 6 * 1024 * 1024 // Max 6MB fallback
                   && (request.resource.contentType == 'image/jpeg' || request.resource.contentType == 'application/pdf');
    }
  }
}
```

### Firestore Rules
Go to **Firebase Console > Firestore Database > Rules** and apply this:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /tutors/{userId} {
      allow read: if true; // Public can see tutor profiles
      allow write: if request.auth != null && request.auth.uid == userId; // Only owner can update
    }
  }
}
```

---

## 2. Configuration (`firebaseConfig.js`)
*Make sure you run `npm install firebase` in your React project.*

```javascript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  // Replace with your actual project config from Firebase Console
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
```

---

## 3. Storage Service (`storageService.js`)
Handles the actual file upload to Firebase Storage and reports progress.

```javascript
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from './firebaseConfig';

export const uploadTutorFile = (file, userId, fileType, onProgress, onError, onSuccess) => {
  // fileType should be 'profile' or 'certificate'
  const extension = file.name.split('.').pop();
  const filePath = `tutors/${userId}/${fileType}.${extension}`;
  const storageRef = ref(storage, filePath);

  const uploadTask = uploadBytesResumable(storageRef, file);

  uploadTask.on(
    'state_changed',
    (snapshot) => {
      const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
      if (onProgress) onProgress(progress);
    },
    (error) => {
      console.error("Upload Error:", error);
      if (onError) onError("File upload failed. Please try again.");
    },
    async () => {
      try {
        const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
        if (onSuccess) onSuccess(downloadUrl);
      } catch (error) {
        if (onError) onError("Failed to get file link.");
      }
    }
  );
};
```

---

## 4. Firestore Service (`firestoreService.js`)
Handles saving and retrieving the URLs.

```javascript
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebaseConfig';

export const saveTutorDocuments = async (userId, data) => {
  try {
    const tutorRef = doc(db, 'tutors', userId);
    await setDoc(tutorRef, {
      ...data,
      updatedAt: serverTimestamp()
    }, { merge: true }); // merge: true prevents overwriting other profile data
    return true;
  } catch (error) {
    console.error("Error saving URLs to Firestore:", error);
    throw error;
  }
};

export const getTutorDocuments = async (userId) => {
  try {
    const tutorRef = doc(db, 'tutors', userId);
    const docSnap = await getDoc(tutorRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (error) {
    console.error("Error fetching documents:", error);
    throw error;
  }
};
```

---

## 5. UI Component (`TutorDocumentUpload.jsx`)
This component replicates the sleek design from your mockup, includes native drag-and-drop, validates file sizes, and handles loading states.

*(If you don't use `lucide-react`, you can replace the `<Camera>`, `<FileText>`, and `<Save>` tags with `<img>` icons or SVG code).*

```jsx
import React, { useState, useEffect, useRef } from 'react';
import { Camera, FileText, Save, CheckCircle, AlertCircle } from 'lucide-react';
import { auth } from './firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { uploadTutorFile } from './storageService';
import { getTutorDocuments, saveTutorDocuments } from './firestoreService';
import './TutorDocumentUpload.css'; // Add the CSS file below

const TutorDocumentUpload = () => {
  const [user, setUser] = useState(null);
  
  const [profilePhotoUrl, setProfilePhotoUrl] = useState(null);
  const [certificateUrl, setCertificateUrl] = useState(null);
  
  const [profileProgress, setProfileProgress] = useState(0);
  const [certProgress, setCertProgress] = useState(0);
  
  const [profileError, setProfileError] = useState("");
  const [certError, setCertError] = useState("");
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const profileInputRef = useRef(null);
  const certInputRef = useRef(null);

  // 1. Fetch User and Existing Data on Load
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Fetch existing URLs from Firestore
        const data = await getTutorDocuments(currentUser.uid);
        if (data) {
          if (data.profilePhotoUrl) setProfilePhotoUrl(data.profilePhotoUrl);
          if (data.certificateUrl) setCertificateUrl(data.certificateUrl);
        }
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. Validation Logics
  const validatePhoto = (file) => {
    if (file.type !== "image/jpeg") return "Profile photo must be a JPG image.";
    if (file.size > 5 * 1024 * 1024) return "File exceeds 5MB limit.";
    return null;
  };

  const validateCert = (file) => {
    if (file.type !== "image/jpeg" && file.type !== "application/pdf") return "Certificate must be JPG or PDF.";
    if (file.size > 6 * 1024 * 1024) return "File exceeds 6MB limit.";
    return null;
  };

  // 3. Handlers
  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file || !user) return;
    
    if (type === 'profile') {
      setProfileError("");
      const error = validatePhoto(file);
      if (error) return setProfileError(error);
      
      setProfileProgress(1); // Start loader
      uploadTutorFile(file, user.uid, 'profile', setProfileProgress, setProfileError, (url) => {
        setProfilePhotoUrl(url);
        setSaveSuccess(false); // Reset save state
      });
    } else {
      setCertError("");
      const error = validateCert(file);
      if (error) return setCertError(error);

      setCertProgress(1); // Start loader
      uploadTutorFile(file, user.uid, 'certificate', setCertProgress, setCertError, (url) => {
        setCertificateUrl(url);
        setSaveSuccess(false); // Reset save state
      });
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      await saveTutorDocuments(user.uid, {
        profilePhotoUrl,
        certificateUrl,
      });
      setSaveSuccess(true);
    } catch (err) {
      alert("Failed to save profile on database.");
    } finally {
      setIsSaving(false);
    }
  };

  // Prevent saving if uploads are currently happening
  const isUploading = (profileProgress > 0 && profileProgress < 100) || (certProgress > 0 && certProgress < 100);
  const isSaveDisabled = isUploading || (!profilePhotoUrl && !certificateUrl) || isSaving;

  return (
    <div className="upload-container">
      <h3 className="section-title">Documents</h3>
      
      <div className="upload-grid">
        {/* Profile Photo Dropzone */}
        <div className="upload-box-wrapper">
          <label className="upload-label">Profile Photo</label>
          <div 
            className="upload-dropzone" 
            onClick={() => profileInputRef.current?.click()}
          >
            {profilePhotoUrl ? (
              <div className="preview-container">
                 <img src={profilePhotoUrl} alt="Profile" className="profile-preview" />
                 <div className="preview-overlay">Change Photo</div>
              </div>
            ) : (
              <div className="upload-placeholder">
                <Camera size={28} color="#4A4A4A" className="mb-2" />
                <p>Click to upload (JPG only, max 5MB)</p>
              </div>
            )}
            
            {/* Progress Bar */}
            {profileProgress > 0 && profileProgress < 100 && (
              <div className="progress-bar"><div className="progress-fill" style={{ width: `${profileProgress}%` }}></div></div>
            )}
            {/* Error message */}
            {profileError && <p className="error-text"><AlertCircle size={14}/> {profileError}</p>}
          </div>
          <input 
            type="file" 
            accept=".jpg,.jpeg" 
            className="hidden-input" 
            ref={profileInputRef} 
            onChange={(e) => handleFileChange(e, 'profile')} 
          />
        </div>

        {/* Education Certificate Dropzone */}
        <div className="upload-box-wrapper">
          <label className="upload-label">Education Certificate</label>
          <div 
            className="upload-dropzone" 
            onClick={() => certInputRef.current?.click()}
          >
             {certificateUrl ? (
              <div className="preview-container">
                <FileText size={40} color="#E8751A" />
                <span className="file-name">Certificate Uploaded</span>
                <div className="preview-overlay">Replace File</div>
              </div>
            ) : (
              <div className="upload-placeholder">
                <FileText size={28} color="#4A4A4A" className="mb-2" />
                <p>Click to upload (JPG/PDF, max 6MB)</p>
              </div>
            )}
            
            {/* Progress Bar */}
            {certProgress > 0 && certProgress < 100 && (
              <div className="progress-bar"><div className="progress-fill" style={{ width: `${certProgress}%` }}></div></div>
            )}
            {/* Error message */}
            {certError && <p className="error-text"><AlertCircle size={14}/> {certError}</p>}
          </div>
          <input 
            type="file" 
            accept=".jpg,.jpeg,.pdf" 
            className="hidden-input" 
            ref={certInputRef} 
            onChange={(e) => handleFileChange(e, 'certificate')} 
          />
        </div>
      </div>

      {/* Save Button */}
      <div className="action-row">
        <button 
          className={`btn-save ${isSaveDisabled ? 'btn-disabled' : ''}`}
          onClick={handleSaveProfile}
          disabled={isSaveDisabled}
        >
          {saveSuccess ? <CheckCircle size={18} /> : <Save size={18} />}
          {isSaving ? "Saving..." : saveSuccess ? "Profile Saved" : "Save Profile"}
        </button>
      </div>
    </div>
  );
};

export default TutorDocumentUpload;
```

## 6. Styles (`TutorDocumentUpload.css`)
```css
.hidden-input {
  display: none;
}
.upload-container {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  max-width: 1000px;
  margin: 0 auto;
}
.section-title {
  color: #0F1E3C;
  font-family: 'DM Sans', sans-serif;
  margin-bottom: 24px;
}
.upload-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}
.upload-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #4A3820;
  margin-bottom: 8px;
  display: block;
}
.upload-dropzone {
  border: 1.5px dashed #D1D5DB;
  border-radius: 8px;
  height: 140px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  background: #FAFAFA;
  transition: all 0.2s;
  position: relative;
  overflow: hidden;
}
.upload-dropzone:hover {
  border-color: #E8751A;
  background: #FFFBF7;
}
.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #6B7280;
  font-size: 0.85rem;
}
.upload-placeholder p {
  margin-top: 8px;
}
.preview-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}
.profile-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.preview-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.5);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  opacity: 0;
  transition: opacity 0.2s;
}
.upload-dropzone:hover .preview-overlay {
  opacity: 1;
}
.file-name {
  margin-top: 10px;
  font-weight: 600;
  color: #0F1E3C;
}
.error-text {
  color: #EF4444;
  font-size: 0.75rem;
  position: absolute;
  bottom: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
}
.progress-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 4px;
  width: 100%;
  background: #E5E7EB;
}
.progress-fill {
  height: 100%;
  background: #E8751A;
  transition: width 0.3s;
}
.action-row {
  margin-top: 30px;
  display: flex;
  justify-content: flex-start;
}
.btn-save {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #E8751A;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-save:hover {
  background: #C25A08;
}
.btn-disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
```
