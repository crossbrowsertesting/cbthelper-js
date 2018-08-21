const fs = require ('fs');
const globals = require('./globals');
const CapsBuilder = require('./CapsBuilder');
const TestHistoryBuilder = require('./TestHistoryBuilder');
const AutomatedTest = require('./AutomatedTest');
const reqprom = require('request-promise-native');


module.exports.getCapsBuilder = function() {
    if(!globals.moduleCapsBuilder)
        globals.moduleCapsBuilder = new CapsBuilder();
    return globals.moduleCapsBuilder;
}

module.exports.login = function(username, auth) {
    this.username = username;
    this.authkey = auth;      
    globals.globalsSet('username', username);
    globals.globalsSet('authkey', auth);
}

module.exports.getTestHistoryBuilder = function() {
    return new TestHistoryBuilder();
}

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

module.exports.getTestFromId = function(sessionId) {
    return new AutomatedTest(sessionId);
}