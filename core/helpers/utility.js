const fs = require("fs");
const util = require("util");
const dotenv = require('dotenv');
const result = dotenv.config({path: `${__dirname}/../../.env`});
const dataBaseProcess = require("../models/databaseProcess.js");
// const logFile = fs.createWriteStream("log.txt", { flags: "a" });

if (result.error) {
  throw result.error
}
const logStdout = process.stdout;

class Utility {
  message = "";
  config = {
    rest_host: process.env.REST_HOST,
    event_host: process.env.EVENT_HOST,
    event_host_token: process.env.EVENT_HOST_TOKEN,
    app_scope: process.env.APP_SCOPE,
    wit_api_key: process.env.WIT_API_KEY
  }

  getApiUrl() {
    return {
      contactFormEventsApi: `${this.config.event_host}rest/v1/next-ereignisse/next/for-kontaktformularlinks`,
      speechApi: `https://api.wit.ai/speech`,
      startDomainCrawlerApi: `${this.config.rest_host}intern/crawler/domain/start`,
      statusDomainCrawlerApi: (url) => `${this.config.rest_host}${url}`,
      hasLockedCriteria: (domain, type = "domain") =>
        `${this.config.rest_host}intern/crawler/results-for-domain?type=${type}&domain=${domain}`,
      lockCriteriaReportedApi: (companyRegisterId) =>
        `${this.config.event_host}rest/v1/unternehmen/${companyRegisterId}/aktionen`,
      saveEventV2ResultApi: (eventId) =>
        `${this.config.event_host}rest/v1/ereignisse/${eventId}/ergebnis`,
      eventDataForCompanyRegisterId: (eventId) =>
        `${this.config.rest_host}intern/branches/events/${eventId}/event-data?campaign_type=kontaktformularlinks`,
      saveEventDataForCompanyRegisterId: (companyRegisteredId) =>
        `${this.config.rest_host}intern/branches/events/${companyRegisteredId}/event-data`,
    };
  }

  eventsApiHeader(userDetail) {
    return {
      "x-schluessel": this.config.event_host_token,
      "x-benutzerraum": this.config.app_scope,
      "x-benutzername": userDetail.username,
      "x-benutzerid": userDetail.id,
    };
  }

  speechApiHeader() {
    return {
      Authorization: `Bearer ${this.config.wit_api_key}`,
      "Content-Type": "audio/mpeg3",
    };
  }

  backEndApiHeader(token) {
    return {
      apitoken: token,
    };
  }

  async logs(message, isEnd = false) {
    // for latter use or use for testing
    // console.log = function (message) {
    //   //
    //   logFile.write("=> " + util.format(message) + "\n\n");
    //   logStdout.write("=> " + util.format(message) + "\n\n");
    // };
    if(process.argv[3]) {
      await dataBaseProcess.saveLogs(String("=> " + util.format(message)));
    }
    console.log(`-> ${message}`);
    if (isEnd) {
      console.log(
        "...................................................................."
      );
    }
  }

  async sleep(ms) {
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

module.exports = utility = new Utility();
