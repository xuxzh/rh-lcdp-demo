import { packageVersion } from './../../../../package-version';
import { Component } from '@angular/core';

@Component({
  selector: 'app-package-version',
  templateUrl: './package-version.component.html',
  styleUrls: ['./package-version.component.less']
})
export class PackageVersionComponent {
  packageVersion = packageVersion;
}
