![N|Solid](https://github.com/mitchas/glass-browser/raw/master/assets/icon64.png)
# **ZenView**

> 此项目基于 [glass-browser](https://github.com/mitchas/glass-browser) 修改而来。


一个适用于 Windows 的摸鱼浏览器。
  - 一键开启无边框沉浸模式
  - 随心调节窗口透明度
  - 任意调节窗口大小
  - 窗口置顶
  - 鼠标移出浏览器窗口自动隐藏
  - 无任务栏便签
  - 快速隐藏快捷键：双击鼠标中键+全局显隐快捷键：双击 Backquote 键
  - 记录上次打开网页
  - 番茄小说专属阅读优化

![N|Solid](https://github.com/mitchas/glass-browser/raw/master/assets/screenshot.PNG)

## 本地构建和运行：
- 克隆仓库。
- 进入目录
- 确保安装了 electron `npm install electron`
- 安装并运行 `npm install && npm start`

## 打包（.app for mac, .exe for windows, 或 linux ** 在 Mac 和 Linux 上未经测试）
- 安装 [Electron Packager Interactive](https://github.com/Urucas/electron-packager-interactive)：`npm install -g electron-packager-interactive`
- 运行 `epi`
- 按照步骤操作
  - 图标路径为 `./assets/icon.ico'

## 使用方法
- 输入 URL 并按 Enter
- 调整窗口大小并定位到您想要的位置。
- 根据您的喜好调整透明度。
- 点击眼睛图标启用点击穿透模式。它会忽略鼠标点击并让您与下方的窗口交互。
- 要禁用点击穿透并再次与窗口交互，请点击 Windows 任务栏中的图标并最小化它，然后再次点击打开它，点击穿透模式将被禁用。

## 已知问题
- 透明度在 Linux 上似乎不起作用 - 但它仍然会浮动在其他窗口之上。
