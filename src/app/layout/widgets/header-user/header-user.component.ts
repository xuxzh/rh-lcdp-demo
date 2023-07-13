import {
  FactoryInfoDto,
  RhProjectConfigDto,
  EmployeeInfoQueryDto,
  FullEmployeeInfoDto,
  RhLoginedUserDto,
  UserAccountInfo,
  UserAccountQueryDto
} from 'rh-base/model';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { AppService } from 'src/app/app.service';
import { MsgHelper, RhStorageService, RhRouteReuseStrategy } from 'rh-base/core';
import { pick } from 'lodash';

@Component({
  selector: 'app-header-user',
  templateUrl: './header-user.component.html',
  styleUrls: ['./header-user.component.less']
})
export class HeaderUserComponent implements OnInit {
  user!: RhLoginedUserDto;
  // 当前登录人
  @Output() rhUserChange = new EventEmitter<RhLoginedUserDto>();
  //当前登录人的工厂信息
  @Input() rhCurrentUserFactory!: FactoryInfoDto;

  // *************** 密码 ********************
  isShowPasswd = false;
  // updatePasswordDto: RhUpdatePasswordDto;
  // updatePasswordForm: FormGroup;

  //*************** 个人资料 ********************
  isShowUserInformationModal = false;

  get projectConfig(): RhProjectConfigDto {
    return this.operator.projectConfig;
  }

  constructor(
    public router: Router,
    public sotrage: RhStorageService,
    private operator: AppService,
    public storage: RhStorageService,
    private appSer: AppService
  ) {}

  async ngOnInit() {
    this.user = this.operator.getUser();
    this.rhUserChange.emit(this.user);
    const userInfo = await this.getUserInfo();
    const employeeInfo = await this.getEmployeeInfo();
    this.updateUserSession(userInfo, employeeInfo);
  }

  logout() {
    // 清空localStorage和路由列表
    this.appSer.logout().then((status) => {
      if (status.success) {
        this.sotrage.cleanLoggedInStorage();
        this.router.navigate([this.projectConfig.LoginPath]).then((flag) => {
          if (flag) {
            RhRouteReuseStrategy.resetHandlers();
          }
        });
      } else {
        MsgHelper.ShowWarningModal(`注销登录失败!${status.msg}`);
      }
    });
    // this.sotrage.cleanLoggedInStorage();
    // this.router.navigate([this.projectConfig.LoginPath]).then((flag) => {
    //   if (flag) {
    //     RhRouteReuseStrategy.resetHandlers();
    //   }
    // });
  }

  openPasswdModal() {
    this.isShowPasswd = true;
  }

  closePassedModal() {
    this.isShowPasswd = false;
  }

  openUserInformationModal() {
    this.isShowUserInformationModal = true;
  }

  closeUserInformationModal() {
    this.isShowUserInformationModal = false;
  }

  onClickRefreshButton() {
    MsgHelper.ShowConfirmModal(
      '选择刷新方式',
      '请选择刷新方式，强制刷新同时会清除缓存!',
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

  refreshPage() {
    // window.document.location.reload(false);
    document.execCommand('Refresh');
  }

  forceRefresh() {
    // window.location = window.location.href+'?eraseCache=true';
  }
  //#region 获取并将个人资料写入localstorage区域
  // 员工信息
  getEmployeeInfo(): Promise<FullEmployeeInfoDto | null> {
    const queryDto = EmployeeInfoQueryDto.create();
    // 使用精确查询
    queryDto.EmployeeCode = `$${this.user.UserName}`;
    queryDto.FactoryCode = this.user.FactoryCode;
    return new Promise((resolve) => {
      this.operator.GetEmployeeInfoDatas(queryDto).subscribe(
        (result) => {
          if (result && result.Success) {
            // if (result.Attach.length === 1)
            resolve(result.Attach[0]);
          } else {
            resolve(null);
          }
        },
        () => resolve(null)
      );
    });
  }

  //用户信息
  getUserInfo(): Promise<UserAccountInfo | null> {
    const queryDto = UserAccountQueryDto.create();
    // 使用精确查询
    queryDto.UserName = `$${this.user.UserName}`;
    queryDto.FactoryCode = this.user.FactoryCode;
    queryDto.IsActive = true;
    queryDto.SkipCount = 0;
    return new Promise((resolve) => {
      this.operator.GetUserAccounts(queryDto).subscribe(
        (result) => {
          if (result && result.Success) {
            resolve(result.Attach[0]);
          } else {
            resolve(null);
          }
        },
        () => resolve(null)
      );
    });
  }

  private updateUserSession(userinfo: UserAccountInfo | null, employeeInfo: FullEmployeeInfoDto | null) {
    const userSession = this.appSer.getUserSession();
    let preUserInfo = userSession?.User;
    if (!preUserInfo) {
      return;
    }
    if (userinfo) {
      preUserInfo = { ...preUserInfo, ...pick(userinfo, ['EmailAddress']) };
    }
    if (employeeInfo) {
      preUserInfo = {
        ...preUserInfo,
        ...pick(employeeInfo, [
          'EmployeeCode',
          'EmployeeName',
          'ClassTypeCode',
          'ClassTypeName',
          'OrganizationStructureCode',
          'OrganizationStructureName',
          'OrganizationStructureExternalCode',
          'FullOrganizationStructureName',
          'PostCode',
          'PostName',
          'Gender',
          'EmployeeType'
        ])
      };
    }
    if (userSession) {
      userSession.User = preUserInfo;
      this.storage.storeUserSession(userSession);
    }
  }
  //#endregion 获取并将个人资料写入localstorage区域结束
}
