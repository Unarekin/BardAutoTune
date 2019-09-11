import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'durationFormat',
  pure: false
})
export class DurationFormatPipe implements PipeTransform {

  transform(value: any): any {
    let sec_num = parseInt(value, 10)// / 1000; // don't forget the second param
    let hours   = Math.floor(sec_num / 3600);
    let minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    let seconds = sec_num - (hours * 3600) - (minutes * 60);

    let elements: string[] = [];
    if (hours)
      elements.push(hours + " hr");
    if (minutes)
      elements.push(minutes + " min");
    if (seconds)
      elements.push(Math.ceil(seconds) + " sec");

    return elements.join(" ");
  }

}