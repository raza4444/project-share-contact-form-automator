const dataBaseProcess = require("./core/models/databaseProcess.js");
const checkLockCriteria = require("./core/checkLockCriteria.js");
const contactFormCrawling = require("./core/contactFormCrawling.js");
const fillAutomateForm = require("./core/fillAutomateForm");
const database = require("./core/models/database.js");
const normalizeFieldsData = require("./core/helpers/NormalizeFieldsData.js");
const utility = require("./core/helpers/utility.js");
const api = require("./core/api.js");
const token = process.argv.slice(2)[0] ? process.argv.slice(2)[0] : null;
const logNumber = process.argv.slice(3)[0] ? process.argv.slice(3)[0] : null;
if (!token && logNumber  || token && !logNumber || !token && !logNumber ) process.exit();

(async () => {

  let eventId = 1234508;
  let domain = "https://wvf-gmbh.de/index.php";
  let contactFormUrl = "https://www.zkw-otterbein.de/kontakt/kontaktformular";
  let userDetail = await dataBaseProcess.getUserDetail(String(token));
  //const event = await api.getEvents(userDetail);
  //const lockCriteriaResponse = await checkLockCriteria.check(userDetail, domain);
    
      const contactFormData = await contactFormCrawling.getContactFormFieldData(
        contactFormUrl
      );
      const getFieldData = await normalizeFieldsData.getFieldsData(
      eventId,
      userDetail
    );
        const formDetail = {
        contactFormData: contactFormData,
        getFieldData: getFieldData,
        url: contactFormUrl,
        debugMode: true
      };
    const formSubmitted = await fillAutomateForm.start(formDetail);
      console.log(formSubmitted);
})()
// (async () => {
//   let eventId = 1234508;
//   let domain = "zweckverband-torgau.de";
//   let contactFormUrl = "https://www.wohnmobilstellplatz-oberhof.de/kontakt/";

//   count = 1;
// //  while (true) {
//     await utility.sleep(5000);
//     utility.logs(`process (${count}) is running and token: ${token}`);
//     //let userDetail = await dataBaseProcess.getUserDetail(String(token));

//     //  const lockCriteriaResponse = await checkLockCriteria.check(userDetail, domain);
//     //  console.log(lockCriteriaResponse);

//     const contactFormData = await contactFormCrawling.getContactFormFieldData(
//         contactFormUrl
//       );
//       console.log(contactFormUrl)
//     // utility.logs(`user: ${userDetail.username}`);
//     // const getFieldData = await normalizeFieldsData.getFieldsData(
//     //   eventId,
//     //   userDetail
//     // );
//     // utility.logs(`user email from get field data: ${getFieldData.email}`);

//     //  //puppeteer form submit test
//     //   const formDetail = {
//     //     contactFormData: contactFormData,
//     //     getFieldData: getFieldData,
//     //     url: contactFormUrl,
//     //     debugMode: true
//     //   };
//     // const formSubmitted = await fillAutomateForm.start(formDetail);
//     //   console.log(formSubmitted);
//   // }
  
// })();
