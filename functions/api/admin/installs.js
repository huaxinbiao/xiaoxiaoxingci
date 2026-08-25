import { fail, json, isAdmin } from '../../lib/http.js';
import { DEFAULT_APP_ID } from '../../lib/app.js';
import { db } from '../../lib/db.js';

export async function onRequestGet(context) {
  if (!(await isAdmin(context.request, context.env))) {
    return fail('未授权', 401, 401);
  }

  const url = new URL(context.request.url);
  const appId = url.searchParams.get('appId') || DEFAULT_APP_ID;
  const query = (url.searchParams.get('q') || '').trim();
  const limit = Math.min(Number(url.searchParams.get('limit') || 100), 200);

  const sql = query
    ? `SELECT i.*, CASE WHEN b.install_id IS NULL THEN 0 ELSE 1 END AS blocked
       FROM installs i
       LEFT JOIN blocked_installs b ON b.install_id = i.install_id
       WHERE i.app_id = ? AND i.install_id LIKE ?
       ORDER BY i.last_seen DESC LIMIT ?`
    : `SELECT i.*, CASE WHEN b.install_id IS NULL THEN 0 ELSE 1 END AS blocked
       FROM installs i
       LEFT JOIN blocked_installs b ON b.install_id = i.install_id
       WHERE i.app_id = ?
       ORDER BY i.last_seen DESC LIMIT ?`;

  const result = query
    ? await db(context.env).prepare(sql).bind(appId, `%${query}%`, limit).all()
    : await db(context.env).prepare(sql).bind(appId, limit).all();

  return json(
    (result.results || []).map((row) => ({
      installId: row.install_id,
      appId: row.app_id,
      platform: row.platform,
      appVersion: row.app_version,
      deviceBrand: row.device_brand || 'unknown',
      deviceModel: row.device_model,
      appLanguage: row.app_language,
      firstSeen: row.first_seen,
      lastSeen: row.last_seen,
      blocked: Number(row.blocked) === 1,
    })),
  );
}

export async function onRequestPost(context) {
  if (!(await isAdmin(context.request, context.env))) {
    return fail('未授权', 401, 401);
  }

  let body;
  try {
    body = await context.request.json();
  } catch {
    return fail('请求体必须是 JSON');
  }

  const appId = String(body.appId || DEFAULT_APP_ID);
  const installId = String(body.installId || '').trim();
  const action = String(body.action || 'block');
  const note = String(body.note || '').slice(0, 200);

  if (!/^[0-9a-fA-F-]{16,64}$/.test(installId)) {
    return fail('installId 无效');
  }

  if (action === 'unblock') {
    await db(context.env).prepare('DELETE FROM blocked_installs WHERE install_id = ? AND app_id = ?')
      .bind(installId, appId)
      .run();
    return json({ installId, blocked: false });
  }

  await db(context.env).prepare(
    `INSERT INTO blocked_installs (install_id, app_id, note, created_at)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(install_id) DO UPDATE SET note = excluded.note`,
  )
    .bind(installId, appId, note, new Date().toISOString())
    .run();

  return json({ installId, blocked: true });
}
