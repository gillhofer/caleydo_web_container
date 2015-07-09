#!/usr/bin/env bash
echo "--- Start provisioning ---"

#create a symlink to the deploy direction
sudo ln -s /vagrant /var/lib/caleydo


#update package sources
sudo apt-get update
#install git
sudo apt-get install -y build-essential git

#install all plugin provision scripts

echo "--- execution provision scripts: "
for line in $(find /vagrant/ -maxdepth 2 -name '_vagrant*.sh'); do
  echo "--- execution provision script: $line"
  ( exec $line )
done

echo "--- Done, use 'vagrant ssh' for jumping into the VM ---"
