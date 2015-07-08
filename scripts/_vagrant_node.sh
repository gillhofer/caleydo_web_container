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
if ![ -d "node_modules" ] ; then
  ln -s ~/vagrant_node_modules ./node_modules
fi

set -vx #to turn echoing on and
npm install
set +vx

cd $bak
