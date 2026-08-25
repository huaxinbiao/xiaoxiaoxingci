import { fail, json, isAdmin } from '../../lib/http.js';
import { DEFAULT_APP_ID, getApp } from '../../lib/app.js';
import { db } from '../../lib/db.js';
import { parseVersion } from '../../lib/semver.js';

export async function onRequestGet(context) {
  if (!isAdmin(context.request, context.env)) {
    return fail('未授权', 401, 401);
  }
  const appId = new URL(context.request.url).searchParams.get('appId') || DEFAULT_APP_ID;
  const app = await getApp(db(context.env), appId);
  if (!app) return fail('未登记的应用', 404, 404);
  return json(app);
}

export async function onRequestPut(context) {
  if (!isAdmin(context.request, context.env)) {
    return fail('未授权', 401, 401);
  }

  let body;
  try {
    body = await context.request.json();
  } catch {
    return fail('请求体必须是 JSON');
  }

  const appId = String(body.appId || DEFAULT_APP_ID);
  if (body.minVersion && !parseVersion(body.minVersion)) return fail('minVersion 无效');
  if (body.latestVersion && !parseVersion(body.latestVersion)) return fail('latestVersion 无效');
  const disabledVersions = Array.isArray(body.disabledVersions)
    ? body.disabledVersions.map(String)
    : [];
  if (disabledVersions.some((item) => !parseVersion(item))) {
    return fail('disabledVersions 必须是 x.y.z 列表');
  }

  const current = await getApp(db(context.env), appId);
  if (!current) return fail('未登记的应用', 404, 404);

  const next = {
    enabled: body.enabled === false ? 0 : 1,
    minVersion: body.minVersion || current.minVersion,
    latestVersion: body.latestVersion || current.latestVersion,
    disabledVersions: JSON.stringify(disabledVersions),
    androidUrl: String(body.androidUrl ?? current.androidUrl),
    iosUrl: String(body.iosUrl ?? current.iosUrl),
    disabledMessage: {
      zhHans: body.disabledMessage?.zhHans ?? current.disabledMessage.zhHans,
      zhHant: body.disabledMessage?.zhHant ?? current.disabledMessage.zhHant,
      en: body.disabledMessage?.en ?? current.disabledMessage.en,
    },
    updateMessage: {
      zhHans: body.updateMessage?.zhHans ?? current.updateMessage.zhHans,
      zhHant: body.updateMessage?.zhHant ?? current.updateMessage.zhHant,
      en: body.updateMessage?.en ?? current.updateMessage.en,
    },
  };

  await db(context.env).prepare(
    `UPDATE apps SET
      enabled = ?, min_version = ?, latest_version = ?, disabled_versions = ?,
      android_url = ?, ios_url = ?,
      disabled_message_zh_hans = ?, disabled_message_zh_hant = ?, disabled_message_en = ?,
      update_message_zh_hans = ?, update_message_zh_hant = ?, update_message_en = ?,
      updated_at = ?
     WHERE app_id = ?`,
  )
    .bind(
      next.enabled,
      next.minVersion,
      next.latestVersion,
      next.disabledVersions,
      next.androidUrl,
      next.iosUrl,
      next.disabledMessage.zhHans,
      next.disabledMessage.zhHant,
      next.disabledMessage.en,
      next.updateMessage.zhHans,
      next.updateMessage.zhHant,
      next.updateMessage.en,
      new Date().toISOString(),
      appId,
    )
    .run();

  return json(await getApp(db(context.env), appId));
}
