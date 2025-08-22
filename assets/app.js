async function loadMenu() {
  const res = await fetch('./assets/config/menu.json');
  const data = await res.json();
  renderSidebar(data);
  renderContent(data);
  bindSearch(data);
  restoreSidebarState();
  bindActiveOnScroll();
}

function createEl(tag, cls, html) {
  const el = document.createElement(tag);
  if (cls) el.className = cls;
  if (html !== undefined) el.innerHTML = html;
  return el;
}

function getFaviconFromUrl(urlStr) {
  try {
    const u = new URL(urlStr);
    return `https://toolb.cn/favicon/${u.hostname}`;
  } catch(e) {
    return '';
  }
}

function renderSidebar(cfg) {
  const sidebarMenu = document.getElementById('sidebarMenu');
  sidebarMenu.innerHTML = '';

  cfg.sections.forEach((sec, idx) => {
    const triggerId = `menu-${sec.id}`;
    const a = createEl('a', 'nav-link d-flex align-items-center');
    a.setAttribute('data-bs-toggle', 'collapse');
    a.href = `#${triggerId}`;
    a.innerHTML = `<i class="bi ${sec.icon} me-2"></i><span class="label-text">${sec.name}</span>`;
    const itemWrap = createEl('div', 'sidebar-item position-relative');
    itemWrap.appendChild(a);

    const wrap = createEl('div', `collapse ${idx<3?'show':''} ps-3`);
    wrap.id = triggerId;

    const ul = createEl('ul', 'nav flex-column small');
    sec.children.forEach(child => {
      const li = createEl('li', 'nav-item');
      const link = createEl('a', 'nav-link');
      link.href = `#${child.id}`;
      link.textContent = child.name;
      li.appendChild(link);
      ul.appendChild(li);
    });
    wrap.appendChild(ul);
    itemWrap.appendChild(wrap);
    sidebarMenu.appendChild(itemWrap);
    sidebarMenu.appendChild(createEl('hr'));
  });

  // 折叠态下，悬停主项时弹出子菜单
  bindFlyout();
}

function renderContent(cfg) {
  const container = document.getElementById('content');
  container.innerHTML = '';
  cfg.sections.forEach(sec => {
    sec.children.forEach(child => {
      const secEl = createEl('section', 'mb-5');
      secEl.id = child.id;
      const title = createEl('h2', 'h5 d-flex align-items-center');
      title.textContent = child.name;
      secEl.appendChild(title);

      const grid = createEl('div', 'row row-cols-1 row-cols-sm-2 row-cols-md-4 g-3');
      (child.links||[]).forEach(link => {
        const col = createEl('div', 'col');
        const fav = getFaviconFromUrl(link.url);
        const card = createEl('div', 'card card-body text-decoration-none card-link d-flex align-items-center');
        card.onclick = () => window.open(link.url, '_blank');
        card.style.cursor = 'pointer';
        card.title = link.url;
        if (fav) {
          const icon = createEl('img', 'favicon me-2');
          icon.src = fav; icon.alt = '';
          icon.onerror = () => {
            icon.style.display = 'none';
            const placeholder = createEl('i', 'bi bi-link-45deg favicon me-2');
            card.insertBefore(placeholder, icon.nextSibling);
          };
          card.appendChild(icon);
        } else {
          const placeholder = createEl('i', 'bi bi-link-45deg favicon me-2');
          card.appendChild(placeholder);
        }
        const textContainer = createEl('div', 'card-text-container');
        const title = createEl('div', 'card-title');
        title.textContent = link.name;
        textContainer.appendChild(title);
        if (link.desc) {
          const desc = createEl('div', 'card-desc');
          desc.textContent = link.desc;
          textContainer.appendChild(desc);
        }
        card.appendChild(textContainer);
        col.appendChild(card); grid.appendChild(col);
      });
      secEl.appendChild(grid);
      container.appendChild(secEl);
    });
  });
}

