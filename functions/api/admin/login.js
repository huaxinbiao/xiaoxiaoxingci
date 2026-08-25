import { adminUser, fail, issueAdminToken, json, passwordsMatch } from '../../lib/http.js';

export async function onRequestPost(context) {
  let body;
  try {
    body = await context.request.json();
  } catch {
    return fail('请求体必须是 JSON');
  }

  const username = String(body.username || '').trim();
  const password = String(body.password || '');
  const expectedUser = adminUser(context.env);
  const expectedPassword = context.env.ADMIN_PASSWORD;

  if (!expectedPassword) {
    return fail('服务器未配置管理员密码', 500, 500);
  }
  if (!passwordsMatch(username, expectedUser) || !passwordsMatch(password, expectedPassword)) {
    return fail('用户名或密码错误', 401, 401);
  }

  const token = await issueAdminToken(context.env, expectedUser);
  return json({ token, username: expectedUser });
}
