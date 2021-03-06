/**
* Builder to generate options for getting test history
* All of the with methods return this for method chaining.
*/
class TestHistoryBuilder {
    /**
    * Test History Builder instance.
    */
    constructor(){
        this.options = {}
    }
    /**
    * Sets the max number of tests to return.
    * @param {number} limit - Number of tests to return.
    */
    withLimit(limit){
        this.options['num'] = limit;
        return this;
    }
    /**
    * If set, will only return active or inactive tests.
    * @param {boolean} active - Boolean value.
    */
    withActive(active){
        this.options['active'] = active;
        return this;
    }
    /**
    * Will only return tests that match the name given.
    * @param {string} name - Name of test to look for. 
    */
    withName(name){
        this.options['name'] = name;
        return this;
    }
    /**
    * Will only return tests that match the build given.
    * @param {string} build - Build of test to look for. 
    */
    withBuild(build){
        this.options['build'] = build;
        return this;
    }
    /**
    * Will only return tests that match the url given.
    * @param {string} url - Url of test to look for. 
    */
    withUrl(url){
        this.options['url'] = url;
        return this;
    }
    /**
    * Will only return tests that match the score given.
    * @param {string} score - Score of test to look for ('pass', 'fail', 'unset'). 
    */
    withScore(score){
        this.options['score'] = score;
        return this;
    }
    /**
    * Will only return tests that match the platform given.
    * @param {string} platform - Platform of test to look for.
    */
    withPlatform(platform){
        this.options['platform'] = platform;
        return this;
    }
    /**
    * Will only return tests that match the platform type given.
    * @param {string} platformType - Platform type of test to look for.
    */
    withPlatformType(platformType){
        this.options['platformType'] = platformType;
        return this;
    }
    /**
    * Will only return tests that match the browser given.
    * @param {string} browser - Browser of test to look for.
    */
    withBrowser(browser){
        this.options['browser'] = browser;
        return this;
    }
    /**
    * Will only return tests that match the browser type given.
    * @param {string} browserType - Browser type of test to look for.
    */
    withBrowserType(browserType){
        this.options['browserType'] = browserType;
        return this;
    }
    /**
    * Will only return tests that match the resolution given.
    * @param {string} resolution - Resolution of test to look for.
    */
    withResolution(resolution){
        this.options['resolution'] = resolution;
        return this;
    }
    /**
    * Will only return tests that match the startDate given.
    * @param {string} startDate - Start date of test to look for.
    */
    withStartDate(startDate){
        this.options['startDate'] = startDate;
        return this;
    }
    /**
    * Will only return tests that match the end date given.
    * @param {string} endDate - End date of test to look for.
    */
    withEndDate(endDate){
        this.options['endDate'] = endDate;
        return this;
    }
    /**
    * Generates the test history options.
    */
    build(){
        return this.options;
    }
}

module.exports = TestHistoryBuilder;