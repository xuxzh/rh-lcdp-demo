import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { DataResultT, RhSafeAny } from 'rh-lcdp/model';
import { AppService } from 'src/app/app.service';

@Injectable({
  providedIn: 'root'
})
export class MockInterceptor implements HttpInterceptor {
  constructor(private appSer: AppService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (request?.url.startsWith('http://192.168.0.')) {
      const tempDatas = request.url.split('/');
      const interfaceName = tempDatas[tempDatas.length - 1];
      // const commonRep: HttpResponse<DataResultT<RhSafeAny>> = new HttpResponse({
      //   body: {
      //     Attach: [],
      //     Message: '获取数据成功',
      //     Success: true,
      //     TotalCount: 0,
      //     SkipCount: 0
      //   },
      //   status: 200,
      //   statusText: 'OK',
      //   url: ''
      // });
      return this.getMockResponseData(interfaceName);
    } else {
      return next.handle(request);
    }
  }

  getMockResponseData(interfaceName: string): Observable<HttpEvent<unknown>> {
    return new Observable((obs) => {
      if (interfaceName === 'GetMouldFailureReportOrderDatas') {
        this.appSer.fetchPageJson('report-order.data').then((body) => {
          obs.next(this.initResponseData(body));
          obs.complete();
        });
      } else if (interfaceName === 'GetMouldFailureRepairOrderDatas') {
        this.appSer.fetchPageJson('repair-order.data').then((body) => {
          obs.next(this.initResponseData(body));
          obs.complete();
        });
      } else if (interfaceName === 'getModuleConfigDatas') {
        this.appSer.fetchPageJson('module-config.data').then((body) => {
          obs.next(this.initResponseData(body));
          obs.complete();
        });
      } else {
        obs.next(
          this.initResponseData({
            Attach: [],
            Message: '获取数据成功',
            Success: true,
            TotalCount: 0,
            SkipCount: 0
          })
        );
        obs.complete();
      }
      // switch (interfaceName) {
      //   case 'GetMouldFailureReportOrderDatas': {
      //     this.appSer.fetchPageJson('report-order-data').then((body) => {
      //       obs.next(this.initResponseData(body));
      //       obs.complete();
      //     });
      //   }
      //   default:
      //     obs.next(
      //       this.initResponseData({
      //         Attach: [],
      //         Message: '获取数据成功',
      //         Success: true,
      //         TotalCount: 0,
      //         SkipCount: 0
      //       })
      //     );
      //     obs.complete();
      // }
    });
  }

  private initResponseData(body: any) {
    return new HttpResponse({
      body: body,
      status: 200,
      statusText: 'OK',
      url: ''
    });
  }
}
