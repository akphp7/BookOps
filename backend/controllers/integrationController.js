import User from '../models/User.js';
import { getEmailConfigStatus, sendTestEmail } from '../utils/bookingNotifications.js';
import { getGoogleAuthUrl, getGoogleTokens } from '../utils/googleCalendar.js';

export const getGoogleConnectUrl = async (req, res) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_REDIRECT_URI) {
    return res.status(503).json({ message: 'Google Calendar is not configured yet' });
  }

  res.json({ url: getGoogleAuthUrl(req.user.id) });
};

export const handleGoogleCallback = async (req, res) => {
  try {
    const { code, state } = req.query;

    if (!code || !state) {
      return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/profile?calendar=failed`);
    }

    const tokens = await getGoogleTokens(code);

    if (!tokens.refresh_token) {
      return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/profile?calendar=missing-refresh-token`);
    }

    await User.findByIdAndUpdate(state, {
      googleRefreshToken: tokens.refresh_token,
      googleCalendarConnected: true,
      googleCalendarId: 'primary',
    });

    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/profile?calendar=connected`);
  } catch (error) {
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/profile?calendar=failed`);
  }
};

export const getEmailStatus = async (req, res) => {
  const status = getEmailConfigStatus();
  res.json({ email: status });
};

export const sendEmailTest = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('email');
    const to = req.body.email || user?.email;

    if (!to) {
      return res.status(400).json({ message: 'A test email recipient is required' });
    }

    const result = await sendTestEmail(to);
    res.json({ message: `Test email sent to ${to}`, result });
  } catch (error) {
    res.status(503).json({ message: error.message });
  }
};
