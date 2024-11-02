/**
 * @param {Number} ms 
 * @param {Boolean} highest 
 * @return {String} If highest: returns Largest time denomination. Else: hh:mm:ss:ms
 */

module.exports = (ms, highest=true) => {
  let milli = Math.floor((ms % 1000) / 100);
  let seconds = Math.floor((ms / 1000) % 60);
  let minutes = Math.floor((ms / (1000 * 60)) % 60);
  let hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
  let days = Math.floor((ms / (1000 * 60 * 60 * 24)));

  let out = `0`;
  if (highest){
    if (days) {
      out = `${days} ${(days>1 ? 'Days' : 'Day')}`
    } else if (hours) {
      out = `${hours} ${(hours>1 ? 'Hours' : 'Hour')}`
    } else if (minutes) {
      out = `${minutes} ${(minutes>1 ? 'Minutes' : 'Minute')}`
    } else if (seconds) {
      out = `${seconds} ${(seconds>1 ? 'Seconds' : 'Second')}`
    } else if (milli) {
      out = `${milli} ${(milli>1 ? 'Milliseconds' : 'Millisecond')}`
    }
  } else {
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;
    
    if (hours) {
      out = `${hours}:${minutes}:${seconds}.${milli}`
    } else if (Number(minutes)) {
      out = `${Number(minutes)}:${seconds}.${milli}`
    } else if (Number(seconds)) {
      out = `${Number(seconds)}.${milli}`
    } else if (Number(milli)) {
      out = `${Number(milli)}`
    }
  }

  return out
}