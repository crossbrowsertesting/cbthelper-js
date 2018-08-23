'use strict';
var webdriver = require("selenium-webdriver");
//var {CapsBuilder, login, AutomatedTest, TestHistoryBuilder, TestHistory} = require('./CrossBrowserTesting.js');
const cbt = require("./CrossBrowserTesting.js");

const cbtHub = "http://hub.crossbrowsertesting.com:80/wd/hub";

async function main(){
    // set username and auth key for api requests
    cbt.login("Your Email","Your Authkey");

    //build caps using best match of what customer wants
    let caps = await cbt.getCapsBuilder().withBrowser("Google Chrome 68").withPlatform("Windows 8").withName("Test 1").withBuild("1.0").withResolution(1024,768).build();
    console.log(caps);

    let driver = new webdriver.Builder()
        .usingServer(cbtHub)
        .withCapabilities(caps)
        .build();

    let session = await driver.getSession();

    //initialize an AutomatedTest object with our selenium session id
    var myTest = cbt.getTestFromId(session.getId());
    var video = await myTest.startRecordingVideo();

    driver.get('http://google.com');

    //easily take snapshot
    let googleSnap = await myTest.takeSnapshot();
    //easily set snapshot description
    googleSnap.setDescription('google.com');
    //save the snapshot locally
    googleSnap.saveLocally('test/google.png');

    driver.get('http://crossbrowsertesting.com');

    //take snapshot and set description with one call (that's all)
    await myTest.takeSnapshot('cbt.com');

    //downloads every snapshot for a given test and saves them in a directory
    //can set useDescription to name the images what we set as the description
    //alternatively can set a prefix (default 'image') and images will be indexed
    await myTest.saveAllSnapshots('test/images', true);

    await video.stopRecording();

    await myTest.saveAllVideos('test/videos')

    //set score using enum ('pass','fail','unset')
    myTest.setScore('pass');

    //set description of test
    myTest.setDescription('blah blah blah');

    myTest.stop();

    //our test history api call takes a lot of optional parameters
    //the builder makes it easier to get what you want
    let options = cbt.getTestHistoryBuilder()
        .withLimit(5)
        .withName('cbthelper test')
        .build();
    console.log(options);

    //grab our history using the options we created above
    let history = await cbt.getTestHistory(options);
    //console.log(history['selenium']);

}

main();

