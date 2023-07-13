import { Component, OnInit } from '@angular/core';
import { RhSafeAny } from 'rh-base/model';
import { RhStorageService } from 'rh-base/core';
import { AppService } from 'src/app/app.service';

@Component({
  selector: 'app-user-information',
  templateUrl: './user-information.component.html',
  styleUrls: ['./user-information.component.less']
})
export class UserInformationComponent implements OnInit {
  // //当前登录人的工厂信息
  // @Input() rhCurrentUserFactory: FactoryInfoDto;
  // //当前登录人
  // @Input() rhCurrentUser: RhLoginedUserDto;

  // //当前登录人的员工信息
  // currentEmployee: FullEmployeeInfoDto;

  // //当前登录人的用户信息
  // currentUserAccount: UserAccountInfo;

  //获取当前登录人
  currentUser: RhSafeAny;

  // transPipe(value: string) {
  //   switch (value) {
  //     case 'OnTheJob':
  //       return '在职';
  //     case 'Departure':
  //       return '离职';
  //     case 'male':
  //       return '男';
  //     case 'female':
  //       return '女';
  //     default:
  //       return value;
  //   }
  // }

  constructor(private operator: AppService) {
    //
  }

  ngOnInit(): void {
    this.currentUser = this.operator.getUserSession()?.User as RhSafeAny;
  }
}
