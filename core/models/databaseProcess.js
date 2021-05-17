const database = require("./database.js");

class dataBaseProcess {
  /**
   *
   * @param {string} token
   */
  getUserDetail = async (token) => {
    try {
      const userData = await database.query(
        `SELECT * FROM apitokens, users WHERE apitokens.userid = users.id AND  apitokens.token =  "${token}" Limit 1`
      );
      return userData[0];
    } catch (err) {
      throw err;
      // handle the error
    } finally {
      await database.close();
    }
  };

  /**
   *
   * @param {object} data
   */
  createContactFormResult = async (data) => {
    try {
      const cfaData = {
        users_id: data.userId,
        events_id: data.eventId,
        domain: data.domain,
        is_error: data.is_error,
        error_status: data.error,
        data: data.data,
        status: data.status,
      };

      let contactFormResult;
      const existingData = await database.query(
        `SELECT * FROM contact_form_automator_result WHERE domain = "${cfaData.domain}" Limit 1`
      );

      if (existingData && existingData.length > 0) {

        contactFormResult = await database.query(
          `UPDATE contact_form_automator_result 
          SET users_id = ? , events_id = ? , domain = ? , error_status = ?, is_error = ?, data = ?, status = ? 
          WHERE id =  ?`,
          [
            cfaData.users_id,
            cfaData.events_id,
            cfaData.domain,
            cfaData.error_status,
            cfaData.is_error,
            cfaData.data,
            cfaData.status,
            existingData[0].id,
          ]
        );


      } else {

        contactFormResult = await database.query(
          "INSERT INTO contact_form_automator_result SET ?",
          cfaData
        );

      }

      return contactFormResult ? true : false;
    } catch (err) {
      throw err;
    } finally {
      await database.close();
    }
  };

  /**
   *
   * @param logNumber
   */
  async saveLogs(message) {
    try {
      const subProcess = await database.query(
        `SELECT * FROM contact_form_automator_sub_process WHERE log_number = "${process.argv[3]}" Limit 1`
      );

      if (subProcess && subProcess.length > 0) {
        const date = new Date();
        const timestamp = `${date.getFullYear()}-${date.getMonth()}-${date.getDay()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}.0`;
        const data = {
          message: message,
          process_id: subProcess[0].contact_form_automator_process_id,
          sub_process_id: subProcess[0].id,
          created_at: timestamp,
          updated_at: timestamp
        }

        await database.query(
          `INSERT INTO contact_form_automator_logs SET ? `,
          data
        );
      }
    } catch (err) {
      throw err;
    } finally {
      await database.close();
    }
  } 
}

module.exports = dataBaseProcess = new dataBaseProcess();
