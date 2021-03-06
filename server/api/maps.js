var exec = require("child_process").exec;
var rimraf = require("rimraf");
var stream = require('stream');
var Path = require('path');
var Boom = require('boom');
var Joi = require('joi');
var config = require('config');
var fs = require('fs');
var Q = require("q");
var unzip = require('unzip');

//var ent = require("ent");
var _ = require('underscore');
var _s = require('underscore.string');
var changeCaseKeys = require('change-case-keys');

var BaseC = require("../../server/models/base-model.js").collection;
var utils = require('../../server/common/utils.js');
var transforms = require('../../server/common/transforms.js');
var pre = require('../../server/common/pre.js');



var internals = {};
/*** RESOURCE CONFIGURATION ***/

internals.resourceName = "maps";
internals.resourcePath = "/maps";


internals.isDbError = function (err){
    return !!err.sqlState;
};

internals.parseDbErrMsg = function(msg){
    // NOTE: msg.split(msg, "\n") isn't working here
    var arrayMsg = _s.lines(msg);

    arrayMsg = arrayMsg.filter(function(line){
        return _s.startsWith(line.toLowerCase(), "error:") || _s.startsWith(line.toLowerCase(), "detail:");
    });

    return arrayMsg.join(". ");
};

internals.parseError = function(err){
    if(internals.isDbError(err)){  
        var errMsg = internals.parseDbErrMsg(err.message);
        return Boom.badImplementation(errMsg);
    } 

    return Boom.badImplementation(err.message);  
};


// validate the ids param in the URL
internals.validateIds = function(value, options, next){
debugger;

    value.ids = _s.trim(value.ids, ",").split(",");


    var idSchema = Joi.number().integer().min(0);

    // must be an objet like this: { ids: [3,5,7] }
    var schema = Joi.object().keys({
        ids: Joi.array().unique().includes(idSchema)
    });

    var validation = Joi.validate(value, schema, config.get('hapi.joi'));

    if(validation.error){  return next(validation.error);  }

    return next(undefined, validation.value);
};


internals.validatePayloadForCreate = function(value, options, next){

    console.log("validatePayloadForCreate");

    var schemaCreate = Joi.object().keys({
/*
        id: Joi.number().integer().min(0),

        //tags: Joi.array().unique().min(0).includes(Joi.string()).required(),
        tags: Joi.string().regex(/^[-\w\s]+(?:,[-\w\s]+)*$/),

        contents: Joi.object().keys({
            pt: Joi.string().required(),
            en: Joi.string().required()
        }).required(),

        contentsDesc: Joi.object().keys({
            pt: Joi.string().required(),
            en: Joi.string().required()
        }),

        active: Joi.boolean()
*/
    });

    return internals.validatePayload(value, options, next, schemaCreate);
};


internals.validatePayloadForUpdate = function(value, options, next){

    console.log("validatePayloadForUpdate");

    var schemaUpdate = Joi.object().keys({
        id: Joi.number().integer().min(0).required(),
/*
        contents: Joi.object().keys({
            pt: Joi.string().allow("").required(),
            en: Joi.string().allow("").required()
        }).required(),

        //tags: Joi.array().unique().min(0).includes(Joi.string()),
        tags: Joi.string().regex(/^[-\w\s]+(?:,[-\w\s]+)*$/),

        contentsDesc: Joi.object().keys({
            pt: Joi.string().required(),
            en: Joi.string().required()
        }),

        active: Joi.boolean()
*/
    });

    return internals.validatePayload(value, options, next, schemaUpdate);
};



internals.validatePayload = function(value, options, next, schema){
debugger;

    if(_.isObject(value) && !_.isArray(value)){  value = [value];  }

    // validate the elements of the array using the given schema
    var validation = Joi.validate(value, Joi.array().includes(schema), config.get('hapi.joi'));

    if(validation.error){  return next(validation.error); }


    // validateIds was executed before this one; the ids param (if defined) is now an array of integers
    var ids = options.context.params.ids;

    // finally, if the ids param is defined, make sure that the ids in the param and the ids in the payload are consistent
    if(ids){
        for(var i=0, l=validation.value.length; i<l; i++){
            // ids in the URL param and ids in the payload must be in the same order
            if(ids[i] !== validation.value[i].id){
                return next(Boom.conflict("The ids given in the payload and in the URI must match (including the order)."));
            }
        }
    }

    // update the value that will be available in request.payload when the handler executes;
    // there are 2 differences: a) Joi has coerced the values to the type defined in the schemas;
    // b) the keys will be in underscored case (ready to be used by the postgres functions)
    return next(undefined, changeCaseKeys(validation.value, "underscored"));
};

