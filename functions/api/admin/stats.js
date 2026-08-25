import { fail, json, isAdmin } from '../../lib/http.js';
import { DEFAULT_APP_ID } from '../../lib/app.js';
import { db } from '../../lib/db.js';

export async function onRequestGet(context) {
  if (!(await isAdmin(context.request, context.env))) {
    return fail('未授权', 401, 401);
  }

  const appId = new URL(context.request.url).searchParams.get('appId') || DEFAULT_APP_ID;
  const now = Date.now();
  const day7 = new Date(now - 7 * 86400000).toISOString();
  const day30 = new Date(now - 30 * 86400000).toISOString();

  const [
    total,
    active7,
    active30,
    blocked,
    platforms,
    versions,
    languages,
    models,
  ] = await Promise.all([
    db(context.env).prepare('SELECT COUNT(*) AS n FROM installs WHERE app_id = ?').bind(appId).first(),
    db(context.env).prepare('SELECT COUNT(*) AS n FROM installs WHERE app_id = ? AND last_seen >= ?')
      .bind(appId, day7)
      .first(),
    db(context.env).prepare('SELECT COUNT(*) AS n FROM installs WHERE app_id = ? AND last_seen >= ?')
      .bind(appId, day30)
      .first(),
    db(context.env).prepare('SELECT COUNT(*) AS n FROM blocked_installs WHERE app_id = ?').bind(appId).first(),
    db(context.env).prepare(
      'SELECT platform, COUNT(*) AS n FROM installs WHERE app_id = ? GROUP BY platform',
    )
      .bind(appId)
      .all(),
    db(context.env).prepare(
      'SELECT app_version AS name, COUNT(*) AS n FROM installs WHERE app_id = ? GROUP BY app_version ORDER BY n DESC',
    )
      .bind(appId)
      .all(),
    db(context.env).prepare(
      'SELECT app_language AS name, COUNT(*) AS n FROM installs WHERE app_id = ? GROUP BY app_language ORDER BY n DESC',
    )
      .bind(appId)
      .all(),
    db(context.env).prepare(
      "SELECT trim(device_brand || ' ' || device_model) AS name, COUNT(*) AS n FROM installs WHERE app_id = ? GROUP BY device_brand, device_model ORDER BY n DESC LIMIT 10",
    )
      .bind(appId)
      .all(),
  ]);

  const platformMap = Object.fromEntries((platforms.results || []).map((row) => [row.platform, row.n]));

  return json({
    totalInstalls: total?.n ?? 0,
    active7d: active7?.n ?? 0,
    active30d: active30?.n ?? 0,
    blockedInstalls: blocked?.n ?? 0,
    android: platformMap.android ?? 0,
    ios: platformMap.ios ?? 0,
    versions: versions.results || [],
    languages: languages.results || [],
    models: models.results || [],
  });
}
