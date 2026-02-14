# NeteaseDL

一个基于 `React + Vite + Express + TypeScript` 的网易云音乐链接解析与下载工具。  
支持粘贴歌曲链接、分享文案、短链或歌曲 ID，解析后直接下载音频文件。

## 功能特性

- 支持输入以下内容进行解析：
  - 网易云歌曲链接
  - 分享文案中的链接
  - `163.cn / 163cn.tv / y.music.163.com` 短链
  - 纯数字歌曲 ID
- 后端自动处理短链跳转并提取资源信息
- 支持 `standard / high / lossless` 质量参数（高音质不可用时自动降级）
- 内置下载代理接口，规避浏览器跨域限制
- 提供健康检查接口，便于部署后巡检
- 支持 Vercel 部署（已包含 `api/index.ts` 与 `vercel.json`）

## 当前限制

- 当前仅实现了网易云 Provider（`NeteaseProvider`）
- 用户主页链接与歌单链接目前会解析为该歌单的第一首歌
- `album` 链接会识别到类型，但当前后端未实现 album 处理流程
- VIP / 版权受限歌曲即使解析成功，也可能无法获取可下载地址

## 技术栈

- 前端：React 18、Vite、Tailwind CSS、Zustand
- 后端：Express、Axios、NeteaseCloudMusicApi
- 语言：TypeScript
- 部署：Vercel（Serverless Function + SPA Rewrite）

## 本地开发

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 到 `.env`，并按需填写：

| 变量名 | 必填 | 说明 |
| --- | --- | --- |
| `NETEASE_COOKIE` | 否 | 网易云 Cookie。未配置时会尝试匿名登录；部分资源仍可能受限 |
| `REAL_IP` | 否 | 传给上游 API 的真实 IP 参数（部分场景可提升可用性） |
| `QQ_COOKIE` | 否 | 预留字段（当前版本未使用） |
| `KUGOU_COOKIE` | 否 | 预留字段（当前版本未使用） |

### 3. 启动开发环境

```bash
npm run dev
```

该命令会并行启动：

- 前端开发服务器：`http://localhost:5173`
- 后端 API 服务：默认 `http://localhost:3001`（端口占用时会自动尝试 `3002-3010`）

## 生产构建

```bash
npm run build
npm run preview
```

如果仅需本地启动后端：

```bash
npm run server:dev
```

## API 说明

### `POST /api/music/parse`

解析输入并返回歌曲信息。

请求体示例：

```json
{
  "url": "https://music.163.com/song?id=28754101"
}
```

也可传入分享文案、短链或纯数字 ID。

### `POST /api/music/download`

根据歌曲 ID 获取可下载地址。

请求体示例：

```json
{
  "id": "28754101",
  "quality": "standard"
}
```

`quality` 可选值：`standard`、`high`、`lossless`。

### `GET /api/music/proxy?url=<encoded_url>`

代理拉取音频流并返回给前端下载。

### `GET /api/health`

健康检查接口，返回服务状态。

## Vercel 部署说明

仓库已包含以下部署适配：

- `api/index.ts`：将 Express 应用导出为 Vercel 函数入口
- `vercel.json`：
  - `/api/*` 重写到 `/api/index`
  - 其他路径重写到 `/index.html` 以支持前端路由

部署时请在 Vercel Project Settings 中配置环境变量（至少建议配置 `NETEASE_COOKIE`）。

## 合规声明

本项目仅用于学习与技术研究。  
请遵守所在地法律法规、平台服务条款与版权要求，不要将本项目用于任何侵权用途。
