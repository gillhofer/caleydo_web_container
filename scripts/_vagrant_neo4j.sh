#!/usr/bin/env bash
echo "--- Start neo4j provision ---"

##########################
# neo4j
# following debian.neo4j.org

if [ $(dpkg-query -W -f='${Status}' neo4j 2>/dev/null | grep -c "ok installed") -eq 0 ]; then
  #neo4j add to packages
  wget -O - http://debian.neo4j.org/neotechnology.gpg.key| sudo apt-key add - # Import our signing key
  echo 'deb http://debian.neo4j.org/repo stable/' | sudo tee /etc/apt/sources.list.d/neo4j.list # Create an Apt sources.list file

  sudo apt-get update
  sudo apt-get install -y neo4j

  #TODO change the neo4j-server.properties e.g using grep or sed
  #listens to all connections even from outside by uncomenting a config line
  sudo sed -i '/^#.*0.0.0.0/s/^#//' /etc/neo4j/neo4j-server.properties
  #disable authorization by default
  sudo sed -i '/dbms.security.auth_enabled=true/s/dbms.security.auth_enabled=false/' /etc/neo4j/neo4j-server.properties
  #stop server:
  sudo service neo4j-service stop
  #access the browser interface via: http://localhost:7474/
else
  echo "neo4j already installed"
fi