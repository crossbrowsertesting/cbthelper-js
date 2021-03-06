const reqprom = require('request-promise-native');
const globals = require('./globals');

function getBrowsers() {
    console.log('getting browsers');
    let options = {
        method: 'GET',
        uri: globals.api + 'browsers',
        json: true,
        auth: {
            username: globals.globalsGet('username'),
            password: globals.globalsGet('authkey'),
        }
    }
    return reqprom(options);
}

/**
* Builder to generate options for getting Capabilites
* All of the with methods return this for method chaining.
*/
class CapsBuilder {
    /**
    * CapsBuilder instance.
    */
    constructor() {
        this.platform = null;
        this.browser = null;
        this.width = null;
        this.height = null;
        this.name = null;
        this.version = null;
        this.recordVideo = null;
        this.recordNetwork = null;
    }
    /**
    * Sets the platform (OS) the user wants to use. The string will be compared against the 'name' and 'api_name' properties returned from the selenium api.
    * @param {string} platform - A string specifying the platform (eg. Windows 7, Mac 10.13).
    */
    withPlatform(platform){
        this.platform = platform;
        return this;
    }
    /**
    * Sets the browser the user wants to use. The string will be compared against the 'name' and 'api_name' properties returned from the selenium api.
    * @param {string} browser - A string specifying the browser (eg. Edge 17, Chrome 68x64).
    */
    withBrowser(browser){
        this.browser=browser
        return this;
    }
    /**
    * Sets the name that will appear in the web app.
    * @param {string} name - String to appear in web app.
    */
    withName(name){
        this.name = name;
        return this;
    }
    /**
    * Sets the screen size for the test.
    * @param {number} width - Width of test.
    * @param {number} height - Height of test.
    */
    withResolution(width,height){
        this.width = width;
        this.height = height;
        return this;
    }
    /**
    * Sets the build name in the web app.
    * @param {string} version - Build name to be seen.
    */
    withBuild(version){
        this.version = version;
        return this;
    }
    /**
    * Records the network for the length of the test.
    * @param {boolean} option - Boolean Value.
    */
    withRecordNetwork(option){
        this.recordNetwork=option;
        return this;
    }
    /**
    * Records a video for the length of the test.
    * @param {boolean} option - Boolean Value.
    */
    withRecordVideo(option){
        this.recordVideo = option;
        return this;
    }
    /**
    * Used to generate the capabilites using any options the user specifies.
    * @returns {object} Object that can be passed to the selenium webdriver.
    */
    async build(){
        return this.choose();
    }
    bestOption(options,target){
        target = target.toLowerCase();
        for (var i=0; i<options.length; i++) {   //for each is possible
            let name = options[i]['name'].toLowerCase();
            let apiName = options[i]['api_name'].toLowerCase();
            if (target == name || target == apiName){
                return options[i];
            }
        }
        return null;
    }
    bestBrowserNoPlatform(target){
        target = target.toLowerCase();
        for (var i=0; i<this.capsData.length; i++){
            for(var j=0; j<this.capsData[i]['browsers'].length; j++){
                let name = this.capsData[i]['browsers'][j]['name'].toLowerCase();
                let apiName = this.capsData[i]['browsers'][j]['api_name'].toLowerCase();
                if (target == name || target == apiName){
                    return this.capsData[i]['browsers'][j];
                }
            }
        }
    }
    async choose(){

        if(!this.capsData)
            this.capsData = await getBrowsers();

        var CapsFinal = {
            username: globals.globalsGet('username'),
            password: globals.globalsGet('authkey'),
        }
        var platform = null;
        var browser = null;
        if (this.platform){
            platform = this.bestOption(this.capsData,this.platform);
            if (platform != null){
                CapsFinal= {
                    ...CapsFinal,
                    ...platform['caps']
                }
            }
        }
        if (this.browser){
            if (platform != null){
                browser = this.bestOption(platform['browsers'],this.browser)
            }
            else{
                browser = this.bestBrowserNoPlatform(this.browser)
            }
            if (browser != null){
                CapsFinal= {
                    ...CapsFinal,
                    ...browser['caps']
                }
            }
        }
        if(this.width && this.height){
            CapsFinal['screenResolution'] = String(this.width) + 'x' + String(this.height);
        }
        if(this.name){
            CapsFinal['name'] = this.name;
        }
        if(this.version){
            CapsFinal['build'] = this.version;
        }
        if(this.recordVideo){
            CapsFinal['record_video'] = this.recordVideo;
        }
        if(this.recordNetwork){
            CapsFinal['record_network'] = this.recordNetwork;
        }
        return CapsFinal;
    }
}

module.exports = CapsBuilder;