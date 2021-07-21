# Polaris Console

## 开发说明

### 环境要求
Node开发环境
Go 1.12及以上版本，本项目依赖go mod进行包管理

### 获取代码
```
git clone https://github.com/PolarisMesh/polaris-console.git
```

### 编译
```
// Web
cd polaris-console/web
npm run build
```

```
// Web服务器
cd polaris-console
go build -o polaris-console
```

### 提交依赖
将Go依赖包复制到vendor
```
go mod vendor
```

