// Atomy Selector - Combined Extension for AZA Mall & Atomy Shop
(function() {
  'use strict';

  // ==================== Site Detection ====================

  function getSiteType() {
    const host = window.location.hostname;
    if (host.includes('atomyaza.co.kr')) return 'AZA';
    if (host.includes('shop.atomy.com') || host.includes('kr.atomy.com')) return 'KR';
    if (host.includes('jp.atomy.com')) return 'JP';
    if (host.includes('my.atomy.com')) return 'MY';
    return null;
  }

  function getSiteConfig() {
    const type = getSiteType();
    const configs = {
      'AZA': { name: 'AZA Mall', color: '#4CAF50', apiBase: null },
      'KR': { name: 'KR', color: '#4CAF50', apiBase: 'https://kr.atomy.com' },
      'JP': { name: 'JP', color: '#4CAF50', apiBase: 'https://jp.atomy.com' },
      'MY': { name: 'MY', color: '#4CAF50', apiBase: 'https://my.atomy.com' }
    };
    return configs[type] || null;
  }

  // ==================== AZA Mall Functions ====================

  function isAzaProductPage() {
    const path = window.location.pathname;
    return (path === '/shop/view.php' || path === '/m/shop/view.php') && 
           window.location.search.includes('gs_id=');
  }

  function extractAzaOptions() {
    const gsIdInput = document.querySelector('input[name="gs_id[]"]');
    let gsId = gsIdInput ? gsIdInput.value : null;
    
    if (!gsId) {
      const urlParams = new URLSearchParams(window.location.search);
      gsId = urlParams.get('gs_id');
    }
    
    const displayPid = gsId || 'N/A';

    const optionElements = document.querySelectorAll('.opt_list_li[data-value]');
    const options = [];

    optionElements.forEach((el, index) => {
      const dataValue = el.getAttribute('data-value');
      if (dataValue) {
        const parts = dataValue.split(',');
        const fullSelector = gsId ? `${gsId}|${dataValue}` : dataValue;
        
        options.push({
          index: index + 1,
          name: parts[0] || '',
          pv: parts[4] || '',
          fullSelector: fullSelector,
          soldOut: false
        });
      }
    });

    return { pid: displayPid, options };
  }

  // ==================== Atomy Shop Functions ====================

  function isAtomyProductPage() {
    return window.location.pathname.includes('/product/');
  }

  function getAtomyProductInfo() {
    const nameEl = document.querySelector('.product-info-wrap .name span, .goods-info .name');
    let pid = '';

    const pathMatch = window.location.pathname.match(/\/product\/([A-Za-z0-9]+)/);
    if (pathMatch) pid = pathMatch[1];

    if (!pid) {
      const pidEl = document.querySelector('.product-num em, [data-goods-no]');
      if (pidEl) pid = pidEl.textContent?.trim() || pidEl.getAttribute('data-goods-no') || '';
    }

    return {
      name: nameEl ? nameEl.textContent.trim() : '',
      pid: pid
    };
  }

  function extractAtomyFirstOptions() {
    const options = [];
    const optionList = document.querySelector('.opt-select-box[item-area="0"] [option-role="item-option-list"] ul');

    if (optionList) {
      const items = optionList.querySelectorAll('a[option-role="option"]');
      items.forEach(item => {
        const txEl = item.querySelector('span.tx');
        if (txEl) {
          options.push(txEl.textContent.trim());
        }
      });
    }
    return options;
  }

  async function fetchAtomyOptions(goodsNo, optValNm1, apiBase) {
    const formData = new FormData();
    formData.append('goodsNo', goodsNo);
    if (optValNm1) {
      formData.append('optValNm1', optValNm1);
    }
    formData.append('goodsTypeCd', '101');

    try {
      const response = await fetch(`${apiBase}/goods/itemStatus`, {
        method: 'POST',
        body: formData
      });
      if (!response.ok) throw new Error('API request failed');

      const data = await response.json();
      return parseAtomyApiResponse(data);
    } catch (err) {
      console.error('[Atomy Selector] API error:', err);
      return [];
    }
  }

  function parseAtomyApiResponse(data) {
    const items = [];
    for (const itemNo in data) {
      const item = data[itemNo];
      items.push({
        itemNo: itemNo,
        opt1: item.optValNm1 || '',
        opt2: item.optValNm2 || '',
        stock: item.salePossQty || 0,
        soldOut: item.goodsStatCd === '20',
        sortSeq: item.sortSeq || 0
      });
    }
    items.sort((a, b) => a.sortSeq - b.sortSeq);
    return items;
  }

  // ==================== Panel Creation ====================

  function createPanel(site, pid, options, isLoading = false) {
    const existing = document.getElementById('aza-selector-panel');
    if (existing) existing.remove();

    const panel = document.createElement('div');
    panel.id = 'aza-selector-panel';

    let optionsHtml = '';
    if (isLoading) {
      optionsHtml = '<div class="aza-loading">載入中...</div>';
    } else if (options.length === 0) {
      optionsHtml = '<div class="aza-no-options">無選項資料</div>';
    } else {
      options.forEach((opt, index) => {
        const stockText = opt.stock !== undefined
          ? (opt.soldOut ? '缺貨' : `庫存: ${opt.stock}`)
          : (opt.pv ? `PV: ${parseInt(opt.pv).toLocaleString()}` : '');

        if (opt.noSelector) {
          // Product without options - just show stock info
          optionsHtml += `
            <div class="aza-option-item ${opt.soldOut ? 'soldout' : ''}">
              <div class="aza-option-header">
                <span class="aza-option-name">${opt.name}</span>
                <span class="aza-option-meta">${stockText}</span>
              </div>
            </div>
          `;
        } else {
          optionsHtml += `
            <div class="aza-option-item ${opt.soldOut ? 'soldout' : ''}">
              <div class="aza-option-header">
                <span class="aza-option-name">${index + 1}. ${opt.name || opt.fullSelector}</span>
                <span class="aza-option-meta">${stockText}</span>
              </div>
              <div class="aza-selector-row">
                <input type="text" class="aza-selector-input" value="${opt.fullSelector}" readonly>
                <button class="aza-copy-btn" data-selector="${opt.fullSelector}">Copy</button>
              </div>
            </div>
          `;
        }
      });
    }

    panel.innerHTML = `
      <div class="aza-panel-header">
        <span>[${site.name}] ${pid}</span>
        <div class="aza-panel-controls">
          <button class="aza-minimize-btn" title="Minimize">−</button>
          <button class="aza-close-btn" title="Close">×</button>
        </div>
      </div>
      <div class="aza-panel-body">
        ${optionsHtml}
      </div>
    `;

    document.body.appendChild(panel);

    // Event handlers
    panel.querySelector('.aza-close-btn').onclick = () => panel.remove();
    panel.querySelector('.aza-minimize-btn').onclick = () => panel.classList.toggle('minimized');

    panel.querySelectorAll('.aza-copy-btn').forEach(btn => {
      btn.onclick = () => {
        const selector = btn.getAttribute('data-selector');
        navigator.clipboard.writeText(selector).then(() => {
          btn.textContent = 'Copied!';
          btn.classList.add('copied');
          setTimeout(() => {
            btn.textContent = 'Copy';
            btn.classList.remove('copied');
          }, 1500);
        });
      };
    });

    makeDraggable(panel);
    return panel;
  }

  function makeDraggable(element) {
    const header = element.querySelector('.aza-panel-header');
    let isDragging = false;
    let startX, startY, startLeft, startTop;

    header.onmousedown = (e) => {
      if (e.target.tagName === 'BUTTON') return;
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      startLeft = element.offsetLeft;
      startTop = element.offsetTop;
      header.style.cursor = 'grabbing';
    };

    document.onmousemove = (e) => {
      if (!isDragging) return;
      element.style.left = startLeft + e.clientX - startX + 'px';
      element.style.top = startTop + e.clientY - startY + 'px';
      element.style.right = 'auto';
    };

    document.onmouseup = () => {
      isDragging = false;
      header.style.cursor = 'grab';
    };
  }

  // ==================== Main Logic ====================

  async function initAza() {
    const site = getSiteConfig();
    const data = extractAzaOptions();
    createPanel(site, data.pid, data.options);
  }

  async function initAtomy() {
    const site = getSiteConfig();
    const product = getAtomyProductInfo();
    const firstOptions = extractAtomyFirstOptions();

    // Show loading panel
    createPanel(site, product.pid, [], true);

    // No options - fetch stock info directly
    if (firstOptions.length === 0) {
      try {
        const items = await fetchAtomyOptions(product.pid, null, site.apiBase);
        if (items.length > 0 && items[0].itemNo === '00000') {
          // Product without options, show stock only
          createPanel(site, product.pid, [{
            name: '無選項商品',
            fullSelector: '',
            stock: items[0].stock,
            soldOut: items[0].soldOut,
            noSelector: true
          }]);
        } else {
          createPanel(site, product.pid, []);
        }
      } catch (err) {
        createPanel(site, product.pid, []);
      }
      return;
    }

    // Fetch all options in parallel
    const allOptions = [];
    const requests = firstOptions.map(opt1 => fetchAtomyOptions(product.pid, opt1, site.apiBase));

    try {
      const results = await Promise.all(requests);

      results.forEach((items, index) => {
        const opt1 = firstOptions[index];
        if (items.length > 0 && items[0].opt2) {
          // Has second level options
          items.forEach(item => {
            allOptions.push({
              name: `${opt1}|${item.opt2}`,
              fullSelector: `${opt1}|${item.opt2}`,
              stock: item.stock,
              soldOut: item.soldOut
            });
          });
        } else if (items.length > 0) {
          // Single option with stock info
          allOptions.push({
            name: opt1,
            fullSelector: opt1,
            stock: items[0].stock,
            soldOut: items[0].soldOut
          });
        } else {
          // Single option without stock info
          allOptions.push({
            name: opt1,
            fullSelector: opt1,
            soldOut: false
          });
        }
      });

      createPanel(site, product.pid, allOptions);
    } catch (err) {
      console.error('[Atomy Selector] Error:', err);
      createPanel(site, product.pid, []);
    }
  }

  function init() {
    const siteType = getSiteType();
    if (!siteType) return;

    if (siteType === 'AZA' && isAzaProductPage()) {
      setTimeout(initAza, 500);
    } else if (['KR', 'JP', 'MY'].includes(siteType) && isAtomyProductPage()) {
      setTimeout(initAtomy, 1000);
    }
  }

  // Run on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
