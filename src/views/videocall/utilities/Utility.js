
const queryString = require("query-string");

class Utility {
    static getRoomIdForMeeting() {
        const queryParmas = queryString.parse(window.location.search);
    
        if (queryParmas.vm && queryParmas.vm !== null) {
          return queryParmas.vm.toLowerCase();
        }
        return ""
      }
}

export default Utility;
