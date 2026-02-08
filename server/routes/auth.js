const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Resend } = require('resend');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { JWT_SECRET } = require('../config');

const router = express.Router();

const APP_URL = process.env.APP_URL || 'http://localhost:5173';
const RESEND_FROM = process.env.RESEND_FROM || 'onboarding@resend.dev';
const RESET_TOKEN_MINUTES = 30;

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

function buildUserPayload(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    specialization: user.specialization,
    hospitalName: user.hospitalName
  };
}

function signToken(userId) {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: '7d' });
}

router.post('/register', async (req, res) => {
  const { name, email, password, specialization, hospitalName } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }

  try {
    const normalizedEmail = email.toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ error: 'Account already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: normalizedEmail,
      passwordHash,
      specialization,
      hospitalName
    });

    const token = signToken(user._id);
    return res.json({ token, user: buildUserPayload(user) });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ error: 'Registration failed.' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const normalizedEmail = email.toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const token = signToken(user._id);
    return res.json({ token, user: buildUserPayload(user) });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Login failed.' });
  }
});

router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('name email specialization hospitalName');
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    return res.json({ user: buildUserPayload(user) });
  } catch (err) {
    console.error('Me error:', err);
    return res.status(500).json({ error: 'Failed to load profile.' });
  }
});

router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }

  try {
    const normalizedEmail = email.toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.json({ message: 'If the email exists, a reset link has been sent.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetTokenHash = resetTokenHash;
    user.resetTokenExpires = new Date(Date.now() + RESET_TOKEN_MINUTES * 60 * 1000);
    await user.save();

    if (!resend) {
      console.error('RESEND_API_KEY not configured.');
      return res.status(500).json({ error: 'Email service not configured.' });
    }

    const baseUrl = APP_URL.replace(/\/$/, '');
    const resetUrl = `${baseUrl}/?resetToken=${encodeURIComponent(resetToken)}`;

    await resend.emails.send({
      from: RESEND_FROM,
      to: user.email,
      subject: 'Reset your password',
      html: `
        <p>We received a request to reset your password.</p>
        <p>This link expires in ${RESET_TOKEN_MINUTES} minutes.</p>
        <p><a href="${resetUrl}">Reset your password</a></p>
        <p>If you did not request this, you can ignore this email.</p>
      `
    });

    return res.json({ message: 'If the email exists, a reset link has been sent.' });
  } catch (err) {
    console.error('Forgot password error:', err);
    return res.status(500).json({ error: 'Failed to send reset email.' });
  }
});

router.post('/reset-password', async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ error: 'Token and password are required.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }

  try {
    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetTokenHash,
      resetTokenExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ error: 'Reset link is invalid or expired.' });
    }

    user.passwordHash = await bcrypt.hash(password, 10);
    user.resetTokenHash = undefined;
    user.resetTokenExpires = undefined;
    await user.save();

    return res.json({ message: 'Password updated.' });
  } catch (err) {
    console.error('Reset password error:', err);
    return res.status(500).json({ error: 'Failed to reset password.' });
  }
});

module.exports = router;
