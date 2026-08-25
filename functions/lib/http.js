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

export function isAdmin(request, env) {
  if (request.headers.get('Cf-Access-Authenticated-User-Email')) {
    return true;
  }
  const token = env.ADMIN_TOKEN;
  if (!token) {
    return true;
  }
  const header = request.headers.get('X-Admin-Token') || '';
  const auth = request.headers.get('Authorization') || '';
  const bearer = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  return header === token || bearer === token;
}
