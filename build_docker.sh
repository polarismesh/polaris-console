#!/bin/bash

workdir=$(dirname $(realpath $0))

# build docker file
if [ $# != 1 ]; then
  echo "e.g.: bash $0 v1.0"
  exit 1
fi

docker_tag=$1

echo "docker repository : polarismesh/polaris-console, tag : ${docker_tag}"

bash build.sh

if [ $? != 0 ]; then
  echo "build polaris-console failed"
  exit 1
fi

docker build --network=host -t polarismesh/polaris-console:${docker_tag} ./

docker push polarismesh/polaris-console:${docker_tag}
docker tag polarismesh/polaris-console:${docker_tag} polarismesh/polaris-console:latest
docker push polarismesh/polaris-console:latest
