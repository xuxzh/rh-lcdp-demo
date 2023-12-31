import { APP_INITIALIZER, NgModule, Provider } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NZ_I18N } from 'ng-zorro-antd/i18n';
import { zh_CN } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import zh from '@angular/common/locales/zh';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouteReuseStrategy } from '@angular/router';
import { InteractionService } from '@core/init';
import { RhRouteReuseStrategy } from 'rh-base/core';
import { CUSTOMIZE_SELECTOR_DATA, RhCustomizeSelectorDatas } from 'rh-base/model';
import { RhSharedModule } from 'rh-base/shared';
import { environment } from '@evn/environment';

import { StartupService } from './core/init/startup.service';
import { MockInterceptor } from '@core/net/mock.interceptor';

registerLocaleData(zh);

function StartupServiceFactory(startupService: StartupService) {
  return () => {
    return startupService.load(environment.production, '../../assets/temp/app-config.json');
  };
}

/**
 *  初始化交互:`MsgHelper`
 */
function interactionServiceFactory(interactionSer: InteractionService) {
  return () => {
    return interactionSer.initInteractionConfig();
  };
}

/** 程序初始化前获取配置信息等工作 */
const APPINIT_PROVIDES: Provider[] = [
  StartupService,
  {
    provide: APP_INITIALIZER,
    useFactory: StartupServiceFactory,
    deps: [StartupService],
    multi: true
  },
  InteractionService,
  {
    provide: APP_INITIALIZER,
    useFactory: interactionServiceFactory,
    deps: [InteractionService],
    multi: true
  }
];

/** 路由复用提供商 */
const APP_ROUTEREUSE_PROVIDERS: Provider[] = [
  {
    provide: RouteReuseStrategy,
    useClass: RhRouteReuseStrategy
  }
];

/** 拦截器提供商 */
const INTERCEPTOR_PROVIDERS: Provider[] = [
  {
    provide: HTTP_INTERCEPTORS,
    useClass: MockInterceptor,
    multi: true
  }
  // {
  //   provide: HTTP_INTERCEPTORS,
  //   useClass: RhThrottleInterceptor,
  //   multi: true
  // },
  // {
  //   provide: HTTP_INTERCEPTORS,
  //   useClass: RhDefaultInterceptor,
  //   multi: true
  // },
  // {
  //   provide: HTTP_INTERCEPTORS,
  //   useClass: RhInterfaceInterceptor,
  //   multi: true
  // },
  // {
  //   provide: HTTP_INTERCEPTORS,
  //   useClass: RhFactoryInterceptor,
  //   multi: true
  // }
];

/** 自定义通用selector提供商 */
const BASE_SELECTOR_DATA_PROVIDERS: Provider[] = [
  {
    provide: CUSTOMIZE_SELECTOR_DATA,
    useValue: [RhCustomizeSelectorDatas],
    multi: true
  }
];

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, AppRoutingModule, FormsModule, HttpClientModule, BrowserAnimationsModule, RhSharedModule],
  providers: [
    ...APPINIT_PROVIDES,
    ...APP_ROUTEREUSE_PROVIDERS,
    ...INTERCEPTOR_PROVIDERS,
    ...BASE_SELECTOR_DATA_PROVIDERS,
    { provide: NZ_I18N, useValue: zh_CN }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
