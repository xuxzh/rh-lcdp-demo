import {
  RhAppConfigDto,
  RhLoginedUserDto,
  RhMenusDto,
  RhMenuNodeDto,
  RhReuseMenuDto,
  InnerNavigatorDto,
  MenuNodeType,
  RhSafeAny,
  FactorynfoQueryDto,
  FactoryInfoDto,
  WithNil
} from 'rh-base/model';
import {
  RhNavigatorService,
  getFullRouteUrl,
  RhAppConfigService,
  RhStorageService,
  MsgHelper,
  RhTreeHelper,
  ArrayHelper,
  FunctionHelper,
  RhRouteReuseStrategy
} from 'rh-base/core';
import { RhThemeService, RhDeveloperDebugComponent } from 'rh-base/shared';
import { Component, OnInit, NgZone, HostListener, OnDestroy, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd, NavigationStart, NavigationCancel, NavigationError } from '@angular/router';
import { filter, map, mergeMap } from 'rxjs/operators';

import { RhMainService } from '../main.service';
import { AppService } from 'src/app/app.service';
import { NzContextMenuService, NzDropdownMenuComponent } from 'ng-zorro-antd/dropdown';
import { MenuRoutePrefix, MenuRouteUrl } from 'src/app/model';
import { Subscription } from 'rxjs';

const DEFAULT_CLICK_COUNT = 8;
@Component({
  selector: 'app-main-web',
  templateUrl: './main-web.component.html',
  styleUrls: ['./main-web.component.less']
})
export class RhMainWebComponent implements OnInit, OnDestroy {
  @ViewChild(RhDeveloperDebugComponent, { static: false }) debugComp!: RhDeveloperDebugComponent;

  appconfig!: RhAppConfigDto;
  /** 子页面的加载效果 */
  componentSpinning = false;
  // /** 标题按需修改 */
  // title: string;

  // /** 用于移除菜单项选中的样式。
  //  * @description
  //  * 因为官方库`nzSelected`属性有些问题(点击菜单项，数据源的selected的值没有改变),而且`nzSelected`不支持双向绑定
  //  */
  // @ViewChildren(RhMenuItemDirective) menuItemList: QueryList<RhMenuItemDirective>;

  /** 设置导航tabset浮动样式 */
  reuseTabNavCollapsClass!: Record<string, string>;

  isCollapsed = false;

  /** 平台logo图片路径 */
  imageSrc!: string;

  // userSession: UserSessionDto = null;

  userDto: RhLoginedUserDto;

  // 路由列表
  routeList: Array<RhReuseMenuDto> = [];
  // homePageMenu: ReuseMenuDto;

  /** 头部主菜单列表 */
  mainMenuDataset: RhMenusDto[] = [];
  /** 侧边栏菜单 */
  childMenuDataset: RhMenuNodeDto[] = [];
  /** 主子菜单模式下的选中的主菜单 */
  selectMainMenu: RhMenusDto | null = null;

  menuMode: MenuNodeType = 'Normal';

  // menuMapped: Record<string, string> = SystemConstant.MENU_MAPPED;

  isDebug = this.storage.getDebug();

  menuMapped!: Record<string, string>;

  theme = this.appSer.projectConfig.DefaultTheme;

  menuLoading = false;

  count = DEFAULT_CLICK_COUNT;

  // 当前登录
  //当前登录人
  currentUser!: RhLoginedUserDto;
  //当前登录人的工厂信息
  currentUserFactory!: FactoryInfoDto;

  // 锁屏
  timer: RhSafeAny;
  time = this.appConfigSer.projectConfig.TriggerLockScreenTime;

  @HostListener('click', ['$event'])
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  OnClick($event: Event) {
    // 当前支持三分钟未操作即锁屏
    if (this.appConfigSer.projectConfig.IsLockScreen) {
      // 重新倒计时
      // 获取配置的触发锁屏时长
      this.time = this.appConfigSer.projectConfig.TriggerLockScreenTime;
      //执行三分钟倒计时，若倒计时结束则页面跳转到锁屏界面
      this.triggerLockTimer();
    } else {
      //
    }
  }

