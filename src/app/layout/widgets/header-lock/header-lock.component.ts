import { RhAppConfigService, RhStorageService, RhRouteReuseStrategy } from 'rh-base/core';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppService } from 'src/app/app.service';

@Component({
  selector: 'rh-header-lock',
  templateUrl: './header-lock.component.html',
  styleUrls: ['./header-lock.component.less']
})
export class HeaderLockComponent implements OnInit {
  constructor(private appconfigSer: RhAppConfigService, private appSer: AppService, private router: Router) {
    //
  }

  ngOnInit(): void {
    //
  }

  lock() {
    //一键锁屏前设置的无操作时长
    const TriggerLockScreentime = this.appconfigSer.projectConfig.TriggerLockScreenTime;
    window.localStorage.setItem('TriggerLockScreentime', TriggerLockScreentime.toString());
    //一键锁屏
    // 当前用户
    this.appconfigSer.projectConfig.TriggerLockScreenTime = 0;
    const usersession = this.appSer.getUserSession();
    if (usersession?.User) {
      usersession.User.locked = true;
    }
    window.localStorage.setItem('userSession', JSON.stringify(usersession));

    setTimeout(() => {
      this.router.navigate(['/passport/lock']).then(() => {
        //清空路由复用数据
        RhRouteReuseStrategy.resetHandlers();
      });
    }, 200);
  }
}
