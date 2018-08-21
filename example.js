'use strict';
var webdriver = require("selenium-webdriver");
//var {CapsBuilder, login, AutomatedTest, TestHistoryBuilder, TestHistory} = require('./CrossBrowserTesting.js');
const cbt = require("./CrossBrowserTesting.js");

const cbtHub = "http://hub.crossbrowsertesting.com:80/wd/hub";

async function main(){
    cbt.login("patrick.richardson@smartbear.com","u6752ef1109dd271");
    let caps = await cbt.getCapsBuilder().withBrowser("Google Chrome 68").withPlatform("Windows 8").withName("Test 1").withBuild("1.0").withResolution(1024,768).build();
    console.log(caps);
    let driver = new webdriver.Builder()
        .usingServer(cbtHub)
        .withCapabilities(caps)
        .build();

    let session = await driver.getSession();

    var myTest = cbt.getTestFromId(session.getId());
    var video = await myTest.startRecordingVideo();

    driver.get('http://google.com');
    let googleSnap = await myTest.takeSnapshot();
    googleSnap.setDescription('google.com');
    googleSnap.saveLocally('test/google.png');

    driver.get('http://crossbrowsertesting.com');
    await myTest.takeSnapshot('cbt.com');

    await myTest.saveAllSnapshots('test/images', true);

    await video.stopRecording();

    await myTest.saveAllVideos('test/videos')

    myTest.setScore('pass');

    myTest.setDescription('blah blah blah');

    myTest.stop();

    let options = cbt.getTestHistoryBuilder()
        .withLimit(5)
        .withName('cbthelper test')
        .build();
    console.log(options);

    let history = await cbt.getTestHistory(options);
    //console.log(history['selenium']);

}

main();





/*
#!/usr/bin/env python3
import cbthelper as cbt
from selenium import webdriver
import sys, os

def main():
    # set username and auth key for api requests
    username = os.environ['CBT_USERNAME'] or ''
    authkey = os.environ['CBT_AUTHKEY'] or ''
    if username == '' or authkey == '':
        print("Don't forget to set username and authkey in main.py")
        sys.exit(1)
    cbt.login(username, authkey)
    # build caps using best match of what customer wants
    # does not require exact platform or browser name
    caps = cbt.getCapsBuilder() \
        .withPlatform('windows 10') \
        .withBrowser('Google Chrome 65') \
        .withResolution(1024, 768) \
        .withName('cbthelper test') \
        .withBuild('0.0.1') \
        .withRecordNetwork(True) \
        .build()
    print(caps)

    driver = webdriver.Remote(desired_capabilities = caps, command_executor = cbt.hub)
    driver.implicitly_wait(20)

    # initialize an AutomatedTest object with our selenium session id
    myTest = cbt.getTestFromId(driver.session_id)
    video = myTest.startRecordingVideo()

    driver.get('http://google.com')
    driver.implicitly_wait(2)
    # easily take snapshot
    googleSnap = myTest.takeSnapshot()
    # easily set snapshot description
    googleSnap.setDescription('google.com')
    # save the snapshot locally
    googleSnap.saveLocally('test/google.png')

    driver.get('http://crossbrowsertesting.com')
    driver.implicitly_wait(2)
    # take snapshot and set description with one call (that's all)
    myTest.takeSnapshot('cbt.com')

    # downloads every snapshot for a given test and saves them in a directory
    # can set useDescription to name the images what we set as the description
    # alternatively can set a prefix (default 'image') and images will be indexed
    myTest.saveAllSnapshots('test/images', useDescription=True)

    video.stopRecording()

    # set score using enum (SCORE_PASS, _FAIL, or _UNSET)
    myTest.setScore(cbt.SCORE_PASS)

    # set description
    myTest.setDescription('blah blah blah')

    # send request to our api to stop the test
    # can also pass in score to set score and stop in one call
    # myTest.stop(cbt.SCORE_PASS)
    myTest.stop()

    video.saveLocally('test/video.mp4')

    #driver.quit()

    # our test history api call takes a lot of optional parameters
    # the builder makes it easier to get what you want
    options = cbt.getTestHistoryBuilder() \
        .withLimit(5) \
        .withName('cbthelper test') \
        .build()
    print(options)
    # grab our history using the options we created above
    history = cbt.getTestHistory(options)
    print(history['selenium'])

if __name__ == '__main__':
    main()
    */
