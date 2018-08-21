module.exports = class TestHistoryBuilder {
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