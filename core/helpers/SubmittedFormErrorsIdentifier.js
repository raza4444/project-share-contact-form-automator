const jsdom = require("jsdom");
const { JSDOM } = jsdom;
class SubmittedFormErrorsIdentifier {
  async check(page, formIdentity) {
    let bodyHTML = await page.evaluate(() => document.body.innerHTML);
    const virtualConsole = new jsdom.VirtualConsole();
    const dom = new JSDOM(bodyHTML, { virtualConsole });
    const errorsInInput = this.inputHasErrorClass(dom, formIdentity);

    if (errorsInInput) return false;

    return true;
  }

  /**
   * 
   * 
   * @param {object} dom 
   * @param {string} formIdentity 
   */
  inputHasErrorClass(dom, formIdentity) {
    const nodeListInput = [
      ...dom.window.document.querySelectorAll(formIdentity + " input"),
    ];
    let errorExist = [];
    nodeListInput.forEach((input) => {
      if (input.className.toLowerCase().includes("error")) {
        errorExist.push(input.className);
      }
    });

    return errorExist && errorExist.length > 0;
  }
}

module.exports = submittedFormErrorsIdentifier = new SubmittedFormErrorsIdentifier();
