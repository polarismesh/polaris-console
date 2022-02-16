#!/bin/bash

workdir=$(dirname $(realpath $0))
version=$(cat version 2>/dev/null)

# build docker file
if [ $# != 3 ]; then
    echo "e.g.: bash $0 v1.0 docker_username docekr_user_password"
    exit 1
fi

docker_tag=$1
docker_username=$2
docker_password=$3

echo "docker repository : polarismesh/polaris-console, tag : ${docker_tag}"

bash build.sh

if [ $? != 0 ]; then
    echo "build polaris-server failed"
    exit 1
fi

docker build --network=host -t polarismesh/polaris-console:${docker_tag} ./

docker login --username=${docker_username} --password=${docker_password}

if [[ $? != 0 ]]; then
    echo "docker login failed"
fi

docker push polarismesh/polaris-console:${docker_tag}
docker tag polarismesh/polaris-console:${docker_tag} polarismesh/polaris-console:latest
docker push polarismesh/polaris-console:latest
