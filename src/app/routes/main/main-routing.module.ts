import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RhMainWebComponent } from './main-web/main-web.component';
import { DefaultPageComponent } from './default-page/default-page.component';
import { RhNotFoundPageComponent } from './error-page/not-found-page/not-found-page.component';

const routes: Routes = [
  {
    path: '',
    component: RhMainWebComponent,
    children: [
      {
        // lcdp
        path: 'lcdp',
        loadChildren: () =>
          import('../business/lcdp/lcdp.module').then((mod) => mod.LcdpModule),
      },
      {
        path: 'DefaultPage',
        component: DefaultPageComponent,
      },
      {
        path: '',
        redirectTo: 'DefaultPage',
        pathMatch: 'full',
      },
      // 设置PageNotFound页面
      {
        path: '**',
        component: RhNotFoundPageComponent,
        data: {
          title: '页面未找到',
        },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RhMainRoutingModule {}
