const got = require("got");
const jsdom = require("jsdom");
const formFieldIdentifier = require("../core/helpers/FormFieldIdentifier.js");
const utility = require("../core/helpers/utility.js");
const captchaType = require("../core/constants/captcha.const.js");
const possibleListing = require('../core/helpers/PossibleListing.js');
const { JSDOM } = jsdom;

class ContactFormCrawling {
  
  hasInputCaptcha = null;
  /**
   *
   * @param {string} contactFormUrl
   */
  async getContactFormFieldData(contactFormUrl) {
    const response = await got(contactFormUrl);

    const virtualConsole = new jsdom.VirtualConsole();
    const dom = new JSDOM(response.body, { virtualConsole });
    const specificContactFormIdentity = this.getIdentityOfContactFormPage(dom);

    if (specificContactFormIdentity == null) {
      utility.logs(`url (${contactFormUrl}) does not have contact form`);
      return null;
    }

    let allRequiredInputOfForm = this.getAllInputsIdentityOfContactForm(
      dom,
      specificContactFormIdentity
    );

    const allRequiredSelectBoxOfForm = this.getAllSelectBoxOfContactForm(
      dom,
      specificContactFormIdentity
    );

    allRequiredInputOfForm = [
      ...allRequiredInputOfForm,
      ...allRequiredSelectBoxOfForm,
    ];
    const messageTextarea = this.getTextAreaIdentityOfContactForm(
      dom,
      specificContactFormIdentity
    );

    const submitButtonIdentity = this.findButtonInForm(
      dom,
      specificContactFormIdentity
    );
    const captchaIdentity = this.checkFormHasCaptcha(
      dom,
      specificContactFormIdentity
    );
    return {
      formIdentity: specificContactFormIdentity,
      formInputDetail: allRequiredInputOfForm,
      formMessageTextarea: messageTextarea,
      formSubmitButton: submitButtonIdentity,
      captchaIdentity: captchaIdentity,
    };
  }

