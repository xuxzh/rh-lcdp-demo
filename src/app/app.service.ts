import {
  RhProjectConfigDto,
  RhLoginedUserDto,
  RhAppConfigDto,
  DataResultT,
  EmployeeInfoQueryDto,
  FullEmployeeInfoDto,
  UserAccountQueryDto,
  UserAccountInfo,
  ExistUserDto,
  OpResult,
  RhUserSessionDto,
  RhSafeAny
} from 'rh-base/model';
import { RhStorageService, RhAppConfigService, RhApiUrlsService } from 'rh-base/core';
import { RhComponentSchemaDto } from 'rh-lcdp/model';

import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Router } from '@angular/router';
import { DEFAULT_MENU_DATAS, DEFAULT_USER } from './data/menu-data';

/** 程序根服务，用于存取整个程序中通用的一些数据 */
@Injectable({
  providedIn: 'root'
})
export class AppService {
  // 调试组件订阅方法
  private debugSubject = new Subject<boolean>();
  get debugSubject$() {
    return this.debugSubject.asObservable();
  }
  debugSubjectTrigger(status: boolean) {
    this.debugSubject.next(status);
  }

  constructor(
    private storage: RhStorageService,
    private appConfigSer: RhAppConfigService,
    private apiUrls: RhApiUrlsService,
    public router: Router
  ) {}

  get appConfig(): RhAppConfigDto {
    return this.appConfigSer.appConfig;
  }

  get projectConfig(): RhProjectConfigDto {
    return this.appConfigSer.projectConfig;
  }

  getUser(): RhLoginedUserDto {
    return DEFAULT_USER;
  }

  getDebug() {
    return this.storage.getDebug();
  }

  setLoginStatus(status: boolean) {
    this.storage.setLoginStatus(status);
  }

  logout(): Promise<{ success: boolean; msg: string }> {
    return new Promise((resolve, reject) => {
      const loginedUser = this.getUser();
      const user = ExistUserDto.create();
      user.UserName = loginedUser.UserName;
      user.UserDisplayName = loginedUser.DisplayName;
      this.Logout(user).subscribe(
        (result) => {
          if (result?.Success) {
            resolve({ success: true, msg: '' });
          } else {
            resolve({ success: false, msg: result?.Message || '' });
          }
        },
        (err) => reject(err)
      );
    });
  }

  getUserSession(): RhUserSessionDto {
    return {
      Menus: DEFAULT_MENU_DATAS,
      User: DEFAULT_USER
    };
  }

  /** 获取页面测试数据 */
  async fetchPageJson(path: string): Promise<RhSafeAny> {
    try {
      if (!path) {
        return null;
      }
      path = `assets/data/${path}.json`;
      const response = await window.fetch(path);
      return await response.json();
    } catch {
      return null;
    }
  }

  //#region 后端接口区域开始
  /**
   *  查询员工基本信息
   */
  GetEmployeeInfoDatas(queryDto: EmployeeInfoQueryDto): Observable<DataResultT<FullEmployeeInfoDto[]>> {
    return this.apiUrls.PostMdp('EmployeeWebApi', 'GetEmployeeInfoDatas', queryDto);
  }

  /**
   *  获取用户账户信息
   */
  GetUserAccounts(queryDto: UserAccountQueryDto): Observable<DataResultT<UserAccountInfo[]>> {
    return this.apiUrls.PostPp('YGAacApi', 'GetUserAccounts', queryDto);
  }

  /**
   *  注销用户
   */
  private Logout(dto: ExistUserDto): Observable<OpResult> {
    return this.apiUrls.PostPp('YGAacApi', 'ExitSystem', dto);
  }

  //#endregion 后端接口区域结束
}
