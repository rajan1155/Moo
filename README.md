# Moo - Valentine's Web App

A special Valentine's Day web app built with Next.js, Tailwind CSS, Framer Motion, and Firebase.

## Setup

1. **Environment Variables**
   Create a `.env.local` file in the root directory and add your Firebase configuration and Admin email:

   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   
   # Admin Email for Dashboard Access
   NEXT_PUBLIC_ADMIN_EMAIL=your_email@example.com
   ```
   *(Note: The admin email is used to restrict access logic if needed, though currently the code relies on Firebase Auth. You should enable Email/Password provider in Firebase Console).*

2. **Firebase Rules**
   Go to your Firebase Console -> Firestore Database -> Rules:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read: if true;
         allow write: if request.auth != null;
       }
     }
   }
   ```
   
   For Storage Rules:
   ```
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /{allPaths=**} {
         allow read: if true;
         allow write: if request.auth != null;
       }
     }
   }
   ```

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

## Features
- **Puzzle Gate**: Slide puzzle to unlock the site.
- **Home**: Beautiful landing page.
- **Moods**: Letters for different moods.
- **Memories**: Photo gallery.
- **Voice**: Voice note player.
- **Valentine**: Interactive Yes/No page.
- **Admin**: Dashboard to manage content.

## Admin Access
Go to `/admin` (or click "pudu" on the puzzle page). Login with your Firebase account.
