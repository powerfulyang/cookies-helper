# chrome-extensions cookies-helper

## 如何安装

### 从 Chrome 商店安装

插件地址: https://chrome.google.com/webstore/detail/cookies-helper/bhofgflgcnibkpdnmpenajacbijpcolh

### 从源码安装

#### 下载源码并编译
+ clone:
```bash
git clone https://github.com/powerfulyang/cookies-helper.git
```
+ install dependencies: 如果没有安装 pnpm, 请先安装 [pnpm](https://pnpm.io/installation)
```bash
pnpm install
```
+ build:
```bash
pnpm run build
```

#### 安装插件

+ 打开 Chrome 的扩展程序页面: `chrome://extensions/`
+ 点击 `开发者模式`/`Developer mode` 按钮
+ 点击 `加载已解压的扩展程序`/`Load unpacked` 按钮
+ 选择 `cookies-helper/dist` 目录
+ 安装成功

## 如何使用

+ 浏览器打开任意网页, 比如: https://www.google.com/
+ 点击插件图标, 弹出插件界面
+ 可以看到当前网页的 Cookies, 文本框可以编辑成你想要查看的域名或者 URL
