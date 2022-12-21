# Polaris Console

English | [中文](README-zh.md)

## Introduction

Polaris Console is one of the components of Polaris, which provides easy-to-use administration pages and supports user and permission management.

Visit [official website](https://polarismesh.cn) to learn more
## Getting started

### Build

Preparing environment:

- Node Development Environment
- Go 1.12 and above, this project relies on go mod for package management

**Caution:**

If `npm install` or `npm run build` fails, try:
- Switching `Node.js` version to around 12.0
- Set the format of `web/build/copy-file.sh` to Unix-like format

Package the project into an executable installer
```shell
./build.sh
```

