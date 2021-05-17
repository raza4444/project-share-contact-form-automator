const contactFormAutomation = require("./core/ContactFormAutomation.js");
const utility = require("./core/helpers/utility");


const token = process.argv.slice(2)[0] ? process.argv.slice(2)[0] : null; 
const logNumber = process.argv.slice(3)[0] ? process.argv.slice(3)[0] : null; 
if (!token && logNumber  || token && !logNumber || !token && !logNumber ) process.exit();


(async () => {
  await contactFormAutomation.start(token);
})();


process.on('SIGINT', () => {
  utility.logs('bye. :)');
  process.exit();
})