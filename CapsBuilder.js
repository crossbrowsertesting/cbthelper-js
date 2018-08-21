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

module.exports = class CapsBuilder {
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
    withPlatform(platform){
        this.platform = platform;
        return this;
    }
    withBrowser(browser){
        this.browser=browser
        return this;
    }
    withName(name){
        this.name = name;
        return this;
    }
    withResolution(width,height){
        this.width = width;
        this.height = height;
        return this;
    }
    withBuild(version){
        this.version = version;
        return this;
    }
    withRecordNetwork(option){
        this.recordNetwork=option;
        return this;
    }
    withRecordVideo(option){
        this.recordVideo = option;
        return this;
    }
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