function bindSearch(cfg) {
  const input = document.getElementById('search');
  const container = document.getElementById('content');
  if (!input) return;
  
  const searchFunction = (searchInput, resultsContainer) => {
    const q = searchInput.value.trim().toLowerCase();
    if (!q) {
      if (resultsContainer) {
        resultsContainer.innerHTML = '';
      } else {
        container.querySelectorAll('[data-hit]')
          .forEach(el => el.removeAttribute('data-hit'));
        container.querySelectorAll('section').forEach(sec => sec.style.display = '');
      }
      return;
    }
    
         if (resultsContainer) {
       // 全屏搜索结果显示
       const results = [];
       cfg.sections.forEach(sec => {
         // 搜索主分类
         const sectionName = sec.name.toLowerCase();
         if (sectionName.includes(q)) {
           results.push({
             name: sec.name,
             url: '#',
             desc: '主分类',
             category: '',
             section: '',
             type: 'section'
           });
         }
         
         sec.children.forEach(child => {
           // 搜索子分类
           const childName = child.name.toLowerCase();
           if (childName.includes(q)) {
             results.push({
               name: child.name,
               url: `#${child.id}`,
               desc: `${sec.name} 分类下的子分类`,
               category: '',
               section: sec.name,
               type: 'category'
             });
           }
           
           // 搜索站点
           (child.links || []).forEach(link => {
             const title = link.name.toLowerCase();
             const desc = (link.desc || '').toLowerCase();
             if (title.includes(q) || desc.includes(q)) {
               results.push({
                 name: link.name,
                 url: link.url,
                 desc: link.desc,
                 category: child.name,
                 section: sec.name,
                 type: 'site'
               });
             }
           });
         });
       });
       
       displaySearchResults(results, resultsContainer);
    } else {
      // 顶部搜索框过滤
      container.querySelectorAll('section').forEach(sec => {
        const title = sec.querySelector('h2')?.textContent.toLowerCase() || '';
        let matched = title.includes(q);
        sec.querySelectorAll('.card-link').forEach(card => {
          const title = card.querySelector('.card-title')?.textContent.toLowerCase() || '';
          const desc = card.querySelector('.card-desc')?.textContent.toLowerCase() || '';
          const hit = title.includes(q) || desc.includes(q);
          card.closest('.col').toggleAttribute('data-hit', hit);
          matched = matched || hit;
        });
        sec.style.display = matched ? '' : 'none';
      });
    }
  };
  
  input.addEventListener('input', () => searchFunction(input, null));
  
  // 全屏搜索
  const fullscreenSearch = document.getElementById('fullscreenSearch');
  const fullscreenResults = document.getElementById('fullscreenSearchResults');
  if (fullscreenSearch && fullscreenResults) {
    fullscreenSearch.addEventListener('input', () => searchFunction(fullscreenSearch, fullscreenResults));
  }
}

function displaySearchResults(results, container) {
  if (results.length === 0) {
    container.innerHTML = '<div class="text-center text-muted">未找到相关结果</div>';
    return;
  }
  
  container.innerHTML = results.map((result, index) => {
    let clickHandler = '';
    let resultClass = 'search-result-item';
    
    if (result.type === 'section') {
      // 主分类：滚动到页面顶部
      clickHandler = 'onclick="handleSearchResultClick(this)"';
      resultClass += ' search-result-section';
    } else if (result.type === 'category') {
      // 子分类：滚动到对应分类
      clickHandler = 'onclick="handleSearchResultClick(this)"';
      resultClass += ' search-result-category';
    } else {
      // 站点：打开新窗口
      clickHandler = 'onclick="handleSearchResultClick(this)"';
      resultClass += ' search-result-site';
    }
    
    const badge = result.type === 'section' ? '<span class="badge bg-primary me-2">分类</span>' :
                  result.type === 'category' ? '<span class="badge bg-info me-2">子分类</span>' :
                  '<span class="badge bg-success me-2">站点</span>';
    
    return `
      <div class="${resultClass}" ${clickHandler} data-index="${index}" data-type="${result.type}" data-url="${result.url}" data-id="${result.type === 'category' ? result.url.slice(1) : ''}">
        <div class="search-result-title">
          ${badge}${result.name}
        </div>
        <div class="search-result-desc">${result.desc || ''}</div>
        ${result.section ? `<small class="text-muted">${result.section}${result.category ? ' > ' + result.category : ''}</small>` : ''}
      </div>
    `;
  }).join('');
  
  // 重置选中状态
  resetSearchSelection();
}

