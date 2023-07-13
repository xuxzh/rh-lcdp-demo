import { NgModule } from '@angular/core';
import { RhSharedModule } from 'rh-base/shared';
import { PackageVersionComponent } from './widgets/package-version/package-version.component';
import { ChangePasswdComponent } from './widgets/change-passwd/change-passwd.component';
import { HeaderTradeComponent } from './widgets/header-trade/header-trade.component';
import { HeaderUserComponent } from './widgets/header-user/header-user.component';
import { HeaderLockComponent } from './widgets/header-lock/header-lock.component';
import { UserInformationComponent } from './widgets/user-information/user-information.component';

const COMPONENTS = [
  PackageVersionComponent,
  ChangePasswdComponent,
  HeaderTradeComponent,
  HeaderUserComponent,
  HeaderLockComponent,
  UserInformationComponent
];

@NgModule({
  imports: [ RhSharedModule],
  declarations: [...COMPONENTS],
  providers: [],
  exports: [...COMPONENTS]
})
export class LayoutModule {}
