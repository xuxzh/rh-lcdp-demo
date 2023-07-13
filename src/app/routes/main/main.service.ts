import { RhApiUrlsService, RhStorageService, RhRouteHelper, MsgHelper, RhTreeHelper, RhAppConfigService } from 'rh-base/core';
import { Injectable } from '@angular/core';
import {
  DataResultT,
  RhMenusDto,
  RhMenuNodeDto,
  InnerNavigatorDto,
  RhUpdatePasswordDto,
  OpResult,
  RhLoginedUserDto,
  RhReuseMenuDto,
  RhParaSettingEntryDto,
  FactorynfoQueryDto,
  FactoryInfoDto
} from 'rh-base/model';
import { Observable, Subject } from 'rxjs';
import { AppService } from 'src/app/app.service';

@Injectable({
  providedIn: 'root'
})
export class RhMainService {
  get menuList(): RhMenusDto[] {
    const tempMenuList = this.appSer.getUserSession()?.Menus?.filter((ele) => ele?.IsVisible) || [];
    return tempMenuList || [];
  }

  private navigator = new Subject<InnerNavigatorDto>();
  /** 子页面的路由导航(兼容权限获取) */
  get navigatorMenu$() {
    return this.navigator.asObservable();
  }
  navigatorTrigger(data: InnerNavigatorDto | string) {
    if (typeof data === 'string') {
      this.navigator.next({ menuName: data });
    } else {
      this.navigator.next(data);
    }
  }

  get appconfig() {
    return this.appConfigSer.appConfig;
  }

  get projectConfig() {
    return this.appConfigSer.projectConfig;
  }

  // currentOpenMenuList: RhReuseMenuDto[];
  // 当前打开的界面列表
  private openMenuListSubject = new Subject<RhReuseMenuDto[]>();
  get openMenuList$() {
    return this.openMenuListSubject.asObservable();
  }
  openMenusTrigger() {
    this.openMenuListSubject.next([]);
  }

  constructor(private appSer: AppService, private apiUrls: RhApiUrlsService, private appConfigSer: RhAppConfigService) {}

  getNormalMenuDatas() {
    const rootMenu = this.menuList.find((ele) => ele.Name === this.projectConfig.RootMenu);
    if (!rootMenu) {
      MsgHelper.ShowWarningModal(`菜单获取失败！请退出重新登录或检查根节点菜单配置是否正确:期望值:${this.projectConfig.RootMenu}`);
      return [];
    }
    return this.getChildMenuDatas(rootMenu);
  }

  getMainMenuDatas() {
    const rootMenu = this.menuList.find((ele) => ele.Name === this.projectConfig.RootMenu);
    if (!rootMenu) {
      MsgHelper.ShowWarningModal(`菜单获取失败！请退出重新登录检查根节点菜单配置是否正确:期望值:${this.projectConfig.RootMenu}`);
      return [];
    }
    const mainMenuDatas = this.menuList.filter((ele) => ele.ParentId === rootMenu.IdKey).sort((a, b) => b.SortOrder - a.SortOrder);
    return mainMenuDatas;
  }

  getChildMenuDatas(item: RhMenusDto): RhMenuNodeDto[] {
    const menuNodeDatas = RhTreeHelper.initMenuTreeNodes(item, this.menuList, this.appConfigSer.projectConfig.DefaultIcon);
    return menuNodeDatas;
  }

  openTargetUrl(url: string) {
    RhRouteHelper.navigateToUrl(url);
  }

  //#region 后端接口区域

  // /**
  //  *  获取用户组用户分配的菜单功能列表
  //  */
  // LoadUserGroupMenuFeatures(userMenu: RhLoginedUserMenu): Observable<DataResultT<RhMenuFeaturesDto[]>> {
  //   return this.apiUrls.PostPp('YGAacApi', 'LoadUserGroupMenuFeatures', userMenu);
  // }

  /**
   *  检测用户账号与密码
   */
  CheckUserPassword(dto: RhUpdatePasswordDto): Observable<OpResult> {
    return this.apiUrls.PostPp('YGAacApi', 'CheckUserPassword', dto);
  }

  /**
   *  修改用户密码
   */
  UpdatePassword(dto: RhUpdatePasswordDto): Observable<OpResult> {
    return this.apiUrls.PostPp('YGAacApi', 'UpdatePassword', dto);
  }

  LoadUserMenus(dto: RhLoginedUserDto): Observable<DataResultT<RhMenusDto[]>> {
    return this.apiUrls.PostPp('YGAacApi', 'LoadUserMenus', dto);
  }

  /**
   *  获取全局系统配置参数
   */
  GetSysConfigParameterDatas(): Observable<DataResultT<RhParaSettingEntryDto[]>> {
    return this.apiUrls.GetRdp('SysConfigApi', 'GetSysConfigParameterDatas');
  }

  /**
   *  获取工厂配置信息
   */
  GetFactoryInfoDatas(queryDto: FactorynfoQueryDto): Observable<DataResultT<FactoryInfoDto[]>> {
    return this.apiUrls.PostMdp('FactoryLayoutWebApi', 'GetFactoryInfoDatas', queryDto);
  }

  //#endregion 后端接口区域结束
}
