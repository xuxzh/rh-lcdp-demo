import { LayoutModule } from './../../layout/layout.module';
import { NgModule } from '@angular/core';
import { RhMainWebComponent } from './main-web/main-web.component';
import { RhMainRoutingModule } from './main-routing.module';
import { RhSharedModule } from 'rh-base/shared';
import { DefaultPageComponent } from './default-page/default-page.component';
import { NzResultModule } from 'ng-zorro-antd/result';
import { RhNotFoundPageComponent } from './error-page/not-found-page/not-found-page.component';

const COMPONENTS = [RhMainWebComponent, DefaultPageComponent, RhNotFoundPageComponent];
@NgModule({
  imports: [RhSharedModule, LayoutModule, NzResultModule, RhMainRoutingModule],
  declarations: [...COMPONENTS],
  exports: [...COMPONENTS]
})
export class RhMainModule {}
