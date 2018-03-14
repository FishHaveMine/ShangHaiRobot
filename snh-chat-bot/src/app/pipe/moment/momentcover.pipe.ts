import { Pipe, PipeTransform } from '@angular/core';

function twoWords(number) {
  return number < 10 ? '0' + number : number;
}

function dateFilter(date, params) {
  return params.replace('mm', twoWords(date.getMinutes())).replace('HH', twoWords(date.getHours())).replace('d', date.getDate()).replace('M', date.getMonth() + 1).replace('yy', date.getFullYear()).replace('yyyy', date.getFullYear())

}

@Pipe({
  name: 'momentcover',
  pure: false
})
export class MomentcoverPipe implements PipeTransform {
  
  transform(input: number): string {
     var s1 = new Date().getTime(),
     s2 = input,
     runTime = (s2 - s1) / 1000;
    if(s2 < s1){
      runTime = (s1 - s2) / 1000;
    }
     var year = Math.floor(runTime / 86400 / 365);
     runTime = runTime % (86400 * 365);
     var month = Math.floor(runTime / 86400 / 30);
     runTime = runTime % (86400 * 30);
     var day = Math.floor(runTime / 86400);
     runTime = runTime % 86400;
     var hour = Math.floor(runTime / 3600);
     runTime = runTime % 3600;
     var minute = Math.floor(runTime / 60);
     runTime = runTime % 60;
     var second = Math.floor(runTime);
     if(hour != 0){
      if(s2 < s1){
        return hour+"小时";
      }else{
        return hour+"小时"+minute+"分钟";
      }
     }else{
      return minute+"分钟";
     }
     
  }

}
