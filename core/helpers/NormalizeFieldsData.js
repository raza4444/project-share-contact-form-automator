const api = require("../api.js");

class NormalizeFieldsData {
  DEFAULT_GREETING = "Gruß,";

  async getFieldsData(eventId, userDetail) {
    let getFieldData = await api.getDataToFillFormFields(eventId, userDetail);

    getFieldData = getFieldData.data;
    const eventDataName = getFieldData.event_data_name;

    if (eventDataName == null) return null;

    const eventDataGreetingName = getFieldData.event_data_greeting_name;

    const eventDataMail = getFieldData.event_data_mail;

    if (eventDataMail == null) return null;

    const eventDataNumber = getFieldData.event_data_number;

    if (eventDataNumber == null) return null;

    const eventDataSubject = getFieldData.event_data_subject;

    const eventDataZip = getFieldData.event_data_zip;

    const eventDataAddress = getFieldData.event_data_address;

    const eventDataSegmentValues = getFieldData.event_data_segment_values;

    const eventDataCurUser = getFieldData.event_data_cur_user

    let messageText = "";

    if (eventDataSegmentValues) {
      for (let i = 0; i < eventDataSegmentValues.length; i++) {
        messageText += eventDataSegmentValues[i].value;

        // Add space if not first or last two
        if (i !== eventDataSegmentValues.length - 2 || i !== 0) {
          messageText += " ";
        }

        // Add new line if first or last two
        if (i === eventDataSegmentValues.length - 2 || i === 0) {
          messageText += "\n\n";
        }
      }

      // Number and greeting
      messageText += eventDataNumber ? eventDataNumber.number : null;
      messageText += "\n\n";

      messageText += getFieldData.event_data_cur_user.end_greeting
        ? getFieldData.event_data_cur_user.end_greeting
        : this.DEFAULT_GREETING;
      messageText += "\n";
      messageText += eventDataGreetingName
        ? eventDataGreetingName.greeting_name
        : null;
    }

    return {
      url: null,
      name: eventDataName.name,
      lastName: eventDataGreetingName.greeting_name,
      email: eventDataMail.mail,
      phone: eventDataNumber.number,
      subject: eventDataSubject ? eventDataSubject.subject : ' ',
      address: eventDataAddress ? eventDataAddress.address : ' ',
      zip: eventDataZip ? eventDataZip.zip : ' ',
      message: messageText,
      saveEventDataWithIds: {
        eventDataNameId: eventDataName.id,
        eventDataGreetingNameId: eventDataGreetingName.id,
        eventDataMailId:  eventDataMail.id,
        eventDataNumberId: eventDataNumber.id,
        eventDataSubjectId: eventDataSubject ? eventDataSubject.id : null,
        eventDataZipId: eventDataZip ? eventDataZip.id :null,
        eventDataAddressId: eventDataAddress ? eventDataAddress.id :null,
        eventDataFollowUpSegmentValues: eventDataSegmentValues.map(v => v.id),
        eventDataCurUserId: eventDataCurUser ? eventDataCurUser.id :null,

      },
    };
  }
}

module.exports = normalizeFieldsData = new NormalizeFieldsData();
