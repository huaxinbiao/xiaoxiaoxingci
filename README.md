# 小小星词运维后台

Cloudflare Pages + D1。给 Flutter 客户端提供安装上报、按 `installId` 禁用、整包禁用、版本禁用、升级提示和强制升级。

升级地址在「策略」里填写。App 点「去更新」会用**系统浏览器**打开 Android / iOS 对应链接。

## 一键接到 Cloudflare

1. 把本仓库推到 GitHub。
2. 打开 [Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git](https://dash.cloudflare.com/?to=/:account/pages/new/provider/github)。
3. 选中仓库后填写：

| 项 | 值 |
| --- | --- |
| Project name | `xiaoxiaoxingci` |
| Root directory | `xiaoxiaoxingci` |
| Build command | `npm ci && npm run build` |
| Build output | `dist` |

4. 创建 D1 并执行迁移：

```bash
cd xiaoxiaoxingci
npx wrangler login
npx wrangler d1 create xiaoxiaoxingci
```

把输出的 `database_id` 填进 `wrangler.toml` 的 `REPLACE_WITH_D1_DATABASE_ID`。

```bash
npx wrangler d1 migrations apply xiaoxiaoxingci --remote
```

5. 在 Pages 项目 Settings → Bindings 增加 D1：变量名 `DB`，数据库 `xiaoxiaoxingci`。
6. 可选：Settings → Environment variables 增加密钥 `ADMIN_TOKEN`。设置后，打开后台页面先填同一令牌再操作。
7. 用 [Cloudflare Access](https://developers.cloudflare.com/cloudflare-one/policies/access/) 保护站点路径 `/`。**不要**把 `/api/installs` 和 `/api/status` 纳入 Access，App 需要公开访问。

GitHub Actions 部署需仓库 Secrets：`CLOUDFLARE_API_TOKEN`、`CLOUDFLARE_ACCOUNT_ID`。

## 本地

```bash
cd xiaoxiaoxingci
npm install
npx wrangler d1 migrations apply xiaoxiaoxingci --local
npm run dev
```

## App 接口

- `POST /api/installs` 上报 `appId`、`installId`、`appVersion`、`platform`、`deviceModel`、`appLanguage`
- `GET /api/status?appId=&installId=&appVersion=` 返回禁用与升级策略，含 `androidUrl` / `iosUrl`

Flutter 使用 `--dart-define=API_BASE_URL=https://<你的页面>.pages.dev`
