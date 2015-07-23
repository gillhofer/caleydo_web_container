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
  if [ -f debian.txt ] ; then
    echo "--- installing apt dependencies ---"
    wd="`pwd`"
    cd /tmp #switch to tmp directory
    set -vx #to turn echoing on and
    sudo apt-get install -y `cat $wd/debian.txt`
    set +vx #to turn them both off
    cd $wd
    rm debian.txt
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
    bower --config.interactive=false install
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
    rm -f tsd.txt tsd.json

    set -vx #to turn echoing on and
    #create the tsd description file
    tsd rebundle
    set +vx #to turn them both off
  fi
}

function ensure_in_vm {
  if [ "`whoami`" != "vagrant" ] ; then
    echo "this command should be executed within the VM: aborting"
    exit 1
  fi

}
function resolve {
  ###################################
  # collects and resolve all dependencies
  ###################################

  ensure_in_vm
  echo "--- resolving dependencies ---"
  grunt resolve_dependencies:dev

  install_apt_dependencies
  install_pip_dependencies
  install_npm_dependencies
  install_bower_dependencies
  install_tsd_dependencies
}

REGISTRY="http://dev.caleydo.org/nexus/content/repositories/caleydo-web/"

function gruntredirect {
  ###################################
  # redirects commands to npm
  ###################################

  ensure_in_vm

  set -vx

  grunt $@
}

function publish {
  ###################################
  # publishes a plugin
  ###################################
  cd plugins
  shift
  set -vx

  npm --registry=$REGISTRY publish $@
}


function npmredirect {
  ###################################
  # redirects commands to npm
  ###################################

  mkdir -p ~/caleydo_web/plugins
  if [ -d "plugins" ] ; then
    ln -s ./plugins ~/caleydo_web/plugins/node_modules
  else
    mkdir ~/caleydo_web/plugins/node_modules
  fi

  cd ~/caleydo_web/plugins

  #create the link to our own registry
  echo "registry=$REGISTRY" > .npmrc

  set -vx #to turn echoing on and

  npm $@

  set +vx #to turn them both off

  #recreate original structure
  cd /vagrant
  rm -r ~/caleydo_web/plugins
}

#command switch
case "$1" in
pull)
	pull
	;;
resolve)
  resolve
  ;;
publish)
  publish $@
  ;;
build | server | server_js)
  gruntredirect $@
  ;;
*)
	npmredirect $@
  ;;
esac
