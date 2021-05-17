const puppeteer = require("puppeteer-extra");
const pluginStealth = require("puppeteer-extra-plugin-stealth");
const submittedFormErrorsIdentifier = require("../core/helpers/SubmittedFormErrorsIdentifier.js");

const grecaptcha = require("./reacpacha-solve/g-recaptcha-solve.js");

class FillAutomateForm {
  async start(formDetail) {
    const formIdentity = formDetail.contactFormData.formIdentity;
    const formInputDetail = formDetail.contactFormData.formInputDetail;
    const textareaIdentity = formDetail.contactFormData.formMessageTextarea;
    const formSubmitButton = formDetail.contactFormData.formSubmitButton;
    const getFieldData = formDetail.getFieldData;
    const contactFormUrl = formDetail.url;
    let checkCheckboxRepetitionIdentity = [];
    await puppeteer.use(pluginStealth());

    const browser = await puppeteer.launch({
      headless: formDetail.debugMode ? false : true,
      args: [
        "--disable-web-security",
        "--disable-features=IsolateOrigins,site-per-process",
        "--no-sandbox",
        "--disable-dev-shm-usage",
      ],
    });

    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(0);
    await page.goto(contactFormUrl);

    await formInputDetail.forEach(async (input) => {
      const formInputIdentity = input.id
        ? input.id
        : input.name
          ? `${formIdentity}  input[name="${input.name}"]`
          : input.class;

      const selectBoxIdentity = input.id
        ? input.id
        : input.name
          ? `${formIdentity} select[name="${input.name}"]`
          : input.class;

      //handle all checkbox
      if (input.type === "checkbox" || input.inputIdentity === "checkbox") {

        if (checkCheckboxRepetitionIdentity.indexOf(formInputIdentity) !== -1) {
        } else {
          checkCheckboxRepetitionIdentity.push(formInputIdentity);
          await page.evaluate((formInputIdentity) => {
            document.querySelector(formInputIdentity).click();
          }, formInputIdentity);
        }
      }
      //handle all checkbox

      //handle select box
      if (input.type === "select") {
        await page.select(selectBoxIdentity, input.selectedOptions);
      }

      if (input.inputIdentity === "mobile") {
        await page.$eval(
          formInputIdentity,
          (el, getFieldData) => (el.value = getFieldData.phone),
          getFieldData
        );
      }

      if (input.inputIdentity == 'email') {
        await page.$eval(formInputIdentity, (el, getFieldData) => el.value = getFieldData.email, getFieldData);
      }

      if (input.inputIdentity == 'name') {
        await page.$eval(formInputIdentity, (el, getFieldData) => el.value = getFieldData.name, getFieldData);
      }

      if (input.inputIdentity == 'first-name') {
        await page.$eval(formInputIdentity, (el, getFieldData) => el.value = getFieldData.name, getFieldData);
      }

      if (input.inputIdentity == "last-name") {
        await page.$eval(
          formInputIdentity,
          (el, getFieldData) => (el.value = getFieldData.lastName),
          getFieldData
        );
      }

      if (input.inputIdentity == "subject") {
        await page.$eval(
          formInputIdentity,
          (el, getFieldData) => (el.value = getFieldData.subject),
          getFieldData
        );
      }

      if (input.inputIdentity == "address") {
        await page.$eval(
          formInputIdentity,
          (el, getFieldData) => (el.value = getFieldData.address),
          getFieldData
        );
      }

      if (input.inputIdentity == "text" && input.required) {
        await page.$eval(
          formInputIdentity,
          (el) => (el.value = 'NA')
        );
      }

    });
    // handle textarea
    await page.focus(textareaIdentity)
    await page.$eval(textareaIdentity, (el, getFieldData) => el.value = getFieldData.message, getFieldData);
    //handle textarea

    await grecaptcha.solve(page);

    await Promise.all([page.click(formSubmitButton)]);

    await page.screenshot({ path: "img/current.png" });

    if (!formDetail.debugMode) await browser.close();
    const response = await submittedFormErrorsIdentifier.check(
      page,
      formIdentity
    );

    return response;
  }
}

module.exports = fillAutomateForm = new FillAutomateForm();