// 处理搜索结果点击
function handleSearchResultClick(element) {
  const type = element.getAttribute('data-type');
  const url = element.getAttribute('data-url');
  const id = element.getAttribute('data-id');
  
  if (type === 'section') {
    document.querySelector('.content-area').scrollTo({top: 0, behavior: 'smooth'});
    bootstrap.Modal.getInstance(document.getElementById('fullscreenSearchModal')).hide();
  } else if (type === 'category') {
    document.getElementById(id).scrollIntoView({behavior: 'smooth'});
    bootstrap.Modal.getInstance(document.getElementById('fullscreenSearchModal')).hide();
  } else {
    window.open(url, '_blank');
  }
}

// 键盘导航变量
let currentSearchIndex = -1;

// 重置搜索选择
function resetSearchSelection() {
  currentSearchIndex = -1;
  document.querySelectorAll('.search-result-item').forEach(item => {
    item.classList.remove('search-result-selected');
  });
}

// 更新搜索选择
function updateSearchSelection() {
  const items = document.querySelectorAll('.search-result-item');
  items.forEach((item, index) => {
    if (index === currentSearchIndex) {
      item.classList.add('search-result-selected');
      // 滚动到可见区域
      item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
      item.classList.remove('search-result-selected');
    }
  });
}

// 执行当前选中的搜索结果
function executeCurrentSelection() {
  const selectedItem = document.querySelector('.search-result-item.search-result-selected');
  if (selectedItem) {
    handleSearchResultClick(selectedItem);
  }
}

function toggleSidebarForDesktop() {
  const body = document.body;
  const sidebar = document.getElementById('sidebar');
  const toggleBtn = document.querySelector('button[onclick="toggleSidebarForDesktop()"]');
  const icon = toggleBtn.querySelector('i');
  
  if (body.classList.contains('sidebar-collapsed')) {
    // 展开侧边栏
    body.classList.remove('sidebar-collapsed');
    sidebar.classList.add('d-lg-block');
    icon.className = 'bi bi-layout-sidebar-inset';
    toggleBtn.title = '收起侧栏';
    try { localStorage.setItem('sidebar-collapsed', '0'); } catch(e) {}
  } else {
    // 收起侧边栏
    body.classList.add('sidebar-collapsed');
    sidebar.classList.remove('d-lg-block');
    icon.className = 'bi bi-layout-sidebar';
    toggleBtn.title = '展开侧栏';
    try { localStorage.setItem('sidebar-collapsed', '1'); } catch(e) {}
  }
  
  return false;
}

function restoreSidebarState() {
  // 从本地存储恢复侧边栏状态
  const isCollapsed = localStorage.getItem('sidebar-collapsed') === '1';
  const body = document.body;
  const sidebar = document.getElementById('sidebar');
  const toggleBtn = document.querySelector('button[onclick="toggleSidebarForDesktop()"]');
  const icon = toggleBtn.querySelector('i');
  
  if (isCollapsed) {
    body.classList.add('sidebar-collapsed');
    sidebar.classList.remove('d-lg-block');
    icon.className = 'bi bi-layout-sidebar';
    toggleBtn.title = '展开侧栏';
  } else {
    body.classList.remove('sidebar-collapsed');
    sidebar.classList.add('d-lg-block');
    icon.className = 'bi bi-layout-sidebar-inset';
    toggleBtn.title = '收起侧栏';
  }
}

