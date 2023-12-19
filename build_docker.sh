#!/bin/bash

workdir=$(dirname $(realpath $0))

# build docker file
if [ $# != 1 ]; then
  echo "e.g.: bash $0 v1.0"
  exit 1
fi

docker_tag=$1
docker_repository="${DOCKER_REPOSITORY}"
if [[ "${docker_repository}" == "" ]]; then
    docker_repository="polarismesh"
fi

echo "docker repository : ${docker_repository}/polaris-console, tag : ${docker_tag}"

arch_list=( "amd64" "arm64" )
platforms=""

for arch in ${arch_list[@]}; do
    export GOARCH=${arch}
    export GOOS="linux"
    bash build.sh ${docker_tag}
    if [ $? != 0 ]; then
      echo "build polaris-console failed"
      exit 1
    fi

    mv polaris-console polaris-console-${arch}
    platforms+="linux/${arch},"
done

platforms=${platforms%?}
extra_tags=""

pre_release=`echo ${docker_tag}|egrep "(alpha|beta|rc|[T|t]est)"|wc -l`
if [ ${pre_release} == 0 ]; then
  extra_tags="-t ${docker_repository}/polaris-console:latest"
fi

docker buildx build -t ${docker_repository}/polaris-console:${docker_tag} ${extra_tags} --platform ${platforms} --push ./
