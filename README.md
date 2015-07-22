Caleydo Web Container
=====================

This is a container repository for Caleydo Web. It is used for creating, combining, and managing individual plugins Caleydo Web constists of.

Minimal Steps for Launching the Demo Application
------------------------------------------------
~~~bash
git clone https://github.com/Caleydo/caleydo_web_container.git
cd caleydo_web_container
vagrant up
#wait
vagrant ssh
~~~

~~~bash
cd /vagrant
# install the plugins specified 
./manage.sh install demo_app caleydo_server
# resolve dependencies of plugins
./manage.sh resolve
# start caleydo web
./manage.sh server
~~~

access: http://192.168.50.52:9000 and have fun :)

Create Dev Environment
----------------------

0. *Windows Only*: Install [Git](http://git-scm.com/download/win)
1. Install [Vagrant](http://www.vagrantup.com/) and [VirtualBox](https://www.virtualbox.org/) (*NOT* Version 5 there is some bug with symbolic links)
  Vagrant is used for creating a controlled environment using a virtual machine provided by VirtualBox

2. Clone this repository
 ~~~bash
 git clone https://github.com/Caleydo/caleydo_web_container.git
 ~~~

3. Launch a (bash) shell
   *Windows Only*: Ensure that you start the `Git Bash` with adminstrative rights

4. switch to the new directory
 ~~~bash
 cd caleydo_web_container
 ~~~

5. let Vagrant create the environment for you
 ~~~bash
 # start vagrant
 vagrant up
 ~~~

6. Connect to VM:
 ~~~bash
 # connect to vm
 vagrant ssh
 ~~~

7. Navigate to caleydo directory
 ~~~bash
 cd /vagrant
 ~~~
 this folder is shared with your cloned repository. So, all changes are reflected in your local filesystem

8. Exit and stop the virtual machine
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

### publish command

the `publish` command publishes a plugin to the caleydo registry

usage

~~~bash
./manage.sh publish <plugin name>
~~~

Before the first usage you have to enter the credentials for the caleydo registry, i.e. the nexus registry
~~~bash
npm adduser
# follow instructions
~~~

### compile, build, server, server_js commands

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


Setup PyCharm environment
-------------------------

Install [PyCharm](https://www.jetbrains.com/pycharm/).

1. Launch PyCharm
2. Create a project with existing sources via PyCharm
3. Go to File->Settings->Project:...->Project Interpreter and configure a new remote intrepter by choosing the Vagrant option.
4. PyCharm will try to launch the virtual machine
3. copy the template project settings (`_idea_template`) to `.idea` and launch PyCharm
4. prepare the typscript compiler.
  Since PyCharm currently just supports 1.4 we need to use our own compiler from the node_modules folder:
 ~~~bash
  #within virtual machine!
  mkdir -p ./_compiler
  cp ./node_modules/grunt-ts/node_modules/typescript ./_compiler/
 ~~~

TODO

Static Deployment
-----------------

grunt task: `grunt build [--application=<application>] [--context=<context>]`

* application: the main script file of the application which is normally provided as parameter to the `caleydo_web.js` file
* context: since absolute links are used, this may specify a context path, e.g. `/test` where the website is located

folder structure: 
```
/config-gen.js ... generated
/caleydo_web.js ... generated
/index.html ... generated
/bower_components/<libs>
/<plugins> ... compile css and ts and exclude them from making them public
```

Server Deployment
-----------------
http://requirejs.org/docs/optimization.html could be used for creating bundles for each plugin

