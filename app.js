'use strict';

var app = require('connect')();
var http = require('http');
var swaggerTools = require('swagger-tools');
var serveStatic = require('serve-static');
var backEndJobService = require('./blogic/BackEndJobService');
var CleanService = require('./blogic/CleanService');

var bodyParser = require('body-parser');
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

var serverPort = 3000;
console.log("dir:" + __dirname);
// swaggerRouter configuration
console.log(" process.env.NODE_ENV :" + process.env.NODE_ENV);
var options = {
    controllers: __dirname + '/controllers',
    useStubs: process.env.NODE_ENV === 'development' ? true : false // Conditionally turn on stubs (mock mode)
};

// The Swagger document (require it, build it programmatically, fetch it from a URL, ...)
var swaggerDoc = require('./api/swagger-ids.json');

// Initialize the Swagger middleware
swaggerTools.initializeMiddleware(swaggerDoc, function (middleware) {
    // Interpret Swagger resources and attach metadata to request - must be first in swagger-tools middleware chain
    app.use(middleware.swaggerMetadata());

    // Validate Swagger requests
    app.use(middleware.swaggerValidator());

    // Open cross site access for functioning as an API
    app.use(function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });

    // Route validated requests to appropriate controller
    app.use(middleware.swaggerRouter(options));

    // Serve the Swagger documents and Swagger UI
    app.use(middleware.swaggerUi());

    app.use(serveStatic(__dirname + '/public'));

    app.use(function(err, req, res, next) {
        if (err) {
            var statusCode = 400, errMessage = "";
            if (err.statusCode && err.message) {
                statusCode = err.statusCode;
                errMessage = err.message;
            }else if(err == "No permission for the selected operation"){
                statusCode = 403;
                errMessage = "No permission for the selected operation";
            }else{
                statusCode = 400;
                errMessage = err;
            }
            if (req.swagger) {
                console.log("[ERROR at " + new Date() + "]\n- "  + JSON.stringify(err) + "\n- req.params:" + JSON.stringify(req.swagger.params) );
            } else {
                console.log("[ERROR at " + new Date() + "]\n- "  + JSON.stringify(err) + "\n- req.params: No swagger params" );
            }
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.statusCode = statusCode;
            res.end(JSON.stringify({"statusCode":statusCode, "message":errMessage}));
        }
    });

    // Start the server
    http.createServer(app).listen(serverPort, function () {
        console.log('Your server is listening on port %d (http://localhost:%d)', serverPort, serverPort);
    });


});