import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LcdpRenderComponent } from './lcdp-render/lcdp-render.component';

const routes: Routes = [
  {
    path: ':id',
    component: LcdpRenderComponent,
    data: { store: true }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LcdpRoutingModule {}
