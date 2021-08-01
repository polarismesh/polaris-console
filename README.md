# Polaris Console

Visit [website](https://polarismesh.cn) to learn more

## Quick Start

### 环境要求

Node 开发环境
Go 1.12 及以上版本，本项目依赖 go mod 进行包管理

### 获取代码

```
git clone https://github.com/PolarisMesh/polaris-console.git
```

### 编译

```
// Web
cd polaris-console/web
npm i
npm run build
```

```
// Web服务器
cd polaris-console
go build -o polaris-console
```

### 提交依赖

将 Go 依赖包复制到 vendor

```
go mod vendor
```
