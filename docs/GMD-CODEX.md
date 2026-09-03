# 每日游戏营销事件看板 · Codex 写入配置

本文件是 Codex 每日更新看板数据的唯一权威说明。

## 地址一览

- 看板页面：https://chenlu-game.cn/wechat-1.html （「CC 氪点信号」详情页中部）
- JSON 公开读取：https://chenlu-game.cn/data/game-marketing-dashboard.json
- 镜像读取：https://connie-portfolio.pages.dev/data/game-marketing-dashboard.json
- 组件已配置 `cache: 'no-store'` + 时间戳参数，提交后 1–2 分钟内全网生效

## 仓库信息

- 仓库：https://github.com/luc030708/chenlu-resume
- 分支：`main`
- 数据文件：`data/game-marketing-dashboard.json`
- 截图目录：`data/hot-search-screenshots/YYYY-MM-DD/`
- 校验脚本：`scripts/validate_gmd.py`（纯标准库）
- 本说明：`docs/GMD-CODEX.md`

## 鉴权

使用 GitHub fine-grained Personal Access Token（仅授权 `luc030708/chenlu-resume` 仓库，权限 Contents: Read and write）。
Token 由站长线下提供，请存入受保护的环境变量 `GMD_GH_TOKEN`，**绝不写入任何前端文件或数据文件**。

## 每日更新流程（必须按顺序）

1. 按 `schema.json`（组件包）生成新 JSON。
2. 本地校验，必须通过：
   ```bash
   python3 scripts/validate_gmd.py path/to/new-dashboard.json
   ```
3. 有热榜截图时先传截图（见下节），把返回的公开 URL 填进 `hotSearches[].screenshot`。
4. 通过 GitHub Contents API 原子替换数据文件：
   ```bash
   # ① 取当前文件 sha
   curl -s -H "Authorization: Bearer $GMD_GH_TOKEN" \
     https://api.github.com/repos/luc030708/chenlu-resume/contents/data/game-marketing-dashboard.json \
     | python3 -c "import json,sys;print(json.load(sys.stdin)['sha'])"

   # ② 提交新内容（content 为 base64；sha 用上一步结果；校验失败绝不要执行本步）
   curl -s -X PUT -H "Authorization: Bearer $GMD_GH_TOKEN" \
     -H "Accept: application/vnd.github+json" \
     https://api.github.com/repos/luc030708/chenlu-resume/contents/data/game-marketing-dashboard.json \
     -d '{"message":"gmd: update YYYY-MM-DD","content":"<BASE64>","sha":"<SHA>","branch":"main"}'
   ```
5. 写入成功的判定：响应含 `commit.sha`。公开读取地址固定为
   `https://chenlu-game.cn/data/game-marketing-dashboard.json`（GitHub Pages 自动部署，约 1 分钟）。
6. **旧数据保护**：Contents API 是原子替换，新 commit 成功前线上始终是旧数据；
   第 2 步校验不通过时禁止写入。

## 截图上传

每张热榜截图单独用 Contents API 上传（同样 base64），路径规范：

```
data/hot-search-screenshots/<YYYY-MM-DD>/<platform>-<keyword>-<rank>.png
```

上传成功后的公开地址：

```
https://chenlu-game.cn/data/hot-search-screenshots/<YYYY-MM-DD>/<filename>.png
```

只允许 png / jpg / webp；单张建议 < 500KB（先压缩再上传）。禁止使用电脑本地路径。

## 返回验收

- 打开 https://chenlu-game.cn/data/game-marketing-dashboard.json 能看到当天日期；
- 看板页面最迟 5 分钟（组件轮询周期）内显示新内容。
