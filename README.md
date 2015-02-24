# caleydo-web

## Prerequesites 

### All platforms
Set up github ssh for authentication, see [this on how to](https://help.github.com/articles/generating-ssh-keys/)
### Mac
1. Install XCode commandline tools (gcc & co)

### Win
1. Ensure to run mingw/gitbash as admin (before starting vagrant)


## Installation as standalone version (w/o caleydo-web-server)

1. Install [node.js](http://www.nodejs.org). (don't use brew on Mac, go to the website)
2. Clone the repository ```git clone git@github.com:Caleydo/caleydo-web.git```.
3. Install grunt and bower ```npm install -g bower grunt-cli``` (might have to be run using ```sudo```).
4. Install requirements ```npm install``` (might have to be run using ```sudo```).
5. Create bower.json file ```node server --dependencyOnly``` 
6. Install bower requirements ```bower install```
7. Build with ```grunt buildd``` (two d's !!)

## Launching the server

1. Launch ```grunt server```.
2. View site in browser at http://127.0.0.1:9000/.


## Webstorm 

1. open the project in WebStorm
2. go to the Grunt tab and start the ```serverd``` tasks. This will start the client and server in debug modus
3. use the existing launch configurations to debug the client code ```caleydo-web-client``` or the server code ```caleydo-web-server```. Just put breakpoints in the corresponding JavaScript files
