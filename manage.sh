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
  if [ -f npm.package.json ] ; then
    echo "--- installing npm dependencies ---"
    mv "package.json" "ori.package.json"
    mv "npm.package.json" "package.json"

    set -vx #to turn echoing on and
    sudo npm install
    set +vx #to turn them both off

    rm "package.json"
    mv "ori.package.json" "package.json"
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

function install_tsd_dependencies {
  if [ -f tsd.txt ] ; then
    echo "--- installing tsd dependencies ---"

    while IFS=';' read name sha1
    do
      set -vx #to turn echoing on and
      tsd install $name --commit $sha1
      set +vx #to turn them both off
    done < tsd.txt
    rm tsd.txt
  fi
}

function resolve {
  ###################################
  # collects and resolve all dependencies
  ###################################

  if [ "`whoami`" == "vagrant" ] ; then
    echo "--- resolving dependencies ---"
    grunt resolveDependencies

    install_apt_dependencies
    install_pip_dependencies
    install_npm_dependencies
    install_bower_dependencies
    install_tsd_dependencies
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

    #fake node_modules directory
    if [ -e "node_modules" ] ; then
      mv "node_modules" "_node_modules"
    fi
    if [ -d "plugins" ] ; then
      mv "plugins" "node_modules"
    else
      mkdir "node_modules"
    fi

    set -vx #to turn echoing on and

    npm $@

    set +vx #to turn them both off
    rm .npmrc

    #recreate original structure
    mv "node_modules" "plugins"
    if [ -e "_node_modules" ] ; then
      mv "_node_modules" "node_modules"
    fi
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
