var reqprom = require('request-promise-native');
var globals = require('./globals');
var apiURL = 'https://crossbrowsertesting.com/api/v3/selenium/';
var fs = require ('fs');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function login(username, auth) {
    this.username = username;
    this.authkey = auth;      
    globals.globalsSet('username', username);
    globals.globalsSet('authkey', auth);
}

async function getBrowsers() {
    let options = {
        method: 'GET',
        uri: apiURL + 'browsers',
        json: true,
        auth: {
            username: globals.globalsGet('username'),
            password: globals.globalsGet('authkey'),
        }
    }
    return await reqprom(options);
}

async function CapsBuilder() {
    const DATA = await getBrowsers();
    return new CapsBuilderClass(DATA);
}

class CapsBuilderClass {
    constructor(data) {
        this.capsData = data;
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
    build(){
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
    choose(){
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

async function AutomatedTest(Id){
    return new AutomatedTestClass(Id);
}

class AutomatedTestClass {
    constructor(testId){
        this.testId = testId;
    }
    setScore(score){
        let options = {
            method : 'PUT',
            uri : apiURL + this.testId,
            json : {
                'action' : 'set_score',
                'score' : score,
                'format' : 'json'
            },
            auth: {
                username: globals.globalsGet('username'),
                password: globals.globalsGet('authkey'),
            }
        }
        reqprom(options);
    } 
    setDescription(description){
        let options = {
            method : 'PUT',
            uri : apiURL + this.testId,
            json : {
                'action' : 'set_description',
                'description' : description,
                'format' : 'json'
            },
            auth: {
                username: globals.globalsGet('username'),
                password: globals.globalsGet('authkey'),
            }
        }
        reqprom(options);
    }
    stop(){
        let options = {
            method : 'DELETE',
            uri : apiURL + this.testId,
            auth: {
                username: globals.globalsGet('username'),
                password: globals.globalsGet('authkey'),
            }
        }
        reqprom(options);
    }
    async takeSnapshot(description=''){
        let options = {
            method : 'POST',
            uri : apiURL + this.testId + '/snapshots',
            json : true,
            auth: {
                username: globals.globalsGet('username'),
                password: globals.globalsGet('authkey'),
            }            
        }
        var hash = await reqprom(options);
        var snap = await Snapshot(hash['hash'],this);
        if (description != ''){
            snap.setDescription(description);
        }
        return snap;
    }
    async getSnapshots(){
        let options = {
            method: 'GET',
            json: true,
            uri : apiURL + this.testId + '/snapshots',
            auth: {
                username: globals.globalsGet('username'),
                password: globals.globalsGet('authkey'),           
            }
        }
        let snaps = await reqprom(options);
        let ret = [];
        for (let i=0; i < snaps.length; i++){
            let pushvalue = await Snapshot(snaps[i]['hash'],this);
            ret.push(pushvalue);
        }
        return ret;
    }
    async saveAllSnapshots(directory,useDescription=false){
        let prefix = 'image';
        let snaps = await this.getSnapshots();
        this.makeDirectory(directory);
        let img = null;
        for (let i = 0; i < snaps.length; i++){
            await snaps[i].getInfo();
            if (useDescription && snaps[i].info['description'] != ''){
                img = snaps[i].info['description'] + '.png';
            }
            else {
                img = prefix + String(i+1) + '.png'
            }
            //console.log(img);
            await snaps[i].saveLocally(directory+'/'+img);
        }
    }

    async startRecordingVideo(description = ''){
        let options = {
            method : 'POST',
            uri : apiURL + this.testId + '/videos',
            json : true,
            auth: {
                username: globals.globalsGet('username'),
                password: globals.globalsGet('authkey'),
            }            
        }
        var hash = await reqprom(options);
        var video = await Video(hash['hash'],this);
        if (description != ''){
            video.setDescription(description);
        }
        return video;
    }
    async getVideos(){
        let options = {
            method: 'GET',
            json: true,
            uri : apiURL + this.testId + '/videos',
            auth: {
                username: globals.globalsGet('username'),
                password: globals.globalsGet('authkey'),           
            }
        }
        let vids = await reqprom(options);
        let ret = [];
        for (let i=0; i < vids.length; i++){
            let pushvalue = await Video(vids[i]['hash'],this);
            ret.push(pushvalue);
        }
        return ret;
    }
    async saveAllVideos(directory,useDescription=false){
        let prefix = 'video';
        let vids = await this.getVideos();
        this.makeDirectory(directory);
        let img = null;
        for (let i = 0; i < vids.length; i++){
            await vids[i].getInfo();
            if (useDescription && vids[i].info['description'] != ''){
                img = vids[i].info['description'] + '.mp4';
            }
            else {
                img = prefix + String(i+1) + '.mp4'
            }
            //console.log(img);
            vids[i].saveLocally(directory+'/'+img);
        }
    }
    makeDirectory(dir){
        if (!fs.existsSync(dir)){
            console.log('Making Directory');
            fs.mkdirSync(dir);
        }
    }
}

async function Video(hash,test){
    return new VideoClass(hash,test);
}

class VideoClass {
    constructor(hash,test){
        this.hash = hash;
        this.testId = test.testId;
        this.getInfo();
    }
    async getInfo(){
        let options = {
            method : 'GET',
            uri : apiURL + this.testId + '/videos/' + this.hash,
            json : true,
            auth: {
                username: globals.globalsGet('username'),
                password: globals.globalsGet('authkey'),
            }                 
        }
        this.info = await reqprom(options);
        return this.info; 
    }
    stopRecording(){
        let options = {
            method: 'DELETE',
            uri : apiURL + this.testId + '/videos/' + this.hash,
            auth: {
                username: globals.globalsGet('username'),
                password: globals.globalsGet('authkey'),
            }    
        }
        reqprom(options);
    }
    setDescription(description){
        let options = {
            method : 'PUT',
            uri : apiURL + this.testId + '/videos/' + this.hash,
            json : {
                'action' : 'set_description',
                'description' : description,
                'format' : 'json'
            },
            auth: {
                username: globals.globalsGet('username'),
                password: globals.globalsGet('authkey'),
            }
        }
        reqprom(options);
    }
    async saveLocally(location){
        let info = await this.getInfo();
        if (info['is_finished']==false){
            await this.stopRecording();
        }
        let url = info['video']
        let options = {
            method: 'GET',
            uri : url,
            stream : true,
            encoding: null
        };
        let timeout = 20;
        let iteration = 1;
        let r = null;
        console.log('Attempting to save video.')
        while(iteration < timeout){  
            try {
                r = await reqprom(options)             
                break;                                 //it will only progress to the break if our request works
            }
            catch(err){
                iteration +=1;
                await sleep(2000);
                if (iteration == 20){
                    console.log('Video could not be found.')
                }
            }
        }

        if (iteration < timeout){
            let path = location.split('/')   //split location into an array
            let name = path.pop();           //remove the final part that will be the name of the file
            path = path.join('/')            //rejoin the now shortened array and place /'s between elements

            if (!fs.existsSync(path)){
                console.log('Making Directory');
                fs.mkdirSync(path);
            }
            let file = fs.openSync(location,'w');
            fs.writeFileSync(file, r);
        } 
    }
}

async function Snapshot(hash,test){
    return new SnapshotClass(hash,test);
}

class SnapshotClass{
    constructor(hash,test){
        this.hash = hash;
        this.testId = test.testId;
        this.getInfo();
    }
    async getInfo(){
        let options = {            
            method : 'GET',
            uri : apiURL + this.testId + '/snapshots/' + this.hash,
            json : true,
            auth: {
                username: globals.globalsGet('username'),
                password: globals.globalsGet('authkey'),
            }   
        }
        this.info = await reqprom(options);
        return this.info;
    }
    setDescription(description){
        let options = {
            method : 'PUT',
            uri : apiURL + this.testId + '/snapshots/' + this.hash,
            json : {
                'action' : 'set_description',
                'description' : description,
                'format' : 'json'
            },
            auth: {
                username: globals.globalsGet('username'),
                password: globals.globalsGet('authkey'),
            }
        }
        reqprom(options);
    }
    async saveLocally(location){
        let url = await this.getInfo();
        url = url['image']
        let options = {
            method: 'GET',
            uri : url,
            stream : true,
            encoding: null
        };
        let timeout = 15;
        let iteration = 1;
        let r = null;
        console.log('Attempting to save image')
        while(iteration < timeout){  //STILL DOING THE 403 INSTA QUIT ERROR so it looks like r is something???? idk what.
            try {
                r = await reqprom(options)             //https://github.com/request/request-promise/issues/171
                break;                                 //it will only progress to the break if our request works
            }
            catch(err){
                iteration +=1;
                await sleep(1000);
                if (iteration == 15){
                    console.log('Image could not be found.')
                }
            }
        }

        if (iteration < timeout){
            let path = location.split('/')   //split location into an array
            let name = path.pop();           //remove the final part that will be the name of the file
            path = path.join('/')            //rejoin the now shortened array and place /'s between elements

            if (!fs.existsSync(path)){
                console.log('Making Directory');
                fs.mkdirSync(path);
            }
            let file = fs.openSync(location,'w');
            fs.writeFileSync(file, r);
        } 
    }
}

function TestHistoryBuilder(){
    return new TestHistoryBuilderClass();
}

class TestHistoryBuilderClass{
    constructor(){
        this.options = {}
    }
    withLimit(limit){
        this.options['num'] = limit;
        return this;
    }
    withActive(active){
        this.options['active'] = active;
        return this;
    }
    withName(name){
        this.options['name'] = name;
        return this;
    }
    withBuild(build){
        this.options['build'] = build;
        return this;
    }
    withUrl(url){
        this.options['url'] = url;
        return this;
    }
    withScore(score){
        this.options['score'] = score;
        return this;
    }
    withPlatform(platform){
        this.options['platform'] = platform;
        return this;
    }
    withPlatformType(platformType){
        this.options['platformType'] = platformType;
        return this;
    }
    withBrowser(browser){
        this.options['browser'] = browser;
        return this;
    }
    withBrowserType(browserType){
        this.options['browserType'] = browserType;
        return this;
    }
    withResolution(resolution){
        this.options['resolution'] = resolution;
        return this;
    }
    withStartDate(startDate){
        this.options['startDate'] = startDate;
        return this;
    }
    withEndDate(endDate){
        this.options['endDate'] = endDate;
        return this;
    }
    build(){
        return this.options;
    }
}

async function TestHistory(data){
    //    return requests.get(G.api, auth=(G.username, G.authkey), data=options).json()
    let options = {
        method : 'GET',
        uri : apiURL,
        data : data,
        json : true,
        auth: {
            username: globals.globalsGet('username'),
            password: globals.globalsGet('authkey'),
        }
    }
    return await reqprom(options);

}

module.exports = {
    CapsBuilder: CapsBuilder,
    login: login,
    AutomatedTest: AutomatedTest,
    TestHistoryBuilder: TestHistoryBuilder,
    TestHistory : TestHistory
};



























