# 每日游戏营销事件看板 · Codex 写入配置

本文件是 Codex 每日更新看板数据的唯一权威说明。

## 地址一览

- 看板页面：https://chenlu-game.cn/wechat-1.html （「CC 氪点信号」详情页中部）
- JSON 公开读取：https://chenlu-game.cn/data/game-marketing-dashboard.json
- 镜像读取：https://connie-portfolio.pages.dev/data/game-marketing-dashboard.json
- 组件已配置 `cache: 'no-store'` + 时间戳参数，并每 60 秒重新读取；提交后通常 1–2 分钟内全网生效

## 仓库信息

- 仓库：https://github.com/luc030708/chenlu-resume
- 分支：`main`
- 数据文件：`data/game-marketing-dashboard.json`
- 截图目录：`data/hot-search-screenshots/YYYY-MM-DD/`
- 校验脚本：`scripts/validate_gmd.py`（纯标准库）
- 本说明：`docs/GMD-CODEX.md`

## 自动同步环境

- 本机发布仓库：`/Users/connie/Documents/个人简历/game-portfolio-publish`
- Git HTTPS 凭据由 macOS Keychain 的 `osxkeychain` helper 提供；自动任务只执行常规 `git fetch/pull/push`，不得读取、显示或复制凭据。
- 若 Keychain 凭据失效，停止线上写入并明确报告，不得改用明文 token、把凭据写进命令、日志、提示词、代码或数据文件。

## 每日更新流程（必须按顺序）

1. 按 `schema.json`（组件包）生成新 JSON。
2. 本地校验，必须通过：
   ```bash
   python3 scripts/validate_gmd.py path/to/new-dashboard.json
   ```
3. 发布仓库先同步远端：
   ```bash
   git -C /Users/connie/Documents/个人简历/game-portfolio-publish fetch origin
   git -C /Users/connie/Documents/个人简历/game-portfolio-publish pull --ff-only origin main
   ```
4. 有热榜截图时复制到发布仓库 `data/hot-search-screenshots/YYYY-MM-DD/`，并把对应的 `https://chenlu-game.cn/...` 地址写入 JSON。
5. 把校验通过的新 JSON 覆盖到发布仓库 `data/game-marketing-dashboard.json`，再次运行仓库内的校验器。
6. 仅提交看板 JSON 和当天新增截图，提交信息使用 `gmd: update YYYY-MM-DD`，随后 `git push origin main`。
7. 写入成功的判定：`git push` 成功且远端 `main` 包含新提交。公开读取地址固定为 `https://chenlu-game.cn/data/game-marketing-dashboard.json`。
8. **旧数据保护**：新 commit 成功前线上始终是旧数据；任一校验不通过时禁止提交或推送。

## 截图上传

每张热榜截图复制到发布仓库时使用以下路径规范：

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
- GitHub Pages 构建成功后，看板页面最迟 60 秒（组件轮询周期）内显示新内容。
