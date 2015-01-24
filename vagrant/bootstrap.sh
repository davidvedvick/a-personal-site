#!/usr/bin/env bash

apt-get update
curl -sL https://deb.nodesource.com/setup | bash -
apt-get install -y nodejs
apt-get install -y build-essential

cd /project/server

npm install
