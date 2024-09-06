#!/bin/bash

curpath=$(pwd)

if [ "${0:0:1}" == "/" ]; then
  dir=$(dirname "$0")
else
  dir=$(pwd)/$(dirname "$0")
fi

cd $dir/..
workdir=$(pwd)

#------------------------------------------------------
source tool/include

# 页面展示的控制配置
if [[ -f "${workdir}/function.json" ]] && [[ -z "${POLARIS_EXPORT_FUNCTION_FILE}" ]];then
  export POLARIS_EXPORT_FUNCTION_FILE="${workdir}/function.json"
fi

pids=$(ps -ef | grep -w "$cmdline" | grep -v "grep" | awk '{print $2}')
array=($pids)
if [ "${#array[@]}" == "0" ]; then
  start
fi
add_cron

#------------------------------------------------------

cd $curpath
