# -*- mode: ruby -*-
# vi: set ft=ruby :

# Vagrantfile API/syntax version. Don't touch unless you know what you're doing!
VAGRANTFILE_API_VERSION = "2"

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|
  # All Vagrant configuration is done here. The most common configuration
  # options are documented and commented below. For a complete reference,
  # please see the online documentation at vagrantup.com.

  # Every Vagrant virtual environment requires a box to build off of.
  config.vm.box = "ubuntu/trusty32"

  config.vm.hostname = "caleydo-web"
  config.vm.network :private_network, ip: "192.168.50.52"

  config.ssh.forward_agent = true

  #forward port 9000 to localhost
  config.vm.network "forwarded_port", guest: 9000, host: 9000

  #example of adding another shared folder
  #syntax: <host directory>, <guest directory (absolute)>, id: <a unique id for referencing>
  #config.vm.synced_folder "../caleydo", "/var/caleydo", id: "calyedo", :nfs => false

  config.vm.provider "virtualbox" do |v|
    v.memory = 2048
    v.cpus = 1 #use just one core avoiding the VT flag enabled in bios
    v.customize ["modifyvm", :id, "--ioapic", "on"]
    #enable symbolic link support on the shared folder
	v.customize ["setextradata", :id, "VBoxInternal2/SharedFoldersEnableSymlinksCreate/vagrant", "1"]
	#enable links for the shared folder example
	#v.customize ["setextradata", :id, "VBoxInternal2/SharedFoldersEnableSymlinksCreate/calyedo", "1"]
  end

  #execute the provision script
  config.vm.provision "shell", path: "Vagrantfile_provision.sh"
end
