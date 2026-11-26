# PsychedMelo

太空船駕駛艙 × lofi 風格的迷幻音樂網站。

- **前台**：訪客不用登入，可以聽音樂、看航行日誌（SEO 文章）。音樂播放器常駐在畫面底部，換頁不會中斷。
- **後台** `/admin`：只有你能登入，可以上傳音樂、寫文章、管理圖片和影片、修改網站設定。

## 技術

| 用途 | 工具 |
|---|---|
| 網站框架（前台、後台、API） | Next.js 15（App Router、TypeScript） |
| 資料庫與管理員登入 | Supabase |
| 音樂、圖片、影片檔案 | Supabase Storage（`media` bucket） |
| 上線 | Vercel（連結 GitHub，push 後自動部署） |

## 網站結構

**前台**

| 網址 | 頁面 |
|---|---|
| `/` | 主控台（首頁）：舷窗視覺、精選音軌、最新日誌 |
| `/music` | 全部音軌 |
| `/music/[代稱]` | 單曲頁 |
| `/articles` | 航行日誌列表 |
| `/articles/[代稱]` | 文章頁 |
| `/about` | 艦長檔案（關於） |
| `/sitemap.xml`、`/robots.txt`、`/feed.xml` | 給搜尋引擎與 RSS 訂閱 |

**後台**（需要登入）

| 網址 | 功能 |
|---|---|
| `/admin/login` | 登入 |
| `/admin` | 總覽與系統檢查 |
| `/admin/tracks` | 上傳、編輯音軌；設定每首歌的舷窗視覺 |
| `/admin/articles` | 上傳 Word 檔（.docx）發文章，圖片自動上傳；SEO 標題與描述、草稿與排程發布 |
| `/admin/media` | 媒體庫：所有上傳過的檔案 |
| `/admin/settings` | 網站名稱、標語、描述、首頁舷窗主視覺、關於頁、社群連結 |

## 第一次設定

### 1. 安裝工具

1. **Git**：在「終端機」執行下面這行，跳出視窗後按「安裝」。

   ```bash
   xcode-select --install
   ```

2. **Node.js**：到 <https://nodejs.org> 下載 LTS 版（20 以上）的安裝檔，照步驟安裝。

3. 安裝專案套件（在這個資料夾裡執行）：

   ```bash
   npm install
   ```

### 2. Supabase（資料庫與登入）

1. 到 <https://supabase.com> 建立新專案。
2. 左側 **SQL Editor** → 貼上 [`supabase/schema.sql`](supabase/schema.sql) 整份內容 → **Run**。
3. **Authentication → Users → Add user**，用你的 Email 和密碼建立帳號（勾選 Auto Confirm）。
4. 回到 SQL Editor，把 Email 換成你的，執行一次，把自己設成管理員：

   ```sql
   insert into public.admins (user_id)
     select id from auth.users where email = 'you@example.com'
     on conflict do nothing;
   ```

5. 建議關閉公開註冊：**Authentication → Sign In / Providers**，關掉「Allow new users to sign up」。
6. **Project Settings → API**：複製 Project URL 和 anon（或 publishable）key，等一下填進環境變數。

### 3. Supabase Storage（檔案儲存）

不用另外設定：上一步執行的 `supabase/schema.sql` 已經建好公開的 `media` bucket，並限制只有管理員能上傳和刪除。

- 免費方案單一檔案上限 **50 MB**，網站也照這個數字擋。音樂建議用 320kbps 以下的 mp3，影片壓在 50 MB 以內。
- 免費方案的儲存空間和每月流量有限（以 Supabase 官網公布為準），音樂一多就需要升級 Pro 方案。

## 寫文章：上傳 Word 檔

