# 小小星词运维后台

Cloudflare Workers（静态资源 + Functions）+ D1。给 Flutter 客户端提供安装上报、按 `installId` 禁用、整包禁用、版本禁用、升级提示和强制升级。

升级地址在「策略」里填写。App 点「去更新」会用**系统浏览器**打开 Android / iOS 对应链接。

线上地址：`https://xiaoxiaoxingci.xiaoxionggouzi.workers.dev`

## 部署（推 Git）

正式发布只走 Git：推送到 `main` 后，GitHub Actions 会构建并部署到 **Workers** 项目 `xiaoxiaoxingci`。

不要再建 Cloudflare Pages。`*.pages.dev` 只属于 Pages，不能绑到 Worker。

1. 仓库 Secrets（Settings → Secrets and variables → Actions）：

| Secret | 说明 |
| --- | --- |
| `CLOUDFLARE_API_TOKEN` | 权限含 Workers Scripts Edit |
| `CLOUDFLARE_ACCOUNT_ID` | `c2445d963b02685c25859b2771ce7632` |

2. 后台登录密码放在 **Worker** Secret，不要提交到 Git：

```bash
npx wrangler secret put ADMIN_PASSWORD
```

用户名固定为 `admin_user`。

3. 日常发布：

```bash
git add -A && git commit -m "说明这次改动" && git push origin main
```

到 GitHub → Actions 看 `Deploy Worker` 是否成功。不要把本地 `npm run deploy` 当常规流程。

4. D1 只在改表结构时执行一次：

```bash
npx wrangler d1 migrations apply xiaoxiaoxingci --remote
```

5. 用 [Cloudflare Access](https://developers.cloudflare.com/cloudflare-one/policies/access/) 保护站点路径 `/` 可选。**不要**挡住 `/api/installs`、`/api/status`。

## 本地

```bash
npm install
npx wrangler d1 migrations apply xiaoxiaoxingci --local
npm run dev
```

## App 接口

- `POST /api/installs` 上报 `appId`、`installId`、`appVersion`、`platform`、`deviceBrand`、`deviceModel`、`appLanguage`（品牌+型号，不是设备名称）
- `GET /api/status?appId=&installId=&appVersion=` 返回禁用与升级策略，含 `androidUrl` / `iosUrl`

Flutter 默认使用 `https://xiaoxiaoxingci.xiaoxionggouzi.workers.dev`。

公开法律页：

- `/legal/privacy.html?lang=zh_CN`
- `/legal/agreement.html?lang=zh_CN`

`lang` 可为 `zh_CN`、`zh_TW`、`en_US`。App 用 WebView 打开。
