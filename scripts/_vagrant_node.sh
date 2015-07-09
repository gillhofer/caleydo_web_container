#!/usr/bin/env bash
echo "--- Start node provisioning ---"

#########################
#node-js

sudo apt-get install -y curl
curl -sL https://deb.nodesource.com/setup | sudo bash -
sudo apt-get install -y nodejs

#install some global packages
sudo npm install -g grunt-cli bower

#install the node packages
bak="`pwd`"
cd /vagrant

#create a symlink version of the node modueles for better performance
if [[ ! -d "node_modules" ]]; then
  mkdir ~/vagrant_node_modules
  ln -s ~/vagrant_node_modules ./node_modules
fi


echo "--- installing node dependencies ---"
set -vx #to turn echoing on and
sudo npm install
set +vx

cd $bak
