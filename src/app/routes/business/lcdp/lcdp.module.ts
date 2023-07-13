import { NgModule } from '@angular/core';

import { LcdpRoutingModule } from './lcdp-routing.module';
import { LcdpRenderComponent } from './lcdp-render/lcdp-render.component';
import { RhLcdpRendererModule } from 'rh-lcdp/renderer';
import { RhLcdpDesignerModule } from 'rh-lcdp/designer';

@NgModule({
  imports: [RhLcdpDesignerModule, LcdpRoutingModule],
  declarations: [LcdpRenderComponent]
})
export class LcdpModule {}