/*** END OF RESOURCE CONFIGURATION ***/



// plugin defintion function
exports.register = function(server, options, next) {

	// READ (all)
    server.route({
        method: 'GET',
        path: internals.resourcePath,
        handler: function (request, reply) {
            console.log(utils.logHandlerInfo(request));
debugger;

        	var mapsC = new BaseC();
        	mapsC.execute({
				query: {
                    command: "select * from maps_read()"
				}
        	})
        	.done(
        		function(){
                    var resp         = mapsC.toJSON();
                    var transformMap = transforms.maps.maps;
                    var transform    = transforms.transformArray;

                    return reply(transform(resp, transformMap));
        		},
                function(err){
debugger;
                    var boomErr = internals.parseError(err);
                    return reply(boomErr);
                }
        	);


        },

        config: {

            auth: config.get('hapi.auth'),
            pre: [pre.abortIfNotAuthenticated],

			description: 'Get all the resources',
			notes: 'Returns all the resources (full collection)',
			tags: ['api'],
        }
    });




	// READ (one or more, but not all)
    server.route({
        method: 'GET',
        path: internals.resourcePath + "/{ids}",
        handler: function (request, reply) {
            console.log(utils.logHandlerInfo(request));
debugger;

            var queryOptions = [];
            request.params.ids.forEach(function(id){
                queryOptions.push({id: id});
            });

            var mapsC = new BaseC();
            mapsC.execute({
                query: {
                    command: "select * from maps_read($1)",
                    arguments: [ JSON.stringify(queryOptions) ]
                }
            })
            .done(
                function(){
debugger;
                    var resp         = mapsC.toJSON();
                    var transformMap = transforms.maps.maps;
                    var transform    = transforms.transformArray;

                    return reply(transform(resp, transformMap));
                },
                function(err){
debugger;
                    var boomErr = internals.parseError(err);
                    return reply(boomErr);
                }
            );

        },
        config: {
			validate: {
	            params: internals.validateIds,
			},

            auth: config.get('hapi.auth'),
            pre: [pre.abortIfNotAuthenticated],

			description: 'Get 2 (short description)',
			notes: 'Get 2 (long description)',
			tags: ['api'],

        }
    });

    // CREATE (one or more)
    server.route({
        method: 'POST',
        path: internals.resourcePath,
        handler: function (request, reply) {
            console.log(utils.logHandlerInfo(request));
debugger;

//console.log("dbData: ", JSON.stringify(changeCaseKeys(request.payload, "underscored")));
console.log("request.payload: ", JSON.stringify(request.payload));

            var dbData = request.payload[0]
                filesC = request.pre.filesC,
                mapsC  = request.pre.mapsC,
                shpSchema = "geo",
                shpTable  = _s.underscored(_s.slugify(dbData["code"])),
                shpFile = "";

            if(mapsC.findWhere({code: shpTable})){
                return reply(Boom.conflict("The map code must be unique."));
            }

            // make sure the zip file really exists in the server
            var fileM = filesC.findWhere({id: request.payload[0]["file_id"]});
            if(!fileM){
                return reply(Boom.conflict("The shape file does not exist in the server"));
            }

            var physicalPath = fileM.get("physicalPath"),
                zipFile = fileM.get("name"),
                zipFullPath = Path.join(global.rootPath, physicalPath, zipFile),
                zipFileWithoutExt = zipFile.slice(0, zipFile.length - 4),
                zipOutputDir = Path.join(global.rootPath, physicalPath, zipFileWithoutExt);
                

            console.log("global.rootPath: ", global.rootPath)
            console.log("physicalPath: ", physicalPath)
            console.log("zipFile: ", zipFile)
            console.log("zipFileWithoutExt: ", zipFileWithoutExt)

// TODO: find a more robust way to verify that the file is indeed a zip file
            if(!_s.endsWith(zipFile, ".zip")){
                return reply(Boom.conflict("The file must be in zip format."));
            }



/*
IMPROVE
2) the name of the database should be based on the map code (use _s in the client)
*/

/***
POSSIBLE ERRORS:

step 1
- at the beggining we try to delete the folder; this might fail for some reason (for instance, if the folder belongs to the root)

step 2
- after the zip is extracted, we search for a file with .shp extension; if it doesn't exist (or if there 2 or more), an error is thrown
- the zip extraction might fail (corrupted zip)

step 3 
- the shp2pgsql fails if there are any table with the given name (which is the same as the map code)

step 5
- delete the folder - similar to the possible error in step 1 (but it's unlikely, because if we arrived at this point, the folder was created by us, so we can delete it)
***/

            var deferred = Q.defer(),
                promise = deferred.promise;

            // step 1: delete the directory where the unzip will be outputed (if it doesn't
            // exists, don't throw an error)
            rimraf(zipOutputDir, function(err){
                if(err){
                    return deferred.reject(err);
                }

                return deferred.resolve();
            });

            // step 2: extract the zip file; a dedicated (temporary) folder will be created
            promise
            .then(function(val){
                var deferred2 = Q.defer();

                fs.mkdirSync(zipOutputDir);
               
                fs.createReadStream(zipFullPath)
                    .pipe(unzip.Extract({ path: zipOutputDir }))
                    .on("close", function(){
                        // the zip has been successfully extracted; now get an array 
                        // with the names of files in zipOutputDir that have the .shp extension
                        var files = fs.readdirSync(zipOutputDir).filter(function(filename){
                            return _s.endsWith(filename, ".shp");
                        });

                        if(files.length!==1){
                            var err = new Error("the zip must contain one .shp file (and only one)");
                            return deferred2.reject(err);
                        }

                        shpFile = files[0];
                        return deferred2.resolve()
                    })
                    .on("error", function(err){
                        return deferred2.reject(err);
                    });

                return deferred2.promise;
            })

            // step 3: execute shp2pgsql; the table name will be the map code (which has the unique constraint)
            .then(function(){
                var deferred3 = Q.defer();
               
                // the command is:  shp2pgsql -D -I -s 4326 <path-to-shp-file>  <name-of-the-table>   |  psql --dbname=<name-of-the-database>
                var command1 = "shp2pgsql -D -I -s 4326 "
                            + Path.join(zipOutputDir, shpFile) + " " + shpSchema + "." + shpTable,

                    command2 = "psql --dbname=" + config.get("db.postgres.database"),

                    command = command1 + " | " + command2;

                console.log("command: ", command);

                exec(command, function(err, stdout, stderr){
                    if(err){
                        console.log("error in exec: ", err);
                        return deferred3.reject(err);
                    }

                    console.log("stdout: \n", stdout);
                    if(_s.include(stdout.toLowerCase(), "create index") && 
                        _s.include(stdout.toLowerCase(), "commit")){
                        return deferred3.resolve();
                    }
                    else{
                        return deferred3.reject(new Error("shp2pgsql did not commit"));
                    }

                })

                return deferred3.promise;
            })

            // step 4: create the row in the maps table
            .then(function(){

                // add the fields that are missing from the payload (server-side information)
                dbData["schema_name"] = shpSchema;
                dbData["owner_id"]    = request.auth.credentials.id;

                console.log("dbData: ", dbData);

                var promise = mapsC.execute({
                    query: {
                        command: "select * from maps_create($1);",
                        arguments: [JSON.stringify(changeCaseKeys(dbData, "underscored"))]
                    },
                    reset: true
                });

                return promise;
            })

            // step 5: delete the zip output directory
            .finally(function(){
                var deferred = Q.defer();
                console.log("finally!");

                rimraf(zipOutputDir, function(err){
                    if(err){
                        return deferred.reject(err);
                    }

                    return deferred.resolve();
                });

                return deferred.promise;
            })
            .done(
                function(){
debugger;
                    var resp         = mapsC.toJSON();
                    var transformMap = transforms.maps.maps;
                    var transform    = transforms.transformArray;

                    return reply(transform(resp, transformMap));
                },
                function(err){
debugger;
// TODO: make sure the table geo.<shpTable> wasn't created; if it was , we should delete it


                    var boomErr = internals.parseError(err);
                    return reply(boomErr);
                }
            );

        },
        config: {
        	validate: {
                // NOTE: to crate a new file we have to send the file itself in a form (multipart/form-data);
                // but if we do the validation the buffer will somehow be messed up by Joi; so here we don't
                // do the validation

                payload: internals.validatePayloadForCreate
        	},

            pre: [
                [pre.abortIfNotAuthenticated],
                [pre.db.readAllFiles, pre.db.readAllMaps]
            ],

            auth: config.get('hapi.auth'),

			description: 'Post (short description)',
			notes: 'Post (long description)',
			tags: ['api'],
        }
    });

    // UPDATE (one or more)
    server.route({
        method: 'PUT',
        path: internals.resourcePath + "/{ids}",
        handler: function (request, reply) {

            console.log(utils.logHandlerInfo(request));
debugger;
            
console.log("dbData: ", request.payload);

            var mapsC = new BaseC();
            var mapsC2 = new BaseC();

            // update the row
        	mapsC.execute({
				query: {
				  	command: "select * from maps_update($1);",
                    arguments: [JSON.stringify(changeCaseKeys(request.payload, "underscored"))]
				}
        	})
            // retrieve the updated row using maps_read (so that we have the joined data too)
            .then(
                function(updatedRow){

                    var promise = mapsC2.execute({
                        query: {
                            command: "select * from maps_read($1);",
                            arguments: [JSON.stringify({id: updatedRow[0].id})]
                        }
                    });

                    return promise;
                }
            )
        	.done(
        		function(row){
debugger;
                    var transformMap = transforms.maps.maps;
                    var transform    = transforms.transformArray;

                    return reply(transform(row, transformMap));
        		},
                function(err){
debugger;
                    var boomErr = internals.parseError(err);
                    return reply(boomErr);
                }   
        	);
        },
        config: {
			validate: {
	            params: internals.validateIds,
                payload: internals.validatePayloadForUpdate
			},

            pre: [
                pre.abortIfNotAuthenticated
            ],

            auth: config.get('hapi.auth'),

			description: 'Put (short description)',
			notes: 'Put (long description)',
			tags: ['api'],
        }
    });

/*
    // DELETE (one or more)
    server.route({
        method: 'DELETE',
        path: internals.resourcePath + "/{ids}",
        handler: function (request, reply) {
debugger;

            var queryOptions = [];
            request.params.ids.forEach(function(id){
                queryOptions.push({id: id});
            });

                    // var boomErr = internals.parseError(err);
                    // return reply(boomErr);

            var filesC = new FilesC();
            filesC.execute({
                query: {
                    command: "select * from files_delete($1)",
                    arguments: [ JSON.stringify(queryOptions) ]
                },
                reset: true
            })
            .done(
                function(){
debugger;
                    return reply(filesC.toJSON());
                },
                function(err){
debugger;
                    var boomErr = internals.parseError(err);
                    return reply(boomErr);
                }
            );
        },

        config: {
			validate: {
	            params: internals.validateIds,
			},
            pre: [pre.abortIfNotAuthenticated],
            auth: config.get('hapi.auth'),

			description: 'Delete (short description)',
			notes: 'Delete (long description)',
			tags: ['api'],

        }
    });
*/
    // any other request will receive a 405 Error
    server.route({
        method: '*',
        path: internals.resourcePath + "/{p*}",
        handler: function (request, reply) {
        	var output = Boom.methodNotAllowed('The method is not allowed for the given URI.');  // 405
            reply(output);
        }
    });

    next();
};

exports.register.attributes = {
    name: internals.resourceName,
    version: '1.0.0'
};





/*

CURL TESTS

curl  -X GET http://127.0.0.1:3000/api/maps

curl  -X GET http://127.0.0.1:3000/api/maps/1

curl  -X GET http://127.0.0.1:3000/api/maps/1,2



curl -X POST http://127.0.0.1:3000/api/maps  \
    -H "Content-Type: application/json"  \
    -d '{ "code": "fwefwefwefweyyxx", "title": { "pt": "uuu", "en": "ttt"}, "file_id": 48, "category_id": 105 }' 



curl -X PUT http://127.0.0.1:3000/api/maps/1001   \
    -H "Content-Type: application/json"  \
    -d '{"id": 1001, "title": { "pt": "yabcx", "en": "zdefy"}}'



curl-X DELETE http://127.0.0.1:3000/api/maps/1

*/