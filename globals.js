var gUsername = "";
var gAuthkey  = "";
var api = "https://crossbrowsertesting.com/api/v3/selenium/";
var hub = "http://hub.crossbrowsertesting.com:80/wd/hub";
module.exports = {
	api: "https://crossbrowsertesting.com/api/v3/selenium/",

	globalsGet: function(option){
		switch(option){
			case 'username':
			return gUsername;
			case 'authkey':
			return gAuthkey;
			case 'api':
			return api;
			case 'hub':
			return hub;
		}
	},

	globalsSet: function(option,target){
		switch(option){
			case 'username':
			gUsername = target;
			case 'authkey':
			gAuthkey = target;
			case 'api':
			api = target;
			case 'hub':
			hub = target;
		}
	},
	
	sleep: function(ms) {
	 	return new Promise(resolve => setTimeout(resolve, ms));
	}
}