# kevin-analysis

几条踩过坑的注意事项:

- **改完代码,两个 app 都要 typecheck**,别只跑当前这个:
  - 本 repo(kevin-analysis):`npx tsc --noEmit`
  - 另一个:`cd /Users/jeremydai/kawo/kevin-workspace/hi-kevin && npx tsc --noEmit`

- **Supabase 的 redirect URL 用 `/**` 通配**,比如 `http://localhost:3000/**`。换端口了就再加一条,旧的不会自动顶替。

- **Vercel 的环境变量在网站 Settings 里改,不是 `.env.local`**。而且改完不会自动生效,得重新 deploy 一次。
