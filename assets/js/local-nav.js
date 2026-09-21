// 顶部导航:地址变为本站的 /works、/about 等,并在页内滚动到对应区块。
// 主题本身没有这个能力:原导航链接直接跳转到外部站点。
(() => {
  // 路径 → 区块 id
  const SECTIONS = {
    '/works': 'works',
    '/about': 'about',
    '/updates': 'updates',
    '/start-a-project': 'start-a-project',
  };

  const normalize = (path) => (path.length > 1 ? path.replace(/\/+$/, '') : path);

  // 与主题滚动时同步地址栏的方式一致,用 replaceState,不产生新的历史记录
  const setPath = (path) => {
    if (window.location.pathname !== path) window.history.replaceState(null, '', path);
  };

  const scrollToSection = (target, onDone) => {
    const scroller = window.main && window.main.scroller;
    const current = scroller && typeof scroller.scroll === 'number' ? scroller.scroll : window.scrollY;
    const top = target.getBoundingClientRect().top + current;

    if (!scroller || typeof scroller.scrollTo !== 'function') {
      window.scrollTo({ top, behavior: 'smooth' });
      if (onDone) setTimeout(onDone, 1000);
      return;
    }

    // 与主题“回到顶部”一致:滚动期间标记为自动滚动,避免导航的地址栏同步来回跳
    window.main.isAutoScrolling = true;
    scroller.scrollTo(top, {
      duration: 1.2,
      lock: true,
      force: true,
      onComplete: () => {
        window.main.isAutoScrolling = false;
        if (onDone) onDone();
      },
    });
  };

  const goTo = (path, target) => {
    setPath(path);
    scrollToSection(target, () => setPath(path));
  };

  // 点击导航
  document.addEventListener('click', (event) => {
    if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey) return;

    const link = event.target.closest('a[data-scroll-to]');
    if (!link) return;

    const target = document.getElementById(link.dataset.scrollTo);
    if (!target) return;

    event.preventDefault();

    const path = normalize(link.getAttribute('href'));
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
      setTimeout(() => goTo(path, target), wait);
    } else {
      goTo(path, target);
    }
  });

  // 直接打开或刷新 /works 等地址时,等主题初始化完成后滚动到对应区块
  const initialPath = normalize(window.location.pathname);
  const initialId = SECTIONS[initialPath];
  if (!initialId) return;

  let done = false;
  const goInitial = () => {
    if (done) return;
    const target = document.getElementById(initialId);
    if (!target) return;
    done = true;
    goTo(initialPath, target);
  };

  const startedAt = Date.now();
  const waitForMain = setInterval(() => {
    const { main } = window;
    if (main && main.scroller) {
      clearInterval(waitForMain);
      if (typeof main.once === 'function') main.once('finishintro', () => setTimeout(goInitial, 300));
      // 开场动画已结束或事件不会触发时的兜底
      setTimeout(goInitial, 5000);
    } else if (Date.now() - startedAt > 15000) {
      clearInterval(waitForMain);
      goInitial();
    }
  }, 200);
})();
