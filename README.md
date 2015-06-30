Caleydo Web Container
=====================

This is a container repository for Caleydo Web. It is used for creating, combining, and managing individual plugins Caleydo Web constists of.

Get Caleydo Web Dev Running on Your Machine
-------------------------------------------

0. *Windows Only*: Install [Git](http://git-scm.com/download/win)
1. Install [Vagrant](http://www.vagrantup.com/) and [VirtualBox](https://www.virtualbox.org/)
  Vagrant is used for creating a controlled environment using a virtual machine provided by VirtualBox

2. Clone this repository
  ~~~bash
 git clone https://github.com/Caleydo/caleydo-web.git
 ~~~

3. Launch a (bash) shell
   *Windows Only*: Ensure that you start the `Git Bash` with Adminstrative rights

4. Install the plugins and applications you wanna use.


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

7. Run Caleydo Web
 ~~~bash
/vagrant/run.sh
 ~~~

*Hint*: during the first run bower will asked whether it can upload usage statistics

8. Caleydo Web should now be accessible at: http://localhost:9000



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
