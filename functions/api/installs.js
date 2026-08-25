import { fail, json } from '../lib/http.js';
import { DEFAULT_APP_ID } from '../lib/app.js';
import { parseVersion } from '../lib/semver.js';

const PLATFORMS = new Set(['android', 'ios']);
const LANGUAGES = new Set(['zh_CN', 'zh_TW', 'en_US']);

export async function onRequestPost(context) {
  let body;
  try {
    body = await context.request.json();
  } catch {
    return fail('请求体必须是 JSON');
  }

  const appId = String(body.appId || DEFAULT_APP_ID).trim();
  const installId = String(body.installId || '').trim();
  const appVersion = String(body.appVersion || '').trim();
  const platform = String(body.platform || '').trim().toLowerCase();
  const deviceModel = String(body.deviceModel || 'unknown').trim().slice(0, 80) || 'unknown';
  const appLanguage = String(body.appLanguage || 'en_US').trim();

  if (!/^[0-9a-fA-F-]{16,64}$/.test(installId)) {
    return fail('installId 无效');
  }
  if (!parseVersion(appVersion)) {
    return fail('appVersion 必须是 x.y.z');
  }
  if (!PLATFORMS.has(platform)) {
    return fail('platform 必须是 android 或 ios');
  }
  if (!LANGUAGES.has(appLanguage)) {
    return fail('appLanguage 必须是 zh_CN、zh_TW 或 en_US');
  }

  const now = new Date().toISOString();
  await context.env.DB.prepare(
    `INSERT INTO installs (
        install_id, app_id, platform, app_version, device_model, app_language, first_seen, last_seen
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(install_id) DO UPDATE SET
        app_id = excluded.app_id,
        platform = excluded.platform,
        app_version = excluded.app_version,
        device_model = excluded.device_model,
        app_language = excluded.app_language,
        last_seen = excluded.last_seen`,
  )
    .bind(installId, appId, platform, appVersion, deviceModel, appLanguage, now, now)
    .run();

  return json({ installId, registered: true });
}
