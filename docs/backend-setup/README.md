# Backend and MongoDB Setup

Use this file to setup the backend and database.

## 1. Install Backend

Open terminal in the project folder.

```bash
cd backend
npm install
```

## 2. Create MongoDB Atlas Account

1. Open MongoDB Atlas.
2. Create an account or log in.
3. Create a new project.
4. Create a free cluster.
5. Wait until the cluster is ready.

Official docs:

```text
https://www.mongodb.com/docs/atlas/connect-to-database-deployment/
```

## 3. Create Database User

1. Open your Atlas project.
2. Go to Database Access.
3. Click Add New Database User.
4. Add username.
5. Add password.
6. Save it.

Save this username and password. You need it in the MongoDB URL.

## 4. Allow Your IP

1. Go to Network Access.
2. Click Add IP Address.
3. Add 0.0.0.0.0 in IP address.
4. Save it.

Now you can access from anywhere.

## 5. Copy MongoDB URL

1. Go to Database.
2. Click Connect.
3. Choose Drivers.
4. Choose Node.js.
5. Copy the connection string.

It looks like this:

```text
mongodb+srv://<username>:<password>@<cluster-url>/?retryWrites=true&w=majority
```

Add database name after the cluster URL.

Example:

```text
mongodb+srv://<username>:<password>@<cluster-url>/BookMee?retryWrites=true&w=majority
```

## 6. Add MongoDB URL

Open:

```text
backend/config/db.js
```

Find:

```js
await mongoose.connect("...")
```

Replace the placeholder with your own MongoDB URL.

Example:

```js
await mongoose.connect("mongodb+srv://username:password@cluster-url/BookMee?retryWrites=true&w=majority")
```


## 7. Create Backend Env File

Create this file:

```text
backend/.env
```

Add these values:

```env
# Frontend URL
CLIENT_URL=http://localhost:5173

# JWT secret for login tokens
JWT_SECRET=

# Admin login email
ADMIN_EMAIL=

# Admin login password
ADMIN_PASSWORD=

# Optional hashed admin password
ADMIN_PASSWORD_HASH=

# Stripe secret key
STRIPE_SECRET_KEY=

# Brevo API key
BREVO_API_KEY=

# Brevo sender email
BREVO_SENDER_EMAIL=

# Brevo sender name
BREVO_SENDER_NAME=BookMe

# Optional fallback sender
EMAIL_FROM=

# Google Calendar keys
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:5000/api/integrations/google/callback
```

## 8. Start Backend

```bash
npm start
```

Backend URL:

```text
http://localhost:5000
```

Open this in browser:

```text
http://localhost:5000
```

You should see:

```text
API Working!
```

## 9. Setup Frontend Env

Create this file:

```text
frontend/.env
```

Add:

```env
# Backend API URL
VITE_API_URL=http://localhost:5000/api
```

## 10. Start Frontend

Open a new terminal.

```bash
cd frontend
npm install
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```
