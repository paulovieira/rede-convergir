var Boom = require('boom');
var Hoek = require('hoek');
var _ = require('underscore');
var UUID = require('node-uuid');
var Bcrypt = require("bcrypt");
var Q = require("q");
var Moment = require("moment");
var chalk = require("chalk");

var config = require("config");
var utils = require(global.rootPath + 'server/common/utils');
var transforms = require(global.rootPath + 'server/common/transforms.js');
var BaseC = require(global.rootPath + "server/models/base-model.js").collection;

//var jsonFormat = require("json-format");

var handlers = {

    testpre: function(request, reply) {
        console.log(utils.logHandlerInfo(request));
        debugger;

        var users = request.pre.usersC.toJSON();
        utils.deleteProps(users, "userTexts", "userGroups", "pwHash");


        return reply(users);
    },

    index: function(request, reply) {
        console.log(utils.logHandlerInfo(request));
        debugger;

        return reply.redirect("/" + config.get("allowedLanguages")[0]);
    },


    generalPage: function(request, reply) {
debugger;
        console.log(utils.logHandlerInfo(request));
        debugger;
//console.log("user-agent:", request.plugins.scooter.toJSON());
//request.log(['databasex', 'read'], "this is the message");
//request.log(['databasex', 'read'], "this is the message2");


        request.params.level1 = request.params.level1 || "";
        request.params.level2 = request.params.level2 || "";
        request.params.level3 = request.params.level3 || "";

        var viewFile = utils.getView(request.params);

        // if the combination of the level params is not recognized (that is, not present in the availableRoutes
        // array in config/default.js), the empty string will be returned
        if(viewFile===""){
            return reply.redirect("/" + request.params.lang + "/404");
        }

        var context = {
            texts: request.pre.texts,
            textsArray: request.pre.textsArray,
            files: request.pre.files,
            images: request.pre.images,
            
            urlParam1: request.params.level1,
            urlParam2: request.params.level2,
            urlParam3: request.params.level3,
            urlWithoutLang: utils.getUrlWithoutLang(request.params),
            auth: request.auth,
        };

        return reply.view(viewFile, {
            ctx: context
        });
    },

    login: function(request, reply) {
        console.log(utils.logHandlerInfo(request));
        debugger;

        if (request.auth.isAuthenticated) {
            console.log("loginForm handler: valid cookie, will now redirect to /" + request.params.lang + "/dashboard");
            return reply.redirect("/" + request.params.lang + "/dashboard");
        }

        var context = {
            texts: request.pre.texts,
            auth: request.auth,

            urlParam1: "login",
            lfr: request.query.lfr || "" // login fail reason
        }

        return reply.view('login', {
            ctx: context
        });
    },


    loginAuthenticate: function(request, reply) {
        console.log(utils.logHandlerInfo(request));
        debugger;

        var email = request.payload.username,
            password = request.payload.password,
            status_code;


        if (request.auth.isAuthenticated) {
            console.log("loginAuthenticate handler: is already authenticated, will now redirect to /lang/dashboard");
            return reply.redirect("/" + request.params.lang + "/dashboard");
        }

        /*
            Possible values for status_code/status_message:
            1 - "ok" (the provided username and password match)
            2 - "missing username or password" (won't even connect to the DB)
            3 - "username does not exist" 
            4 - "wrong password" (username exists but password doesn't match)
        */

        if (!email || !password) {
            status_code = 2;  // "missing username or password"
            return reply.redirect("/" + request.params.lang + "/login?lfr=" + status_code);
        }

        var usersC = new BaseC();
        usersC
            .execute({
                query: {
                    command: "select * from users_read($1)",
                    arguments: JSON.stringify([{email: email}])
                }
            })
            .done(
                function() {

                    if (usersC.length === 0) {
                        status_code = 3;  // "username does not exist" 
                        return reply.redirect("/" + request.params.lang + "/login?lfr=" + status_code);
                    }

                    var res = Bcrypt.compareSync(password, usersC.at(0).get("pwHash"));

                    if (res === false) {
                        status_code = 4;  // "wrong password"
                        return reply.redirect("/" + request.params.lang + "/login?lfr=" + status_code);
                    }

                    // if we get here, the username and password match
                    console.log( chalk.bgGreen("    ") + chalk.bgYellow(" authentication succeeded for " + usersC.at(0).get("email") ) + chalk.bgGreen("    "));
debugger;
                    var usersGroups = usersC.at(0).get("userGroups");
console.log("usersC.at(0)", usersC.at(0).toJSON());
console.log("usersGroups", usersGroups);
                    var credentials = {
                        id:           usersC.at(0).get("id"),
                        firstName:    usersC.at(0).get("firstName"),
                        lastName:     usersC.at(0).get("lastName"),
                        email:        usersC.at(0).get("email"),

                        // will be true if the user belongs to the group "admin"
                        isAdmin:      !! _.findWhere(usersGroups, {code: 99}),  

                        // will be true if the user belongs to some group that has the
                        // canEditTexts permission
                        canEditTexts: !! _.chain(usersGroups).pluck("permissions").findWhere({canEditTexts: true}).value()
                    };

                    // a user in the admin group can always edit texts
                    if(credentials.isAdmin){
                        credentials.canEditTexts = true;
                    }

                    // set the session in the internal cache (Catbox with memory adapter)
                    var uuid = UUID.v4();
                    request.server.app.cache.set(
                        uuid, 
                        {
                            account: credentials
                        }, 
                        0, 
                        function(err) {
                            debugger;
                            if (err) {
                                return reply(err);
                            }

                            request.auth.session.set({
                                sid: uuid
                            });

                            console.log(chalk.bgGreen("    ") + chalk.bgYellow(" session was set in catbox ") + chalk.bgGreen("    "));
                            console.log("    credentials:\n", credentials);
                            console.log("    will now redirect to /lang/dashboard");

                            return reply.redirect("/" + request.params.lang + "/dashboard");
                        }
                    );

                },
                function() {
                    return reply(Boom.badImplementation());
                }
            );

    },


    /* will handle these paths: /pt/dashboard, /en/dashboard   */
    dashboard: function(request, reply) {
        console.log(utils.logHandlerInfo(request));

        debugger;

        // when NODE_ENV is "dev-no-auth", the route's auth configuration is set to false
        if(config.get('hapi.auth')!==false){
            if(!request.auth.isAuthenticated){
                console.log("    not authenticated, will now redirect to /lang/login");
                return reply.redirect("/" + request.params.lang + "/login");
            }
        }
        else{
            request.auth.credentials.id = 1;
            request.auth.credentials.firstName = "paulo";
            request.auth.credentials.lastName = "vieira";
        }


        var context = {
            texts:      request.pre.texts,
            textsArray: request.pre.textsArray,
            files:      request.pre.files,
            filesArray: request.pre.filesArray,
            auth:       request.auth,
            urlParam1:  "dashboard",
        };

        return reply.view('dashboard', {
            ctx: context
        });

    },

    recover: function(request, reply){
debugger;

        var usersC = request.pre.usersC;
       
        var tokenValidity, reason;

        var context = {
            texts: request.pre.texts,
            urlParam1: "recover",
        };

        if(usersC.length === 0){
            context.reason = "invalid";
        }
        else{
            context.token = usersC.at(0).get("recover");
            tokenValidity = usersC.at(0).get("recoverValidUntil");

            if(Moment().isAfter(tokenValidity)){
                context.reason = "expired";
            }
        }


        return reply.view("recover_password.html", {
            ctx: context
        });


        // if the token is valid and has not expired, show the form to create a new password
//        return reply("change password");
    },

    missing: function(request, reply) {
        console.log(utils.logHandlerInfo(request));
        debugger;

        var context = {
            texts: request.pre.texts,
            urlParam1: "404",
        }

        return reply.view('404', {
            ctx: context
        }).code(404);
    },

    catchAll: function(request, reply) {
        console.log(utils.logHandlerInfo(request));
        debugger;

        return reply.redirect("/" + request.params.lang + "/404");
    },


    logout: function(request, reply) {
        console.log(utils.logHandlerInfo(request));
        debugger;

        request.auth.session.clear();

        console.log("   session was cleared, will now redirect to /lang");
        return reply.redirect("/" + request.params.lang);
    },

    mapa: function(request, reply) {
        utils.logHandlerInfo("mapa", request);

        debugger;


        var context = {
            texts:      request.pre.texts,
            textsArray: request.pre.textsArray,
            files:      request.pre.files,
            filesArray: request.pre.filesArray,
            auth:       request.auth,
            urlParam1:  "mapa",
        };

        return reply.view('mapa', {
            ctx: context
        });

    },
};

module.exports = handlers;
