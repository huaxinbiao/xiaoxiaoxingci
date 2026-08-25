CREATE TABLE IF NOT EXISTS apps (
  app_id TEXT PRIMARY KEY,
  enabled INTEGER NOT NULL DEFAULT 1,
  min_version TEXT NOT NULL DEFAULT '0.0.0',
  latest_version TEXT NOT NULL DEFAULT '1.0.0',
  disabled_versions TEXT NOT NULL DEFAULT '[]',
  android_url TEXT NOT NULL DEFAULT '',
  ios_url TEXT NOT NULL DEFAULT '',
  disabled_message_zh_hans TEXT NOT NULL DEFAULT '应用暂时不可用',
  disabled_message_zh_hant TEXT NOT NULL DEFAULT '應用暫時不可用',
  disabled_message_en TEXT NOT NULL DEFAULT 'This app is temporarily unavailable',
  update_message_zh_hans TEXT NOT NULL DEFAULT '请更新到最新版本',
  update_message_zh_hant TEXT NOT NULL DEFAULT '請更新到最新版本',
  update_message_en TEXT NOT NULL DEFAULT 'Please update to the latest version',
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS installs (
  install_id TEXT PRIMARY KEY,
  app_id TEXT NOT NULL,
  platform TEXT NOT NULL,
  app_version TEXT NOT NULL,
  device_model TEXT NOT NULL DEFAULT 'unknown',
  app_language TEXT NOT NULL DEFAULT 'en_US',
  first_seen TEXT NOT NULL,
  last_seen TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_installs_last_seen ON installs(last_seen);
CREATE INDEX IF NOT EXISTS idx_installs_app ON installs(app_id);

CREATE TABLE IF NOT EXISTS blocked_installs (
  install_id TEXT PRIMARY KEY,
  app_id TEXT NOT NULL,
  note TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL
);

INSERT OR IGNORE INTO apps (
  app_id, enabled, min_version, latest_version, disabled_versions,
  android_url, ios_url, updated_at
) VALUES (
  'nb.tbaba.com', 1, '0.0.0', '1.0.0', '[]',
  '', '', '2026-08-25T00:00:00.000Z'
);
