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
  cd plugins
  find . -name .git -type d -prune | while read d; do
    cd $d/..
    echo "--- pull plugin $PWD"
    git pull
    cd $OLDPWD
  done
  cd ..
}


function install_apt_dependencies {
  if [ -f _tmp/debian.txt ] ; then
    echo "--- installing apt dependencies ---"
    wd="`pwd`"
    cd /tmp #switch to tmp directory
    set -vx #to turn echoing on and
    sudo apt-get install -y `cat $wd/_tmp/debian.txt`
    set +vx #to turn them both off
    cd $wd
  fi
}
function install_pip_dependencies {
  if [ -f _tmp/requirements.txt ] ; then
    echo "--- installing pip dependencies ---"
    wd="`pwd`"
    cd /tmp #switch to tmp directory
    sudo pip install -r $wd/_tmp/requirements.txt
    set -vx #to turn echoing on and
    cd $wd
  fi
}
function install_npm_dependencies {
  if [ -f _tmp/package.json ] ; then
    echo "--- installing npm dependencies ---"
    mv "package.json" "ori.package.json"
    mv "_tmp/package.json" "package.json"

    set -vx #to turn echoing on and
    sudo npm install
    set +vx #to turn them both off

    rm "package.json"
    mv "ori.package.json" "package.json"
  fi
}
function install_bower_dependencies {
  if [ -f _tmp/bower.json ] ; then
    echo "--- installing bower dependencies ---"
    mv "_tmp/bower.json" "bower.json"
    set -vx #to turn echoing on and
    bower --config.interactive=false install
    set +vx #to turn them both off
    mv "bower.json" "_tmp/bower.json"
  fi
}

function install_tsd_dependencies {
  if [ -f _tmp/tsd.txt ] ; then
    echo "--- installing tsd dependencies ---"

    while IFS=';' read name sha1
    do
      set -vx #to turn echoing on and
      tsd install $name --commit $sha1
      set +vx #to turn them both off
    done < _tmp/tsd.txt
    rm -f tsd.json

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

function resolve_dev {
  ###################################
  # collects and resolve all dependencies
  ###################################

  echo "--- resolving dev dependencies ---"
  grunt resolve_dependencies:dev

  install_tsd_dependencies
}

REGISTRY="http://registry.caleydo.org/"

function gruntredirect {
  ###################################
  # redirects commands to npm
  ###################################

  ensure_in_vm

  set -vx

  grunt $@
}

resolved_plugins=";"

function clone {
  ###################################
  # clones a plugin given by url
  ###################################

  #use ssh or https (default)
  local prefix=""
  local usessh=$1
  if [[ $1 == "ssh" ]] ; then
    prefix="git@github.com:"
  else
    prefix="https://github.com/"
  fi
  shift
  local pull_if_exist=$1
  shift

  #guess the repo name
  local reponame=${1##*/}
  if [ -d plugins/${reponame} ] ; then
    if [[ ${resolved_plugins} == *";${reponame}"* ]] ; then
      #already resolved
      echo ${reponame} already exists and checked
    else
      echo ${reponame} already exists
      if [ ${pull_if_exist} == "true" ] && ([ -d plugins/${reponame}/.git ]) ; then
        cd plugins/${reponame}
        set -vx
        git pull
        set +vx
        cd ..
        cd ..
      fi
      resolved_plugins="${resolved_plugins}${reponame};"
      clone_dependencies ${usessh} ${pull_if_exist} ${reponame}
    fi

    return
  fi

  cd plugins

  if ([ $1 != git* ] || [ $1 != http* ] ) ; then
    local url=Caleydo/$1
    if [[ "$1" == */* ]] ; then
      url=$1
    fi
    shift
    echo cloning ${prefix}${url}.git $@
    set -vx
    git clone ${prefix}${url}.git $@
    set +vx
  else
    echo cloning $@
    set -vx
    git clone $@
    set +vx
  fi

  cd ..

  resolved_plugins="${resolved_plugins}${reponame};"
  clone_dependencies ${usessh} ${pull_if_exist} ${reponame}
}

function clone_dependencies {
  local usessh=$1
  local pull_if_exist=$2
  local reponame=$3
  #extract the peer dependencies
  if which node >/dev/null; then
    node ./nanage_helper catDependencies ${reponame} | while IFS=';' read name repo
    do
      echo "installing dependency ${name} ${repo}"
      clone ${usessh} ${pull_if_exist} ${repo}
    done
  else
    echo "can't find node for extracting dependencies"
  fi
}

function publish {
  ###################################
  # publishes a plugin
  ###################################
  cd plugins
  set -vx

  npm --registry="${REGISTRY}" publish $@
}


function npmredirect {
  ###################################
  # redirects commands to npm
  ###################################

  if [ "`whoami`" == "vagrant" ] ; then
    #inside vm
    mkdir -p ~/caleydo_web/plugins
    if [ -d "plugins" ] ; then
      if [ ! -e "/home/vagrant/caleydo_web/plugins/node_modules" ] ; then
        ln -sf `pwd`/plugins ~/caleydo_web/plugins/node_modules
      fi
    else
      mkdir ~/caleydo_web/plugins/node_modules
    fi
    cd ~/caleydo_web/plugins
  else
    # outside on windows
    #outside of vm use move if we are on a linux system else just link
    mkdir -p _npmenv
    if [ -d "plugins" ] ; then
      if [ "$(expr substr $(uname -s) 1 10)" == "MINGW32_NT" -o "$(expr substr $(uname -s) 1 6)" == "CYGWIN" ]; then
        mv plugins _npmenv/node_modules
      else
        ln -s `pwd`/plugins _npmenv/node_modules
      fi
    else
      mkdir _npmenv/node_modules
    fi
    cd _npmenv
  fi

  #create the link to our own registry
  echo "registry=$REGISTRY" > .npmrc

  set -vx #to turn echoing on and

  npm $@

  set +vx #to turn them both off

  #recreate original structure
  if [ "`whoami`" == "vagrant" ] ; then
    #inside vm
    rm ~/caleydo_web/plugins
  else
    #outside of vm use move if we are on a linux system else just link
    if [ "$(expr substr $(uname -s) 1 10)" == "MINGW32_NT" -o "$(expr substr $(uname -s) 1 6)" == "CYGWIN" ]; then
      mv node_modules ../plugins
    fi
    cd ..
    rm -r _npmenv
  fi
}

#command switch
case "$1" in
pull)
  pull $@
  ;;
resolve)
  resolve $@
  ;;
resolve_dev)
  resolve_dev $@
  ;;
clone)
  shift
  clone https false $@
  ;;
clone_ssh | ssh_clone)
  shift
  clone ssh false $@
  ;;
clone_deps)
  shift
  clone_dependencies https false $@
  ;;
clone_ssh_deps | ssh_clone_deps)
  shift
  clone_dependencies ssh false $@
  ;;
update_deps)
  shift
  clone_dependencies https true $@
  ;;
update_ssh_deps | ssh_update_deps)
  shift
  clone_dependencies ssh true $@
  ;;
publish)
  shift
  publish $@
  ;;
build | server | server_js | dev)
  gruntredirect $@
  ;;
autocomplete)
  echo pull resolve clone clone_ssh clone_deps clone_ssh-deps update_deps update_ssh_deps publish build server server_js dev install search ls
  ;;
*)
  npmredirect $@
  ;;
esac
