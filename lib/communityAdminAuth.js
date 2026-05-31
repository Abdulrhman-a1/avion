import crypto from 'crypto';

const TOKEN_SALT = 'avion-pm-community';

function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || process.env.VITE_ADMIN_PASSWORD || '';
}

export function makeAdminToken(password, scope = 'local-dev') {
  return crypto
    .createHash('sha256')
    .update(`${password}${TOKEN_SALT}${scope}`)
    .digest('hex');
}

export function verifyAdminLogin(password) {
  const expected = getAdminPassword();
  if (!expected) {
    return { ok: false, error: 'Admin login is not configured. Set ADMIN_PASSWORD in .env.' };
  }
  if (String(password) !== String(expected)) {
    return { ok: false, error: 'Invalid password.' };
  }
  return {
    ok: true,
    data: {
      success: true,
      adminToken: makeAdminToken(expected),
    },
  };
}

export function verifyAdminToken(token) {
  const expected = getAdminPassword();
  if (!expected || !token) return false;
  return token === makeAdminToken(expected);
}
