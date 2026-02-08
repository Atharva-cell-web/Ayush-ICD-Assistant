const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

if (!process.env.JWT_SECRET) {
  console.warn('JWT_SECRET is not set. Using insecure default value.');
}

module.exports = { JWT_SECRET };
