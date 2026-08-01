# GitHub Pages 部署操作指南

> 本地 git 仓库已初始化完成，网站文件已全部提交（main 分支）。
> 你只需完成下面 3 步，网站就能上线。全程约 5 分钟。

---

## 第一步：在 GitHub 上创建空仓库（1 分钟）

1. 打开 https://github.com/new （登录你的 GitHub 账号，没有就先注册）
2. **Repository name** 填：`connie-portfolio`（或你喜欢的名字）
3. 选择 **Public**（⚠️ 免费版 GitHub Pages 要求仓库必须是 Public）
4. **不要勾选** "Add a README" / ".gitignore" / "license"（保持空仓库）
5. 点击 **Create repository**

---

## 第二步：把本地网站推送到 GitHub（复制粘贴两行命令）

创建仓库后，打开**终端（Terminal）**，逐行粘贴执行：

```bash
cd /Users/connie/Documents/kimi/workspace/connie-portfolio
git remote add origin https://github.com/你的用户名/connie-portfolio.git
git push -u origin main
```

- 把 `你的用户名` 换成你的 GitHub 用户名
- 首次推送会弹出登录授权窗口，按提示登录即可
- 看到 `* [new branch] main -> main` 就说明推送成功

---

## 第三步：开启 GitHub Pages（1 分钟）

1. 在仓库页面点击顶部 **Settings**（设置）
2. 左侧菜单点 **Pages**
3. **Source** 选择 `Deploy from a branch`
4. **Branch** 选择 `main`，目录保持 `/(root)`，点 **Save**
5. 等 1-2 分钟刷新，页面顶部会出现绿色提示框，显示你的网站地址：

```
https://你的用户名.github.io/connie-portfolio/
```

打开这个链接，你的作品集就上线了 🎉

---

## 以后怎么更新网站

每次改了网站文件（或让我改完）之后，在终端执行：

```bash
cd /Users/connie/Documents/kimi/workspace/connie-portfolio
git add *.html style.css assets
git commit -m "更新内容说明"
git push
```

等 1 分钟左右，线上自动更新。

### 每日更新营销看板

Codex 每天产出新的看板数据后，把新的 JSON 覆盖到这个位置：

```
assets/game-marketing/game-marketing-dashboard.json
```

然后执行上面的三条 git 命令推送，网站上的看板就更新了。

---

## 常见问题

**Q: 推送时提示 Permission denied / 403？**
A: 需要登录 GitHub。终端执行 `git push` 时会弹窗引导授权；如果反复失败，建议安装 GitHub Desktop（图形化工具，点几下就能推送，见下方备选方案）。

**Q: 打开了网址但看板不显示？**
A: 看板组件需要通过 http(s) 访问，GitHub Pages 上完全正常。本地双击 html 文件预览时看板不加载是正常现象，不影响线上。

**Q: 网址能换成自己的域名吗（如 conniechenlu.cn）？**
A: 可以。买好域名后，在仓库 Settings → Pages → Custom domain 填入域名，并按提示在域名服务商处添加 CNAME 解析记录。国内访问稳定性要求更高的话，可参考 `腾讯云部署指南.md` 走 COS + 备案方案。

---

## 备选方案：GitHub Desktop（不想用命令行）

1. 下载安装 https://desktop.github.com/
2. 登录 GitHub 账号
3. File → Add Local Repository → 选择 `/Users/connie/Documents/kimi/workspace/connie-portfolio`
4. 点 **Publish repository**（取消勾选 "Keep this code private"，因为 Pages 需要 Public）
5. 以后每次更新：打开 GitHub Desktop → 写一句提交说明 → Commit → Push origin

然后按【第三步】开启 Pages 即可。

---

> 本地仓库状态：✅ 已初始化（main 分支）✅ 首次提交已完成（20 个网站文件）
> 排除在外的文件：zip 压缩包、简历 PDF、工作文档、node_modules 等（见 .gitignore）