function bindActiveOnScroll() {
  const links = Array.from(document.querySelectorAll('#sidebarMenu a.nav-link[href^="#"]'));
  const map = new Map(); // section -> childLink
  const parentMap = new Map(); // section -> parentToggle
  links.forEach(a => {
    const id = a.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if (target) map.set(target, a);
  });

  // 建立 parentToggle 关系
  document.querySelectorAll('#sidebarMenu .sidebar-item').forEach(item => {
    const toggle = item.querySelector('> a.nav-link');
    item.querySelectorAll('.collapse .nav a.nav-link').forEach(child => {
      const id = child.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (target) parentMap.set(target, toggle);
    });
  });

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const a = map.get(entry.target);
      if (!a) return;
      if (entry.isIntersecting) {
        links.forEach(x => x.classList.remove('active'));
        document.querySelectorAll('#sidebarMenu > .sidebar-item > a.nav-link').forEach(x=>x.classList.remove('active-parent'));
        a.classList.add('active');
        const parent = parentMap.get(entry.target);
        if (parent) parent.classList.add('active-parent');
      }
    });
  }, { root: document.querySelector('.content-area'), threshold: 0.2 });

  map.forEach((_, section) => obs.observe(section));
}

function bindFlyout() {
  const isCollapsed = () => document.body.classList.contains('sidebar-collapsed');
  const sidebar = document.querySelector('.sidebar');
  let flyout;

  // 收起态下，鼠标滑过每个顶级项时显示悬浮子菜单
  sidebar.addEventListener('mouseover', (e) => {
    if (!isCollapsed()) return;
    // 鼠标在浮层中移动时不处理，避免被误判为需要隐藏
    if (flyout && e.target.closest('.submenu-flyout')) return;
    const item = e.target.closest('.sidebar-item');
    if (!item || !sidebar.contains(item)) { hideFlyout(); return; }
    showFlyout(item);
  });

  // 从侧栏移出时，如果是进入浮层则不隐藏
  sidebar.addEventListener('mouseleave', (e) => {
    const to = e.relatedTarget;
    if (flyout && to && flyout.contains(to)) return;
    hideFlyout();
  });

  // 点击浮层中的子链接时，触发原侧栏对应项的点击逻辑并高亮父级
  sidebar.addEventListener('click', (e) => {
    const a = e.target.closest('.submenu-flyout a.nav-link');
    if (!a) return;
    const href = a.getAttribute('href');
    const original = document.querySelector(`#sidebarMenu .collapse .nav a.nav-link[href="${href}"]`);
    if (original) {
      e.preventDefault();
      original.click();
    }
    hideFlyout();
  });

  function showFlyout(item) {
    const sub = item.querySelector('.collapse .nav');
    if (!sub) { hideFlyout(); return; }
    if (!flyout) flyout = createEl('div', 'submenu-flyout');
    flyout.innerHTML = '';
    flyout.appendChild(sub.cloneNode(true));
    const rect = item.getBoundingClientRect();
    const sRect = sidebar.getBoundingClientRect();
    flyout.style.top = `${rect.top - sRect.top + sidebar.scrollTop}px`;
    flyout.style.left = `${sRect.width}px`;
    flyout.classList.add('show');
    sidebar.appendChild(flyout);

    // 离开浮层且不是回到侧栏时才隐藏
    flyout.onmouseleave = (ev) => {
      const to = ev.relatedTarget;
      if (!to || !sidebar.contains(to)) hideFlyout();
    };
  }

  function hideFlyout() {
    if (flyout) flyout.classList.remove('show');
  }
}

function setAllCollapses(open) {
  document.querySelectorAll('#sidebarMenu .collapse').forEach(el => {
    if (open) el.classList.add('show'); else el.classList.remove('show');
  });
}

// 展开/收起全部菜单功能
function initToggleAllMenus() {
  const toggleBtn = document.getElementById('toggleAllMenus');
  if (!toggleBtn) return;
  
  // 从本地存储恢复状态
  const isExpanded = localStorage.getItem('all-menus-expanded') === 'true';
  updateToggleButtonState(isExpanded);
  setAllCollapses(isExpanded);
  
  toggleBtn.addEventListener('click', () => {
    const currentState = toggleBtn.classList.contains('expanded');
    const newState = !currentState;
    
    updateToggleButtonState(newState);
    setAllCollapses(newState);
    
    // 保存状态到本地存储
    try {
      localStorage.setItem('all-menus-expanded', newState.toString());
    } catch(e) {}
  });
}

