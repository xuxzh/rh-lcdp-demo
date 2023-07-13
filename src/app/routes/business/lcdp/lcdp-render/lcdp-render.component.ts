import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RhApiUrlsService } from 'rh-base/core';
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
    // const data = this.storageSer.getAuthorityData();
    // if (data?.menuDto.IsUseFeaturePermission) {
    //   const result = await firstValueFrom(
    //     this.GetMenuFeaturesDatas({
    //       MenuName: data.menuDto.name,
    //       FeatureName: '',
    //       MaxResultCount: 10,
    //       SkipCount: 0,
    //       Mode: 8
    //     })
    //   );
    //   if (!result.Success) throw result.Message;
    //   const items = result.Attach;
    //   const visibleItems = new Set(data.menuFeatureAuthorityDatas);
    //   this.instanceAuthorities = items
    //     .filter((item) => !visibleItems.has(item.FeatureName))
    //     .map((item) => {
    //       return {
    //         instanceKey: item.FeatureName,
    //         authority: {
    //           visible: false
    //         }
    //       };
    //     });
    //   //console.log(this.instanceAuthorities);
    // }
    const pageConfigDto = await this.appSer.fetchPageJson(pageKey);
    if (pageConfigDto) {
      this.pageConfigDto = pageConfigDto;
    }
  }

  // /**
  //  *  获取菜单功能数据信息
  //  */
  // GetMenuFeaturesDatas(queryDto: RhMenuFeaturesQueryDto): Observable<DataResultT<RhMenuFeaturesDto[]>> {
  //   return this.apiUrls.PostPp('YGAacApi', 'GetMenuFeaturesDatas', queryDto);
  // }
}
