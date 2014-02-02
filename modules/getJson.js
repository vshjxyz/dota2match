
var http, https;

http = require("http");
https = require("https");

/*
 getJSON: REST get request returning JSON object(s)
 @param options: http options object
 @param callback: callback to pass the results JSON object(s) back
 */
exports.getJSON = function(options, onResult) {
    var prot, req;

    console.log("---> " + options.method + " ~ " + options.host + ":" + options.port + options.path);
    prot = (options.port === 443 ? https : http);
    req = prot.request(options, function(res) {
        var output,
            _this = this;

        output = "";
        console.log("<--- response code - " + res.statusCode);
        res.setEncoding("utf8");
        res.on("data", function(chunk) {
            return output += chunk;
        });
        return res.on("end", function() {
            var e, obj;

            try {
                obj = JSON.parse(output);
            } catch (_error) {
                e = _error;
                console.error("Error during the JSON parsing, output: " + output);
            }
            return onResult(res.statusCode, obj);
        });
    });
    req.on("error", function(err) {
        return console.error("Error during the rest call: " + err.message);
    });
    return req.end();
};
