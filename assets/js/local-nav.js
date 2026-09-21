// 顶部导航在页内滚动到对应区块,不跳出本站。
// 主题本身没有这个能力:原导航链接直接交给路由/浏览器跳转到外部站点。
(() => {
  const scrollToSection = (target) => {
    const scroller = window.main && window.main.scroller;
    const current = scroller && typeof scroller.scroll === 'number' ? scroller.scroll : window.scrollY;
    const top = target.getBoundingClientRect().top + current;

    if (!scroller || typeof scroller.scrollTo !== 'function') {
      window.scrollTo({ top, behavior: 'smooth' });
      return;
    }

    // 与主题“回到顶部”一致:滚动期间标记为自动滚动,避免导航的地址栏同步来回跳
    window.main.isAutoScrolling = true;
    scroller.scrollTo(top, {
      duration: 1.2,
      force: true,
      onComplete: () => {
        window.main.isAutoScrolling = false;
      },
    });
  };

  document.addEventListener('click', (event) => {
    if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey) return;

    const link = event.target.closest('a[data-scroll-to]');
    if (!link) return;

    const target = document.getElementById(link.dataset.scrollTo);
    if (!target) return;

    event.preventDefault();

    let wait = 0;

    // 移动端菜单展开时,先收起菜单再滚动
    const openedToggle = document.querySelector('.navbar.navbar--opened .navbar__toggle');
    if (openedToggle) {
      openedToggle.click();
      wait = 700;
    }

    // 作品详情层打开时,先关闭详情再滚动
    const openDetails = document.querySelector('.work-details:not(.hide)');
    const closeButton = openDetails && openDetails.querySelector('.work-details__close-bt');
    if (closeButton) {
      closeButton.click();
      wait = Math.max(wait, 900);
    }

    if (wait) {
      setTimeout(() => scrollToSection(target), wait);
    } else {
      scrollToSection(target);
    }
  });
})();
