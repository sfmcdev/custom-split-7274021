'use strict';

// Deps
var activityUtils = require('./activityUtils');
var activityOffer = require('./activityOffer');

/*
 * GET home page.
 */
exports.index = function(req, res){
    if( !req.session.valid ) {
        res.render( 'index', {
            title: 'Unauthenticated',
            errorMessage: 'This app may only be loaded via the Salesforce Marketing Cloud',
        });
    } else {
        res.render( 'index', {
            title: 'Journey Builder Activity Example',
            results: activityUtils.logExecuteData,
        });
    }
};

exports.login = function( req, res ) {
    console.log( 'exports.login');
    res.redirect( '/' );
};

exports.logout = function( req, res ) {
    req.session.token = '';
	req.session.valid = false;
};

