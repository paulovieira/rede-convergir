var Hapi = require('hapi'),
    Nunjucks = require('hapi-nunjucks'),
    _ = require('underscore'),
    moment = require("moment"),
    chalk = require('chalk'),
    config = require("config"),
    utils = require(global.rootPath + "server/common/utils.js");


// 1. create a server with the options defined in the main server's settings file
var server = new Hapi.Server(config.get("hapi.server"));

server.connection({
    host: config.get("host"),
    port: config.get("port")
});


// 2. configure views and template engine
server.views(config.get("hapi.views"));

Nunjucks.configure(global.rootPath + 'server/views', {
    watch: false
    //    autoescape: true 
});

Nunjucks.addGlobal("lang", "pt");

Nunjucks.addFilter('stringify', function(str) {
    return JSON.stringify(str);
});


// 3. register the plugins
utils.registerPlugins(server);


// 4. add the routes (for views and files)
server.route(require(global.rootPath + 'server/routes/assets-routes.js'));
server.route(require(global.rootPath + 'server/routes/base-routes.js'));


// 5. add the API routes

// read every module in the server/api directory (load-all.js uses require-directory, which
// will read all the modules in that directory and create an object holding them all)
var apiRoutesArray = _.values(require(global.rootPath + "server/api/load-all.js"));

// register the API routes (which were defined as hapi plugin objects)
/**/
server.register(
    apiRoutesArray, 
    {
        routes: {
            prefix: "/api"
        }
    },
    function(err) {
        if (err) {
            throw err;
        }
    }
);

// make sure we always have a "credentials" object on request.auth
server.ext("onPostAuth", function(request, reply){
    request.auth.credentials = request.auth.credentials || {};
    return reply.continue();
});


server.on('tail', function (request) {

    var lang = request.path.substring(1,3),
        logData = {};

    if(lang === "pt" || lang === "en"){
        logData.id = request.id;
        logData.time = moment().format();  // date in ISO8601 format
        logData.method = request.method;
        logData.path = request.path;
        logData.responseStatusCode = request.response.statusCode;
        logData.duration = request.info.responded - request.info.received;
        logData.remoteAddress = request.info.remoteAddress;
        logData.remotePort = request.info.remotePort;
        logData.referrer = request.info.referrer;
        logData.host = request.info.host;
        logData.hostname = request.info.hostname;


        //console.log(request.plugins.scooter.toJSON());
//        console.log(logData);
    }


});

server.on('request-error', function (request, err) {
    // console.log("--------------------------");
    // console.log("reqId: ", request.id);
    // console.log("message: ", err.message);
    // console.log("stack: ", err.stack);
    // console.log("--------------------------");
});

server.on('request-internal', function (request, event, tags) {

//    console.log("tags: ", tags);
});



// 6. Start the server
server.start(function() {
    console.log("Server started: \n" +
        chalk.bgBlue("protocol:") + " " + server.info.protocol + "\n" +
        chalk.bgBlue("host:") + " " + server.info.host + "\n" +
        chalk.bgBlue("port:") + " " + server.info.port + "\n" +
        chalk.bgBlue("uri:") + " " + server.info.uri + "\n" +
        chalk.bgBlue("address:") + " " + server.info.address + "\n");
});
