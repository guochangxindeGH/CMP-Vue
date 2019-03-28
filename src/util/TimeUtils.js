class TimeUtils {
    constructor() {

    }
    /**
     * 登录
     * @param {string} userName
     */
    getCurDataStr() {
        let date = new Date();
        let year = date.getFullYear();
        let month = date.getMonth() + 1;
        let strDate = date.getDate();
        let strHours = date.getHours();
        if (month >= 1 && month <= 9) {
            month = "0" + month;
        }
        if (strDate >= 0 && strDate <= 9) {
            strDate = "0" + strDate;
        }
        if (strHours >= 0 && strHours <= 9) {
            strHours = "0" + strHours;
        }

        let currentdate = year + "-" + month + "-" + strDate + " " + strHours + ":00:00";
        return currentdate;
    }
}
module.exports = TimeUtils;
