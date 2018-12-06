function common (dateStr) {
    const date = new Date(dateStr * 1000)
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    let hour = date.getHours().toString();
    if (hour && hour.length === 1) {
      hour = '0' + hour;
    }
    let minute = date.getMinutes().toString();
    if (minute && minute.length === 1) {
      minute = '0' + minute;
    }
    let second = date.getSeconds().toString();
    if (second && second.length === 1) {
      second = '0' + second;
    }
    const timeStr = '' + year + '年' + month + '月' + day + '日' + ' ' + hour + ':' + minute + ':' + second;
    return timeStr
} 

export default {
  common: common
};