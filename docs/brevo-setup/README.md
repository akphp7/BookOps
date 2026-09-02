# Brevo Email Setup

Use this file to enable OTP and booking emails.

## 1. Create Brevo Account

1. Open Brevo.
2. Create an account or log in.
3. Open Brevo dashboard.

Official docs:

```text
https://developers.brevo.com/docs/send-a-transactional-email
```

## 2. Add Sender

1. Go to Senders.
2. Add sender email.
3. Verify sender email.
4. Save sender name.

Use the verified sender email in this app.

## 3. Create API Key

1. Go to SMTP and API.
2. Open API Keys.
3. Create new API key.
4. Copy the key.

It may start with:

```text
xkeysib-
```

## 4. Add Values In Backend Env

Open:

```text
backend/.env
```

Add:

```env
# Brevo API key
BREVO_API_KEY=

# Verified sender email
BREVO_SENDER_EMAIL=

# Sender name
BREVO_SENDER_NAME=BookMe

# Optional fallback sender
EMAIL_FROM=
```

Example:

```env
BREVO_SENDER_EMAIL=no-reply@example.com
BREVO_SENDER_NAME=BookMe
EMAIL_FROM=BookMe <no-reply@example.com>
```

## 5. Restart Backend

```bash
cd backend
npm start
```
