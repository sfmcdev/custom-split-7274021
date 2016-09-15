'use strict';
var https = require( 'https' );
var activityUtils = require('./activityUtils');

/*
 * POST Handler for / route of Activity (this is the edit route).
 */
exports.edit = function( req, res ) {
    // Data from the req and put it in an array accessible to the main app.
    //console.log( req.body );
    activityUtils.logData( req );
    res.send( 200, 'Edit' );
};

/*
 * POST Handler for /save/ route of Activity.
 * This gets called when the journey is activated in the JB UI (and before /validate/ and /publish/)
 */
exports.save = function( req, res ) {
    // Data from the req and put it in an array accessible to the main app.
    //console.log( req.body );

	console.log("SAVE()||Session.valid = ", req.session.valid);
    activityUtils.logData( req );
		
    res.send( 200, 'Save' );
};

/*
 * POST Handler for /publish/ route of Activity.
 * Run any code here that you need to run to prepare the activity for execution.
 * This gets called when the journey is activated in JB (and after /save/ and /validate/)
 */
exports.publish = function( req, res ) {
    // Data from the req and put it in an array accessible to the main app.
    //console.log( req.body );

    activityUtils.logData( req );
	
    res.send( 200, 'Publish' );
};

/*
 * POST Handler for /validate/ route of Activity.
 * This method should validate the configuration inputs.  
 * This gets called when the journey is activated in the JB UI (and after /save/ but before /publish/)
 * Respond with 200 for valid, 500 for invalid
 */
exports.validate = function( req, res ) {
    // Data from the req and put it in an array accessible to the main app.
    //console.log( req.body );
	
	//console.log("VALIDATE(req) : ", req.body);
	
    activityUtils.logData( req );
    res.send( 200, 'Validate' );

    /* 
    If validation passes then call
    res.send( 200, 'Validate' );

    If validation fails then call
    res.send( 500, 'Validate' );
    */
};

/*
 * POST Handler for /execute/ route of Activity.
 * Runs each time the activity executes.  This is the main workhorse of the custom activity
 * Caller expects a 200 response back.  Can return any custom data also.
 */
exports.execute = function( req, res ) {
    // Data from the req and put it in an array accessible to the main app.
    activityUtils.logData( req );
	
		
	console.log("EXECUTE()|| Session.Valid = ", req.session.valid);
	
	if( !req.session.valid )
	{
		console.log('NO Session');
		res.send( 200, {"status": 0} ); 
		return;
	}
	
	console.log('TOKEN Available');

	//merge the array of objects for easy access in code.
	//var aArgs = req.body.inArguments;
	var aArgs = req.payload.inArguments;
	console.log( "aArgs = " + aArgs );
	var oArgs = {};
	
	var iLen = 0;
	if(aArgs != undefined)
	{
		iLen = aArgs.length;
	}
	for (var i=0; i<iLen; i++) 	
	{  
		for (var key in aArgs[i]) { 
			oArgs[key] = aArgs[i][key]; 
		}
	}
		
	//var contactKey = req.body.keyValue;
	var contactKey = req.payload.keyValue;
	console.log("contactKey = " + contactKey);

	// these values come from the config.json
	var email = oArgs.emailAddress;
	var fname = oArgs.firstName;
	var lname = oArgs.lastName;

	// these values come from the custom activity form inputs
	var titleEn = oArgs.titleEn;
	var contentEn = oArgs.contentEn;
	var titleTc = oArgs.titleTc;
	var contentTc = oArgs.contentTc;
	var messageType = oArgs.messageType;
	//var valueTier = oArgs.valueTier;
	//var bonusType = oArgs.type;
	//var bonusId = oArgs.bonus;

	// any logic for bonus allocation can go here...
	// This is a placeholder that shows an example https call
	// to a given endpoint.  Again, you can do anything you like here.

	console.log('INBOX message for ', contactKey);
	var post_data = JSON.stringify({  
		"contactKey":contactKey,
		//"valueTier": valueTier,
		//"bonusType":bonusType,
		//"bonusId":bonusId
		"titleEn": titleEn,
		"contentEn": contentEn,
		"titleTc": titleTc,
		"contentTc": contentTc,
		"messageType":messageType
	});			

	var options = {
		'hostname': activityUtils.endpOintcreds.host,
		'path': '/api/v2/offers',
		'method': 'POST',
		'headers': {
			'Accept': 'application/json',
			'Content-Type': 'application/json',
			'Content-Length': post_data.length
		},
	};				
	
	console.log(options);

	var httpsCall = https.request(options, function(response) {
		var data = '';
		var error = '';
			
		response.on( 'data' , function( chunk ) {
			data += chunk;
		});

		response.on( 'end' , function() {
			console.log("data:",data);

			if (response.statusCode == 200) {
				data = JSON.parse(data);
				console.log('onEND allocateOffer:', response.statusCode, data);
				res.send( 200, {"status": 0} ); // data.allocationId is the new offerAllocationId...this is just an example of populating an outArgument
			} else {
				console.log('onEND fail:', response.statusCode);
				res.send(response.statusCode);
			}		
		});								
	});

	httpsCall.on( 'error', function( e ) {
		console.error(e);
		res.send(500, 'createCase', {}, { error: e });
	});				
	
	httpsCall.write(post_data);
	httpsCall.end();

};