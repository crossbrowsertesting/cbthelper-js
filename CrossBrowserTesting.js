const fs = require ('fs');
const globals = require('./globals');
const CapsBuilder = require('./CapsBuilder');
const TestHistoryBuilder = require('./TestHistoryBuilder');
const AutomatedTest = require('./AutomatedTest');
const reqprom = require('request-promise-native');

/** 
* Used to get the selenium capability builder.
* Generating the CapsBuilder pulls in a large amount of data, so user should not call the constrcutor manually.
*/
module.exports.getCapsBuilder = function() {
    if(!globals.moduleCapsBuilder)
        globals.moduleCapsBuilder = new CapsBuilder();
    return globals.moduleCapsBuilder;
}

/** 
* Sets the username and authkey used to make the HTTP requests.
* @param {string} username - The user's username.
* @param {string} auth - The user's authkey.
*/
module.exports.login = function(username, auth) {
    this.username = username;
    this.authkey = auth;      
    globals.globalsSet('username', username);
    globals.globalsSet('authkey', auth);
}

/** 
* Used to get the TestHistoryBuilder
*/
module.exports.getTestHistoryBuilder = function() {
    return new TestHistoryBuilder();
}

/** 
* Returns an object with the test history, filtering based on the options given.
* @param {object} options - An object created by TestHistoryBuilder.
*/
module.exports.getTestHistory = async function(options) {
    let req = {
        method : 'GET',
        uri : globals.api,
        data : options,
        json : true,
        auth: {
            username: globals.globalsGet('username'),
            password: globals.globalsGet('authkey'),
        }
    }
    return await reqprom(req);
}

/** 
* Creates an automated test from the selenium session id.
* @param {string} sessionId - String for the selenium session/test id. Should come from WebDriver.
*/
module.exports.getTestFromId = function(sessionId) {
    return new AutomatedTest(sessionId);
}