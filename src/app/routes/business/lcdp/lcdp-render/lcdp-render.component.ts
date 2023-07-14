import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { error, MsgHelper, RhApiUrlsService } from 'rh-base/core';
import { RhStorageService } from 'rh-lcdp/core';
import { DataResultT, RhMenuFeaturesDto, RhMenuFeaturesQueryDto, RhSafeAny, RhComponentSchemaDto } from 'rh-lcdp/model';
import { Observable, firstValueFrom } from 'rxjs';
import { AppService } from 'src/app/app.service';

type RhInstanceAuthorityRegistration = RhSafeAny;

@Component({
  selector: 'app-lcdp-render',
  templateUrl: './lcdp-render.component.html',
  styleUrls: ['./lcdp-render.component.less']
})
export class LcdpRenderComponent implements OnInit {
  pageConfigDto!: RhComponentSchemaDto;
  pageLoading = false;

  instanceAuthorities: RhInstanceAuthorityRegistration[] = [];

  constructor(private route: ActivatedRoute, private storageSer: RhStorageService, private appSer: AppService) {
    //
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((param) => {
      this.init(param.get('id') as string);
    });
  }

  async init(pageKey: string) {
    MsgHelper.ShowGlobalLoadingMessage(`正在加载页面数据，请稍后。。。`, 0);
    this.pageLoading = true;
    this.appSer
      .fetchPageJson(pageKey)
      .then((data) => {
        const pageConfigDto = data;
        if (pageConfigDto) {
          this.pageConfigDto = pageConfigDto;
        }
      })
      .catch((err) => {
        MsgHelper.ShowWarningMessage(`加载页面数据发生错误：${err}`);
      })
      .finally(() => {
        MsgHelper.CloseGlobalLoadingMessage();
        this.pageLoading = false;
      });
  }

  // /**
  //  *  获取菜单功能数据信息
  //  */
  // GetMenuFeaturesDatas(queryDto: RhMenuFeaturesQueryDto): Observable<DataResultT<RhMenuFeaturesDto[]>> {
  //   return this.apiUrls.PostPp('YGAacApi', 'GetMenuFeaturesDatas', queryDto);
  // }
}
