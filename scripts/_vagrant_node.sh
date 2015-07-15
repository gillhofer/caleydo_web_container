#!/usr/bin/env bash
echo "--- Start node provisioning ---"

#########################
#node-js

sudo apt-get install -y curl
curl -sL https://deb.nodesource.com/setup | sudo bash -
sudo apt-get install -y nodejs

#install some global packages
sudo npm install -g grunt-cli bower tsd

#install the node packages
bak="`pwd`"
cd /vagrant

#create a symlink version of the node modueles for better performance
if [[ ! -d "node_modules" ]]; then
  mkdir -p /home/vagrant/caleydo_web/node_modules
  ln -s /home/vagrant/caleydo_web/node_modules ./node_modules
fi


echo "--- installing node dependencies ---"
set -vx #to turn echoing on and
sudo npm install
set +vx

cd $bak
