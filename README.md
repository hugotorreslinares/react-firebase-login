# React Firebase Login

Minimal React app with Firebase authentication supporting:
- Google Sign-In
- Email/Password registration and login
- Passwordless email link login

## Setup

### 1. Firebase Configuration

1. Create a project at [Firebase Console](https://console.firebase.google.com)
2. Go to **Authentication → Sign-in method** and enable:
   - Google
   - Email/Password
   - Email link (passwordless sign-in)
3. Go to **Project Settings** and copy your config
4. Add your domain to **Authentication → Settings → Authorized domains**

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

## Features

- `/` - Public home page
- `/login` - Login page with email/password and Google
- `/dashboard` - Protected route (requires authentication)

## Tech Stack

- React + Vite
- Tailwind CSS
- Firebase Auth
- React Router
