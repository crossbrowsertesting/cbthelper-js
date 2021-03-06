const reqprom = require('request-promise-native');
const globals = require('./globals');
const Video = require('./Video');
const Snapshot = require('./Snapshot');
const fs = require ('fs');


/** Helpful representation of a selenium test. */
class AutomatedTest {
    /**
    * Create an Automated Test.
    * @param {number} testId - the selenium session ID, usually from webdriver
    */
    constructor(testId){
        this.testId = testId;
    }
    /**
    * Sets the score for our test in the CBT app
    * @param {string} score - Should be 'pass', 'fail', or 'unset'.
    */
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
    /**
    * Sets the description for our test in the CBT app.
    * @param {string} description - The description of your test.
    */
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
    /**
    * Sends the command to our api to stop the selenium test. Similar to driver.quit()
    */
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
   /**
    * Sends the command to take a snapshot and returns a Snapshot instance
    * @param {string} description - (optional) description - The description of your snapshot.
    */
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
   /**
    * Gets all snapshots for this test.
    * @returns {object} a list of Snapshot objects for this test.
    */
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
   /**
    * Downloads all snapshots for this test into a directory.
    * @param {string} directory - the directory where the snapshots will be saved.
    * @param {boolean} useDescription - If true set the images names as their descriptions.
    */
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
   /**
    * Starts recording video for this test
    * @param {string} description - (optional) Description of the video.
    */
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
   /**
    * Gets all video recordings for this test
    * @returns {object} A list of Video objects for this test
    */
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
   /**
    * Downloads all videos for this test into a directory.
    * @param {string} directory - the directory where the videos will be saved.
    * @param {boolean} useDescription - If true set the video names as their descriptions.
    */
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

module.exports = AutomatedTest;