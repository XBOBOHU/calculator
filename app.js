(function () {
  /* ==========================================================
   * 常量 & key
   * ========================================================== */
  const CALC_HISTORY_KEY = 'autocalc_history_v1';
  const SHEET_HISTORY_KEY = 'autocalc_sheet_history_v1';
  const SHEET_KEY = 'autocalc_sheet_v1';
  const LEGACY_TABLE_KEY = 'autocalc_table_v1';
  const VIEW_KEY = 'autocalc_view_v1';
  const CALC_POS_KEY = 'autocalc_calc_pos_v1';
  const SUM_POS_KEY = 'autocalc_floatsum_pos_v1';

  const CORNER_W = 46;
  const HEAD_H = 34;
  const DEFAULT_COL_W = 104;
  const DEFAULT_ROW_H = 40;
  const MIN_COL_W = 56;
  const MAX_COL_W = 460;
  const MIN_ROW_H = 30;
  const MAX_ROW_H = 320;

  // 单元格图片：压缩目标（最长边 px）与 jpeg 质量
  const CELL_IMG_MAX = 900;
  const CELL_IMG_QUALITY = 0.8;
  const CELL_IMG_SHOW_MAX_H = 150;

  /* ==========================================================
   * DOM 引用
   * ========================================================== */
  const toast = document.getElementById('toast');

  const navCalc = document.getElementById('navCalc');
  const navTable = document.getElementById('navTable');
  const viewCalc = document.getElementById('viewCalc');
  const viewTable = document.getElementById('viewTable');

  // 计算模块主面板
  const numInput = document.getElementById('numInput');
  const totalValue = document.getElementById('totalValue');
  const countNum = document.getElementById('countNum');
  const subTotal = document.getElementById('subTotal');
  const chipArea = document.getElementById('chipArea');
  const btnAddOne = document.getElementById('btnAddOne');
  const btnSave = document.getElementById('btnSave');
  const btnClearInput = document.getElementById('btnClearInput');
  const btnExport = document.getElementById('btnExport');
  const btnImage = document.getElementById('btnImage');
  const btnHistoryCalc = document.getElementById('btnHistoryCalc');
  const btnCalcOpen = document.getElementById('btnCalcOpen');
  const calcBadge = document.getElementById('calcBadge');

  // 表格模块
  const sheetWrap = document.getElementById('sheetWrap');
  const sheetStatus = document.getElementById('sheetStatus');
  const tblRows = document.getElementById('tblRows');
  const tblCols = document.getElementById('tblCols');
  const btnBuildTable = document.getElementById('btnBuildTable');
  const btnAddRow = document.getElementById('btnAddRow');
  const btnAddCol = document.getElementById('btnAddCol');
  const btnSaveSheet = document.getElementById('btnSaveSheet');
  const btnTableExport = document.getElementById('btnTableExport');
  const btnHistorySheet = document.getElementById('btnHistorySheet');
  const btnSumOpen = document.getElementById('btnSumOpen');
  const btnCalcOpen2 = document.getElementById('btnCalcOpen2');
  const btnTableClear = document.getElementById('btnTableClear');
  const btnInsertImg = document.getElementById('btnInsertImg');
  const cellImgInput = document.getElementById('cellImgInput');
  const sheetBadge = document.getElementById('sheetBadge');

  // 表格页悬浮累加窗
  const floatSum = document.getElementById('floatSum');
  const floatSumHeader = document.getElementById('floatSumHeader');
  const floatSumClose = document.getElementById('floatSumClose');
  const sumTotal = document.getElementById('sumTotal');
  const sumInput = document.getElementById('sumInput');
  const sumCount = document.getElementById('sumCount');
  const sumSub = document.getElementById('sumSub');
  const sumChips = document.getElementById('sumChips');
  const btnSumAdd = document.getElementById('btnSumAdd');
  const btnSumSave = document.getElementById('btnSumSave');
  const btnSumClear = document.getElementById('btnSumClear');

  // 悬浮键盘计算器
  const floatCalc = document.getElementById('floatCalc');
  const floatCalcHeader = document.getElementById('floatCalcHeader');
  const floatCalcClose = document.getElementById('floatCalcClose');
  const calcExpr = document.getElementById('calcExpr');
  const calcResult = document.getElementById('calcResult');
  const calcKeys = document.getElementById('calcKeys');

  // 历史弹窗
  const historyModal = document.getElementById('historyModal');
  const historyList = document.getElementById('historyList');
  const historyCount = document.getElementById('historyCount');
  const historyTabs = document.getElementById('historyTabs');
  const tabCalc = document.getElementById('tabCalc');
  const tabSheet = document.getElementById('tabSheet');
  const modalClose = document.getElementById('modalClose');
  const btnClearAll = document.getElementById('btnClearAll');

  // 图片弹窗
  const imgModal = document.getElementById('imgModal');
  const imgTitle = document.getElementById('imgTitle');
  const imgClose = document.getElementById('imgClose');
  const imgCancel = document.getElementById('imgCancel');
  const imgPreview = document.getElementById('imgPreview');
  const imgDownload = document.getElementById('imgDownload');

  // 表格记录详情弹窗
  const sheetViewModal = document.getElementById('sheetViewModal');
  const sheetViewBody = document.getElementById('sheetViewBody');
  const sheetViewMeta = document.getElementById('sheetViewMeta');
  const sheetViewImg = document.getElementById('sheetViewImg');
  const sheetViewRestore = document.getElementById('sheetViewRestore');
  const sheetViewClose = document.getElementById('sheetViewClose');
  let sheetViewRecord = null;
  let sheetViewId = null;

  /* ==========================================================
   * 通用工具
   * ========================================================== */
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 1800);
  }

  function clamp(n, min, max) {
    return Math.min(Math.max(n, min), max);
  }

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  function parseNumbers(text) {
    if (!text || !text.trim()) return [];
    const cleaned = text.replace(/\b\d{1,3}(?:,\d{3})+\b/g, (m) => m.replace(/,/g, ''));
    const matches = cleaned.match(/-?\d+(?:\.\d+)?/g);
    if (!matches) return [];
    return matches.map(Number).filter((n) => !isNaN(n));
  }

  function sumNumbers(nums) {
    return nums.reduce((a, b) => a + b, 0);
  }

  function formatNum(n) {
    if (Number.isInteger(n)) return n.toLocaleString('zh-CN');
    return Number(n.toFixed(4)).toLocaleString('zh-CN');
  }

  function pad(n) {
    return n < 10 ? '0' + n : '' + n;
  }

  function dateKey(ts) {
    const d = new Date(ts);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  function timeStr(ts) {
    const d = new Date(ts);
    return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  }

  // 单行文本：转义 HTML，换行显示为 ↵
  function escapeHtml(s) {
    const div = document.createElement('div');
    div.textContent = s == null ? '' : String(s);
    return div.innerHTML.replace(/\n/g, ' ↵ ');
  }

  // 多行文本：转义 HTML，换行保留为 <br>
  function escapeText(s) {
    const div = document.createElement('div');
    div.textContent = s == null ? '' : String(s);
    return div.innerHTML.replace(/\n/g, '<br>');
  }

  function readText(el) {
    return (el.innerText || '')
      .replace(/\u00a0/g, ' ')
      .replace(/\n+$/, '')
      .replace(/\n{3,}/g, '\n\n');
  }

  function readJSON(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function writeJSON(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      // 本地存储写满（表格图片较多时容易触发）
      return false;
    }
  }

  function loadList(key) {
    const v = readJSON(key);
    return Array.isArray(v) ? v : [];
  }

  /* ==========================================================
   * 自动累加组件（计算模块主面板 / 表格页悬浮窗 共用）
   * ========================================================== */
  function createAutoSum(cfg) {
    const input = cfg.input;
    const area = cfg.chipArea;
    const emptyText = cfg.emptyText || '还没有数字';
    let nums = [];
    let idleTimer = null;
    let composing = false;

    function clearIdle() {
      if (idleTimer !== null) {
        clearTimeout(idleTimer);
        idleTimer = null;
      }
    }

    function render() {
      const total = sumNumbers(nums);
      if (cfg.totalEl) cfg.totalEl.textContent = formatNum(total);
      if (cfg.countEl) cfg.countEl.textContent = nums.length;
      if (cfg.subEl) cfg.subEl.textContent = formatNum(total);

      if (nums.length === 0) {
        area.innerHTML = '<span class="chip-empty">' + escapeHtml(emptyText) + '</span>';
        return;
      }

      area.innerHTML = nums
        .map(
          (n, i) =>
            `<span class="chip ${n < 0 ? 'neg' : ''}" data-idx="${i}">
              ${formatNum(n)}
              <button class="chip-del" data-idx="${i}" title="删除">✕</button>
            </span>`
        )
        .join('');
    }

    function add(raw, silent) {
      const text = (raw === undefined ? input.value : raw).trim();
      if (!text) return false;

      const parsed = parseNumbers(text);
      if (parsed.length === 0) {
        if (!silent) showToast('❌ 没识别到有效数字');
        return false;
      }

      nums.push(...parsed);
      render();

      if (raw === undefined) {
        input.value = '';
        input.focus();
      }
      return true;
    }

    function resetIdle() {
      clearIdle();
      if (composing) return;
      idleTimer = setTimeout(() => {
        if (input.value.trim()) add(undefined, true);
      }, 450);
    }

    input.addEventListener('compositionstart', () => {
      composing = true;
      clearIdle();
    });

    input.addEventListener('compositionend', () => {
      composing = false;
      if (input.value.trim()) add(undefined, true);
    });

    input.addEventListener('input', resetIdle);

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        clearIdle();
        if (e.ctrlKey || e.metaKey) {
          if (cfg.onSave) cfg.onSave();
        } else {
          add();
        }
      } else if (e.key === ' ' || e.key === ',' || e.key === 'Tab') {
        e.preventDefault();
        clearIdle();
        add();
      }
    });

    input.addEventListener('paste', (e) => {
      clearIdle();
      const text = (e.clipboardData || window.clipboardData).getData('text');
      if (!text || !text.trim()) return;
      const parsed = parseNumbers(text);
      if (parsed.length <= 1) return;
      e.preventDefault();
      nums.push(...parsed);
      render();
      input.value = '';
      showToast(`✓ 粘贴识别了 ${parsed.length} 个数字`);
    });

    area.addEventListener('click', (e) => {
      clearIdle();
      if (!e.target.classList.contains('chip-del')) return;
      const idx = parseInt(e.target.dataset.idx, 10);
      if (!isNaN(idx) && idx >= 0) {
        nums.splice(idx, 1);
        render();
      }
    });

    function clearAll() {
      clearIdle();
      if (nums.length === 0) {
        showToast('列表已经是空的');
        return false;
      }
      nums = [];
      render();
      input.focus();
      return true;
    }

    return {
      render: render,
      add: add,
      clear: clearAll,
      clearIdle: clearIdle,
      getNums: () => nums.slice(),
      setNums: (arr) => {
        nums = arr.slice();
        render();
      },
      focus: () => input.focus(),
      size: () => nums.length,
    };
  }

  /* ==========================================================
   * 双历史
   * ========================================================== */
  let activeHistoryTab = 'calc';

  const loadCalcHistory = () => loadList(CALC_HISTORY_KEY);
  const saveCalcHistory = (list) => writeJSON(CALC_HISTORY_KEY, list);
  const loadSheetHistory = () => loadList(SHEET_HISTORY_KEY);
  const saveSheetHistory = (list) => writeJSON(SHEET_HISTORY_KEY, list);

  function refreshBadges() {
    calcBadge.textContent = loadCalcHistory().length;
    sheetBadge.textContent = loadSheetHistory().length;
  }

  function addCalcRecord(nums) {
    if (!nums || nums.length === 0) {
      showToast('列表是空的');
      return;
    }
    const list = loadCalcHistory();
    list.unshift({
      id: uid(),
      content: nums.join(', '),
      nums: nums.slice(),
      total: sumNumbers(nums),
      time: Date.now(),
    });
    saveCalcHistory(list);
    refreshBadges();
    showToast('✓ 已保存到计算记录');
  }

  const sheetCellText = (v, hasImg) => {
    const t = String(v || '').replace(/\n/g, ' ⏎ ');
    if (!t.trim()) return hasImg ? '[图片]' : '';
    return hasImg ? t + ' [图片]' : t;
  };

  function sheetPreview(cells, images) {
    const lines = [];
    for (let r = 0; r < cells.length; r++) {
      if (lines.length >= 3) break;
      const row = cells[r] || [];
      const imgRow = (images || [])[r] || [];
      const parts = row.map((v, c) => sheetCellText(v, !!imgRow[c])).filter((v) => v.trim());
      if (parts.length) lines.push(parts.join(' , '));
    }
    return lines.join('  /  ') || '(空白表格)';
  }

  function countSheetImages() {
    let n = 0;
    sheetData.images.forEach((row) => row.forEach((v) => { if (v) n++; }));
    return n;
  }

  function addSheetRecord() {
    const filled = countFilled();
    if (filled === 0) {
      showToast('表格是空的，先填写内容或插入图片吧');
      return;
    }
    const list = loadSheetHistory();
    list.unshift({
      id: uid(),
      rows: sheetData.rows,
      cols: sheetData.cols,
      colWidths: sheetData.colWidths.slice(),
      rowHeights: sheetData.rowHeights.slice(),
      cells: sheetData.cells.map((r) => r.slice()),
      images: sheetData.images.map((r) => r.slice()),
      colHeaders: sheetData.colHeaders.slice(),
      rowHeaders: sheetData.rowHeaders.slice(),
      filled: filled,
      time: Date.now(),
    });
    if (list.length > 200) list.length = 200;
    if (!saveSheetHistory(list)) {
      showToast('⚠ 本地空间不足，记录未保存（图片太多）');
      return;
    }
    refreshBadges();
    showToast('✓ 已保存到表格记录');
  }

  function renderHistory(tab) {
    activeHistoryTab = tab === 'sheet' ? 'sheet' : 'calc';
    tabCalc.classList.toggle('active', activeHistoryTab === 'calc');
    tabSheet.classList.toggle('active', activeHistoryTab === 'sheet');

    const isCalc = activeHistoryTab === 'calc';
    const list = isCalc ? loadCalcHistory() : loadSheetHistory();
    historyCount.textContent = list.length + ' 条';
    btnClearAll.textContent = isCalc ? '⚠ 清空计算记录' : '⚠ 清空表格记录';

    if (list.length === 0) {
      historyList.innerHTML = isCalc
        ? '<p class="empty-tip">还没有计算记录，输入数字后点击"保存为记录"吧</p>'
        : '<p class="empty-tip">还没有表格记录，填好表格后点击"保存为记录"吧</p>';
      return;
    }

    const groups = {};
    list.forEach((item) => {
      const k = dateKey(item.time);
      (groups[k] = groups[k] || []).push(item);
    });
    const dates = Object.keys(groups).sort((a, b) => b.localeCompare(a));

    historyList.innerHTML = dates
      .map((d) => {
        const items = groups[d].sort((a, b) => b.time - a.time);
        return `
          <div class="history-group">
            <div class="history-group-title">${d}</div>
            ${items
              .map((it) =>
                isCalc
                  ? `
              <div class="history-item ${it.total < 0 ? 'neg-total' : ''}" data-id="${it.id}">
                <div class="history-item-top">
                  <span class="history-item-total">${formatNum(it.total)}</span>
                  <span class="history-item-time">${timeStr(it.time)}</span>
                </div>
                <div class="history-item-content">${escapeHtml(it.content)}</div>
                <div class="history-item-actions">
                  <button class="restore-btn">↻ 恢复到列表</button>
                  <button class="copy-btn">📋 复制内容</button>
                  <button class="del-btn">✕ 删除</button>
                </div>
              </div>
              `
                  : `
              <div class="history-item sheet-item clickable" data-id="${it.id}">
                <div class="history-item-top">
                  <span class="history-item-total">${it.rows} 行 × ${it.cols} 列</span>
                  <span class="history-item-time">${timeStr(it.time)}</span>
                </div>
                <div class="history-item-content">${escapeHtml(
                  it.filled + ' 个已填写 · ' + sheetPreview(it.cells, it.images)
                )}</div>
                <div class="history-item-actions">
                  <button class="view-btn">👁 查看详情</button>
                  <button class="restore-btn">↻ 恢复表格</button>
                  <button class="copy-btn">📋 复制内容</button>
                  <button class="del-btn">✕ 删除</button>
                </div>
              </div>
              `
              )
              .join('')}
          </div>
        `;
      })
      .join('');
  }

  function openHistory(origin) {
    const fromSheet = origin === 'sheet';
    historyTabs.hidden = !fromSheet;
    renderHistory(fromSheet ? 'sheet' : 'calc');
    historyModal.classList.add('show');
    historyModal.setAttribute('aria-hidden', 'false');
  }

  function closeHistory() {
    historyModal.classList.remove('show');
    historyModal.setAttribute('aria-hidden', 'true');
  }

  function clearCurrentHistory() {
    const isCalc = activeHistoryTab === 'calc';
    const list = isCalc ? loadCalcHistory() : loadSheetHistory();
    if (list.length === 0) {
      showToast('当前没有记录');
      return;
    }
    if (!confirm(isCalc ? '⚠ 确定清空所有计算记录吗？' : '⚠ 确定清空所有表格记录吗？')) return;
    if (isCalc) saveCalcHistory([]);
    else saveSheetHistory([]);
    refreshBadges();
    renderHistory(activeHistoryTab);
    showToast('已清空');
  }

  function deleteRecord(id) {
    if (!confirm('确定删除这条记录吗？')) return;
    if (activeHistoryTab === 'calc') {
      saveCalcHistory(loadCalcHistory().filter((it) => it.id !== id));
    } else {
      saveSheetHistory(loadSheetHistory().filter((it) => it.id !== id));
    }
    refreshBadges();
    renderHistory(activeHistoryTab);
    showToast('已删除');
  }

  function restoreRecord(id) {
    if (activeHistoryTab === 'calc') {
      const item = loadCalcHistory().find((it) => it.id === id);
      if (!item) return;
      autoSumCalc.setNums(item.nums || []);
      switchView('calc');
      closeHistory();
      showToast('已恢复到计算列表');
      return;
    }

    const item = loadSheetHistory().find((it) => it.id === id);
    if (!item) return;
    sheetData = normalizeSheet({
      rows: item.rows,
      cols: item.cols,
      colWidths: item.colWidths,
      rowHeights: item.rowHeights,
      cells: item.cells,
      images: item.images,
      colHeaders: item.colHeaders,
      rowHeaders: item.rowHeaders,
    });
    activeCell = null;
    ensureSizes();
    renderSheet();
    saveSheet();
    switchView('table');
    closeHistory();
    showToast('已恢复表格内容');
  }

  /* ---- 表格记录详情：查看整表 + 存图片 ---- */
  function openSheetView(id) {
    const item = loadSheetHistory().find((it) => it.id === id);
    if (!item) return;
    sheetViewId = id;
    sheetViewRecord = normalizeSheet(item);
    sheetViewMeta.textContent = `${sheetViewRecord.rows} 行 × ${sheetViewRecord.cols} 列 · ${timeStr(
      item.time
    )}`;
    sheetViewBody.innerHTML =
      '<div class="sheet-inner">' + sheetTableHTML(sheetViewRecord, true).html + '</div>';
    sheetViewModal.classList.add('show');
    sheetViewModal.setAttribute('aria-hidden', 'false');
  }

  function closeSheetView() {
    sheetViewModal.classList.remove('show');
    sheetViewModal.setAttribute('aria-hidden', 'true');
  }

  function restoreFromView() {
    if (!sheetViewRecord) return;
    sheetData = normalizeSheet(sheetViewRecord);
    activeCell = null;
    ensureSizes();
    renderSheet();
    saveSheet();
    closeSheetView();
    closeHistory();
    switchView('table');
    showToast('已恢复表格内容');
  }

  // 单元格图片在表内的显示尺寸：等比缩放，不超内容宽，高度上限 CELL_IMG_SHOW_MAX_H
  function fitBox(im, availW) {
    const iw = im.naturalWidth || 1;
    const ih = im.naturalHeight || 1;
    let w = Math.min(availW, iw);
    let h = w * (ih / iw);
    if (h > CELL_IMG_SHOW_MAX_H) {
      h = CELL_IMG_SHOW_MAX_H;
      w = h * (iw / ih);
    }
    return { img: im, w: w, h: h };
  }

  async function buildSheetImage(data) {
    const dpr = 2;
    const PAD = 40;
    const LINE_H = 30;
    const CELL_PAD_X = 12;
    const CELL_PAD_Y = 12;
    const TITLE_H = 56;
    const META_H = 18;
    const FONT = '-apple-system, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif';
    const HEAD_FONT = 'bold 22px ' + FONT;
    const CELL_FONT = '22px ' + FONT;

    const colWs = [CORNER_W].concat(data.colWidths);
    const tableW = colWs.reduce((a, b) => a + b, 0);
    const W = Math.round(tableW + PAD * 2);

    const measure = document.createElement('canvas').getContext('2d');

    // 表头行高：取换行最多的一列（单行时与页面一致取 34px）
    measure.font = HEAD_FONT;
    const colHeadLines = data.colHeaders.map((v, c) =>
      wrapCell(measure, v || colName(c), colWs[c + 1] - CELL_PAD_X * 2)
    );
    let headMax = 1;
    colHeadLines.forEach((ls) => {
      if (ls.length > headMax) headMax = ls.length;
    });
    const headH = Math.max(HEAD_H, headMax * LINE_H + CELL_PAD_Y * 2);

    // 预加载单元格图片（有图的行高按图占位加高）
    const imgBoxes = [];
    const jobs = [];
    for (let r = 0; r < data.rows; r++) {
      const imgRow = (data.images || [])[r] || [];
      const one = new Array(data.cols).fill(null);
      for (let c = 0; c < data.cols; c++) {
        const url = imgRow[c];
        if (!url) continue;
        const idx = c;
        jobs.push(
          loadImage(url).then(
            (im) => {
              one[idx] = fitBox(im, colWs[idx + 1] - CELL_PAD_X * 2);
            },
            () => {
              one[idx] = null;
            }
          )
        );
      }
      imgBoxes.push(one);
    }
    if (jobs.length) await Promise.all(jobs);

    // 数据行高：单元格文字换行数、图片占位、行头换行三者取最大
    measure.font = CELL_FONT;
    const cellLines = [];
    const rowHeadLines = [];
    const rowHs = [];
    for (let r = 0; r < data.rows; r++) {
      const one = [];
      let maxN = 1;
      let minH = data.rowHeights[r];
      for (let c = 0; c < data.cols; c++) {
        const ls = wrapCell(measure, (data.cells[r] || [])[c] || '', colWs[c + 1] - CELL_PAD_X * 2);
        one.push(ls);
        if (ls.length > maxN) maxN = ls.length;
        const box = imgBoxes[r][c];
        if (box) {
          const needH = box.h + CELL_PAD_Y * 2 + ls.length * LINE_H;
          if (needH > minH) minH = needH;
        }
      }
      const rLines = wrapCell(measure, data.rowHeaders[r] || rowName(r), colWs[0] - CELL_PAD_X * 2);
      if (rLines.length > maxN) maxN = rLines.length;
      cellLines.push(one);
      rowHeadLines.push(rLines);
      rowHs.push(Math.max(minH, maxN * LINE_H + CELL_PAD_Y * 2));
    }

    const tableH = headH + rowHs.reduce((a, b) => a + b, 0);
    const H = Math.round(PAD + TITLE_H + META_H + tableH + PAD);

    const canvas = document.createElement('canvas');
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.textBaseline = 'middle';

    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#f2f8fe');
    bg.addColorStop(1, '#d9e8f9');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    const now = new Date();
    ctx.fillStyle = '#4a6fa5';
    ctx.font = 'bold 30px ' + FONT;
    ctx.fillText('📊 表格记录', PAD, PAD + 20);
    ctx.fillStyle = '#8aa5c4';
    ctx.font = '20px ' + FONT;
    ctx.fillText(
      `${data.rows} 行 × ${data.cols} 列 · ${dateKey(now.getTime())} ${pad(now.getHours())}:${pad(
        now.getMinutes()
      )}`,
      PAD,
      PAD + TITLE_H - 10
    );

    const left = PAD;
    const top = PAD + TITLE_H + META_H;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(left, top, tableW, tableH);
    ctx.fillStyle = '#eef4fd';
    ctx.fillRect(left, top, tableW, headH);
    let cy = top + headH;
    for (let r = 0; r < data.rows; r++) {
      ctx.fillRect(left, cy, colWs[0], rowHs[r]);
      cy += rowHs[r];
    }

    // 网格线
    ctx.strokeStyle = '#d8e6f5';
    ctx.lineWidth = 1;
    const xs = [left];
    let cx = left;
    colWs.forEach((w) => {
      cx += w;
      xs.push(cx);
    });
    xs.forEach((px) => {
      const p = Math.round(px) + 0.5;
      ctx.beginPath();
      ctx.moveTo(p, top);
      ctx.lineTo(p, top + tableH);
      ctx.stroke();
    });
    const ys = [top, top + headH];
    let ry = top + headH;
    rowHs.forEach((h) => {
      ry += h;
      ys.push(ry);
    });
    ys.forEach((py) => {
      const p = Math.round(py) + 0.5;
      ctx.beginPath();
      ctx.moveTo(left, p);
      ctx.lineTo(left + tableW, p);
      ctx.stroke();
    });

    const drawLines = (lines, x, y, w, h, color, font, center) => {
      ctx.fillStyle = color;
      ctx.font = font;
      const startY = y + (h - lines.length * LINE_H) / 2 + LINE_H / 2;
      lines.forEach((ln, i) => {
        const tx = center ? x + (w - ctx.measureText(ln).width) / 2 : x + CELL_PAD_X;
        ctx.fillText(ln, tx, startY + i * LINE_H);
      });
    };

    // 格子内容 = 图片（可选） + 文本，整体在格子内垂直居中
    const drawCell = (x, y, w, h, box, lines, color, font, center) => {
      const textH = lines.length * LINE_H;
      let by = y + Math.max(0, (h - ((box ? box.h : 0) + textH)) / 2);
      if (box) {
        ctx.drawImage(box.img, x + (w - box.w) / 2, by, box.w, box.h);
        by += box.h;
      }
      drawLines(lines, x, by, w, textH, color, font, center);
    };

    colHeadLines.forEach((ls, c) => {
      const x = left + colWs.slice(0, c + 1).reduce((a, b) => a + b, 0);
      drawCell(x, top, colWs[c + 1], headH, null, ls, '#6c8cb8', HEAD_FONT, true);
    });

    cy = top + headH;
    for (let r = 0; r < data.rows; r++) {
      drawCell(left, cy, colWs[0], rowHs[r], null, rowHeadLines[r], '#6c8cb8', HEAD_FONT, true);
      let bx = left + colWs[0];
      for (let c = 0; c < data.cols; c++) {
        drawCell(
          bx,
          cy,
          colWs[c + 1],
          rowHs[r],
          imgBoxes[r][c],
          cellLines[r][c],
          '#3b5578',
          CELL_FONT,
          false
        );
        bx += colWs[c + 1];
      }
      cy += rowHs[r];
    }

    ctx.strokeStyle = '#c7dcf3';
    ctx.lineWidth = 2;
    ctx.strokeRect(left + 0.5, top + 0.5, tableW, tableH);

    const url = canvas.toDataURL('image/png');
    imgTitle.textContent = '🖼 表格记录图片';
    imgPreview.src = url;
    imgPreview.alt = '表格记录图片预览';
    imgDownload.href = url;
    imgDownload.download = `表格记录_${dateKey(now.getTime())}_${data.rows}行${data.cols}列.png`;
    imgModal.classList.add('show');
    imgModal.setAttribute('aria-hidden', 'false');
  }

  function copyRecord(id) {
    let text = '';
    if (activeHistoryTab === 'calc') {
      const item = loadCalcHistory().find((it) => it.id === id);
      if (!item) return;
      text = item.content;
    } else {
      const item = loadSheetHistory().find((it) => it.id === id);
      if (!item) return;
      text = item.cells
        .map((row, r) =>
          row
            .map((v, c) => {
              const t = String(v || '');
              const hasImg = !!((item.images || [])[r] || [])[c];
              if (!hasImg) return t;
              return t ? t + ' [图片]' : '[图片]';
            })
            .join('\t')
        )
        .join('\n');
    }
    writeClipboard(text, '✓ 已复制');
  }

  function writeClipboard(text, okMsg) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        () => showToast(okMsg || '✓ 已复制'),
        () => showToast('复制失败')
      );
      return;
    }
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      showToast(okMsg || '✓ 已复制');
    } catch (e) {
      showToast('复制失败');
    }
    document.body.removeChild(ta);
  }

  function exportCSV() {
    const list = loadCalcHistory();
    if (list.length === 0) {
      showToast('没有计算记录可导出');
      return;
    }
    const header = ['时间', '总计', '数字个数', '原始内容'];
    const rows = list.map((it) => [
      new Date(it.time).toLocaleString('zh-CN'),
      it.total,
      (it.nums || []).length,
      String(it.content || '').replace(/"/g, '""'),
    ]);
    downloadCSV([header, ...rows], `计算记录_${dateKey(Date.now())}.csv`);
  }

  function downloadCSV(rows, filename) {
    const csv =
      '\uFEFF' + rows.map((r) => r.map((c) => `"${String(c)}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('✓ CSV 已下载');
  }

  /* ==========================================================
   * 生成计算结果图片
   * ========================================================== */
  function drawRoundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function wrapText(ctx, text, maxWidth) {
    const lines = [];
    let line = '';
    for (const ch of text) {
      if (line && ctx.measureText(line + ch).width > maxWidth) {
        lines.push(line);
        line = ch;
      } else {
        line += ch;
      }
    }
    if (line) lines.push(line);
    return lines;
  }

  // 带换行的文本分行：先按 \n 分段，再逐段按宽度折行
  function wrapCell(ctx, text, maxWidth) {
    const out = [];
    String(text == null ? '' : text)
      .split('\n')
      .forEach((seg) => {
        const ls = wrapText(ctx, seg, maxWidth);
        if (ls.length === 0) out.push('');
        else ls.forEach((l) => out.push(l));
      });
    return out.length ? out : [''];
  }

  function buildResultImage() {
    const nums = autoSumCalc.getNums();
    if (nums.length === 0) {
      showToast('列表是空的，先输入数字吧');
      return;
    }

    const dpr = 2;
    const W = 750;
    const PAD = 44;
    const contentW = W - PAD * 2;
    const total = sumNumbers(nums);
    const now = new Date();

    const expr = nums
      .map((n, i) => {
        const a = formatNum(Math.abs(n));
        if (i === 0) return n < 0 ? '-' + a : a;
        return (n < 0 ? ' - ' : ' + ') + a;
      })
      .join('');

    const measure = document.createElement('canvas').getContext('2d');
    measure.font = '26px -apple-system, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif';
    const exprLines = wrapText(measure, expr, contentW - 48);

    let y = PAD;
    const titleH = 56;
    const dateH = 36;
    const totalBoxH = 130;
    const labelH = 44;
    const exprH = exprLines.length * 40 + 24;
    const footerH = 40;
    const gap = 20;
    const H = PAD + 8 + titleH + dateH + gap + totalBoxH + gap + labelH + exprH + gap + footerH + PAD;

    const canvas = document.createElement('canvas');
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#f2f8fe');
    bg.addColorStop(1, '#d9e8f9');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(150, 190, 240, 0.5)';
    ctx.font = '20px sans-serif';
    [[60, 40], [W - 80, 70], [W - 50, H - 90], [40, H - 50], [W / 2, H - 30]].forEach(([sx, sy]) => {
      ctx.fillText('✦', sx, sy);
    });

    ctx.save();
    ctx.shadowColor = 'rgba(108, 156, 232, 0.25)';
    ctx.shadowBlur = 24;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
    drawRoundRect(ctx, 20, 20, W - 40, H - 40, 26);
    ctx.fill();
    ctx.restore();

    y = PAD + 8;

    ctx.fillStyle = '#4a6fa5';
    ctx.font = 'bold 34px -apple-system, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.fillText('🧮 自动计算小助手', PAD, y + 34);
    y += titleH;

    ctx.fillStyle = '#8aa5c4';
    ctx.font = '22px -apple-system, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.fillText(
      `${dateKey(now.getTime())}  ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`,
      PAD,
      y + 22
    );
    y += dateH + gap;

    const grad = ctx.createLinearGradient(PAD, y, W - PAD, y + totalBoxH);
    grad.addColorStop(0, '#79a8ee');
    grad.addColorStop(1, '#a3c4f5');
    ctx.fillStyle = grad;
    drawRoundRect(ctx, PAD, y, contentW, totalBoxH, 18);
    ctx.fill();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.font = '22px -apple-system, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.fillText('当前总计', PAD + 28, y + 40);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 54px -apple-system, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif';
    const totalText = formatNum(total);
    const tw = ctx.measureText(totalText).width;
    ctx.fillText(totalText, W - PAD - 28 - tw, y + 96);
    y += totalBoxH + gap;

    ctx.fillStyle = '#6c9ce8';
    ctx.font = 'bold 22px -apple-system, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.fillText(`✦ 共 ${nums.length} 个数字`, PAD, y + 24);
    y += labelH;

    ctx.fillStyle = '#3b5578';
    ctx.font = '26px -apple-system, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif';
    exprLines.forEach((ln) => {
      ctx.fillText(ln, PAD + 4, y + 26);
      y += 40;
    });
    y += gap;

    ctx.fillStyle = '#a9c0da';
    ctx.font = '18px -apple-system, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.fillText('来自「自动计算小助手」· 保存图片随时查看', PAD, y + footerH - 12);

    const url = canvas.toDataURL('image/png');
    imgTitle.textContent = '🖼 计算结果图片';
    imgPreview.src = url;
    imgPreview.alt = '计算结果图片预览';
    imgDownload.href = url;
    imgDownload.download = `计算结果_${dateKey(now.getTime())}_总计${totalText.replace(/,/g, '')}.png`;
    imgModal.classList.add('show');
    imgModal.setAttribute('aria-hidden', 'false');
  }

  function closeImgModal() {
    imgModal.classList.remove('show');
    imgModal.setAttribute('aria-hidden', 'true');
  }

  /* ==========================================================
   * 表格数据模型
   * ========================================================== */
  let sheetData = {
    rows: 3,
    cols: 3,
    colWidths: [],
    rowHeights: [],
    cells: [],
    images: [],
    colHeaders: [],
    rowHeaders: [],
  };
  let sheetInner = null;
  let sheetTableBox = null;
  let sheetHandle = null;
  let sheetColEls = [];
  let sheetRowEls = [];
  let activeCell = null; // 当前聚焦的单元格 { r, c }，插图按钮的目标
  let insertTarget = null; // 点「插入图片」时锁定的目标单元格

  const colName = (c) => String.fromCharCode(65 + (c % 26));
  const rowName = (r) => String(r + 1);

  function headerList(d, key, len) {
    const src = Array.isArray(d[key]) ? d[key] : [];
    const out = [];
    for (let i = 0; i < len; i++) {
      const v = src[i];
      out.push(typeof v === 'string' ? v : v == null ? '' : String(v));
    }
    return out;
  }

  function makeCells(rows, cols) {
    const out = [];
    for (let r = 0; r < rows; r++) out.push(new Array(cols).fill(''));
    return out;
  }

  // 单元格图片：合法值为 data:image/... 的字符串，其余一律视为空
  function imageGrid(d, rows, cols) {
    const src = Array.isArray(d.images) ? d.images : [];
    const out = [];
    for (let r = 0; r < rows; r++) {
      const srow = Array.isArray(src[r]) ? src[r] : [];
      const row = [];
      for (let c = 0; c < cols; c++) {
        const v = srow[c];
        row.push(typeof v === 'string' && v.indexOf('data:image/') === 0 ? v : '');
      }
      out.push(row);
    }
    return out;
  }

  function normalizeSheet(d) {
    const fallback = {
      rows: 3,
      cols: 3,
      colWidths: [],
      rowHeights: [],
      cells: makeCells(3, 3),
      images: makeCells(3, 3),
      colHeaders: ['', '', ''],
      rowHeaders: ['', '', ''],
    };
    if (!d || !Array.isArray(d.cells) || d.cells.length === 0) return fallback;

    const rows = clamp(parseInt(d.rows, 10) || d.cells.length, 1, 50);
    const cols = clamp(parseInt(d.cols, 10) || 1, 1, 20);
    const cells = [];
    for (let r = 0; r < rows; r++) {
      const src = Array.isArray(d.cells[r]) ? d.cells[r] : [];
      const row = [];
      for (let c = 0; c < cols; c++) {
        const v = src[c];
        row.push(typeof v === 'string' ? v : v == null ? '' : String(v));
      }
      cells.push(row);
    }

    const colWidths = [];
    for (let c = 0; c < cols; c++) {
      const w = parseInt((Array.isArray(d.colWidths) ? d.colWidths : [])[c], 10);
      colWidths.push(clamp(isNaN(w) ? DEFAULT_COL_W : w, MIN_COL_W, MAX_COL_W));
    }
    const rowHeights = [];
    for (let r = 0; r < rows; r++) {
      const h = parseInt((Array.isArray(d.rowHeights) ? d.rowHeights : [])[r], 10);
      rowHeights.push(clamp(isNaN(h) ? DEFAULT_ROW_H : h, MIN_ROW_H, MAX_ROW_H));
    }

    return {
      rows,
      cols,
      colWidths,
      rowHeights,
      cells,
      images: imageGrid(d, rows, cols),
      colHeaders: headerList(d, 'colHeaders', cols),
      rowHeaders: headerList(d, 'rowHeaders', rows),
    };
  }

  function ensureSizes() {
    const { rows, cols } = sheetData;
    for (let c = sheetData.colWidths.length; c < cols; c++) sheetData.colWidths.push(DEFAULT_COL_W);
    sheetData.colWidths.length = cols;
    for (let r = sheetData.rowHeights.length; r < rows; r++) sheetData.rowHeights.push(DEFAULT_ROW_H);
    sheetData.rowHeights.length = rows;
    for (let c = sheetData.colHeaders.length; c < cols; c++) sheetData.colHeaders.push('');
    sheetData.colHeaders.length = cols;
    for (let r = sheetData.rowHeaders.length; r < rows; r++) sheetData.rowHeaders.push('');
    sheetData.rowHeaders.length = rows;
    if (!Array.isArray(sheetData.images)) sheetData.images = [];
    for (let r = 0; r < rows; r++) {
      if (!Array.isArray(sheetData.images[r])) sheetData.images[r] = [];
      const imgRow = sheetData.images[r];
      for (let c = imgRow.length; c < cols; c++) imgRow.push('');
      imgRow.length = cols;
    }
    sheetData.images.length = rows;
  }

  function loadSheet() {
    let d = readJSON(SHEET_KEY);
    if (!d) {
      // 兼容上一版存在旧 key 的表格数据
      const legacy = readJSON(LEGACY_TABLE_KEY);
      if (legacy && Array.isArray(legacy.cells)) d = legacy;
    }
    return normalizeSheet(d);
  }

  let sheetSaveWarned = false;
  function saveSheet() {
    const ok = writeJSON(SHEET_KEY, {
      rows: sheetData.rows,
      cols: sheetData.cols,
      colWidths: sheetData.colWidths,
      rowHeights: sheetData.rowHeights,
      cells: sheetData.cells,
      images: sheetData.images,
      colHeaders: sheetData.colHeaders,
      rowHeaders: sheetData.rowHeaders,
    });
    if (!ok && !sheetSaveWarned) {
      sheetSaveWarned = true;
      showToast('⚠ 本地空间不足，图片可能没保存上');
    } else if (ok) {
      sheetSaveWarned = false;
    }
    return ok;
  }

  function countFilled() {
    let n = 0;
    sheetData.cells.forEach((row, r) => {
      const imgRow = sheetData.images[r] || [];
      row.forEach((v, c) => {
        if ((v && String(v).trim()) || imgRow[c]) n++;
      });
    });
    return n;
  }

  function updateSheetStatus() {
    const { rows, cols } = sheetData;
    const imgs = countSheetImages();
    sheetStatus.textContent =
      `${rows} 行 × ${cols} 列 · 已填写 ${countFilled()} 格` +
      (imgs ? ` · 含 ${imgs} 张图片` : '') +
      ' · 点单元格输入，回车换行；选中单元格后可点「🖼 插入图片」或直接粘贴图片';
  }

  // 单元格图片：外层 wrap 不可编辑，避免编辑文本时被误删
  function cellImgHTML(url, r, c, readOnly) {
    const del = readOnly
      ? ''
      : `<button class="cell-img-del" data-row="${r}" data-col="${c}" contenteditable="false" title="移除图片">✕</button>`;
    return `<span class="cell-img-wrap${readOnly ? ' ro' : ''}" contenteditable="false">
      <img class="cell-img" src="${url}" alt="单元格图片" draggable="false" />${del}
    </span>`;
  }

  /* ---- 单元格图片：读取文本 / 压缩 / 写入 ---- */
  // 读单元格纯文本：跳过图片块，否则 innerText 会掺进图片占位产生的空行
  function readCellText(td) {
    let out = '';
    const walk = (node) => {
      const kids = node.childNodes;
      for (let i = 0; i < kids.length; i++) {
        const n = kids[i];
        if (n.nodeType === 3) {
          out += n.nodeValue;
        } else if (n.nodeType === 1) {
          if (n.classList && n.classList.contains('cell-img-wrap')) continue;
          if (n.tagName === 'BR') {
            out += '\n';
            continue;
          }
          walk(n);
        }
      }
    };
    walk(td);
    return out.replace(/\u00a0/g, ' ').replace(/\n+$/, '').replace(/\n{3,}/g, '\n\n');
  }

  function loadImage(url) {
    return new Promise((resolve, reject) => {
      const im = new Image();
      im.onload = () => resolve(im);
      im.onerror = () => reject(new Error('image load failed'));
      im.src = url;
    });
  }

  // 压缩为 jpeg dataURL：最长边限 CELL_IMG_MAX，先铺白底（透明图不会变黑）
  function compressImage(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('read failed'));
      reader.onload = () => {
        const im = new Image();
        im.onerror = () => reject(new Error('decode failed'));
        im.onload = () => {
          const scale = Math.min(1, CELL_IMG_MAX / Math.max(im.naturalWidth, im.naturalHeight));
          const w = Math.max(1, Math.round(im.naturalWidth * scale));
          const h = Math.max(1, Math.round(im.naturalHeight * scale));
          const cv = document.createElement('canvas');
          cv.width = w;
          cv.height = h;
          const ctx = cv.getContext('2d');
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, w, h);
          ctx.drawImage(im, 0, 0, w, h);
          resolve(cv.toDataURL('image/jpeg', CELL_IMG_QUALITY));
        };
        im.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  // 写入 / 移除某格图片：只更新这一格，不整表重绘，避免丢焦点
  function setCellImage(r, c, url) {
    if (!sheetData.images[r]) sheetData.images[r] = [];
    sheetData.images[r][c] = url || '';
    const td = sheetTableBox.querySelector(`td[data-row="${r}"][data-col="${c}"]`);
    if (td) {
      const old = td.querySelector('.cell-img-wrap');
      if (old) old.remove();
      if (url) td.insertAdjacentHTML('afterbegin', cellImgHTML(url, r, c, false));
    }
    saveSheet();
    updateSheetStatus();
  }

  function insertCellImage(r, c, file) {
    compressImage(file).then(
      (url) => {
        setCellImage(r, c, url);
        showToast('✓ 图片已插入');
      },
      () => showToast('❌ 图片读取失败，换一张试试')
    );
  }

  // 表格 HTML：编辑态（可改内容 / 增删 / 拖拽）与只读预览态共用
  function sheetTableHTML(data, readOnly) {
    const { rows, cols, colWidths, rowHeights, cells } = data;
    const tableW = CORNER_W + colWidths.reduce((a, b) => a + b, 0);

    let html = `<table class="sheet-table${readOnly ? ' sheet-table-ro' : ''}" style="width:${tableW}px">`;
    html += `<colgroup><col style="width:${CORNER_W}px">`;
    for (let c = 0; c < cols; c++) html += `<col style="width:${colWidths[c]}px">`;
    html += '</colgroup>';

    html += `<thead><tr style="height:${HEAD_H}px"><th class="corner"></th>`;
    for (let c = 0; c < cols; c++) {
      const label = escapeText(data.colHeaders[c] || colName(c));
      html += readOnly
        ? `<th class="col-head"><span class="hd-label">${label}</span></th>`
        : `<th class="col-head" data-col="${c}">
        <span class="hd-label" contenteditable="true" spellcheck="false" data-type="col" data-idx="${c}" title="点一下可直接改表头">${label}</span>
        <button class="ax" data-type="col" data-idx="${c}" title="删除此列">✕</button>
        <span class="col-resizer" data-col="${c}" title="拖动调整列宽"></span>
      </th>`;
    }
    html += '</tr></thead><tbody>';

    for (let r = 0; r < rows; r++) {
      const rowLabel = escapeText(data.rowHeaders[r] || rowName(r));
      html += `<tr style="height:${rowHeights[r]}px">`;
      html += readOnly
        ? `<th class="row-head"><span class="hd-label">${rowLabel}</span></th>`
        : `<th class="row-head" data-row="${r}">
        <span class="hd-label" contenteditable="true" spellcheck="false" data-type="row" data-idx="${r}" title="点一下可直接改表头">${rowLabel}</span>
        <button class="ax" data-type="row" data-idx="${r}" title="删除此行">✕</button>
        <span class="row-resizer" data-row="${r}" title="拖动调整行高"></span>
      </th>`;
      const imgRow = (data.images || [])[r] || [];
      for (let c = 0; c < cols; c++) {
        const v = escapeText((cells[r] || [])[c] || '');
        const url = imgRow[c] || '';
        const imgHtml = url ? cellImgHTML(url, r, c, readOnly) : '';
        html += readOnly
          ? `<td>${imgHtml}${v}</td>`
          : `<td contenteditable="true" data-row="${r}" data-col="${c}">${imgHtml}${v}</td>`;
      }
      html += '</tr>';
    }
    html += '</tbody></table>';

    return { html, tableW };
  }

  function renderSheet() {
    const { rows, cols } = sheetData;
    tblRows.value = rows;
    tblCols.value = cols;

    const { html, tableW } = sheetTableHTML(sheetData, false);

    sheetTableBox.innerHTML = html;
    sheetInner.style.width = tableW + 'px';

    sheetColEls = Array.prototype.slice.call(sheetTableBox.querySelectorAll('colgroup col'), 1);
    sheetRowEls = Array.prototype.slice.call(sheetTableBox.querySelectorAll('tbody tr'));

    updateSheetStatus();
  }

  function buildSheet() {
    const rows = clamp(parseInt(tblRows.value, 10) || 1, 1, 50);
    const cols = clamp(parseInt(tblCols.value, 10) || 1, 1, 20);
    const cells = [];
    const images = [];
    for (let r = 0; r < rows; r++) {
      const row = [];
      const imgRow = [];
      for (let c = 0; c < cols; c++) {
        row.push(((sheetData.cells[r] || [])[c]) || '');
        imgRow.push(((sheetData.images[r] || [])[c]) || '');
      }
      cells.push(row);
      images.push(imgRow);
    }
    sheetData.rows = rows;
    sheetData.cols = cols;
    sheetData.cells = cells;
    sheetData.images = images;
    ensureSizes();
    renderSheet();
    saveSheet();
    showToast(`✓ 表格尺寸已设为 ${rows} 行 × ${cols} 列`);
  }

  function addSheetRow() {
    if (sheetData.rows >= 50) {
      showToast('最多 50 行');
      return false;
    }
    sheetData.cells.push(new Array(sheetData.cols).fill(''));
    sheetData.images.push(new Array(sheetData.cols).fill(''));
    sheetData.rowHeaders.push('');
    sheetData.rows++;
    ensureSizes();
    renderSheet();
    saveSheet();
    return true;
  }

  function addSheetCol() {
    if (sheetData.cols >= 20) {
      showToast('最多 20 列');
      return false;
    }
    sheetData.cells.forEach((row) => row.push(''));
    sheetData.images.forEach((row) => row.push(''));
    sheetData.colHeaders.push('');
    sheetData.cols++;
    ensureSizes();
    renderSheet();
    saveSheet();
    return true;
  }

  function deleteSheetRow(idx) {
    if (sheetData.rows <= 1) {
      showToast('至少保留 1 行');
      return;
    }
    sheetData.cells.splice(idx, 1);
    sheetData.images.splice(idx, 1);
    sheetData.rowHeights.splice(idx, 1);
    sheetData.rowHeaders.splice(idx, 1);
    sheetData.rows--;
    activeCell = null;
    ensureSizes();
    renderSheet();
    saveSheet();
  }

  function deleteSheetCol(idx) {
    if (sheetData.cols <= 1) {
      showToast('至少保留 1 列');
      return;
    }
    sheetData.cells.forEach((row) => row.splice(idx, 1));
    sheetData.images.forEach((row) => row.splice(idx, 1));
    sheetData.colWidths.splice(idx, 1);
    sheetData.colHeaders.splice(idx, 1);
    sheetData.cols--;
    activeCell = null;
    ensureSizes();
    renderSheet();
    saveSheet();
  }

  function clearSheet() {
    if (countFilled() === 0) {
      showToast('表格已经是空的');
      return;
    }
    if (!confirm('确定清空表格里的所有内容（含图片）吗？')) return;
    sheetData.cells = makeCells(sheetData.rows, sheetData.cols);
    sheetData.images = makeCells(sheetData.rows, sheetData.cols);
    activeCell = null;
    renderSheet();
    saveSheet();
    showToast('已清空表格内容');
  }

  function exportSheetCSV() {
    if (countFilled() === 0) {
      showToast('表格是空的，没有可导出的内容');
      return;
    }
    const rows = [[''].concat(sheetData.colHeaders.map((v, c) => v || colName(c)))];
    sheetData.cells.forEach((row, r) => {
      const imgRow = sheetData.images[r] || [];
      rows.push(
        [sheetData.rowHeaders[r] || rowName(r)].concat(
          row.map((v, c) => sheetCellText(v, !!imgRow[c]))
        )
      );
    });
    downloadCSV(rows, `表格_${dateKey(Date.now())}.csv`);
  }

  /* ==========================================================
   * 表格交互：输入 / 换行 / 粘贴 / 拖拽尺寸 / 手柄增行列
   * ========================================================== */
  function initSheetInteraction() {
    function headerArr(el) {
      return el.dataset.type === 'col' ? sheetData.colHeaders : sheetData.rowHeaders;
    }

    function commitHeader(el) {
      const idx = parseInt(el.dataset.idx, 10);
      const arr = headerArr(el);
      if (isNaN(idx) || !arr) return;
      arr[idx] = readText(el);
    }

    sheetTableBox.addEventListener('input', (e) => {
      const el = e.target;
      if (el.classList && el.classList.contains('hd-label')) {
        commitHeader(el);
        saveSheet();
        return;
      }
      const td = el;
      if (td.tagName !== 'TD') return;
      const r = parseInt(td.dataset.row, 10);
      const c = parseInt(td.dataset.col, 10);
      if (isNaN(r) || isNaN(c) || !sheetData.cells[r]) return;
      sheetData.cells[r][c] = readCellText(td);
      saveSheet();
      updateSheetStatus();
    });

    sheetTableBox.addEventListener('keydown', (e) => {
      const el = e.target;
      if (el.classList && el.classList.contains('hd-label')) {
        if (e.key === 'Enter') {
          e.preventDefault();
          document.execCommand('insertLineBreak');
          commitHeader(el);
          saveSheet();
        }
        return;
      }
      if (el.tagName !== 'TD') return;
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        document.execCommand('insertLineBreak');
        sheetData.cells[parseInt(el.dataset.row, 10)][parseInt(el.dataset.col, 10)] =
          readCellText(el);
        saveSheet();
        updateSheetStatus();
      } else if (e.key === 'Tab') {
        e.preventDefault();
        const td = el;
        const r = parseInt(td.dataset.row, 10);
        const c = parseInt(td.dataset.col, 10);
        const next = sheetTableBox.querySelector(
          `td[data-row="${r}"][data-col="${e.shiftKey ? c - 1 : c + 1}"]`
        );
        if (next) next.focus();
      }
    });

    // 表头失焦：空内容回落默认列字母 / 行号
    sheetTableBox.addEventListener(
      'blur',
      (e) => {
        const el = e.target;
        if (!el.classList || !el.classList.contains('hd-label')) return;
        commitHeader(el);
        const idx = parseInt(el.dataset.idx, 10);
        if (!readText(el).trim()) {
          el.textContent = el.dataset.type === 'col' ? colName(idx) : rowName(idx);
        }
        saveSheet();
      },
      true
    );

    sheetTableBox.addEventListener('paste', (e) => {
      const el = e.target;
      if (el.classList && el.classList.contains('hd-label')) {
        e.preventDefault();
        const t = (e.clipboardData || window.clipboardData)
          .getData('text')
          .replace(/\r?\n/g, ' ');
        document.execCommand('insertText', false, t);
        return;
      }
      const td = el;
      if (td.tagName !== 'TD') return;
      const dt = e.clipboardData || window.clipboardData;
      const items = dt && dt.items ? Array.prototype.slice.call(dt.items) : [];
      const imgItem = items.find(
        (it) => it.kind === 'file' && it.type && it.type.indexOf('image/') === 0
      );
      if (imgItem) {
        // 粘贴剪贴板里的图片 → 插到当前单元格
        e.preventDefault();
        const file = imgItem.getAsFile();
        const r = parseInt(td.dataset.row, 10);
        const c = parseInt(td.dataset.col, 10);
        if (file && !isNaN(r) && !isNaN(c)) insertCellImage(r, c, file);
        else showToast('❌ 读不到这张图片');
        return;
      }
      e.preventDefault();
      const text = dt.getData('text').replace(/\r\n/g, '\n').replace(/\n+$/, '');
      document.execCommand('insertText', false, text);
    });

    sheetTableBox.addEventListener('focusin', (e) => {
      const td = e.target;
      if (td.tagName !== 'TD') return;
      const r = parseInt(td.dataset.row, 10);
      const c = parseInt(td.dataset.col, 10);
      if (!isNaN(r) && !isNaN(c)) activeCell = { r, c };
    });

    // 点单元格任意位置（含图片、删除角标）都记为当前单元格
    sheetTableBox.addEventListener('pointerdown', (e) => {
      const td = e.target.closest('td');
      if (!td) return;
      const r = parseInt(td.dataset.row, 10);
      const c = parseInt(td.dataset.col, 10);
      if (!isNaN(r) && !isNaN(c)) activeCell = { r, c };
    });

    sheetTableBox.addEventListener('click', (e) => {
      const delImg = e.target.closest('.cell-img-del');
      if (delImg) {
        e.preventDefault();
        const r = parseInt(delImg.dataset.row, 10);
        const c = parseInt(delImg.dataset.col, 10);
        if (!isNaN(r) && !isNaN(c)) {
          setCellImage(r, c, '');
          showToast('已移除图片');
        }
        return;
      }
      const btn = e.target.closest('.ax');
      if (!btn) return;
      const idx = parseInt(btn.dataset.idx, 10);
      if (isNaN(idx)) return;
      if (btn.dataset.type === 'row') deleteSheetRow(idx);
      else deleteSheetCol(idx);
    });

    // ---- 列宽 / 行高拖拽 ----
    let mode = null;
    let dragIdx = 0;
    let startX = 0;
    let startY = 0;
    let startSize = 0;

    sheetWrap.addEventListener('pointerdown', (e) => {
      const colR = e.target.closest('.col-resizer');
      const rowR = e.target.closest('.row-resizer');
      if (!colR && !rowR) return;
      if (e.button) return;
      if (colR) {
        mode = 'col';
        dragIdx = parseInt(colR.dataset.col, 10);
        startX = e.clientX;
        startSize = sheetData.colWidths[dragIdx];
      } else {
        mode = 'row';
        dragIdx = parseInt(rowR.dataset.row, 10);
        startY = e.clientY;
        startSize = sheetData.rowHeights[dragIdx];
      }
      e.preventDefault();
      document.body.classList.add('resizing');
    });

    document.addEventListener('pointermove', (e) => {
      if (!mode) return;
      if (mode === 'col') {
        const w = clamp(Math.round(startSize + (e.clientX - startX)), MIN_COL_W, MAX_COL_W);
        sheetData.colWidths[dragIdx] = w;
        const col = sheetColEls[dragIdx];
        if (col) col.style.width = w + 'px';
        sheetInner.style.width =
          CORNER_W + sheetData.colWidths.reduce((a, b) => a + b, 0) + 'px';
      } else {
        const h = clamp(Math.round(startSize + (e.clientY - startY)), MIN_ROW_H, MAX_ROW_H);
        sheetData.rowHeights[dragIdx] = h;
        const tr = sheetRowEls[dragIdx];
        if (tr) tr.style.height = h + 'px';
      }
    });

    document.addEventListener('pointerup', () => {
      if (!mode) return;
      mode = null;
      document.body.classList.remove('resizing');
      saveSheet();
      updateSheetStatus();
    });

    // ---- 右下角手柄：右拖加列 / 下拖加行 ----
    let handleActive = false;
    let lastX = 0;
    let lastY = 0;
    let accX = 0;
    let accY = 0;
    const STEP = 52;

    sheetHandle.addEventListener('pointerdown', (e) => {
      if (e.button) return;
      handleActive = true;
      lastX = e.clientX;
      lastY = e.clientY;
      accX = 0;
      accY = 0;
      e.preventDefault();
      sheetHandle.setPointerCapture(e.pointerId);
      sheetHandle.classList.add('active');
      document.body.classList.add('resizing');
    });

    sheetHandle.addEventListener('pointermove', (e) => {
      if (!handleActive) return;
      accX += e.clientX - lastX;
      accY += e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      while (accX >= STEP) {
        accX -= STEP;
        if (!addSheetCol()) break;
      }
      while (accY >= STEP) {
        accY -= STEP;
        if (!addSheetRow()) break;
      }
    });

    function endHandle() {
      if (!handleActive) return;
      handleActive = false;
      sheetHandle.classList.remove('active');
      document.body.classList.remove('resizing');
    }
    sheetHandle.addEventListener('pointerup', endHandle);
    sheetHandle.addEventListener('pointercancel', endHandle);
  }

  /* ==========================================================
   * 悬浮键盘计算器
   * ========================================================== */
  let calcValue = '';
  let calcJustEvaluated = false;
  let calcLastResult = 0;

  const calcGlyph = (s) => s.replace(/\*/g, '×').replace(/\//g, '÷').replace(/-/g, '−');
  const calcTrim = (n) => Number(n.toPrecision(12));

  function calcEval(input) {
    const s = (input || '').replace(/\s+/g, '');
    if (!s || !/^[-+*/0-9.]+$/.test(s)) return null;
    const clean = s.replace(/[-+*/]+$/, '');
    if (!clean) return null;

    const tokens = clean.match(/\d+\.?\d*|\.\d+|[+\-*/]/g);
    if (!tokens) return null;

    const prec = { '+': 1, '-': 1, '*': 2, '/': 2 };
    const out = [];
    const ops = [];
    let prev = null;

    for (const t of tokens) {
      if (/^[\d.]/.test(t)) {
        out.push(parseFloat(t));
      } else {
        const isUnary = prev === null || prec[prev] !== undefined;
        if (isUnary && (t === '-' || t === '+')) {
          if (t === '-') {
            out.push(-1);
            ops.push('*');
          }
        } else {
          while (ops.length && prec[ops[ops.length - 1]] >= prec[t]) out.push(ops.pop());
          ops.push(t);
        }
      }
      prev = t;
    }
    while (ops.length) out.push(ops.pop());

    const st = [];
    for (const t of out) {
      if (typeof t === 'number') {
        st.push(t);
        continue;
      }
      const b = st.pop();
      const a = st.pop();
      if (a === undefined || b === undefined) return null;
      if (t === '+') st.push(a + b);
      else if (t === '-') st.push(a - b);
      else if (t === '*') st.push(a * b);
      else st.push(b === 0 ? NaN : a / b);
    }
    if (st.length !== 1 || !isFinite(st[0])) return null;
    return calcTrim(st[0]);
  }

  function renderCalc(showError) {
    calcExpr.textContent = calcValue ? calcGlyph(calcValue) : '0';
    if (showError) {
      calcResult.textContent = '错误';
      return;
    }
    const v = calcEval(calcValue);
    if (v !== null) calcLastResult = v;
    calcResult.textContent = formatNum(calcLastResult);
  }

  function toggleCalcSign() {
    const m = calcValue.match(/(\d+\.?\d*|\.\d+)$/);
    if (!m) {
      if (!calcValue) calcValue = '-';
      return;
    }
    const before = calcValue.slice(0, calcValue.length - m[0].length);
    if (before.endsWith('-')) {
      const prev = before.slice(0, -1);
      if (prev === '' || /[+\-*/]$/.test(prev)) {
        calcValue = prev + m[0];
        return;
      }
    }
    calcValue = before + '-' + m[0];
  }

  function handleCalcKey(k) {
    if (k === 'C') {
      calcValue = '';
      calcJustEvaluated = false;
      calcLastResult = 0;
      renderCalc();
      return;
    }

    if (k === 'back') {
      if (calcJustEvaluated) {
        calcValue = '';
        calcJustEvaluated = false;
      } else {
        calcValue = calcValue.slice(0, -1);
      }
      renderCalc();
      return;
    }

    if (k === '=') {
      const v = calcEval(calcValue);
      if (v === null) {
        renderCalc(true);
        showToast('⚠ 算式不完整');
        return;
      }
      calcValue = String(v);
      calcLastResult = v;
      calcJustEvaluated = true;
      renderCalc();
      return;
    }

    if (k === 'neg') {
      if (calcJustEvaluated) {
        calcValue = '-' + calcValue;
        calcJustEvaluated = false;
      } else {
        toggleCalcSign();
      }
      renderCalc();
      return;
    }

    if (k === '.' || (k >= '0' && k <= '9')) {
      if (calcJustEvaluated) {
        calcValue = '';
        calcJustEvaluated = false;
      }
      if (k === '.') {
        const m = calcValue.match(/(\d*\.?\d*)$/);
        const cur = m ? m[1] : '';
        if (cur.includes('.')) return;
        if (!cur) calcValue += '0';
      }
      calcValue += k;
      renderCalc();
      return;
    }

    if (k === '+' || k === '-' || k === '*' || k === '/') {
      calcJustEvaluated = false;
      if (!calcValue) {
        if (k === '-') {
          calcValue = '-';
          renderCalc();
        }
        return;
      }
      if (/[+\-*/]$/.test(calcValue)) calcValue = calcValue.slice(0, -1) + k;
      else calcValue += k;
      renderCalc();
    }
  }

  function openCalc() {
    floatCalc.classList.add('show');
    floatCalc.setAttribute('aria-hidden', 'false');
    renderCalc();
  }

  function closeCalc() {
    floatCalc.classList.remove('show');
    floatCalc.setAttribute('aria-hidden', 'true');
  }

  function toggleCalc() {
    if (floatCalc.classList.contains('show')) closeCalc();
    else openCalc();
  }

  function openFloatSum() {
    floatSum.classList.add('show');
    floatSum.setAttribute('aria-hidden', 'false');
    autoSumSum.render();
  }

  function closeFloatSum() {
    floatSum.classList.remove('show');
    floatSum.setAttribute('aria-hidden', 'true');
  }

  function toggleFloatSum() {
    if (floatSum.classList.contains('show')) closeFloatSum();
    else openFloatSum();
  }

  /* ==========================================================
   * 悬浮面板拖动 / 位置记忆
   * ========================================================== */
  function initFloatDrag(panel, header, posKey) {
    let drag = null;

    header.addEventListener('pointerdown', (e) => {
      if (e.target.closest('.float-close')) return;
      if (e.button) return;
      const rect = panel.getBoundingClientRect();
      panel.style.left = rect.left + 'px';
      panel.style.top = rect.top + 'px';
      panel.style.right = 'auto';
      panel.style.bottom = 'auto';
      drag = { dx: e.clientX - rect.left, dy: e.clientY - rect.top };
      panel.classList.add('dragging');
      header.setPointerCapture(e.pointerId);
      e.preventDefault();
    });

    header.addEventListener('pointermove', (e) => {
      if (!drag) return;
      const w = panel.offsetWidth;
      const h = panel.offsetHeight;
      const left = clamp(e.clientX - drag.dx, 4, Math.max(4, window.innerWidth - w - 4));
      const top = clamp(e.clientY - drag.dy, 4, Math.max(4, window.innerHeight - h - 4));
      panel.style.left = left + 'px';
      panel.style.top = top + 'px';
    });

    function endDrag() {
      if (!drag) return;
      drag = null;
      panel.classList.remove('dragging');
      writeJSON(posKey, { left: panel.style.left, top: panel.style.top });
    }

    header.addEventListener('pointerup', endDrag);
    header.addEventListener('pointercancel', endDrag);
  }

  function restoreFloatPos(panel, posKey) {
    const pos = readJSON(posKey);
    if (!pos || typeof pos.left !== 'string' || typeof pos.top !== 'string') return;
    if (!pos.left || !pos.top) return;
    panel.style.left = pos.left;
    panel.style.top = pos.top;
    panel.style.right = 'auto';
    panel.style.bottom = 'auto';
  }

  /* ==========================================================
   * 视图切换
   * ========================================================== */
  function switchView(name) {
    const view = name === 'table' ? 'table' : 'calc';
    viewCalc.hidden = view !== 'calc';
    viewTable.hidden = view !== 'table';
    navCalc.classList.toggle('active', view === 'calc');
    navTable.classList.toggle('active', view === 'table');
    writeJSON(VIEW_KEY, view);

    if (view === 'table') {
      updateSheetStatus();
      if (!floatSum.classList.contains('show')) openFloatSum();
    }
  }

  /* ==========================================================
   * 组件实例
   * ========================================================== */
  const autoSumCalc = createAutoSum({
    input: numInput,
    chipArea: chipArea,
    totalEl: totalValue,
    countEl: countNum,
    subEl: subTotal,
    emptyText: '还没有数字，输一个试试吧',
    onSave: () => addCalcRecord(autoSumCalc.getNums()),
  });

  const autoSumSum = createAutoSum({
    input: sumInput,
    chipArea: sumChips,
    totalEl: sumTotal,
    countEl: sumCount,
    subEl: sumSub,
    emptyText: '还没有数字，输一个试试吧',
    onSave: () => addCalcRecord(autoSumSum.getNums()),
  });

  /* ==========================================================
   * 事件绑定
   * ========================================================== */
  function bindEvents() {
    navCalc.addEventListener('click', () => switchView('calc'));
    navTable.addEventListener('click', () => switchView('table'));

    btnAddOne.addEventListener('click', () => {
      autoSumCalc.clearIdle();
      autoSumCalc.add();
    });

    btnSave.addEventListener('click', () => {
      autoSumCalc.clearIdle();
      addCalcRecord(autoSumCalc.getNums());
    });

    btnClearInput.addEventListener('click', () => {
      if (autoSumCalc.clear()) showToast('已清空列表');
    });

    btnExport.addEventListener('click', exportCSV);
    btnImage.addEventListener('click', () => {
      autoSumCalc.clearIdle();
      buildResultImage();
    });
    btnHistoryCalc.addEventListener('click', () => openHistory('calc'));
    btnCalcOpen.addEventListener('click', toggleCalc);

    imgClose.addEventListener('click', closeImgModal);
    imgCancel.addEventListener('click', closeImgModal);
    imgModal.addEventListener('click', (e) => {
      if (e.target === imgModal) closeImgModal();
    });

    // ---- 表格模块 ----
    btnBuildTable.addEventListener('click', buildSheet);
    btnAddRow.addEventListener('click', addSheetRow);
    btnAddCol.addEventListener('click', addSheetCol);
    btnInsertImg.addEventListener('click', () => {
      if (!activeCell) {
        showToast('先点一下要放图片的单元格');
        return;
      }
      insertTarget = { r: activeCell.r, c: activeCell.c };
      cellImgInput.value = '';
      cellImgInput.click();
    });
    cellImgInput.addEventListener('change', () => {
      const f = cellImgInput.files && cellImgInput.files[0];
      const target = insertTarget || activeCell;
      if (f && target) insertCellImage(target.r, target.c, f);
      insertTarget = null;
    });
    btnSaveSheet.addEventListener('click', addSheetRecord);
    btnTableExport.addEventListener('click', exportSheetCSV);
    btnTableClear.addEventListener('click', clearSheet);
    btnHistorySheet.addEventListener('click', () => openHistory('sheet'));
    btnSumOpen.addEventListener('click', toggleFloatSum);
    btnCalcOpen2.addEventListener('click', toggleCalc);

    // ---- 悬浮累加窗 ----
    floatSumClose.addEventListener('click', closeFloatSum);
    btnSumAdd.addEventListener('click', () => {
      autoSumSum.clearIdle();
      autoSumSum.add();
    });
    btnSumSave.addEventListener('click', () => {
      autoSumSum.clearIdle();
      addCalcRecord(autoSumSum.getNums());
    });
    btnSumClear.addEventListener('click', () => {
      if (autoSumSum.clear()) showToast('已清空列表');
    });

    // ---- 悬浮计算器 ----
    floatCalcClose.addEventListener('click', closeCalc);
    calcKeys.addEventListener('click', (e) => {
      const key = e.target.closest('.ck');
      if (key) handleCalcKey(key.dataset.k);
    });

    // ---- 历史弹窗 ----
    tabCalc.addEventListener('click', () => renderHistory('calc'));
    tabSheet.addEventListener('click', () => renderHistory('sheet'));
    modalClose.addEventListener('click', closeHistory);
    btnClearAll.addEventListener('click', clearCurrentHistory);
    historyModal.addEventListener('click', (e) => {
      if (e.target === historyModal) closeHistory();
    });
    historyList.addEventListener('click', (e) => {
      const item = e.target.closest('.history-item');
      if (!item) return;
      const id = item.dataset.id;
      if (e.target.classList.contains('del-btn')) deleteRecord(id);
      else if (e.target.classList.contains('restore-btn')) restoreRecord(id);
      else if (e.target.classList.contains('copy-btn')) copyRecord(id);
      else if (e.target.classList.contains('view-btn')) openSheetView(id);
      else if (item.classList.contains('sheet-item') && !e.target.closest('.history-item-actions')) {
        // 点表格记录卡片本体 → 查看完整表格
        openSheetView(id);
      }
    });

    // 表格记录详情
    sheetViewClose.addEventListener('click', closeSheetView);
    sheetViewImg.addEventListener('click', () => {
      if (sheetViewRecord) buildSheetImage(sheetViewRecord);
    });
    sheetViewRestore.addEventListener('click', restoreFromView);
    sheetViewModal.addEventListener('click', (e) => {
      if (e.target === sheetViewModal) closeSheetView();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      if (imgModal.classList.contains('show')) closeImgModal();
      if (sheetViewModal.classList.contains('show')) closeSheetView();
      if (historyModal.classList.contains('show')) closeHistory();
      if (floatCalc.classList.contains('show')) closeCalc();
    });
  }

  /* ==========================================================
   * 初始化
   * ========================================================== */
  function init() {
    sheetWrap.innerHTML =
      '<div class="sheet-inner" id="sheetInner">' +
      '<div id="sheetTableBox"></div>' +
      '<div class="sheet-handle" id="sheetHandle" title="向右拖加列 · 向下拖加行">⇲</div>' +
      '</div>';
    sheetInner = document.getElementById('sheetInner');
    sheetTableBox = document.getElementById('sheetTableBox');
    sheetHandle = document.getElementById('sheetHandle');

    sheetData = loadSheet();
    ensureSizes();
    renderSheet();
    initSheetInteraction();

    restoreFloatPos(floatCalc, CALC_POS_KEY);
    restoreFloatPos(floatSum, SUM_POS_KEY);
    renderCalc();

    autoSumCalc.render();
    autoSumSum.render();
    refreshBadges();

    bindEvents();
    initFloatDrag(floatCalc, floatCalcHeader, CALC_POS_KEY);
    initFloatDrag(floatSum, floatSumHeader, SUM_POS_KEY);

    switchView(readJSON(VIEW_KEY) === 'table' ? 'table' : 'calc');

    // 计算模块下自动聚焦输入框（表格模块不聚焦，避免移动端弹出键盘）
    if (!viewCalc.hidden) numInput.focus();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
