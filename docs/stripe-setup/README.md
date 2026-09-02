# Stripe Setup

Use this file to enable paid bookings.

## 1. Create Stripe Account

1. Open Stripe.
2. Create an account or log in.
3. Open Stripe Dashboard.

Official docs:

```text
https://docs.stripe.com/keys
https://docs.stripe.com/api/authentication
```

## 2. Get Test Secret Key

1. Open Developers.
2. Open API keys.
3. Turn on Test mode.
4. Copy Secret key.

It starts with:

```text
sk_test_
```

## 3. Add Key In Backend Env

Open:

```text
backend/.env
```

Add:

```env
# Stripe secret key
STRIPE_SECRET_KEY=sk_test_your_key_here
```

This project only needs the Stripe secret key.

## 4. Restart Backend

```bash
cd backend
npm start
```

## 5. Test Payment

1. Open the app.
2. Create a service with price more than `0`.
3. Open public booking page.
4. Book the service.
5. Stripe Checkout should open.
6. Pay with Stripe test card.
