#!/usr/bin/env bash

###################################
# Management script for Caleydo Web
###################################

function pull {
  ###################################
  # shorthand script for pulling the container and all plugins
  ###################################
  echo "--- pull container ---"
  git pull
  echo "--- pull plugins ---"

  find . -name .git -type d -prune | while read d; do
     cd $d/..
     echo "--- pull plugin $PWD"
     git pull
     cd $OLDPWD
  done
}

INDEX_FILE=".tmp/web-index.csv"

function update {
  ###################################
  # update the index file
  ###################################

  mkdir -p .tmp
  curl -o $INDEX_FILE http://caleydo.github.io/downloads/web-index.csv
}

function ensure_index {
  ###################################
  # ensures that the index file exists
  ###################################

  if [ ! -f $INDEX_FILE ]; then
    update
  fi
}

function list {
  ###################################
  # lists all available plugins
  ###################################

  ensure_index
  while IFS=';' read name url description
  do
    echo "$name ($url)"
    echo  "$description"
  done < $INDEX_FILE
}

function install {
  ###################################
  # install a given plugin by name
  ###################################

  local plugin=$1
  local usessh=$2
  while IFS=';' read name url description
  do
    if [ "$name" == "$plugin" ]; then
      echo "installing: $name ($url)"
      git clone $url
    fi
  done < $INDEX_FILE
}

function resolve {
  ###################################
  # collects and resolve all dependencies
  ###################################
  #provision dependencies
  #pip dependencies
  #node dependencies
  #bower dependencies
  echo "TODO"
}


#command switch
case "$1" in
pull)
	pull
	;;
update)
  update
  ;;
list)
  list
  ;;
install)
  install $2 $3
  ;;
resolve)
  resolve
  ;;
*)
	echo "unknown command: $1"
esac
