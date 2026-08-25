import { fail, json } from '../lib/http.js';
import { DEFAULT_APP_ID, getApp } from '../lib/app.js';
import { compareVersion, parseVersion } from '../lib/semver.js';

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const appId = url.searchParams.get('appId') || DEFAULT_APP_ID;
  const installId = (url.searchParams.get('installId') || '').trim();
  const appVersion = (url.searchParams.get('appVersion') || '').trim();

  if (installId && !/^[0-9a-fA-F-]{16,64}$/.test(installId)) {
    return fail('installId 无效');
  }
  if (appVersion && !parseVersion(appVersion)) {
    return fail('appVersion 必须是 x.y.z');
  }

  const app = await getApp(context.env.DB, appId);
  if (!app) {
    return fail('未登记的应用', 404, 404);
  }

  let installBlocked = false;
  if (installId) {
    const blocked = await context.env.DB.prepare(
      'SELECT install_id FROM blocked_installs WHERE install_id = ? AND app_id = ?',
    )
      .bind(installId, appId)
      .first();
    installBlocked = Boolean(blocked);
  }

  const versionDisabled = Boolean(
    appVersion && app.disabledVersions.some((item) => compareVersion(item, appVersion) === 0),
  );

  return json({
    appId: app.appId,
    appEnabled: app.enabled,
    installBlocked,
    versionDisabled,
    minVersion: app.minVersion,
    latestVersion: app.latestVersion,
    androidUrl: app.androidUrl,
    iosUrl: app.iosUrl,
    disabledMessage: app.disabledMessage,
    updateMessage: app.updateMessage,
  });
}
