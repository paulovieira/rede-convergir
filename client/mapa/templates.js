(function() {(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["loading/templates/loading.html"] = (function() {function root(env, context, frame, runtime, cb) {
var lineno = null;
var colno = null;
var output = "";
try {
output += "<h4 class=\"text-center\">Please wait...</h4>";
cb(null, output);
;
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
return {
root: root
};
})();
})();
(function() {(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["map/templates/map.html"] = (function() {function root(env, context, frame, runtime, cb) {
var lineno = null;
var colno = null;
var output = "";
try {
output += "<div id=\"map\" style=\"height: 600px;\"></div>";
cb(null, output);
;
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
return {
root: root
};
})();
})();
(function() {(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["project/templates/project.html"] = (function() {function root(env, context, frame, runtime, cb) {
var lineno = null;
var colno = null;
var output = "";
try {
output += "<div class=\"panel panel-default b-shadow project-container\" style=\"margin-bottom: 14px; border-radius: 1px; border-color: #ededed;\">\n    <div class=\"panel-heading\" style=\"padding: 3px 15px; border-color: #ededed;\">\n        <span style=\"font-size: 18px;\">";
output += runtime.suppressValue(env.getFilter("upper").call(context, runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "properties")),"name", env.autoesc)), env.autoesc);
output += "</span>\n    </div>\n\n    <div class=\"panel-body\" style=\"padding-bottom: 10px; padding-top: 8px;\">\n\n\n        <div class=\"row\">\n            <div class=\"col-sm-8\">\n\n                <div>\n                    <span style=\"font-weight: bold;\">Tipo de projecto: </span> ";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "properties")),"type", env.autoesc), env.autoesc);
output += "\n                </div>            \n";
output += "\n                <div class=\"row\" style=\"margin-top: 12px;\">\n                    <div class=\"col-sm-6\">\n                        <button type=\"button\" style=\"border-radius: 2px;\" class=\"btn btn-info btn-block\" data-toggle=\"collapse\" data-target=\"#";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "id"), env.autoesc);
output += "-more-info\">Mais informações</button>\n                    </div>\n                    <div class=\"col-sm-6\">\n                        <button type=\"button\" style=\"border-radius: 2px;\" class=\"btn btn-info btn-block\">Eventos</button>\n                    </div>                \n                </div>\n\n\n            </div>\n            <div class=\"col-sm-4\">\n                <div class=\"text-center\" style=\"\">\n                    <img src=\"/common/images/logos/";
output += runtime.suppressValue(env.getFilter("lower").call(context, runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "properties")),"logoImage", env.autoesc)), env.autoesc);
output += "\" class=\"img-responsive img-thumbnail\" style=\"max-height:80px\">\n                </div>\n\n\n            </div>\n        </div>\n";
output += "\n\n        <div class=\"row collapse\" id=\"";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "id"), env.autoesc);
output += "-more-info\" style=\"margin-top: 10px;\">\n            <div class=\"col-sm-12\">\n\n                <div>\n                    <span style=\"font-weight: bold;\">Domínios de interesse: </span>";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "properties")),"domains", env.autoesc), env.autoesc);
output += "\n                </div>\n\n                <div style=\"margin-top: 6px;\">\n                    <span style=\"font-weight: bold;\">Descrição: </span>";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "properties")),"description", env.autoesc), env.autoesc);
output += "\n                </div>\n\n            </div>\n        </div>                                       \n\n\n\n    </div>\n</div>";
cb(null, output);
;
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
return {
root: root
};
})();
})();
