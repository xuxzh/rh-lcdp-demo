/**
 * 加载成功之后关闭load界面
 */
export function preloaderFinished() {
  // tslint:disable-next-line: no-non-null-assertion
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const body = document.querySelector('body')!;
  // tslint:disable-next-line: no-non-null-assertion
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const preloader = document.querySelector('.preloader')!;

  preloader.addEventListener('transitionend', () => {
    preloader.className = 'preloader-hidden';
  });

  body.style.overflow = 'hidden';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).appBootstrap = () => {
    setTimeout(() => {
      remove();
      body.style.overflow = '';
    }, 100);
  };

  function remove() {
    // preloader value null when running --hmr
    if (!preloader) {
      return;
    }
    // preloader.addEventListener('transitionend', () => {
    //   preloader.className = 'preloader-hidden';
    // });

    preloader.className += ' preloader-hidden-add preloader-hidden-add-active';
  }
}
