#!/bin/bash

set -e

if [[ $(uname) == 'Darwin' ]]; then
  realpath() {
    [[ $1 = /* ]] && echo "$1" || echo "$PWD/${1#./}"
  }

  md5sum() {
    md5 $*
  }
fi

workdir=$(dirname $(realpath $0))
version=$(cat version 2>/dev/null)

if [ $# == 1 ]; then
  version=$1
fi

bin_name="polaris-console"
if [ "${GOOS}" == "" ]; then
  GOOS=$(go env GOOS)
fi
if [ "${GOARCH}" == "" ]; then
  GOARCH=$(go env GOARCH)
fi
folder_name="polaris-console-release_${version}.${GOOS}.${GOARCH}"
pkg_name="${folder_name}.zip"
if [ "${GOOS}" == "windows" ]; then
  bin_name="polaris-console.exe"
fi
echo "GOOS is ${GOOS}, binary name is ${bin_name}"

cd $workdir

# 清理环境
rm -rf ${folder_name}
rm -f ${pkg_name}
rm -rf "polaris_console_package"

# 编译web
cd $workdir/web
rm -rf dist/
npm install --force
npm run build

# 编译web服务器
cd $workdir
rm -f polaris-console
CGO_ENABLED=0 go build -o ${bin_name}

# 打包
cd $workdir
mkdir -p ${folder_name}/web/
mv web/dist/ ${folder_name}/web/
cp ${bin_name} ${folder_name}
cp polaris-console.yaml ${folder_name}
cp -r tool/ ${folder_name}/tool/

mkdir -p ${folder_name}/mysql/
zip -r "${pkg_name}" ${folder_name}
md5sum ${pkg_name} >"${pkg_name}.md5sum"
mv ${folder_name} "polaris_console_package"

if [[ $(uname -a | grep "Darwin" | wc -l) -eq 1 ]]; then
  md5 ${pkg_name} >"${pkg_name}.md5sum"
else
  md5sum ${pkg_name} >"${pkg_name}.md5sum"
fi
