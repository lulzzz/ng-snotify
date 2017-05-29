import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncate'
})
export class TruncatePipe implements PipeTransform {

  transform(value: any, args?: any): any {
    let limit = 40;
    let trail = '...';
    if (args) {
      limit = args.length > 0 ? parseInt(args[0], 10) : 60;
      trail = args.length > 1 ? args[1] : '...';
    }

    return value.length > limit ? value.substring(0, limit) + trail : value;
  }

}
