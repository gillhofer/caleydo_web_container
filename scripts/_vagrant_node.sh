#!/usr/bin/env bash
echo "--- Start node provisioning ---"

#########################
#node-js

sudo apt-get install -y curl
curl -sL https://deb.nodesource.com/setup | sudo bash -
sudo apt-get install -y nodejs

#install some global packages
sudo npm install -g grunt-cli bower