#!/usr/bin/env bash
echo "--- Start neo4j provision ---"

##########################
# neo4j
# following debian.neo4j.org

#neo4j add to packages
wget -O - http://debian.neo4j.org/neotechnology.gpg.key| sudo apt-key add - # Import our signing key
echo 'deb http://debian.neo4j.org/repo stable/' | sudo tee /etc/apt/sources.list.d/neo4j.list # Create an Apt sources.list file

sudo apt-get update
sudo apt-get install -y neo4j

#TODO change the neo4j-server.properties e.g using grep or sed
#listens to all connections even from outside by uncomenting a config line
sudo sed -i '/^#.*0.0.0.0/s/^#//' /etc/neo4j/neo4j-server.properties
#restart server:
sudo service neo4j-service restart
#access the browser interface via: http://localhost:7474/
