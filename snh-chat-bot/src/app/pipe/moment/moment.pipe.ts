import { Pipe, PipeTransform } from '@angular/core';

function twoWords(number) {
  return number < 10 ? '0' + number : number;
}

function dateFilter(date, params) {
  return params.replace('mm', twoWords(date.getMinutes())).replace('HH', twoWords(date.getHours())).replace('d', date.getDate()).replace('M', date.getMonth() + 1).replace('yyyy', date.getFullYear()).replace('yy', date.getFullYear())

}

@Pipe({
  name: 'moment',
  pure: false
})
export class MomentPipe implements PipeTransform {

  transform(input: any, args?: any): any {

    let isAlwaysShowTime = true;
    let isShorterDate = false;
    if (!input) {
      return "";
    }

    var date = new Date(input)
    var now = new Date();
    // 和当前时间的分钟差
    var diff = (now.getTime() - date.getTime()) / 60000;

    //今天零点
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    // 今天零点和现在的分钟差
    var todayFar = (now.getTime() - today.getTime()) / 60000;

    if (!isAlwaysShowTime && diff < 1) {
      // 1分钟内
      return "刚刚";
    }
    if (!isAlwaysShowTime && diff < 60) {
      // 1小时内
      return diff + "分钟前";
    }

    if (diff < todayFar) {
      // 今天内, 1小时（含）前
      return dateFilter(date, "HH:mm");
    }

    if (isShorterDate) {
      // 1 天有1440 分钟
      if (diff < (todayFar + 1440)) {
        return "昨天";
      }
      return dateFilter(date, "yy/M/d");
    }

    if (now.getFullYear() === date.getFullYear()) {
      // 1天以上（含）, 同年
      return dateFilter(date, "M月d日 HH:mm");
    }

    // 1天以上（含）, 跨年
    return dateFilter(date, "yyyy年M月d日 HH:mm");
  }

}
