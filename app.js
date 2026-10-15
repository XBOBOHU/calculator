(function () {
  const STORAGE_KEY = 'autocalc_history_v1';

  const numInput = document.getElementById('numInput');
  const totalValue = document.getElementById('totalValue');
  const countNum = document.getElementById('countNum');
  const subTotal = document.getElementById('subTotal');
  const chipArea = document.getElementById('chipArea');
  const historyList = document.getElementById('historyList');
  const historyCount = document.getElementById('historyCount');
  const toast = document.getElementById('toast');
  const historyModal = document.getElementById('historyModal');
  const btnHistory = document.getElementById('btnHistory');
  const modalClose = document.getElementById('modalClose');
  const fabBadge = document.getElementById('fabBadge');

  const btnAddOne = document.getElementById('btnAddOne');
  const btnSave = document.getElementById('btnSave');
  const btnClearInput = document.getElementById('btnClearInput');
  const btnClearAll = document.getElementById('btnClearAll');
  const btnExport = document.getElementById('btnExport');
  const btnImage = document.getElementById('btnImage');
  const imgModal = document.getElementById('imgModal');
  const imgClose = document.getElementById('imgClose');
  const imgCancel = document.getElementById('imgCancel');
  const imgPreview = document.getElementById('imgPreview');
  const imgDownload = document.getElementById('imgDownload');

  let chips = [];
  let idleTimer = null;
  let isComposing = false;

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 1800);
  }

  function parseNumbers(text) {
    if (!text || !text.trim()) return [];
    const cleaned = text.replace(/\b\d{1,3}(?:,\d{3})+\b/g, (m) => m.replace(/,/g, ''));
    const re = /-?\d+(?:\.\d+)?/g;
    const matches = cleaned.match(re);
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

  function renderChips() {
    const total = sumNumbers(chips);
    totalValue.textContent = formatNum(total);
    countNum.textContent = chips.length;
    subTotal.textContent = formatNum(total);

    if (chips.length === 0) {
      chipArea.innerHTML = '<span class="chip-empty">还没有数字，输一个试试吧</span>';
      return;
    }

    chipArea.innerHTML = chips
      .map(
        (n, i) =>
          `<span class="chip ${n < 0 ? 'neg' : ''}" data-idx="${i}">
            ${formatNum(n)}
            <button class="chip-del" data-idx="${i}" title="删除">✕</button>
          </span>`
      )
      .join('');
  }

  function addOne(raw, silent) {
    const text = (raw ?? numInput.value).trim();
    if (!text) return false;

    const nums = parseNumbers(text);
    if (nums.length === 0) {
      if (!silent) showToast('❌ 没识别到有效数字');
      return false;
    }

    chips.push(...nums);
    renderChips();

    if (raw === undefined) {
      numInput.value = '';
      numInput.focus();
    }
    return true;
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

  function loadHistory() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveHistory(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  function escapeHtml(s) {
    const div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML.replace(/\n/g, ' ↵ ');
  }

  function renderHistory() {
    const list = loadHistory();
    historyCount.textContent = list.length + ' 条';
    fabBadge.textContent = list.length;

    if (list.length === 0) {
      historyList.innerHTML = '<p class="empty-tip">还没有记录，输入数字后点击"保存为记录"吧</p>';
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
              .map(
                (it) => `
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
              )
              .join('')}
          </div>
        `;
      })
      .join('');
  }

  function openHistory() {
    historyModal.classList.add('show');
    historyModal.setAttribute('aria-hidden', 'false');
  }

  function closeHistory() {
    historyModal.classList.remove('show');
    historyModal.setAttribute('aria-hidden', 'true');
    numInput.focus();
  }

  function addRecord() {
    if (chips.length === 0) {
      showToast('列表是空的');
      return;
    }
    const list = loadHistory();
    const content = chips.join(', ');
    list.unshift({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      content: content,
      nums: chips.slice(),
      total: sumNumbers(chips),
      time: Date.now(),
    });
    saveHistory(list);
    renderHistory();
    showToast('✓ 已保存');
  }

  function deleteRecord(id) {
    if (!confirm('确定删除这条记录吗？')) return;
    const list = loadHistory().filter((it) => it.id !== id);
    saveHistory(list);
    renderHistory();
    showToast('已删除');
  }

  function restoreRecord(id) {
    const list = loadHistory();
    const item = list.find((it) => it.id === id);
    if (!item) return;
    chips = item.nums.slice();
    renderChips();
    numInput.value = '';
    closeHistory();
    showToast('已恢复到列表');
  }

  function copyContent(id) {
    const list = loadHistory();
    const item = list.find((it) => it.id === id);
    if (!item) return;
    navigator.clipboard.writeText(item.content).then(
      () => showToast('✓ 已复制'),
      () => showToast('复制失败')
    );
  }

  function clearAll() {
    const list = loadHistory();
    if (list.length === 0) {
      showToast('当前没有记录');
      return;
    }
    if (!confirm('⚠ 确定要清空所有历史记录吗？此操作无法撤销！')) return;
    saveHistory([]);
    renderHistory();
    showToast('已清空');
  }

  function exportCSV() {
    const list = loadHistory();
    if (list.length === 0) {
      showToast('没有记录可导出');
      return;
    }
    const header = ['时间', '总计', '数字个数', '原始内容'];
    const rows = list.map((it) => [
      new Date(it.time).toLocaleString('zh-CN'),
      it.total,
      it.nums.length,
      it.content.replace(/"/g, '""'),
    ]);
    const csv =
      '\uFEFF' +
      [header, ...rows]
        .map((r) => r.map((c) => `"${c}"`).join(','))
        .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `计算记录_${dateKey(Date.now())}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('✓ CSV 已下载');
  }

  /* ============ 生成计算结果图片 ============ */
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

  function buildResultImage() {
    if (chips.length === 0) {
      showToast('列表是空的，先输入数字吧');
      return;
    }

    const dpr = 2;
    const W = 750;
    const PAD = 44;
    const contentW = W - PAD * 2;
    const total = sumNumbers(chips);
    const now = new Date();

    // 拼算式：负数显示为 " - 3"，正数显示为 " + 3"
    const expr = chips
      .map((n, i) => {
        const a = formatNum(Math.abs(n));
        if (i === 0) return n < 0 ? '-' + a : a;
        return (n < 0 ? ' - ' : ' + ') + a;
      })
      .join('');

    // 先用临时 context 量算换行，再确定画布高度
    const measure = document.createElement('canvas').getContext('2d');
    measure.font = '26px -apple-system, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif';
    const exprLines = wrapText(measure, expr, contentW - 48);

    let y = PAD;
    const titleH = 56;   // 标题
    const dateH = 36;    // 日期
    const totalBoxH = 130; // 总计卡片
    const labelH = 44;   // "计算算式" 小标题
    const exprH = exprLines.length * 40 + 24;
    const footerH = 40;
    const gap = 20;
    const cardH = titleH + dateH + totalBoxH + labelH + exprH + footerH + gap * 5 + PAD;
    const H = cardH;

    const canvas = document.createElement('canvas');
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    // 背景：淡蓝渐变 + 装饰星星
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

    // 白色圆角卡片
    ctx.save();
    ctx.shadowColor = 'rgba(108, 156, 232, 0.25)';
    ctx.shadowBlur = 24;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
    drawRoundRect(ctx, 20, 20, W - 40, H - 40, 26);
    ctx.fill();
    ctx.restore();

    y = PAD + 8;

    // 标题
    ctx.fillStyle = '#4a6fa5';
    ctx.font = 'bold 34px -apple-system, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.fillText('🧮 自动计算小助手', PAD, y + 34);
    y += titleH;

    // 日期
    ctx.fillStyle = '#8aa5c4';
    ctx.font = '22px -apple-system, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.fillText(
      `${dateKey(now.getTime())}  ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`,
      PAD, y + 22
    );
    y += dateH + gap;

    // 总计卡片（蓝色渐变）
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

    // 算式区
    ctx.fillStyle = '#6c9ce8';
    ctx.font = 'bold 22px -apple-system, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.fillText(`✦ 共 ${chips.length} 个数字`, PAD, y + 24);
    y += labelH;

    ctx.fillStyle = '#3b5578';
    ctx.font = '26px -apple-system, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif';
    exprLines.forEach((ln) => {
      ctx.fillText(ln, PAD + 4, y + 26);
      y += 40;
    });
    y += gap;

    // 页脚
    ctx.fillStyle = '#a9c0da';
    ctx.font = '18px -apple-system, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.fillText('来自「自动计算小助手」· 保存图片随时查看', PAD, y + footerH - 12);

    const url = canvas.toDataURL('image/png');
    imgPreview.src = url;
    imgDownload.href = url;
    imgDownload.download = `计算结果_${dateKey(now.getTime())}_总计${totalText.replace(/,/g, '')}.png`;
    imgModal.classList.add('show');
    imgModal.setAttribute('aria-hidden', 'false');
  }

  function closeImgModal() {
    imgModal.classList.remove('show');
    imgModal.setAttribute('aria-hidden', 'true');
  }

  function bindEvents() {
    function clearIdleTimer() {
      if (idleTimer !== null) {
        clearTimeout(idleTimer);
        idleTimer = null;
      }
    }

    function resetIdleTimer() {
      clearIdleTimer();
      if (isComposing) return;
      idleTimer = setTimeout(() => {
        if (numInput.value.trim()) {
          addOne(undefined, true);
        }
      }, 450);
    }

    numInput.addEventListener('compositionstart', () => {
      isComposing = true;
      clearIdleTimer();
    });

    numInput.addEventListener('compositionend', () => {
      isComposing = false;
      if (numInput.value.trim()) {
        addOne(undefined, true);
      }
    });

    numInput.addEventListener('input', () => {
      resetIdleTimer();
    });

    numInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        clearIdleTimer();
        addOne();
      } else if (e.key === ' ' || e.key === ',' || e.key === 'Tab') {
        e.preventDefault();
        clearIdleTimer();
        addOne();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        clearIdleTimer();
        addRecord();
      }
    });

    numInput.addEventListener('paste', (e) => {
      clearIdleTimer();
      const text = (e.clipboardData || window.clipboardData).getData('text');
      if (!text || !text.trim()) return;
      const nums = parseNumbers(text);
      if (nums.length <= 1) return;

      e.preventDefault();
      chips.push(...nums);
      renderChips();
      numInput.value = '';
      showToast(`✓ 粘贴识别了 ${nums.length} 个数字`);
    });

    btnAddOne.addEventListener('click', () => {
      clearIdleTimer();
      addOne();
    });

    chipArea.addEventListener('click', (e) => {
      clearIdleTimer();
      const target = e.target;
      if (!target.classList.contains('chip-del')) return;
      const idx = parseInt(target.dataset.idx, 10);
      if (!isNaN(idx) && idx >= 0) {
        chips.splice(idx, 1);
        renderChips();
      }
    });

    btnSave.addEventListener('click', () => {
      clearIdleTimer();
      addRecord();
    });
    btnClearInput.addEventListener('click', () => {
      clearIdleTimer();
      if (chips.length === 0) {
        showToast('列表已经是空的');
        return;
      }
      chips = [];
      renderChips();
      numInput.focus();
      showToast('已清空列表');
    });
    btnClearAll.addEventListener('click', () => {
      clearIdleTimer();
      clearAll();
    });
    btnExport.addEventListener('click', () => {
      clearIdleTimer();
      exportCSV();
    });

    btnImage.addEventListener('click', () => {
      clearIdleTimer();
      buildResultImage();
    });

    imgClose.addEventListener('click', closeImgModal);
    imgCancel.addEventListener('click', closeImgModal);
    imgModal.addEventListener('click', (e) => {
      if (e.target === imgModal) closeImgModal();
    });

    historyList.addEventListener('click', (e) => {
      clearIdleTimer();
      const item = e.target.closest('.history-item');
      if (!item) return;
      const id = item.dataset.id;
      if (e.target.classList.contains('del-btn')) deleteRecord(id);
      else if (e.target.classList.contains('restore-btn')) restoreRecord(id);
      else if (e.target.classList.contains('copy-btn')) copyContent(id);
    });

    btnHistory.addEventListener('click', () => {
      openHistory();
    });

    modalClose.addEventListener('click', closeHistory);
    historyModal.addEventListener('click', (e) => {
      if (e.target === historyModal) closeHistory();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (imgModal.classList.contains('show')) closeImgModal();
        if (historyModal.classList.contains('show')) closeHistory();
      }
    });
  }

  function init() {
    renderChips();
    renderHistory();
    bindEvents();
    numInput.focus();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
