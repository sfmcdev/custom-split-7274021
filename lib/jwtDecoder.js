"use strict";

var jwtLib = require('jwt-simple');
var packageJson = require('../package.json');

var VERSION = packageJson.version;

var JwtDecoder = module.exports = function JwtDecoder( options ) {
    this.options = options || {};
};

JwtDecoder.VERSION = VERSION;

JwtDecoder.prototype.decode = function( req, key ) {
	
	//console.log("jwtdecoder: req = ", req);
	//console.log("JWTDecoder - app signature:" + this.options.appSignature);
	//console.log("JWTDecoder - tokensecret:" + process.env.jwtTokenSecret);
    var jwtObj = {};
    var jwt = req.body.jwt;
	
	if(undefined == jwt)
	{		
		jwt = req.body;
		
		if(req.body != undefined)
		{
			console.log("JwtDecoder||using req.body");					
			//console.log("JwtDecoder||header = ", req.header);					
		}
	}

	var decoded;
    try 
	{
        decoded         = jwtLib.decode( jwt, this.options.appSignature );
    } catch( ex ) 
	{
		console.log('Decoding failed using appSignature, now trying saltSecret');
		try 
		{	
			decoded         = jwtLib.decode( jwt, this.options.saltSecret );			
		} catch( ex ) 
		{			
			console.error( 'Decoding failed for jwt: ' + jwt );
			console.error( 'Exception: ' + ex );
		}
    }
	
	/*
	jwtObj.full         = decoded;
	jwtObj.token        = decoded.request.user.oauthToken;
	jwtObj.refreshToken = decoded.request.user.refreshToken;
	jwtObj.casToken     = decoded.request.user.internalOauthToken;
	jwtObj.culture      = decoded.request.user.culture;
	jwtObj.timezone     = decoded.request.user.timezone; //OBJECT
	jwtObj.expires      = ( decoded.request.user.expiresIn * 1000 ) - 60000;
	*/
	
	jwtObj.payload = decoded;
	jwtObj.valid = true;
    return jwtObj;
};
