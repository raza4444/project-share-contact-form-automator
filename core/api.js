const axios = require("axios");
const https = require("https");
const utility = require("./helpers/utility.js");

class Api {
  /**
   * var array userDetail
   * return Events
   */

  getEvents = async (userDetail) => {
    try {
      const httsAgent = new https.Agent({ rejectUnauthorized: false });
      return await axios({
        httsAgent,
        method: "get",
        url: utility.getApiUrl().contactFormEventsApi,
        headers: utility.eventsApiHeader(userDetail),
      })
        .catch(err => {
          throw err;
        });
    } catch (err) {
      utility.logs("=> get Events API Failed: " + err.message)
      return null;
    }
  };

  /**
   * var array audioBytes
   * return SpeechText
   */

  getSpeechText = async (audioBytes) => {
    try {
      const httsAgent = new https.Agent({ rejectUnauthorized: false });
      return await axios({
        httsAgent,
        method: "post",
        url: utility.getApiUrl().speechApi,
        data: new Uint8Array(audioBytes).buffer,
        headers: utility.speechApiHeader(),
      }).catch(err => {
        throw err;
      });
    } catch (err) {
      utility.logs("=> get Speech Text API Failed for google solve: " + err.message)
      return null;
    }
  };

  /**
   * @param object userDetail
   * @param string url
   * @return array
   */

  startDomainCrawling = async (userDetail, domain) => {
    try {
      const body = {
        user_id: userDetail.id,
        links: [domain],
      };
      const httsAgent = new https.Agent({ rejectUnauthorized: false });
      return await axios({
        httsAgent,
        method: "post",
        url: utility.getApiUrl().startDomainCrawlerApi,
        data: body,
        headers: utility.backEndApiHeader(userDetail.token),
      }

      ).catch(err => {
        throw err;
      });
    } catch (err) {
      utility.logs("=> Start Domain crawler API Failed: " + err.message)
      return null;
    }

  };

  /**
   * @param int userId
   * @param string url
   * @return array
   */

  domainCrawlingStatus = async (userDetail, url) => {
    try {
      const httsAgent = new https.Agent({ rejectUnauthorized: false });
      return await axios({
        httsAgent,
        method: "get",
        url: utility.getApiUrl().statusDomainCrawlerApi(url),
        headers: utility.backEndApiHeader(userDetail.token),
      }).catch(err => {
        throw err;
      });
    } catch (err) {
      utility.logs("=> status Domain crawler API Failed: " + err.message)
      return null;
    }
  };

  checkDomainCrawlingResult = async (userDetail, domain) => {
    try {
      const httsAgent = new https.Agent({ rejectUnauthorized: false });
      return await axios({
        httsAgent,
        method: "get",
        url: utility.getApiUrl().hasLockedCriteria(domain),
        headers: utility.backEndApiHeader(userDetail.token),
      })

        .catch(err => {
          throw err;
        });
    } catch (err) {
      utility.logs("=> check Domain crawler Result API Failed: " + err.message)
      return null;
    }
  };

  /**
   * @param int eventId
   * @param array body
   * @return array
   */

  reportedLockCriteria = async (companyRegisteredId, body, userDetail) => {
    try {
      const httsAgent = new https.Agent({ rejectUnauthorized: false });
      return await axios({
        httsAgent,
        method: "post",
        url: utility.getApiUrl().lockCriteriaReportedApi(companyRegisteredId),
        data: body,
        headers: utility.eventsApiHeader(userDetail),
      })
        .catch(err => {
          throw err;
        });
    } catch (err) {
      utility.logs("=> check reported Lock Criteria API Failed: " + err.message)
      return null;
    }

  };

  /**
   * @param int eventId
   * @param object body
   * @return array
   */

  saveEventV2Result = async (eventId, body, userDetail) => {
    const httsAgent = new https.Agent({ rejectUnauthorized: false });
    return await axios({
      httsAgent,
      method: "post",
      url: utility.getApiUrl().saveEventV2ResultApi(eventId),
      data: body,
      headers: utility.eventsApiHeader(userDetail)
    });
  };

  /**
   * @param int eventId
   * @return array
   */

  getDataToFillFormFields = async (eventId, userDetail) => {
    try {
      const httsAgent = new https.Agent({ rejectUnauthorized: false });
      return await axios({
        httsAgent,
        method: "get",
        url: utility.getApiUrl().eventDataForCompanyRegisterId(eventId),
        headers: utility.backEndApiHeader(userDetail.token),
      }).catch(err => {
        throw err;
      });
    } catch (err) {
      utility.logs("=> API Failed: (get data to fill form field)  : " + err.message)
      return null;
    }
  };

  saveEventData = async (
    companyRegisteredId,
    saveEventDataWithIds,
    userDetail
  ) => {
    const body = {
      event_data_name_id: saveEventDataWithIds.eventDataNameId,
      event_data_greeting_name_id: saveEventDataWithIds.eventDataGreetingNameId,
      event_data_mail_id: saveEventDataWithIds.eventDataMailId,
      event_data_number_id: saveEventDataWithIds.eventDataNumberId,
      event_data_custom_number: null,
      event_data_subject_id: saveEventDataWithIds.eventDataSubjectId,
      event_data_zip_id: saveEventDataWithIds.eventDataZipId,
      event_data_address_id: saveEventDataWithIds.eventDataAddressId,
      event_data_segment_values:
        saveEventDataWithIds.eventDataFollowUpSegmentValues,
      event_data_cur_user_id: saveEventDataWithIds.eventDataCurUserId,
    };

    const httsAgent = new https.Agent({ rejectUnauthorized: false });
    return await axios({
      httsAgent,
      method: "post",
      url: utility
        .getApiUrl()
        .saveEventDataForCompanyRegisterId(companyRegisteredId),
      data: body,
      headers: utility.backEndApiHeader(userDetail.token),
    });
  };
}

module.exports = api = new Api();