  /**
   *
   * @param {object} dom
   */

  
   getIdentityOfContactFormPage(dom) {
    const nodeList = [...dom.window.document.querySelectorAll("form")];
    const allForms = [];
    nodeList.forEach((form) => {
      let className = form.className
        ? "." + form.className.trim().replace(" ", ".")
        : null;
      let formId = !form.id.match(
        /^(?:[0-9])|[\'^£$%&*(?<=\[}{@\\\\\/#~?:.><>,|=+¬]|(\[(?:\[??[^\[]*?\]))/
      )
        ? form.id.toString()
        : null;

      let parentIdentity = form.parentElement.id
        ? "#" + form.parentElement.id
        : form.parentElement.className
        ? `.${form.parentElement.className.trim().replace(" ", ".")}`
        : form.parentElement.tagName;

      let formIdentity = formId
        ? "#" + formId
        : className
        ? className
        : parentIdentity + " form";
      allForms.push(formIdentity);
    });
    let findSpecificContactForm = [];
    allForms.forEach((form) => {
      const nodeListInput = [
        ...dom.window.document.querySelectorAll(form + " input"),
      ];
      let contactFormInputTypes = [];

      nodeListInput
        .filter((form) => {
          if (form.type == "submit") return false;
          return form;
        })
        .forEach((input) => {
          contactFormInputTypes.push(input.type);
        });
      var textFieldCount = contactFormInputTypes.filter((x) => x === "text")
        .length;

      if (
        contactFormInputTypes.length > 2 &&
        ((contactFormInputTypes.includes("text") &&
          contactFormInputTypes.includes("email")) ||
          textFieldCount >= 2)
      ) {
        findSpecificContactForm.push(form);
      }
    });
    const specificContactForm = findSpecificContactForm[
      findSpecificContactForm.length - 1
    ]
      ? findSpecificContactForm[findSpecificContactForm.length - 1]
      : null;
    return specificContactForm;
  }

  /**
   *
   * @param {object} dom
   * @param {string} formIdentity
   */
  getAllInputsIdentityOfContactForm(dom, formIdentity) {
    let allRequiredInputs = [];
    const nodeListInput = [
      ...dom.window.document.querySelectorAll(formIdentity + " input"),
    ];

    nodeListInput
      .filter(
        (input) =>
          input.type !== "submit" &&
          input.type !== "hidden" &&
          input.type !== "button"
      )
      .forEach((input) => {
        if(formFieldIdentifier.checkCaptchaExist(input)) {
          this.hasInputCaptcha = captchaType.UNKNOWN_CAPTCHA;
        }
        
        let id =
          input.id &&
          !input.id.match(
            /^(?:[0-9])|[\'^£$%&*(?<=\[}{@\\\\\/#~?:.><>,|=+¬]|(\[(?:\[??[^\[]*?\]))/
          )
            ? input.id.toString()
            : null;
        allRequiredInputs.push({
          type: input.type,
          class: input.className
            ? `.${input.className.trim().replace(" ", ".")}`
            : null,
          id: id ? `#${id}` : null,
          name: input.name,
          placeholder: input.placeholder ? input.placeholder : null,
          required: input.required ? true : input.getAttribute('data-field-required') ? true : false,
          inputIdentity: formFieldIdentifier.getInputFieldIdentifier(input),
        });
      });
    return allRequiredInputs;
  }

  /**
   *
   * @param {object} dom
   * @param {string} formIdentity
   */

  getTextAreaIdentityOfContactForm(dom, formIdentity) {
    let requiredTextarea = [];
    const nodeListTextarea = [
      ...dom.window.document.querySelectorAll(formIdentity + " textarea"),
    ];

    const lastIndex = nodeListTextarea.length - 1;

    let textAreaId =
      nodeListTextarea[lastIndex].id &&
      !nodeListTextarea[lastIndex].id.match(
        /^(?:[0-9])|[\'^£$%&*(?<=\[}{@\\\\\/#~?:.><>,|=+¬]|(\[(?:\[??[^\[]*?\]))/
      )
        ? nodeListTextarea[lastIndex].id.toString()
        : null;

    return textAreaId
      ? `#${textAreaId}`
      : nodeListTextarea[lastIndex].name
      ? `${formIdentity} textarea[name='${nodeListTextarea[lastIndex].name}']`
      : `${formIdentity} textarea`;
  }

  /**
   *
   * @param {object} dom
   * @param {string} formIdentity
   */
  getAllSelectBoxOfContactForm(dom, formIdentity) {
    let allSelectBox = [];
    const nodeListSelectBoxes = [
      ...dom.window.document.querySelectorAll(formIdentity + " select"),
    ];

    nodeListSelectBoxes.forEach((selectBox) => {
      const selectBoxId =
        selectBox.id &&
        !selectBox.id.match(
          /^(?:[0-9])|[\'^£$%&*(?<=\[}{@\\\\\/#~?:.><>,|=+¬]|(\[(?:\[??[^\[]*?\]))/
        )
          ? selectBox.id.toString()
          : null;

      allSelectBox.push({
        type: "select",
        class: selectBox.className
          ? `.${selectBox.className.trim().replace(" ", ".")}`
          : null,
        id: selectBoxId ? `#${selectBoxId}` : null,
        name: selectBox.name,
        placeholder: selectBox.placeholder ? selectBox.placeholder : null,
        required: selectBox.required ? selectBox.required : null,
        inputIdentity: "",
        selectedOptions:
          selectBox.options.item(0).value === "" ||
          selectBox.options.item(0).value === -1 ||
          selectBox.options.item(0).disabled
            ? selectBox.options.item(1).value
            : selectBox.options.item(0).value,
      });
    });
    return allSelectBox;
  }

  findButtonInForm(dom, formIdentity) {
    const savedBtnIdentity = possibleListing.possibleBtnIdentity;
    
    for (let i = 0; i < savedBtnIdentity.length; i++) {
      
      const nodeListInSpecialBtnClass = [
        ...dom.window.document.querySelectorAll(
          formIdentity + " "+ savedBtnIdentity[i] 
        ),];
        if(nodeListInSpecialBtnClass && nodeListInSpecialBtnClass.length > 0) {
          return formIdentity + " "+ savedBtnIdentity[i];
          break;
        }
    }
    const nodeListInput = [
      ...dom.window.document.querySelectorAll(
        formIdentity + " input[type='submit']"
      ),
    ];

    let inputSubmitButtonId =
      nodeListInput &&
      nodeListInput[0] &&
      nodeListInput[0].id &&
      !nodeListInput[0].id.match(
        /^(?:[0-9])|[\'^£$%&*(?<=\[}{@\\\\\/#~?:.><>,|=+¬]|(\[(?:\[??[^\[]*?\]))/
      )
        ? nodeListInput[0].id.toString()
        : null;

    if (nodeListInput.length > 0) {
      return inputSubmitButtonId
        ? "#" + inputSubmitButtonId
        : `${formIdentity} input[type='submit']`;
    }

    const nodeListInputTypeButton = [
      ...dom.window.document.querySelectorAll(
        formIdentity + " input[type='button']"
      ),
    ];
    let inputButtonId =
      nodeListInputTypeButton &&
      nodeListInputTypeButton[0] &&
      nodeListInputTypeButton[0].id &&
      !nodeListInputTypeButton[0].id.match(
        /^(?:[0-9])|[\'^£$%&*(?<=\[}{@\\\\\/#~?:.><>,|=+¬]|(\[(?:\[??[^\[]*?\]))/
      )
        ? nodeListInputTypeButton[0].id.toString()
        : null;

    if (nodeListInputTypeButton.length > 0) {
      return inputButtonId
        ? "#" + inputButtonId
        : `${formIdentity} input[type='button']`;
    }

    const nodeListButtonOfForm = [
      ...dom.window.document.querySelectorAll(formIdentity + " button"),
    ];

    if (
      nodeListButtonOfForm &&
      nodeListButtonOfForm[0] &&
      nodeListButtonOfForm[0].type == "submit"
    ) {
      return nodeListButtonOfForm[0].id
        ? "#" + nodeListButtonOfForm[0].id
        : `${formIdentity} button[type="submit"]`;
    } else if (nodeListButtonOfForm && nodeListButtonOfForm[0]) {
      return nodeListButtonOfForm[0].id
        ? nodeListButtonOfForm[0].id
        : `${formIdentity} button`;
    }
  }

  checkFormHasCaptcha(dom, formIdentity) {
    const googleReCaptcha = this.checkGoogleReCaptcha(dom, formIdentity);
    return googleReCaptcha ? googleReCaptcha : this.hasInputCaptcha;
  }

  checkGoogleReCaptcha(dom, formIdentity) {
    let nodeListCheckReCaptchaByClass = [];
    let nodeListCheckReCaptchaByTag = [];
    nodeListCheckReCaptchaByClass = [
      ...dom.window.document.querySelectorAll(formIdentity + " .g-recaptcha"),
    ];
    if (
      nodeListCheckReCaptchaByClass &&
      nodeListCheckReCaptchaByClass.length > 0
    ) {
      return captchaType.GOOGLE_CAPTCHA;
    }

    nodeListCheckReCaptchaByClass = [
      ...dom.window.document.querySelectorAll(".g-recaptcha"),
    ];
    if (
      nodeListCheckReCaptchaByClass &&
      nodeListCheckReCaptchaByClass.length > 0
    ) {
      return captchaType.GOOGLE_CAPTCHA;
    }

    nodeListCheckReCaptchaByTag = [
      ...dom.window.document.querySelectorAll("g-recaptcha"),
    ];
    if (nodeListCheckReCaptchaByTag && nodeListCheckReCaptchaByTag.length > 0) {
      return captchaType.GOOGLE_CAPTCHA;
    }

    return null;
  }
}

module.exports = contactFormCrawling = new ContactFormCrawling();
