Caleydo Web Container
=====================

This is a container repository for Caleydo Web. It is used for creating, combining, and managing individual plugins Caleydo Web constists of.

Create Dev Environment
----------------------

0. *Windows Only*: Install [Git](http://git-scm.com/download/win)
1. Install [Vagrant](http://www.vagrantup.com/) and [VirtualBox](https://www.virtualbox.org/)
  Vagrant is used for creating a controlled environment using a virtual machine provided by VirtualBox

2. Clone this repository
  ~~~bash
 git clone https://github.com/Caleydo/caleydo-web.git
 ~~~

3. Launch a (bash) shell
   *Windows Only*: Ensure that you start the `Git Bash` with Adminstrative rights

4. let Vagrant create the environment for you
 ~~~bash
 # start vagrant
 vagrant up
 ~~~

5. Connect to VM:
 ~~~bash
 # connect to vm
 vagrant ssh
 ~~~

6. Navigate to caleydo directory
 ~~~bash
 cd /vagrant
 ~~~
 this folder is shared with your cloned repository. So, all changes are reflected in your local filesystem
 
7. Exit and stop the virtual machine
 ~~~bash
 exit
 vagrant halt
 ~~~

Management Utility
------------------
`manage.py` is a management utility for installling plugins, pulling repositories, and resolving external dependencies. commands

usage: 
~~~bash
./manage.sh <command> <args>
~~~

### pull command

the `pull` command is a utility for pulling all git repositories within the project, i.e. the container and all the plugins

### resolve command

the `resolve` command is used to resolve external dependencies of the plugins. 

**Attention**: this command can only be invoked within the virtual machine, to avoid that your system is cluttered. 

Currently, following external dependency types are supported: 

 * *debian*: installs the listed debian packages using `[Apt](https://wiki.debian.org/Apt)
 * *python*: installs python plugins using the [PyPi](https://pypi.python.org/pypi)
 * *node*: installs node dependencies via [npm](http://npmjs.org/)
 * *web*: installs web dependencies via [Bower](http://bower.io)
 
### build, server, server_js commands

builds or build and runs Caleydo Web. [Grunt](http://gruntjs.com) is used as build tool and this command redirects to it. 


### install, list, explore, search, ... commands

all other commands are redirected to a configured [npm](http://npmjs.org/) instance. The configuration includes using the caleydo repository. 
If you wanna install plugins outside of the virtual machine, ensure that you installed npm. 

Building Caleydo Web
--------------------

TODO

Running Caleydo Web
-------------------

Depending whether you installed the python server `caleydo_server` or the Javascript server `caleydo_server_js` call the corresponing grunt task: `server` and `server_js`. 
This will compile and watches all files and launch the server at port 9000 by default. 