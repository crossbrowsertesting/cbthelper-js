const reqprom = require('request-promise-native');
const globals = require('./globals');
const fs = require ('fs');


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/** Represents a snapshot for selenium tests */
class Snapshot{
    /**
    * Create a Snapshot Instance.
    * @param {string} hash - the hash for this image, returned by rest api when taking a screenshot.
    * @param {object} test - an AutomatedTest object that represents a test currently running. 
    */
    constructor(hash,test){
        this.hash = hash;
        this.testId = test.testId;
        this.getInfo();
    }
    /**
    * Calls out to the api to get updated info for this snapshot. 
    * @returns {object} Object with all of the info for a specific snapshot.
    */
    async getInfo(){
        let options = {            
            method : 'GET',
            uri : globals.api + this.testId + '/snapshots/' + this.hash,
            json : true,
            auth: {
                username: globals.globalsGet('username'),
                password: globals.globalsGet('authkey'),
            }   
        }
        this.info = await reqprom(options);
        return this.info;
    }
    /**
    * Sets the description for this snapshot.
    * @param {string} description - Set the description for a snapshot.
    */
    setDescription(description){
        let options = {
            method : 'PUT',
            uri : globals.api + this.testId + '/snapshots/' + this.hash,
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
    * Save all snapshots locally. 
    * @param {string} location - Save images to specified location. 
    */
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
        while(iteration < timeout){  
            try {
                r = await reqprom(options)             
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

module.exports = Snapshot;