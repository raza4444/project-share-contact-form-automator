const api = require("./api.js");

class CheckLockCriteria {

    SUB_CRAWLER_TIMEOUT_TICKS = 25;

    async check(userDetail, domain) {
    //start domain crawling
    const startDomainCrawling = await api.startDomainCrawling(
      userDetail,
      domain
    );
    if(!startDomainCrawling) return this.lockCriteriaResponse(`There is issue with Start Crawler API. Please Check Start Crawler API.`);
   
    const statusUrl = startDomainCrawling.data.status_url;
    
    return await new Promise(async (resolve) => {
        
        let ticks = 0;
        const polling = setInterval(async () => {
        
        if (ticks >= this.SUB_CRAWLER_TIMEOUT_TICKS) {
          clearInterval(polling);
          resolve(this.lockCriteriaResponse("Crawling process exceeded timeout limit."));
        }
        const domainStatus = await api.domainCrawlingStatus(
            userDetail,
            statusUrl
          );
          if (domainStatus.data.success && !domainStatus.data.running) {
            clearInterval(polling);
            const lockCriteriaResult = await this.checkForLockCriteria(userDetail, domain);
            resolve(lockCriteriaResult);

          } else if (!domainStatus.data.success && !domainStatus.data.running) {
            clearInterval(polling);
            resolve(this.lockCriteriaResponse("There is something issue with domain Crawling process to check lock criteria."));
          } else {
            ticks++;
          }
      }, 3000);
    });
  }

  /**
   * 
   * @param {object} userDetail 
   * @param {string} domain 
   */
  async checkForLockCriteria(userDetail, domain) {
    const hasLockCriteria = await api.checkDomainCrawlingResult(
        userDetail,
        domain
      );
      if (hasLockCriteria.data && hasLockCriteria.data[0]) {

        const lockCriteriaResult = this.normalizeLockCriteriaResult(hasLockCriteria.data);
      
        if (lockCriteriaResult.foundLockCriteria) {
            //lock criteria found
            return this.lockCriteriaResponse(`gesperrt,kalt,kontakt,wegen,${lockCriteriaResult.reason !== '' ? lockCriteriaResult.reason : 'durch,crawler'}`, true)
        
        } else {
            //lock criteria not found
            return this.lockCriteriaResponse(`No lock Criteria found. starting contact form process (${domain})` , false , true)
        }
      } else {
        //result not found
        return this.lockCriteriaResponse(`No results found for company's website (${domain}) .....`)
      }
  }

  /**
   * 
   * @param {array} crawlerResults 
   * return object 
   */
  normalizeLockCriteriaResult(crawlerResults) {
    let lockCriteriaFound = false;
    let lockReason = "";
    if (crawlerResults[0].has_newsletter) {
          
        lockCriteriaFound = true;
        lockReason += ",newsletter";
      }

      if (crawlerResults[0].has_search) {
        lockCriteriaFound = true;
        lockReason += ",suche";
      }

      if (crawlerResults[0].has_shop) {
        lockCriteriaFound = true;
        lockReason += ",shop";
      }

      // Sub link results
      if (crawlerResults[0].subLinks) {
        results[0].subLinks.forEach((subLink) => {
          // Main results
          if (subLink.has_newsletter) {
            lockCriteriaFound = true;
            lockReason += lockReason.includes("newsletter")
              ? ""
              : ",newsletter";
          }

          if (subLink.has_search) {
            lockCriteriaFound = true;
            lockReason += lockReason.includes("suche") ? "" : ",suche";
          }

          if (subLink.has_shop) {
            lockCriteriaFound = true;
            lockReason += lockReason.includes("shop") ? "" : ",shop";
          }
        });
      }

      if (crawlerResults[0].keywordresults) {
        crawlerResults[0].keywordresults.forEach((keywordResult) => {
           if (
            keywordResult.keyword.report_result !== "" &&
            keywordResult.result
          ) {
            lockReason += lockReason.includes(keywordResult.keyword.keyword)
              ? ""
              : `,${keywordResult.keyword.keyword}`;
            lockCriteriaFound = true;
          }
        });
      }
      return {
          foundLockCriteria: lockCriteriaFound,
          reason:lockReason
      }
  }
  
  lockCriteriaResponse(msg = '', foundLockCriteria = false , isSuccess = false) {
      return {
          success: isSuccess,
          foundLockCriteria: foundLockCriteria,
          response: msg
      }
  }



}

module.exports = checkLockCriteria = new CheckLockCriteria();
