import { parseDisabledVersions } from './semver.js';

export const DEFAULT_APP_ID = 'nb.tbaba.com';

export function mapApp(row) {
  if (!row) return null;
  return {
    appId: row.app_id,
    enabled: Number(row.enabled) === 1,
    minVersion: row.min_version,
    latestVersion: row.latest_version,
    disabledVersions: parseDisabledVersions(row.disabled_versions),
    androidUrl: row.android_url,
    iosUrl: row.ios_url,
    disabledMessage: {
      zhHans: row.disabled_message_zh_hans,
      zhHant: row.disabled_message_zh_hant,
      en: row.disabled_message_en,
    },
    updateMessage: {
      zhHans: row.update_message_zh_hans,
      zhHant: row.update_message_zh_hant,
      en: row.update_message_en,
    },
    updatedAt: row.updated_at,
  };
}

export async function getApp(db, appId) {
  const row = await db.prepare('SELECT * FROM apps WHERE app_id = ?').bind(appId).first();
  return mapApp(row);
}
