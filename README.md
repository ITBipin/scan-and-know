# Scan & Know

A cross-platform camera-first Expo app for identifying objects from images using an AI vision service.

## Setup

1. Install dependencies:
   npm install
2. Create a local environment file:
   cp .env.example .env
3. Fill in your values:
   EXPO_PUBLIC_AI_API_KEY=YOUR_API_KEY
   EXPO_PUBLIC_AI_API_URL=YOUR_API_URL

## Important security note

For a production app, do not expose a private AI key directly inside the mobile app. Prefer a small backend or proxy service that keeps the key on the server. This MVP is structured so the AI layer can be moved behind a backend later without changing the rest of the UI.

## Run the app

npm start

Then select Android or iOS in Expo.
