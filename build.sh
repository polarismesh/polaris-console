#!/bin/bash

#workdir=$(dirname $(realpath $0))
workdir=$(cd -P -- "$(dirname -- "$0")" && pwd -P)
version=$(cat version 2>/dev/null)
folder_name="polaris-console-release_${version}"
if [ -n $GOOS ] && [ -n $GOARCH ]
then
	folder_name="polaris-console-release_${version}.${GOOS}.${GOARCH}"
fi
pkg_name="${folder_name}.tar.gz"

cd $workdir

# 清理环境
rm -rf ${folder_name}
rm -f ${pkg_name}

# 编译web
cd $workdir/web
rm -rf dist/
npm install
npm run build

# 编译web服务器
cd $workdir
rm -f polaris-console
go build -mod=vendor -o polaris-console

# 打包
cd $workdir
mkdir -p ${folder_name}/web/
mv web/dist/ ${folder_name}/web/
mv polaris-console ${folder_name}
cp polaris-console.yaml ${folder_name}
cp -r tool/ ${folder_name}/tool/
tar -czvf "${pkg_name}" ${folder_name}
#md5sum ${pkg_name} > "${pkg_name}.md5sum"

if [[ $(uname -a | grep "Darwin" | wc -l) -eq 1 ]]; then
  md5 ${pkg_name} >"${pkg_name}.md5sum"
else
  md5sum ${pkg_name} >"${pkg_name}.md5sum"
fi
