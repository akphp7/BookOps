# Google Calendar Setup

Use this file to connect Google Calendar.

## 1. Create Google Cloud Project

1. Open Google Cloud Console.
2. Create a new project.
3. Select the project.

Official docs:

```text
https://developers.google.com/workspace/guides/enable-apis
https://developers.google.com/identity/protocols/oauth2/web-server
```

## 2. Enable Google Calendar API

1. Go to APIs and Services.
2. Open Library.
3. Search Google Calendar API.
4. Click Enable.

## 3. Setup OAuth Consent

1. Go to Google Auth Platform.
2. Open Branding.
3. Add app name.
4. Add support email.
5. Save.
6. Add your email as a test user.

## 4. Create OAuth Client

1. Go to APIs and Services.
2. Open Credentials.
3. Click Create Credentials.
4. Select OAuth client ID.
5. Select Web application.
6. Add this redirect URL:

```text
http://localhost:5000/api/integrations/google/callback
```

7. Click Create.
8. Copy Client ID.
9. Copy Client Secret.

## 5. Add Keys In Backend Env

Open:

```text
backend/.env
```

Add:

```env
# Google OAuth client ID
GOOGLE_CLIENT_ID=

# Google OAuth client secret
GOOGLE_CLIENT_SECRET=

# Google callback URL
GOOGLE_REDIRECT_URI=http://localhost:5000/api/integrations/google/callback
```

## 6. Restart Backend

```bash
cd backend
npm start
```

