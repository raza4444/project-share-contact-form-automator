const dataBaseProcess = require("./models/databaseProcess.js");
const checkLockCriteria = require("../core/checkLockCriteria.js");
const contactFormCrawling = require("../core/contactFormCrawling.js");
const utility = require("../core/helpers/utility.js");
const fillAutomateForm = require("../core/fillAutomateForm");
const normalizeFieldsData = require("../core/helpers/NormalizeFieldsData.js");
const captchaType = require("../core/constants/captcha.const.js");
const api = require("./api.js");

class ContactFormAutomation {
  token = '';
  userDetail = null;
  event;
  SUB_CRAWLER_TIMEOUT_TICKS = 25;
  debugMode = false;

  async start(token) {
    let count = 0;
    this.token = String(token);
    while (true) {
      await utility.sleep(5000);
      //get user detail
      this.userDetail = await dataBaseProcess.getUserDetail(String(token));

      // get event detail
      const event = await api.getEvents(this.userDetail);
      if (event) {
        this.event = event.data;

        //print logs
        this.startAutomationLogs();
        // print logs

        // get lock criteria response
        const lockCriteriaResponse = await checkLockCriteria.check(
          this.userDetail,
          this.event.unternehmen.domain
        );

        if (await this.checkIfNoLockCriteriaFound(lockCriteriaResponse)) {
          utility.logs(
            "No lock Criteria found.... start contact form automation"
          );

          // crawling contact form identity and  form input identity
          const contactFormData = await contactFormCrawling.getContactFormFieldData(
            this.event.unternehmen.kontaktformularlink
          );
          if (await this.checkContactFormExistAndCheckUnownCaptcha(contactFormData)) {
            //get field data
            const getInputFieldData = await normalizeFieldsData.getFieldsData(
              this.event.unternehmen.id,
              this.userDetail
            );

            if (await this.checkInputFieldDataExist(getInputFieldData)) {
              const formDetail = {
                contactFormData: contactFormData,
                getFieldData: getInputFieldData,
                url: this.event.unternehmen.kontaktformularlink,
                debugMode: this.debugMode,
              };
              const formSubmitted = await fillAutomateForm.start(formDetail);

              //save submitted result
              await this.saveFormSubmittedResult(
                formSubmitted,
                getInputFieldData
              );
            } else {
              //if input field data is missing form B.E
              this.start(this.token);
              break;
            }
          } else {
            //if no contact form exist in contact form url.
            this.start(this.token);
            break;
          }
        } else {
          //if lock criteria found
          this.start(this.token);
          break;
        }
      }
    }
  }

  startAutomationLogs() {
    utility.logs(`.........${this.userDetail.username} started automation of website: ${this.event.unternehmen.domain}.........`);
    utility.logs(`Start Contact Form Automation of this Url: ${this.event.unternehmen.kontaktformularlink}   ......`);
    utility.logs(`Checking lock criteria of website: ${this.event.unternehmen.domain}`);
  }

  async saveFormSubmittedResult(formSubmitted, inputFieldData) {

    if (formSubmitted) {
      await this.endWithNewCrawlingResult("gesendet");
      await api.saveEventData(
        this.event.unternehmen.id,
        inputFieldData.saveEventDataWithIds,
        this.userDetail
      );
      await this.addResultInDatabase(null, true);
      return;
    } else {
      inputFieldData.url = this.event.unternehmen.kontaktformularlink;
      inputFieldData.saveEventDataWithIds = null;
      await this.addResultInDatabase(
        "Contact Form is not submitted, There is something issue with contact form",
        true,
        true,
        inputFieldData
      );
      return;
    }
  }

  async checkInputFieldDataExist(getInputFieldData) {
    if (getInputFieldData) {
      return true;
    } else {
      utility.logs(
        "Input field data is missing. please set All input data first...."
      );
      await this.addResultInDatabase(
        "Input field data is missing. please set All input data first.",
        true,
        true
      );
      return false;
    }
  }

  async checkContactFormExistAndCheckUnownCaptcha(contactFormData) {
    if (contactFormData) {
      //check unkown captcha
      if (contactFormData.captchaIdentity === captchaType.UNKNOWN_CAPTCHA) {

        utility.logs(
          `Contact form (${this.event.unternehmen.kontaktformularlink}) has different captcha that cannot be bypass`
        );
        await this.addResultInDatabase(
          `Contact form (${this.event.unternehmen.kontaktformularlink}) has different captcha that cannot be bypass`,
          true,
          true
        );
        return false;

      }

      return true;

    } else {
      await this.endWithNewCrawlingResult();
      utility.logs(
        `Website does not have contact form in this url: ${this.event.unternehmen.kontaktformularlink}`
      );
      await this.addResultInDatabase(
        `Website does not have contact form in this url: ${this.event.unternehmen.kontaktformularlink}`,
        true,
        true
      );
      return false;
    }
  }

  /**
   *
   * @param {object} lockCriteriaResponse
   */
  async checkIfNoLockCriteriaFound(lockCriteriaResponse) {
    if (lockCriteriaResponse.success) return true;

    //if not success (if lock criteria found)
    if (lockCriteriaResponse.foundLockCriteria) {
      const reportedLockCriteria = await api.reportedLockCriteria(
        this.event.unternehmen.id,
        [lockCriteriaResponse.response],
        this.userDetail
      );
      if (!reportedLockCriteria) {
        return false;
      }
      await this.endWithNewCrawlingResult();

      utility.logs(`Lock Criteria found in ${this.event.unternehmen.domain}`);
      await this.addResultInDatabase(
        `Lock Criteria found in ${this.event.unternehmen.domain}`,
        true,
        true
      );

      return false;
    } else {
      utility.logs(`Lock Criteria response: \n\n${lockCriteriaResponse.response}`);

      await this.addResultInDatabase(lockCriteriaResponse.response, true, true);
      return false;
    }
  }

  async endWithNewCrawlingResult(ergebnis = null) {
    const result = {
      id: this.event.ereignis.id,
      ergebnis: ergebnis,
      status: 1,
    };
    await api.saveEventV2Result(result.id, result, this.userDetail);
    return;
  }

  async addResultInDatabase(
    error = null,
    status = true,
    is_error = false,
    data = null
  ) {
    const contactFormResultData = {
      userId: this.userDetail.id,
      eventId: this.event.unternehmen.id,
      domain: this.event.unternehmen.domain,
      is_error: is_error,
      data: data,
      error: error,
      status: status,
    };
    return await dataBaseProcess.createContactFormResult(
      contactFormResultData
    );
  }
}

module.exports = contactFormAutomation = new ContactFormAutomation();
