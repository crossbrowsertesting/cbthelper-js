const reqprom = require('request-promise-native');
const globals = require('./globals');
const fs = require ('fs');


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = class Video {
    constructor(hash, test) {
        this.hash = hash;
        this.testId = test.testId;
        this.getInfo();
    }
    async getInfo(){
        let options = {
            method : 'GET',
            uri : globals.api + this.testId + '/videos/' + this.hash,
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
            uri : globals.api + this.testId + '/videos/' + this.hash,
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
            uri : globals.api + this.testId + '/videos/' + this.hash,
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