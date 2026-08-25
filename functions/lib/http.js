export function json(data, code = 200, msg = '成功', status = 200) {
  return Response.json({ data, code, msg }, { status, headers: corsHeaders() });
}

export function fail(msg, code = 400, status = 400) {
  return json(null, code, msg, status);
}

export function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Admin-Token',
  };
}

export function adminUser(env) {
  return env.ADMIN_USER || 'admin_user';
}

function bearerToken(request) {
  const header = request.headers.get('X-Admin-Token') || '';
  const auth = request.headers.get('Authorization') || '';
  if (header) return header;
  return auth.startsWith('Bearer ') ? auth.slice(7) : '';
}

function bytesEqual(left, right) {
  if (left.length !== right.length) return false;
  let diff = 0;
  for (let i = 0; i < left.length; i += 1) diff |= left[i] ^ right[i];
  return diff === 0;
}

export function passwordsMatch(left, right) {
  const encoder = new TextEncoder();
  const a = encoder.encode(String(left ?? ''));
  const b = encoder.encode(String(right ?? ''));
  return bytesEqual(a, b);
}

async function hmacHex(secret, text) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(text));
  return [...new Uint8Array(signature)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

export async function issueAdminToken(env, username) {
  const secret = env.ADMIN_PASSWORD;
  if (!secret) throw new Error('ADMIN_PASSWORD is not configured');
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
  const payload = `${expiresAt}:${username}`;
  const signature = await hmacHex(secret, payload);
  return `${payload}.${signature}`;
}

export async function tokenIsValid(env, token) {
  const secret = env.ADMIN_PASSWORD;
  if (!secret || !token) return false;
  const split = token.lastIndexOf('.');
  if (split <= 0) return false;
  const payload = token.slice(0, split);
  const signature = token.slice(split + 1);
  const [expiresAt, username] = payload.split(':');
  if (!expiresAt || username !== adminUser(env)) return false;
  if (Number(expiresAt) < Date.now()) return false;
  const expected = await hmacHex(secret, payload);
  return passwordsMatch(signature, expected);
}

export async function isAdmin(request, env) {
  if (request.headers.get('Cf-Access-Authenticated-User-Email')) {
    return true;
  }
  return tokenIsValid(env, bearerToken(request));
}
