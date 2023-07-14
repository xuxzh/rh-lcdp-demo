import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { enableProdMode } from '@angular/core';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

import { preloaderFinished } from 'rh-base/core';

preloaderFinished();
if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .then((ref) => {
    // Ensure Angular destroys itself on hot reloads.
    if ((window as any).ngRef) {
      (window as any).ngRef.destroy();
    }
    (window as any).ngRef = ref;
    // 加载成功之后关闭load页面
    if ((window as any).appBootstrap) {
      (window as any).appBootstrap();
    }
  })
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err?.message);
  })
  .finally(() => {
    //
  });
