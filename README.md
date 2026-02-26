# React Firebase Login

Minimal React app with Firebase authentication and ideas sharing.

## Features

- **Google Sign-In** - Login with Google account
- **Email/Password** - Traditional registration and login
- **Passwordless email link** - Login without password
- **Ideas** - Create and share ideas (public or private)
- **Public ideas** - Anyone can view public ideas on the home page

## Setup

### 1. Firebase Configuration

1. Create a project at [Firebase Console](https://console.firebase.google.com)
2. Go to **Authentication → Sign-in method** and enable:
   - Google
   - Email/Password
   - Email link (passwordless sign-in)
3. Go to **Firestore Database** and create a collection called `ideas`
4. Set Firestore rules:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if true;
       }
     }
   }
   ```
5. Go to **Project Settings** and copy your config
6. Add your domain to **Authentication → Settings → Authorized domains**

### 2. Environment Variables

Create a `.env` file in the project root:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 3. Vercel Deployment

The app is configured with `vercel.json` for SPA routing.

1. Connect your GitHub repo to Vercel
2. Add the environment variables in Vercel dashboard (Settings → Environment Variables)
3. Deploy

Or use CLI:
```bash
vercel
vercel --prod
```

## Development

```bash
npm install
npm run dev
```

## Routes

- `/` - Home page with public ideas (visible to everyone)
- `/login` - Login page with email/password and Google
- `/dashboard` - Protected route (requires authentication)

## Firestore Collection: ideas

```json
{
  "titulo": "string",
  "idea": "string",
  "public": boolean,
  "createdBy": "string (email)",
  "createdByName": "string",
  "timestamp": number
}
```

## Tech Stack

- React + Vite
- Tailwind CSS
- Firebase Auth
- Firebase Firestore
- React Router
