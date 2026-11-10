# 部署到 GitHub Pages

这个文件夹已经是「上传即用」的静态站点，**不需要做成单文件**。
Unity WebGL 必须通过 HTTP 分别加载 wasm / 数据包，单文件反而更容易在手机内存上翻车。

## 一、新建仓库并上传

1. 在 GitHub 新建一个仓库（例如 `duelist-stickman`），**不要**勾选 Add README。
2. 把本文件夹里的**所有内容**上传到仓库根目录：
   - 网页上传：仓库页 → Add file → Upload files，把 `index.html`、`Build`、`TemplateData`、`logo.png` 拖进去。
   - `.nojekyll` 是隐藏文件，网页拖拽常常漏掉。可以在 Add file → Create new file，
     文件名填 `.nojekyll`，内容留空，提交即可。
3. 提交。

用命令行更省事：

```bash
cd "路径/BattleOfRedAndBlue_GHPages"
git init
git add -A
git commit -m "add offline duelist stickman"
git branch -M main
git remote add origin https://github.com/<你的用户名>/<仓库名>.git
git push -u origin main
```

## 二、开启 Pages

仓库 → Settings → Pages：

- Source 选 **Deploy from a branch**
- Branch 选 **main**，目录选 **/ (root)**
- Save

等 1～2 分钟，访问：

```
https://<你的用户名>.github.io/<仓库名>/
```

`index.html` 会在根路径自动作为首页，所以不用在地址后面加文件名。

## 三、手机上的注意事项

- 首次加载约 16 MB，4G 下大概 10～30 秒，进度条会停在 VSEGON 画面，属正常。
- iOS Safari 需要先点一下屏幕才会出声（浏览器自动播放限制），游戏内左上角可开关声音。
- 想全屏：Safari「添加到主屏幕」后从桌面图标打开，体验接近原生 App。
- 双人模式在同一块屏幕上左右各一个虚拟摇杆。

## 四、几点提醒

- GitHub Pages 不支持自定义响应头，但这个游戏**不需要** COOP/COEP（非多线程构建），
  已实测在普通静态托管下可正常运行。
- 仓库是公开的，等于把这些游戏资源公开了。介意的话可以只在本地/局域网玩，
  或用私有仓库 + 支持私有 Pages 的付费方案。
- 以后 Yandex 上的游戏更新了，这个副本不会自动更新。
