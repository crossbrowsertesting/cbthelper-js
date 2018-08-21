const reqprom = require('request-promise-native');
const globals = require('./globals');
const Video = require('./Video');
const Snapshot = require('./Snapshot');
const fs = require ('fs');

module.exports = class AutomatedTest {
    constructor(testId){
        this.testId = testId;
    }
    setScore(score){
        let options = {
            method : 'PUT',
            uri : globals.api + this.testId,
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
            uri : globals.api + this.testId,
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
            uri : globals.api + this.testId,
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
            uri : globals.api + this.testId + '/snapshots',
            json : true,
            auth: {
                username: globals.globalsGet('username'),
                password: globals.globalsGet('authkey'),
            }            
        }
        var hash = await reqprom(options);
        var snap = await new Snapshot(hash['hash'],this);
        if (description != ''){
            snap.setDescription(description);
        }
        return snap;
    }
    async getSnapshots(){
        let options = {
            method: 'GET',
            json: true,
            uri : globals.api + this.testId + '/snapshots',
            auth: {
                username: globals.globalsGet('username'),
                password: globals.globalsGet('authkey'),           
            }
        }
        let snaps = await reqprom(options);
        let ret = [];
        for (let i=0; i < snaps.length; i++){
            let pushvalue = await new Snapshot(snaps[i]['hash'],this);
            ret.push(pushvalue);
        }
        return ret;
    }
    async saveAllSnapshots(directory,useDescription){
        if(!useDescription)
            useDescription = false;
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
            uri : globals.api + this.testId + '/videos',
            json : true,
            auth: {
                username: globals.globalsGet('username'),
                password: globals.globalsGet('authkey'),
            }            
        }
        var hash = await reqprom(options);
        var video = await new Video(hash['hash'],this);
        if (description != ''){
            await video.setDescription(description);
        }
        return video;
    }
    async getVideos(){
        let options = {
            method: 'GET',
            json: true,
            uri : globals.api + this.testId + '/videos',
            auth: {
                username: globals.globalsGet('username'),
                password: globals.globalsGet('authkey'),           
            }
        }
        let vids = await reqprom(options);
        let ret = [];
        for (let i=0; i < vids.length; i++){
            let pushvalue = new Video(vids[i]['hash'],this);
            ret.push(pushvalue);
        }
        return ret;
    }
    async saveAllVideos(directory,useDescription){
        if(!useDescription)
            useDescription = false;
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