function updateToggleButtonState(isExpanded) {
  const toggleBtn = document.getElementById('toggleAllMenus');
  if (!toggleBtn) return;
  
  const icon = toggleBtn.querySelector('i');
  const title = toggleBtn.getAttribute('title');
  
  if (isExpanded) {
    toggleBtn.classList.add('expanded');
    icon.className = 'bi bi-chevron-up';
    toggleBtn.title = '收起全部菜单';
  } else {
    toggleBtn.classList.remove('expanded');
    icon.className = 'bi bi-chevron-down';
    toggleBtn.title = '展开全部菜单';
  }
}

// 点击子项立即高亮（避免等待滚动进入视口）
document.addEventListener('click', (e) => {
  const a = e.target.closest('#sidebarMenu .collapse .nav a.nav-link');
  if (!a) return;
  document.querySelectorAll('#sidebarMenu .collapse .nav a.nav-link').forEach(x=>x.classList.remove('active'));
  a.classList.add('active');
  document.querySelectorAll('#sidebarMenu > .sidebar-item > a.nav-link').forEach(x=>x.classList.remove('active-parent'));
  const parentToggle = a.closest('.sidebar-item')?.querySelector('> a.nav-link');
  if (parentToggle) parentToggle.classList.add('active-parent');
});

// 夜间模式切换功能
function initThemeToggle() {
  const toggleBtn = document.getElementById('themeToggle');
  const toggleIcon = toggleBtn.querySelector('i');
  
  // 从本地存储恢复主题
  const savedTheme = localStorage.getItem('theme') || 'light';
  setTheme(savedTheme);
  
  toggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  });
  
  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    if (theme === 'dark') {
      toggleIcon.className = 'bi bi-sun';
      toggleBtn.title = '切换到日间模式';
    } else {
      toggleIcon.className = 'bi bi-moon';
      toggleBtn.title = '切换到夜间模式';
    }
  }
}

// 全屏搜索模态框控制
function initFullscreenSearch() {
  const modal = new bootstrap.Modal(document.getElementById('fullscreenSearchModal'));
  const fullscreenSearch = document.getElementById('fullscreenSearch');
  
  // 快捷键 Ctrl+K 打开全屏搜索
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      modal.show();
      // 等待模态框完全显示后再聚焦
      setTimeout(() => {
        fullscreenSearch.focus();
        fullscreenSearch.select();
      }, 300);
    }
    
    // ESC 键关闭全屏搜索
    if (e.key === 'Escape' && document.getElementById('fullscreenSearchModal').classList.contains('show')) {
      modal.hide();
    }
  });
  
  // 搜索框键盘导航
  fullscreenSearch.addEventListener('keydown', (e) => {
    const items = document.querySelectorAll('.search-result-item');
    const maxIndex = items.length - 1;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      currentSearchIndex = Math.min(currentSearchIndex + 1, maxIndex);
      updateSearchSelection();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      currentSearchIndex = Math.max(currentSearchIndex - 1, -1);
      updateSearchSelection();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (currentSearchIndex >= 0) {
        executeCurrentSelection();
      }
    }
  });
  
  // 模态框显示时自动聚焦
  document.getElementById('fullscreenSearchModal').addEventListener('shown.bs.modal', () => {
    setTimeout(() => {
      fullscreenSearch.focus();
      fullscreenSearch.select();
    }, 100);
  });
  
  // 模态框关闭时清空搜索
  document.getElementById('fullscreenSearchModal').addEventListener('hidden.bs.modal', () => {
    fullscreenSearch.value = '';
    document.getElementById('fullscreenSearchResults').innerHTML = '';
  });
}

window.addEventListener('DOMContentLoaded', () => {
  loadMenu();
  initThemeToggle();
  initFullscreenSearch();
  initToggleAllMenus();
});


