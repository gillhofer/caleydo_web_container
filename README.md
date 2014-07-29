# caleydo-web

## Installation

1. Install [node.js](http://www.nodejs.org).
2. Clone the repository ```git clone git@github.com:Caleydo/caleydo-web.git```.
3. Install grunt and bower ```npm install -g bower grunt-cli``` (might have to be run using ```sudo```).
4. Install requirements ```npm install``` (might have to be run using ```sudo```).
5. Install bower requirements ```bower install```

## Launching the server

1. Launch ```grunt server```.
2. View site in browser at http://127.0.0.1:9000/.


## Webstorm 

1. open the project in WebStorm
2. go to the Grunt tab and start the ```serverd``` tasks. This will start the client and server in debug modus
3. use the existing launch configurations to debug the client code ```caleydo-web-client``` or the server code ```caleydo-web-server```. Just put breakpoints in the corresponding JavaScript files
