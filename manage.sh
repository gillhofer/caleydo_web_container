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


function install_apt_dependencies {
  if [ -f apt.txt ] ; then
    echo "--- installing apt dependencies ---"
    wd="`pwd`"
    cd /tmp #switch to tmp directory
    set -vx #to turn echoing on and
    sudo apt-get install -y `cat $wd/apt.txt`
    set +vx #to turn them both off
    cd $wd
    rm apt.txt
  fi
}
function install_pip_dependencies {
  if [ -f requirements.txt ] ; then
    echo "--- installing pip dependencies ---"
    wd="`pwd`"
    cd /tmp #switch to tmp directory
    sudo pip install -r $wd/requirements.txt
    set -vx #to turn echoing on and
    cd $wd
    rm requirements.txt
  fi
}
function install_npm_dependencies {
  if [ -f npm.txt ] ; then
    echo "--- installing npm dependencies ---"
    cat npm.txt | while  read $line;do
      set -vx #to turn echoing on and
      npm install $line
      set +vx #to turn them both off
    done
    rm npm.txt
  fi
}
function install_bower_dependencies {
  if [ -f bower.json ] ; then
    echo "--- installing bower dependencies ---"
    set -vx #to turn echoing on and
    bower install
    set +vx #to turn them both off
    rm bower.json
  fi
}



function resolve {
  ###################################
  # collects and resolve all dependencies
  ###################################
  #provision dependencies
  #pip dependencies
  #node dependencies
  #bower dependencies

  if [ "`whoami`" == "vagrant" ] ; then
    echo "--- resolving depenendencies"
    grunt resolveDependencies

    install_apt_dependencies
    install_pip_dependencies
    install_npm_dependencies
    install_bower_dependencies
  else
    echo "this command should be executed within the VM: aborting"
  fi
}

REGISTRY="http://dev.caleydo.org/nexus/content/repositories/caleydo-web/"

function npmredirect {
    ###################################
    # redirects commands to npm
    ###################################
    #create the link to our own registry
    echo "registry=$REGISTRY" > .npmrc
    set -vx #to turn echoing on and
    (npm $@; rm .npmrc)
    set +vx #to turn them both off
}

#command switch
case "$1" in
pull)
	pull
	;;
resolve)
  resolve
  ;;
*)
	npmredirect $@
  ;;
esac