  /** 是否已新增postmeaage监听事件 */
  isAddMessageEventListener = false;

  get projectConfig() {
    return this.appSer.projectConfig;
  }

  /** 当前菜单 */
  currentMenu!: RhMenuNodeDto;

  enableRefreshMenuDatas = true;

  routerEventSub: Subscription | null = null;
  menuOpenSub!: Subscription;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private storage: RhStorageService,
    public appConfigSer: RhAppConfigService,
    private ngZone: NgZone,
    private operator: RhMainService,
    private themeSer: RhThemeService,
    public appSer: AppService,
    private nzContextMenuService: NzContextMenuService,
    private navigator: RhNavigatorService
  ) {
    this.routeList = this.initRouteList();
    // this.setPageTitle();
    this.userDto = this.appSer.getUser();
    if (this.routerEventSub) {
      this.routerEventSub.unsubscribe();
    }
    // 路由事件 每次地址发生变化时触发
    this.routerEventSub = this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        map(() => this.activatedRoute),
        map((route) => {
          while (route.firstChild) {
            route = route.firstChild;
          }
          return route;
        }),
        filter((route) => route.outlet === 'primary'),
        mergeMap((route) => route.data)
      )
      .subscribe(async (event) => {
        // 路由data的标题
        // console.log('路由复用列表', this.menuList);
        let url = this.router.routerState.snapshot.url;
        // 去除路由地址的一些查询参数，形如xxx?target=sdsdfsdaf;
        url = FunctionHelper.removeRouteQueryPara(url);
        // 根据url获取左侧菜单，然后根据获取的菜单拉取对应的权限数据
        let title = '';
        let menuDto: RhMenuNodeDto = this.currentMenu;
        // 刷新页面时，数据重新拉取
        // let menuDto: RhMenuNodeDto;
        // const authorityData = this.storage.getAuthorityData();
        // if (authorityData && authorityData.menuUrl?.replace(/\//g, '') === url?.replace(/\//g, '')) {
        //   menuDto = authorityData?.menuDto;
        // } else {
        //   menuDto = null;
        //   this.storage.removeAuthorityData();
        // }
        await this.getMainMenuDatas();
        // 目前iframe方式，会将`title`和`route`数据都作为查询参数拼接到地址栏
        // if (this.router.routerState?.snapshot?.root?.queryParams?.route?.startsWith(MenuRoutePrefix.IframeLink)) {
        //   //
        //   menuDto = this.router.routerState?.snapshot?.root?.queryParams as RhMenuNodeDto;
        // } else {
        //   menuDto = await this.getTargetMenuNodeDto(url);
        // }
        menuDto = (await this.getTargetMenuNodeDto(url)) as RhMenuNodeDto;
        if (menuDto) {
          menuDto.selected = true;
        }
        const backupTitle = event['title'];
        // 为了兼容从子页面直接导航到其他子页面的情况
        if (backupTitle) {
          // 优先使用路由指定的title;
          title = backupTitle;
        } else if (menuDto) {
          title = menuDto ? (menuDto.title ? menuDto.title : backupTitle) : '主页';
        }
        // else {
        //   title = this.currentMenu ? this.currentMenu.title : '主页';
        // }
        this.routeList.forEach((p) => (p.isSelect = false));
        const menu: RhReuseMenuDto = { title, module: url, store: event['store'], isSelect: true, menuDto: menuDto ? menuDto : null };
        // this.titleService.setTitle(title);
        const exitMenu = this.routeList.find((info) => info.module === url);
        if (exitMenu) {
          // 如果存在不添加，当前表示选中
          this.routeList.forEach((p) => (p.isSelect = p.module === url));
          return;
        }
        const list: RhReuseMenuDto[] = [];
        Object.assign(list, this.routeList);
        list.push(menu);
        this.routeList = list;
      });
    // 设置组件的loading状态
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.componentSpinning = true;
      } else if (event instanceof NavigationEnd || event instanceof NavigationCancel || event instanceof NavigationError) {
        this.componentSpinning = false;
      }
    });
  }

  async ngOnInit() {
    this.subscribeDebugStatus();
    this.subscribeOpenMenu();
    this.subscribeOpenMenuList();
    this.imageSrc = `./assets/images/applogo.png`;
    this.menuMode = this.appSer.projectConfig.MenuMode;
    // 订阅激发标签的关闭操作
    // this.subscribeCloseTab();
    // await this.getWmsMainMenuDatas();
    // this.locateTargetMenu();
    // 更改页面主题
    this.themeSer.change.subscribe((theme) => {
      setTimeout(() => {
        this.theme = theme === 'compact' ? 'dark' : this.theme;
      });
    });

    // 当前支持三分钟未操作即锁屏
    if (this.appConfigSer.projectConfig.IsLockScreen && this.appConfigSer.projectConfig.TriggerLockScreenTime !== -1) {
      this.triggerLockTimer();
    } else {
      //
    }
    window.document.addEventListener('visibilitychange', this.handler);
  }

  handler = () => {
    // 也可以通过document.hidden属性（布尔类型）来判断
    // window.document.hidden (True/False)
    // document.visibilityState拥有两种字符串枚举值（'visible' 和 'hidden'）
    if (window.document.visibilityState === 'visible') {
      // 当页签处于可见状态，TODO
      const userDto = this.appSer.getUser();
      // console.log('this.userDto', this.userDto);
      // console.log('userDto', userDto);
      if (userDto.UserId !== this.userDto.UserId) {
        MsgHelper.ShowConfirmModal(
          '提示',
          '检测到当前登录人发生变更，请刷新页面！',
          () => {
            window.location.reload();
          },
          () => {
            window.location.reload();
          },
          'primary',
          '刷新',
          '强制刷新'
        );
      }
    } else {
      // 当页签处于不可见状态（hidden），TODO
    }
  };

  getUserChange(data: RhLoginedUserDto) {
    this.currentUser = data;
    const queryDto = FactorynfoQueryDto.create();
    queryDto.FactoryCode = this.currentUser.FactoryCode;
    this.operator.GetFactoryInfoDatas(queryDto).subscribe((result) => {
      if (result && result.Success) {
        this.currentUserFactory = result.Attach[0];
        // console.log(this.currentUserFactory);
      }
    });
  }

  ngOnDestroy() {
    clearTimeout(this.timer);
    window.document.removeEventListener('visibilitychange', this.handler);
    this.routerEventSub?.unsubscribe();
    this.menuOpenSub?.unsubscribe();
  }

  // 锁屏定时器
  triggerLockTimer() {
    if (this.timer) {
      clearTimeout(this.timer);
    }

    // 当前路由
    let currentRouter = window.location.href;
    // const fullrouter = currentRouter.split('/');
    // if (fullrouter.indexOf(':') === -1) {
    //   fullrouter.splice(0, 3);
    // }
    // // if (fullrouter.length > 2) {
    // //   fullrouter.splice(0, 1);
    // // }
    // currentRouter = '/' + fullrouter.join('/');
    const mainPath = this.appSer.projectConfig.MainPath;
    currentRouter = '/' + mainPath + currentRouter.split(mainPath)[1];
    if (currentRouter) {
      window.localStorage.setItem('currentRoute', currentRouter);
    }
    // 当前用户
    const currentUser = this.appSer.getUserSession()?.User?.UserName;
    if (currentUser) {
      window.localStorage.setItem('currentUser', currentUser);
    }
    if (this.appConfigSer.projectConfig.TriggerLockScreenTime !== -1) {
      this.timer = setTimeout(() => {
        // 三分钟倒计时结束跳转到锁屏界面
        const userSession = this.appSer.getUserSession();
        if (userSession?.User) {
          userSession.User.locked = true;
        }
        window.localStorage.setItem('userSession', JSON.stringify(userSession));
        // setTimeout(() => {
        //   this.router.navigate(['/passport/lock']);
        // }, 200);
        this.router.navigate(['/passport/lock']).then(() => {
          // 清空复用路由数据
          RhRouteReuseStrategy.resetHandlers();
        });
        // this.storage.cleanLoggedInStorage();
      }, this.time * 1000);
    }
  }

  closeUrl(module: WithNil<string>, isSelect: WithNil<boolean>) {
    if (!module) {
      return;
    }
    // 主页面不能关闭
    // if (module === '/ygProductManage') {
    //   return;
    // }
    // 当前关闭的是第几个路由
    const index = this.routeList.findIndex((p) => p.module === module);
    // 如果只有一个不可以关闭
    // if (this.menuList.length === 1) { return; }

    this.routeList = this.routeList.filter((p) => p.module !== module);
    // 删除复用
    // delete AppReuseStrategy.handlers[module];
    RhRouteReuseStrategy.deleteRouteSnapshot(module);
    // 如果本来就存在激活的菜单(使用与右键关闭其他菜单操作),直接返回
    if (this.routeList.some((ele) => ele.isSelect)) {
      return;
    }
    // this.reusetabService.closeAllByRegex(url);
    if (this.routeList.length > 0) {
      const location = this.routeList.findIndex((item) => item.module === module);
      if (location !== -1) {
        this.routeList.splice(location, 1);
      }
      if (!isSelect) {
        return;
      }
      //  显示上一个选中
      let menu = this.routeList[index + 1];
      if (!menu) {
        // 如果上一个没有下一个选中
        menu = this.routeList[index - 1];
      }
      if (menu !== undefined) {
        this.routeList.forEach((p) => (p.isSelect = p.module === menu.module));
        let queryParams = {};
        if (menu.menuDto?.route?.startsWith(MenuRoutePrefix.IframeLink)) {
          // queryParams = menu.menuDto.title
          queryParams = menu.menuDto;
        }
        // 显示当前路由信息
        this.router.navigate([menu.module], { queryParams: queryParams }).then(() => {
          // // 存储权限信息
          // this.storeAuthorityData(menu);
          this.locateTargetMenu();
        });
      }
    } else {
      // 当菜单都关闭，默认打开主页面
      this.router.navigate([`${this.appSer.projectConfig.MainPath}${this.appSer.projectConfig.MainPagePath}`]);
    }
  }

  /** 关闭当前tab页 */
  closeCurrentTab(node: RhReuseMenuDto) {
    //
    node.isSelect = true;
    this.closeUrl(node.module as string, node.isSelect);
  }
  /** 关闭其他tab页 */
  closeOtherTabs(node: RhReuseMenuDto) {
    //
    const tempDataset = this.initRouteList();
    this.routeList = [...tempDataset, node];
    this.onClickTab(null, node);
    // 由于路由复用数据是在跳转到其他网址时触发，所以此时只需要在跳转页面后，清除所有路由数据即可
    RhRouteReuseStrategy.resetHandlers();
  }
  /** 关闭所有tab页 */
  closeAllTabs() {
    //
    this.routeList = this.initRouteList();
    this.onClickTab(null, this.routeList[0]);
    RhRouteReuseStrategy.resetHandlers();
  }

  onClickTab($event: Event | null, item: RhReuseMenuDto) {
    if ($event) {
      $event.preventDefault();
    }

    let queryParams = null;
    let navigateUrl = '';
    // 重复点击同一个tab页，直接返回
    const url = this.router.routerState.snapshot.url;

    if (url === item.module) {
      return;
    }
    if (item?.menuDto?.route?.startsWith(MenuRoutePrefix.IframeLink)) {
      queryParams = item?.menuDto;
      navigateUrl = `${item.module}?title=${queryParams.title}&route=${queryParams.route}`;
    } else {
      navigateUrl = item.module as string;
    }
    // 导航到路由
    this.router.navigateByUrl(navigateUrl).then(() => {
      // this.storeAuthorityData(item);
      this.locateTargetMenu(item.module as string);
    });
  }

  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
    // this.setReuseTabNavClass();
  }

  onSelectMainMenu(item: RhMenusDto) {
    this.mainMenuDataset.forEach((ele) => {
      ele.select = item === ele;
    });
    // 拉取子菜单
    this.getChildMenuDatas(item);
  }

  /**
   * 点击侧边栏菜单，导航到对应的页面
   * @param item 需要导航到的菜单节点对象
   * @param data 查询参数
   */
  async navigateToUrl(item: RhMenuNodeDto, data?: Record<string, RhSafeAny>) {
    this.currentMenu = item;
    // 选择菜单时也要折叠其他的同级菜单
    this.closeOtherMenu(item, this.childMenuDataset);
    // 导航到外链网址
    // 外链地址需要在菜单管理中配置，形如：`$out:http://${host}:${port}/rh-web-report/#/`或者`https://www.baidu.com/`
    if (item?.route?.startsWith(MenuRoutePrefix.OutLink)) {
      const sliceStr = item.route.slice(5);
      const patt = /\${\w*}/g;

      const hostName = window.location.hostname;
      const hostPort = window.location.port;
      const result = sliceStr.replace(patt, (str) => {
        if (str === '${host}') {
          return hostName;
        }
        if (str === '${port}') {
          return hostPort;
        }
        return str;
      });

      // 配合`rh-advanced-designer`项目`index.html`中的脚本使用
      (window as RhSafeAny).popupWin = window.open(result);
      if (!this.isAddMessageEventListener) {
        // 跨窗口通信
        window.addEventListener('message', (message) => {
          if (message?.data?.status) {
            (window as RhSafeAny).popupWin?.postMessage(this.appSer.getUserSession(), '*');
          }
        });
        this.isAddMessageEventListener = true;
      }
      return;
    }

    if (item?.route?.startsWith(MenuRoutePrefix.IframeLink)) {
      this.iframeGoToRouter(item);
      return;
    }

    // 跳转到lcdp专用路由
    if (item?.route?.startsWith(MenuRoutePrefix.LcdpLink)) {
      const id = item.route.slice(6);
      const url = `${MenuRouteUrl.LcdpUrl}/${id}`;
      this.router.navigate([url]);
      return;
    }
    this.navigateTargetUrl(item, data);
  }

  /**
   * iframe页面跳转
   * @param item
   * @param data
   */
  iframeGoToRouter(item: RhMenuNodeDto) {
    const routerUrl = `/main/iframe/${item.id}`;
    this.navigatorHandler(routerUrl, { title: item.title, route: item.route }).then(() => {
      // 存储menuKey到路由数据上
      const target = this.routeList.find((ele) => ele.module === routerUrl);
      if (target) {
        target.menuDto = item;
      }
    });
  }

  tabContextMenu($event: MouseEvent, menu: NzDropdownMenuComponent) {
    this.nzContextMenuService.create($event, menu);
  }

  /** 定位点击的tab页或者页面刷新之后所对应的菜单(根据路由路径查找) */
  private async locateTargetMenu(url?: string) {
    this.removeMenuItemClass();
    if (!this.childMenuDataset?.length) {
      return;
    }
    RhTreeHelper.clearStatus(this.childMenuDataset);
    this.childMenuDataset = [...this.childMenuDataset];
    url = url || this.router.routerState.snapshot.url;
    const menuDto = await this.getTargetMenuNodeDto(url);
    if (menuDto) {
      menuDto.selected = true;
      this.childMenuDataset = [...this.childMenuDataset];
    }
  }

  private findTargetRoute(source: RhMenuNodeDto[], url: string): RhMenuNodeDto {
    let target = source.find((ele) => ele.enable && ele.route === url);
    if (target) {
      target.open = true;
    } else {
      source.some((ele) => {
        if (ele.children && ele.children.length) {
          const innerTarget = this.findTargetRoute(ele.children as RhSafeAny[], url);
          if (innerTarget) {
            target = innerTarget;
            ele.open = true;
          }
        }
      });
    }
    return target as RhMenuNodeDto;
  }

  private navigateTargetUrl(item: RhMenuNodeDto, data?: Record<string, RhSafeAny>) {
    // 需要新的定位方法，根据新增的parent字段来判定。
    // nzSelected无法双向绑定,所以使用id来寻找
    // const url = '/main' + (this.getFullRouteAddr(item.id) || '/DefaultPage');'
    // 查看路由数据
    const targetNode = this.findTargetTreeNode({ menuName: item.name || '' }, this.childMenuDataset);
    if (!targetNode) {
      MsgHelper.ShowWarningModal('没有找到目标菜单，请检查账户是否有权限访问该菜单');
      return;
    }
    // 当页面iframe嵌套

    const url = getFullRouteUrl(item, this.projectConfig);
    this.navigatorHandler(url, data).then(() => {
      // 存储menuKey到路由数据上
      const target = this.routeList.find((ele) => ele.module === url);
      if (target) {
        target.menuDto = item;
      }
    });
  }

  private navigatorHandler(url: string, data?: Record<string, RhSafeAny>): Promise<boolean> {
    if (data) {
      return this.router.navigate([url], { queryParams: data });
    } else {
      return this.router.navigate([url]);
    }
  }

  submenuOpenChange(menu: RhMenuNodeDto) {
    // 设置同时只能打开一个主菜单 否则寻找路由会失效
    // console.log(menu);
    this.closeOtherMenu(menu, this.childMenuDataset);
  }

  triggerDebug() {
    if (this.count > 1) {
      this.count--;
    } else {
      if (this.debugComp) {
        this.debugComp.openModal();
      }
      this.count = DEFAULT_CLICK_COUNT;
    }
  }

  switchProdEnv() {
    window.open('http://192.168.0.121:6018/prod/passport/login');
  }

  /** 关闭对应菜单 */
  private closeOtherMenu(menu: RhMenuNodeDto, menuList: RhMenuNodeDto[]) {
    const level = menu.level;
    menuList.forEach((ele) => {
      if (ele.level === level) {
        ele.open = ele === menu;
      } else if (ele.children && ele.children.length) {
        this.closeOtherMenu(menu, ele.children as RhSafeAny[]); // 递归关闭子菜单
      }
    });
  }

  private findTargetTreeNode(data: InnerNavigatorDto, datasource: RhMenuNodeDto[]): RhMenuNodeDto {
    let target = datasource.find((ele) => ele.name === data.menuName);
    if (!target) {
      datasource.some((ele) => {
        if (ele.children && ele.children.length) {
          target = this.findTargetTreeNode(data, ele.children as RhSafeAny[]);
        }
        // 终止循环
        return target;
      });
    }
    return target as RhMenuNodeDto;
  }
  /** 拉取主菜单 */
  private async getMainMenuDatas() {
    if (!this.enableRefreshMenuDatas) {
      return;
    }
    // 获取wms系统参数配置
    // await this.getWmsSysConfig();
    // 每次刷新界面时需要重新拉取菜单；
    await this.refreshMenuDatas();
    this.enableRefreshMenuDatas = false;
    switch (this.menuMode) {
      case 'Normal': // 正常模式
        this.selectMainMenu = null;
        this.childMenuDataset = this.operator.getNormalMenuDatas();
        // console.log('menuTree', this.childMenuDataset);
        break;
      case 'MainChild':
        // 主子菜单模式
        this.mainMenuDataset = this.operator.getMainMenuDatas();
        if (this.mainMenuDataset.length) {
          this.selectMainMenu = this.mainMenuDataset[0];
          this.onSelectMainMenu(this.selectMainMenu);
        }
        break;
      default:
        this.selectMainMenu = null;
        this.childMenuDataset = this.operator.getNormalMenuDatas();
        // console.log('menuTree', this.childMenuDataset);
        throw new Error(`未定义的菜单模式:${this.menuMode}，已载入默认的Normal菜单模式`);
    }
    this.locateTargetMenu();
  }

  private refreshMenuDatas(): Promise<void> {
    const user = this.appSer.getUserSession()?.User;
    return new Promise((resolve, reject) => {
      this.menuLoading = true;
      this.operator.LoadUserMenus(user as RhLoginedUserDto).subscribe(
        (result) => {
          if (result?.Success) {
            // 注意：Usersession的操作已放在接口内进行，防止与个人资料同时存储localstorage发生冲突
            const userSession = this.appSer.getUserSession();
            if (userSession) {
              userSession.Menus = result.Attach;
              this.storage.storeUserSession(userSession);
            }
            resolve();
          } else {
            reject();
          }
          this.menuLoading = false;
        },
        () => {
          this.menuLoading = false;
          reject();
        }
      );
    });
  }

  private getChildMenuDatas(item: RhMenusDto) {
    this.selectMainMenu = item;
    this.childMenuDataset = this.operator.getChildMenuDatas(item);
    // console.log(this.wmsChildDataset);
  }

  private getTargetMenuNodeDto(url: string): Promise<RhMenuNodeDto | null> {
    return new Promise((resolve, reject) => {
      try {
        let datas = this.childMenuDataset;
        // 处理lcdp网址，找到对应的menuDto
        if (url.includes(MenuRouteUrl.LcdpUrl)) {
          const pageKey = url.split('/').pop();
          const lcdpUrl = `${MenuRoutePrefix.LcdpLink}${pageKey}`;
          const targetMenuDto = this.findTargetRoute(datas, lcdpUrl);
          resolve(targetMenuDto || null);
          return;
        }
        // 处理iframe网址，找到对应的menuDto
        if (url.includes(MenuRouteUrl.IframeUlr)) {
          // TODO:
          resolve(null);
          return;
        }
        const urlDatas = ArrayHelper.compact(url.split('/')); // ["main", "AAC", "MenuManage"]
        if (!urlDatas?.length || urlDatas[1] === 'DefaultPage' || !datas?.length) {
          resolve(null);
          return;
        }
        for (let index = 1; index < urlDatas.length && datas; index++) {
          const target = this.findTargetRoute(datas, urlDatas[index]);
          if (target && (!target.children || !target.children.length)) {
            resolve(target);
            return;
          }
          if (target && target.children && target.children.length) {
            datas = target.children as RhSafeAny[];
          } else {
            datas = [];
          }
        }
        resolve(null);
      } catch (error) {
        reject(error);
      }
    });
  }

  private removeMenuItemClass() {
    // if (this.menuItemList) {
    //   this.menuItemList.forEach((ele) => {
    //     this.renderer2.removeClass(ele.elementRef.nativeElement, 'ant-menu-item-selected');
    //   });
    // }
  }

  private initRouteList() {
    return [
      new RhReuseMenuDto(
        '主页',
        `${this.appSer.projectConfig.MainPath}${this.appSer.projectConfig.MainPagePath}`,
        false,
        true,
        new RhMenuNodeDto(-1, '主页', null, '', null, null, -1, null, false, true, false, false, true)
      )
    ];
  }

  /** 订阅子页面的菜单打开操作 */
  private subscribeOpenMenu() {
    this.menuOpenSub = this.navigator.navigatorMenu$.subscribe((data) => {
      // 首先定位YgMenuDto，然后调用导航方法；
      const target = this.findTargetTreeNode(data, this.childMenuDataset);
      if (!target) {
        MsgHelper.ShowWarningMessage(`无效的菜单键值或无权限访问该菜单:${data.menuName}`);
        return;
      }
      this.navigateToUrl(target, data.paras);
    });
  }

  private subscribeDebugStatus() {
    this.appSer.debugSubject$.subscribe((status) => {
      if (typeof status !== 'boolean') {
        return;
      }
      // 必须在`ngZone`里面跑，否则变更检测不出来。原因？？
      this.ngZone.run(() => {
        this.isDebug = this.appConfigSer.isDebug = status;
      });
    });
  }

  private subscribeOpenMenuList() {
    this.operator.openMenuList$.subscribe(() => {
      // 关闭404界面
      const index = this.routeList.findIndex((ele) => ele.title === '页面未找到');
      this.routeList.splice(index, 1);
    });
  }
}
