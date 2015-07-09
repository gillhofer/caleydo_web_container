#!/usr/bin/env bash

read -p "Enter id: [other]" name
name=${name:-other}
read -p "Enter destination: [~/neo4j_${name}d]" dest
dest=${dest:-~/neo4j_${name}d}
read -p "Enter port: [7475]" port
port=${port:-7475}
read -p "Enter data directory: [data/graph.db]" datadir
datadir=${datadir:-data/graph.db}

echo $name $port $dest $datadir

basedir='/var/lib/neo4j'

mkdir $dest
mkdir $dest/conf

ln -s $basedir/bin $dest
ln -s $basedir/lib $dest
ln -s $basedir/plugins $dest 
ln -s $basedir/system $dest 

#create config links
ln -s $basedir/conf/* $dest/conf
#replace the config with a new one
rm $dest/conf/neo4j-server.properties
cp $basedir/conf/neo4j-server.properties $dest/conf/neo4j-server.properties
sedeasy(){
  sed -i "s/$(echo $1 | sed -e 's/\([[\/.*]\|\]\)/\\&/g')/$(echo $2 | sed -e 's/[\/&]/\\&/g')/g" $dest/conf/neo4j-server.properties
}
sedeasy 7474 ${port}
sedeasy "data/graph.db" "${datadir}"
sedeasy "https.enabled=true" "https.enabled=false"

mkdir $dest/data
ln -s $basedir/data/keystore $dest/data

ln -s $dest/bin/neo4j ~/neo4j_${name}

echo "done start using ~/neo4j_${name} start"