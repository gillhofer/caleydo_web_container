Caleydo Web Container
=====================

Checkout this repository parallel to the `caleydo-web` repository.

##Setup within host
 1. Install [Vagrant](http://www.vagrantup.com/) and [VirtualBox](https://www.virtualbox.org/)
 2. clone repo
 
 ~~~bash
 git clone https://github.com/Caleydo/caleydo-web.git
 git clone https://github.com/Caleydo/caleydo-web-server.git
 ~~~
 
 **IMPORTANT** you have to checkout the server in the same directory as the caleydo-web repository. Both directories are linked within the virtual machine
 3. go to a (bash) shell
  **IMPORTANT** on windows ensure that you execute the shell with administrator rights
 
 4. let vagrant create a vm for you:
 ~~~bash
 # start vagrant
 vagrant up
 ~~~

 6. Connect to VM:
 ~~~bash
 # connect to vm
 vagrant ssh
 ~~~

##shorthand script for client and server
run:
~~~bash
/vagrant/run.sh
~~~

hint: during the first run bower will asked whether it can upload usage statistics

now you can access: http://localhost:9000

END 

Long version for the server setup:

##Install Pip Depedendencies
 1. Within the vm:
  ~~~bash
 #switch to right directory
 cd /vagrant/
 ~~~

 2. create a pip dependencies file
  ~~~bash
 python server --dependencyOnly
 ~~~

 3. install the dependencies
 
 ~~~bash
 sudo pip install -r requirements.txt
 ~~~
 
##Run the server
 1. ~~~bash
 python server 
 ~~~
 2. access the server as usual: http://localhost:9000

##Stop 
 1. kill python
 2. shutdown vagrant
 ~~~bash
 vagrant halt
 ~~~
