# Polaris Console

[English](README.md) | 中文

## 介绍
Polaris Console 为 Polaris 的组件之一，它提供简单易用的管理页面，支持用户和权限管理。

访问 [官网](https://polarismesh.cn) 了解更多

## 准备开发

- Node 开发环境
- Go 1.12 及以上版本，本项目依赖 go mod 进行包管理

将项目打包成可执行安装包
```shell
./build.sh
```

**注意：**

如若 `npm install` 或 `npm run build` 失败，请尝试：
- 切换 `Node.js` 的版本为 12.0 左右
- 设置 `web/build/copy-file.sh` 的格式为类 Unix 格式
