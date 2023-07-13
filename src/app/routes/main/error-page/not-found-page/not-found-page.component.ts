import { RhRouteHelper } from 'rh-base/core';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RhReuseMenuDto } from 'rh-base/model';
import { RhMainService } from '../../main.service';

@Component({
  selector: 'rh-not-found-page',
  templateUrl: './not-found-page.component.html',
  styleUrls: ['./not-found-page.component.less']
})
export class RhNotFoundPageComponent implements OnInit {
  // 当前打开的菜单list
  currentOpenMenuList: RhReuseMenuDto[] = [];

  constructor(private router: Router, private operator: RhMainService) {
    //
  }

  ngOnInit() {
    //
  }

  // 返回主界面
  gotoHomePage(): void {
    RhRouteHelper.clearAuthorityData();
    this.router.navigateByUrl('main/DefaultPage');
    // 关闭404页面
    this.operator.openMenusTrigger();
  }
}
