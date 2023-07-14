import { NgModule } from '@angular/core';

import { LcdpRoutingModule } from './lcdp-routing.module';
import { LcdpRenderComponent } from './lcdp-render/lcdp-render.component';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { RhLcdpDesignerModule } from 'rh-lcdp/designer';

@NgModule({
  imports: [RhLcdpDesignerModule, LcdpRoutingModule, NzSpinModule],
  declarations: [LcdpRenderComponent]
})
export class LcdpModule {}
