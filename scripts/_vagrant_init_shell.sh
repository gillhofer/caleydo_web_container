#!/usr/bin/env bash
echo "--- Start bash configuration ---"

#create an init script for the bash to jump to the right directory

echo "cd /vagrant" >> /home/vagrant/.bashrc
echo "source /vagrant/scripts/_manage_autocomplete.sh" >> /home/vagrant/.bashrc

chown vagrant:vagrant /home/vagrant/.bashrc


