class FormFieldIdentifier {
  nameFieldPossibleIdentifier = ["name"];

  firstNamePossibleIdentifier = [
    "firstname",
    "first-name",
    "first name",
    "vorname",
  ];

  lastNamePossibleIdentifier = [
    "lastname",
    "last-name",
    "last name",
    "vorname",
  ];

  emailFieldPossibleIdentifier = ["email", "e-mail", "mail"];

  mobileNoFieldPossibleIdentifier = [
    "telefon",
    "telefon-nr",
    "phone",
    "contact",
    "mobile",
    "telefonnummer",
    "tel",
    "telfax",
  ];

  textareaPossibleIdentifier = ["nachricht", "anliegen"];

  captchaIdentifier = ["captcha", "sicherheitsabfrage", "contact_07", "cap"];

  subjectFieldPossibleIdentifier = ["betreff", "subject"];

  addressFieldPossibleIdentifier = ["straße", "adresse", "plz", "ort", "haus"];

  getInputFieldIdentifier(input) {
    let emailCheck = this.checkEmailField(input);
    let nameCheck = this.checkNameField(input);
    let phoneNumberCheck = this.checkPhoneNoField(input);
    let subjectCheck = this.checkSubjectField(input);
    let addressCheck = this.checkAddressField(input);
    return emailCheck
      ? emailCheck
      : nameCheck
      ? nameCheck
      : phoneNumberCheck
      ? phoneNumberCheck
      : subjectCheck
      ? subjectCheck
      : addressCheck
      ? addressCheck
      : input.type;
  }

  /**
   *
   * @param {object} input
   */
  checkEmailField(input) {
    let hasEmailField = this.emailFieldPossibleIdentifier.some((email) => {
      return (
        (input.type && input.type.toLowerCase().includes(email)) ||
        (input.name && input.name.toLowerCase().includes(email)) ||
        (input.placeholder &&
          input.placeholder.toLowerCase().includes(email)) ||
        (input.className && input.className.toLowerCase().includes(email)) ||
        (input.id && input.id.toLowerCase().includes(email)) ||
        this.checkInLabel(input, this.emailFieldPossibleIdentifier)
      );
    });

    if (hasEmailField) {
      return "email";
    }
    return null;
  }

  /**
   *
   * @param {object} input
   */

  checkNameField(input) {
    let hasFirstNameField = this.firstNamePossibleIdentifier.some(
      (firstName) => {
        return (
          (input.name && input.name.toLowerCase().includes(firstName)) ||
          (input.placeholder &&
            input.placeholder.toLowerCase().includes(firstName)) ||
          (input.className &&
            input.className.toLowerCase().includes(firstName)) ||
          (input.id && input.id.toLowerCase().includes(firstName)) ||
          this.checkInLabel(input, this.firstNamePossibleIdentifier)
        );
      }
    );

    let hasLastNameField = this.lastNamePossibleIdentifier.some((lastName) => {
      return (
        (input.name && input.name.toLowerCase().includes(lastName)) ||
        (input.placeholder &&
          input.placeholder.toLowerCase().includes(lastName)) ||
        (input.className && input.className.toLowerCase().includes(lastName)) ||
        (input.id && input.id.toLowerCase().includes(lastName)) ||
        this.checkInLabel(input, this.lastNamePossibleIdentifier)
      );
    });

    let hasNameField = this.nameFieldPossibleIdentifier.some((name) => {
      return (
        (input.name && input.name.toLowerCase().includes(name)) ||
        (input.placeholder && input.placeholder.toLowerCase().includes(name)) ||
        (input.className && input.className.toLowerCase().includes(name)) ||
        (input.id && input.id.toLowerCase().includes(name)) ||
        this.checkInLabel(input, this.nameFieldPossibleIdentifier)
      );
    });

    return hasFirstNameField
      ? "first-name"
      : hasLastNameField
      ? "last-name"
      : hasNameField
      ? "name"
      : null;
  }

  /**
   *
   * @param {object} input
   */

  checkSubjectField(input) {
    let hasSubjectField = this.subjectFieldPossibleIdentifier.some(
      (subject) => {
        return (
          (input.name && input.name.toLowerCase().includes(subject)) ||
          (input.placeholder &&
            input.placeholder.toLowerCase().includes(subject)) ||
          (input.className &&
            input.className.toLowerCase().includes(subject)) ||
          (input.id && input.id.toLowerCase().includes(subject)) ||
          this.checkInLabel(input, this.subjectFieldPossibleIdentifier)
        );
      }
    );

    if (hasSubjectField) {
      return "subject";
    }
    return null;
  }

  /**
   *
   * @param {object} input
   */
  checkPhoneNoField(input) {
    let hasMobileField = this.mobileNoFieldPossibleIdentifier.some((mobile) => {
      return (
        (input.name && input.name.toLowerCase().includes(mobile)) ||
        (input.placeholder &&
          input.placeholder.toLowerCase().includes(mobile)) ||
        (input.className && input.className.toLowerCase().includes(mobile)) ||
        (input.id && input.id.toLowerCase().includes(mobile)) ||
        this.checkInLabel(input, this.mobileNoFieldPossibleIdentifier)
      );
    });

    if (hasMobileField) {
      return "mobile";
    }
    return null;
  }

  /**
   *
   * @param {object} input
   */

  checkAddressField(input) {
    let hasAddressField = this.addressFieldPossibleIdentifier.some((mobile) => {
      return (
        input.type === "text" &&
        ((input.name && input.name.toLowerCase().includes(mobile)) ||
          (input.placeholder &&
            input.placeholder.toLowerCase().includes(mobile)) ||
          (input.className && input.className.toLowerCase().includes(mobile)) ||
          (input.id && input.id.toLowerCase().includes(mobile)) ||
          this.checkInLabel(input, this.addressFieldPossibleIdentifier))
      );
    });

    if (hasAddressField) {
      return "address";
    }
    return null;
  }

  /**
   *
   * @param {object} input
   */
  checkInLabel(input, possibleIdentifier) {
    let labelText =
      input.parentElement.nodeName.toLowerCase() === "label"
        ? input.parentElement.textContent
        : input.parentElement.querySelector("label")
        ? input.parentElement.querySelector("label").textContent
        : input.parentElement.parentElement.querySelector("label")
        ? input.parentElement.parentElement.querySelector("label").textContent
        : null;

    if (
      labelText &&
      possibleIdentifier.some((text) => labelText.toLowerCase().includes(text))
    ) {
      return true;
    } else {
      return false;
    }
  }

  /**
   *
   * @param {object} input
   */

  checkCaptchaExist(input) {
    return this.captchaIdentifier.some((captcha) => {
      return (
        (input.name && input.name.toLowerCase().includes(captcha)) ||
        (input.placeholder &&
          input.placeholder.toLowerCase().includes(captcha)) ||
        (input.className && input.className.toLowerCase().includes(captcha)) ||
        (input.id && input.id.toLowerCase().includes(captcha)) ||
        this.checkInLabel(input, this.captchaIdentifier) ||
        this.checkCaptchaInParentDiv(input, this.captchaIdentifier)
      );
    });
  }

  checkCaptchaInParentDiv(input, possibleIdentifier) {
    return possibleIdentifier.some((captcha) => {
      return (
        (input.parentElement.className &&
          input.parentElement.className.toLowerCase().includes(captcha)) ||
        (input.parentElement.id &&
          input.parentElement.id.toLowerCase().includes(captcha))
      );
    });
  }
}

module.exports = formFieldIdentifier = new FormFieldIdentifier();
