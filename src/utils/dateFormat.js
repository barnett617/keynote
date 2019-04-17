function common (dateStr) {
    const date = new Date(dateStr * 1000)
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const nowYear = new Date().getFullYear();
    const nowMonth = new Date().getMonth() + 1;
    const nowDay = new Date().getDate();
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
    let timeStr;
    if (year === nowYear && month === nowMonth && day === nowDay) {
      timeStr = '' + hour + ':' + minute;
    } else if (year === nowYear && month === nowMonth && day === (nowDay - 1)) {
      timeStr = '昨天 ' + hour + ':' + minute;
    } else {
      timeStr = '' + year + '年' + month + '月' + day + '日' + ' ' + hour + ':' + minute;
    }
    // const timeStr = '' + year + '年' + month + '月' + day + '日' + ' ' + hour + ':' + minute + ':' + second;
    return timeStr
} 

function timestamp (dateStr) {
  const date = new Date(dateStr)
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const current = new Date();
  const nowYear = current.getFullYear();
  const nowMonth = current.getMonth() + 1;
  const nowDay = current.getDate();
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
  let timeStr;
  if (year === nowYear && month === nowMonth && day === nowDay) {
    timeStr = '' + hour + ':' + minute;
  } else if (year === nowYear && month === nowMonth && day === (nowDay - 1)) {
    timeStr = '昨天 ' + hour + ':' + minute;
  } else {
    timeStr = '' + year + '年' + month + '月' + day + '日' + ' ' + hour + ':' + minute;
  }
  // const timeStr = '' + year + '年' + month + '月' + day + '日' + ' ' + hour + ':' + minute + ':' + second;
  return timeStr
} 

function gapfivemin (last, now) {
  const gap = now.valueOf() - last.valueOf();
  if (gap > 5 * 60 * 1000) {
    return true
  }
  return false
}

export default {
  common: common,
  timestamp: timestamp,
  gapfivemin: gapfivemin,
};