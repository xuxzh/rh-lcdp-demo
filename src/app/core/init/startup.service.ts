/* eslint-disable no-console */
import { Injectable, Inject } from '@angular/core';
import { RH_I18N_TOKEN, RhAppConfigService } from 'rh-base/core';
import { HttpClient } from '@angular/common/http';
import { zip } from 'rxjs';
import { catchError } from 'rxjs/operators';

// import { I18nService } from '../i18n/i18n.service';
import { RhAppConfigDto, RhProjectConfigDto, RhSafeAny } from 'rh-base/model';

@Injectable({
  providedIn: 'root'
})
export class StartupService {
  constructor(
    private appconfigSer: RhAppConfigService,
    // private tranlate: TranslateService,
    // @Inject(RH_I18N_TOKEN) private i18n: I18nService,
    private httpClient: HttpClient
  ) {
    // console.log(this.appconfigSer);
    // console.log(this.http);
    // console.log(this.appconfigSer);
  }

  /**
   * 加载程序配置
   * @param production 是否生产模式
   * @description 非生产模式下必须传入配置的`appconfig.json`的路径
   */
  load(production: boolean, jsonUrl?: string): Promise<RhSafeAny> {
    // const serverIp = window.location.hostname;
    // const port = window.location.port;
    return new Promise((resolve) => {
      const projectUrl = 'assets/setting/project-config.json';
      // if (production) {
      //   const url = `http://${serverIp}:${port}/WebAppConfiguration/WebAppConfig.json`;
      //   zip(
      //     // this.httpClient.get(`assets/i18n/${this.i18n.defaultLang || 'zh-CN'}.json`),
      //     this.httpClient.get(url),
      //     this.httpClient.get(projectUrl)
      //   )
      //     .pipe(
      //       //
      //       catchError((res) => {
      //         console.warn(`StartupService.load: Network request failed`, res);
      //         resolve(null);
      //         return [];
      //       })
      //     )
      //     .subscribe(([appData, projectData]) => {
      //       //this.i18nSetting(langData);

      //       // 当启用了使用网站ip作为服务器时，处理ServerIp
      //       appData = this.serverIpHanlder(appData as RhAppConfigDto);
      //       this.appconfigSer.setAppConfigBackup(appData as RhAppConfigDto);
      //       appData = this.setDevelopMode(appData as RhAppConfigDto);
      //       this.appconfigSer.setAppConfig(appData as RhAppConfigDto);

      //       this.appconfigSer.setProjectConfig(projectData as RhProjectConfigDto);
      //       resolve(true);
      //     });
      // } else {
      const url = jsonUrl as string;
      zip(
        // this.httpClient.get(`assets/i18n/${this.i18n.defaultLang || 'zh-CN'}.json`),
        this.httpClient.get(url),
        this.httpClient.get(projectUrl)
      )
        .pipe(
          //
          catchError((res) => {
            console.warn(`StartupService.load: Network request failed`, res);
            resolve(null);
            return [];
          })
        )
        .subscribe(([appData, projectData]) => {
          // this.i18nSetting(langData);
          // 当启用了使用网站ip作为服务器时，处理ServerIp
          appData = this.serverIpHanlder(appData as RhAppConfigDto);
          this.appconfigSer.setAppConfigBackup(appData as RhAppConfigDto);
          appData = this.setDevelopMode(appData as RhAppConfigDto);
          this.appconfigSer.setAppConfig(appData as RhAppConfigDto);

          this.appconfigSer.setProjectConfig(projectData as RhProjectConfigDto);
          resolve(true);
        });
      // }
    });
  }

  /**设置是否是开发者模式
   * @description
   * 是否是开发者模式，需要读取缓存的配置，而不是每次刷新都加载服务器上的配置
   */
  private setDevelopMode(dto: RhAppConfigDto) {
    const DeveloperMode = this.appconfigSer.appConfig?.DeveloperMode;
    dto.DeveloperMode = DeveloperMode ? DeveloperMode : false;
    return dto;
  }

  // private xmlHttp(url: string): Promise<RhAppConfigDto> {
  //   return new Promise((resolve) => {
  //     const xmlHttp = new XMLHttpRequest();
  //     // 同步读取需要改成异步，防止控制台警告
  //     xmlHttp.open('GET', url, false);
  //     xmlHttp.send();
  //     if (!xmlHttp.responseText) {
  //       resolve(null);
  //     } else {
  //       const configDto = JSON.parse(xmlHttp.responseText) as RhAppConfigDto;
  //       resolve(configDto);
  //     }
  //   });
  // }

  // private i18nSetting(langData) {
  //   this.tranlate.setTranslation(this.i18n.defaultLang, langData);
  //   this.tranlate.setDefaultLang(this.i18n.defaultLang);
  // }

  /**
   * 当启用了使用网站ip作为服务器时，处理ServerIp
   * */
  private serverIpHanlder(data: RhAppConfigDto) {
    if (data?.IsUserSiteServerIp) {
      const serverIp = window.location.hostname;
      data.ServerIp = serverIp;
    }
    return data;
  }
}
