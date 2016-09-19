'use strict';
// Module Dependencies
// -------------------
var express     = require('express');
var http        = require('http');
var JWT         = require('./lib/jwtDecoder');
var path        = require('path');
var request     = require('request');
var bodyParser  = require('body-parser');
var routes      = require('./routes');
var activitySplit   = require('./routes/activitySplit');
//var activityUtils    = require('./routes/activityUtils');
var pkgjson = require( './package.json' );

var app = express();

// Register configs for the environments where the app functions
// , these can be stored in a separate file using a module like config

var APIKeys = {
    appId           : '0247c4d7-1cf1-4df1-bd08-e3d21eef804c',
    clientId        : 'fwaqwx97s0sl2ozybmzjvjyg',
    clientSecret    : 'rmxg70sy0thKR3XSbrCRNIb7',
    appSignature    : 'wksiuux1h3w2j40e1tnqvpxfmfqlzn5sjxynymfvlp03pbjtzfcjm30fvuqut53ze4u2dmaex05rxwbs5l5qgkoxtfnpotwic5tr5f5dg3x5ykjpohf12dd3y5ikrrf0qve2324c4od4q5za55ogll4vji1vswxzcuo4wwamj3lyus3acer5reykwo24aettafl1g03v3recw34rrscop5yv1deqhsqcoqk1myl14igwwjrihjhv2lgwhl1o5ru',
    authUrl         : 'https://auth.exacttargetapis.com/v1/requestToken?legacy=1'
};

// Simple custom middleware
function tokenFromJWT( req, res, next ) {
    // Setup the signature for decoding the JWT
    var jwt = new JWT(
	{
		appSignature: APIKeys.appSignature
		, appId: APIKeys.appId
		, clientId: APIKeys.clientId
		, clientSecret: APIKeys.clientSecret
		, saltSecret: "SFMC CS TEST"
	});
    
    // Object representing the data in the JWT
    var jwtData = jwt.decode( req );

    // Bolt the data we need to make this call onto the session.
    // Since the UI for this app is only used as a management console,
    // we can get away with this. Otherwise, you should use a
    // persistent storage system and manage tokens properly with
    // node-fuel
	
	req.session.valid = false;
	if(jwtData != undefined && jwtData != null)
    {
		req.payload = jwtData.payload;
		req.session.valid = true;
	}
	req.session.token = jwtData.token;
    next();
}


// Use the cookie-based session  middleware
app.use(express.cookieParser());

// TODO: MaxAge for cookie based on token exp?
app.use(express.cookieSession({secret: "DeskAPI-CookieSecret0980q8w0r8we09r8"}));

// Configure Express
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
// for jwt
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.text({ type: 'application/jwt' }));
app.use(bodyParser.json({ type: 'application/*+json' }))

app.use(express.methodOverride());
app.use(express.favicon());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));



// Express in Development Mode
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// HubExchange Routes
app.get('/', routes.index );
app.post('/login', tokenFromJWT, routes.login );
app.post('/logout', routes.logout );

// Custom Activity Routes for interacting with Desk.com API
app.post('/ixn/activities/split/save/', activitySplit.save );
app.post('/ixn/activities/split/validate/', activitySplit.validate );
app.post('/ixn/activities/split/publish/', activitySplit.publish );
app.post('/ixn/activities/split/execute/', tokenFromJWT, activitySplit.execute );



app.get('/clearList', function( req, res ) {
	// The client makes this request to get the data
	activityUtils.logExecuteData = [];
	res.send( 200 );
});


// Used to populate events which have reached the activity in the interaction we created
app.get('/getActivityData', function( req, res ) {
	// The client makes this request to get the data
	if( !activityUtils.logExecuteData.length ) {
		res.send( 200, {data: null} );
	} else {
		res.send( 200, {data: activityUtils.logExecuteData} );
	}
});

app.get( '/version', function( req, res ) {
	res.setHeader( 'content-type', 'application/json' );
	res.send(200, JSON.stringify( {
		version: pkgjson.version
	} ) );
} );

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