1. 在 Word 裡用內建樣式排版：文章標題用「標題 1」（或「標題」），小標用「標題 2」「標題 3」。
2. 後台 **文章 → 上傳文章** → 選 `.docx`。標題、摘要、內文會自動帶入，Word 裡的圖片會自動上傳。
3. 補上網址代稱、SEO 標題與描述、封面圖，存成草稿或發布。
4. 要修改：在同一篇文章重新上傳新版 Word，會取代原本的內文。

> 舊版 `.doc` 請先另存成 `.docx`。EMF／WMF 這類向量圖瀏覽器顯示不了，請在 Word 裡改存成 PNG 或 JPG。

### 4. 環境變數

```bash
cp .env.example .env.local
```

打開 `.env.local`，把上面拿到的值填進去。這個檔案有密鑰，已經設定成不會推上 GitHub。

### 5. 在自己電腦上跑起來

```bash
npm run dev
```

- 前台：<http://localhost:3000>
- 後台：<http://localhost:3000/admin>

還沒設定 Supabase 時，前台也能打開，只是內容都是空的。

## 推上 GitHub

GitHub 上的 repo：<https://github.com/AllenCode0520/PsychedMelo>

第一次推送，依序執行：

```bash
git init
```

```bash
git add .
```

```bash
git commit -m "PsychedMelo 初版"
```

```bash
git branch -M main
```

```bash
git remote add origin https://github.com/AllenCode0520/PsychedMelo.git
```

```bash
git push -u origin main
```

問密碼時，要貼 GitHub 的 **Personal Access Token**，不是登入密碼。
建立方式：GitHub → Settings → Developer settings → Personal access tokens，權限勾 `repo`。
不想打指令的話，也可以用 [GitHub Desktop](https://desktop.github.com)。

之後每次修改：

```bash
git add . && git commit -m "說明這次改了什麼" && git push
```

## 上線（Vercel）

1. 到 <https://vercel.com> 用 GitHub 登入 → **Add New → Project** → 選 `PsychedMelo`。
2. **Environment Variables** 填入跟 `.env.local` 一樣的值，`NEXT_PUBLIC_SITE_URL` 改成正式網址。
3. 按 **Deploy**。之後每次 `git push`，Vercel 會自動重新部署。
4. 到 Google Search Console 提交 `https://你的網域/sitemap.xml`。

> Vercel 免費方案（Hobby）只能用在非商業用途。網站如果會營利，要改用 Pro 方案。

## 資料夾結構

```
app/
  (site)/            前台頁面（共用頁首、頁尾、常駐播放器）
  admin/
    login/           登入頁
    (panel)/         後台頁面（需要登入）
    actions.ts       後台所有儲存、刪除動作
  api/upload/        產生 Supabase Storage 上傳網址
  sitemap.ts         sitemap.xml
  robots.ts          robots.txt
  feed.xml/          RSS
  globals.css        駕駛艙 × lofi 全站樣式
components/
  admin/             後台表單、Word 匯入、上傳欄位
  cockpit/           頁首、頁尾、圖示、艙內時鐘
  content/           音軌列表、文章卡片
  player/            常駐播放器、舷窗模式
  visuals/           舷窗視覺（迷幻動畫、圖片、影片）
lib/                 資料讀取、登入檢查、檔案儲存、格式化工具
public/brand/        Psychedmelo 主視覺（首頁舷窗、關於頁）與社群分享圖 1200×630
supabase/schema.sql  資料表與權限
middleware.ts        保護 /admin
```

## 之後擴充

- **新的舷窗視覺格式**（例如 Lottie 動畫）：
  1. 在 `lib/types.ts` 的 `VisualType` 加一個值。
  2. 在 `components/visuals/Viewport.tsx` 的 `RENDERERS` 加一個畫法。
  3. 在資料庫 `tracks.visual_type` 的 check 條件加上新值。
  4. 在 `components/admin/TrackForm.tsx` 的選項加上它。
- **多語系**：目前只有繁體中文。之後要加英文，建議改成 `/zh-tw/...`、`/en/...` 的網址結構。
