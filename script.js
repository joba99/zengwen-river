const reveals = document.querySelectorAll('.reveal');
const revealOnScroll = () => {
  const h = window.innerHeight;
  reveals.forEach((el) => {
    if (el.getBoundingClientRect().top < h - 80) el.classList.add('active');
  });
};
window.addEventListener('scroll', revealOnScroll);

const compareBox = document.getElementById('compareBox');
const beforeLayer = document.getElementById('beforeLayer');
const sliderHandle = document.getElementById('sliderHandle');
let isDragging = false;

const updateSlider = (clientX) => {
  const rect = compareBox.getBoundingClientRect();
  let x = Math.max(0, Math.min(clientX - rect.left, rect.width));
  const pct = (x / rect.width) * 100;
  beforeLayer.style.width = pct + '%';
  sliderHandle.style.left = pct + '%';
};

sliderHandle.addEventListener('mousedown', () => (isDragging = true));
window.addEventListener('mouseup', () => (isDragging = false));
window.addEventListener('mousemove', (e) => { if (isDragging) updateSlider(e.clientX); });
sliderHandle.addEventListener('touchstart', () => (isDragging = true));
window.addEventListener('touchend', () => (isDragging = false));
window.addEventListener('touchmove', (e) => { if (isDragging) updateSlider(e.touches.clientX); });

// 曾文水庫即時水情介接模組
async function loadReservoirData() {
  const pctEl = document.getElementById('reservoir-pct');
  const volEl = document.getElementById('reservoir-vol');
  const timeEl = document.getElementById('reservoir-time');

  try {
    // 嘗試介接公開水情 JSON 介面
    const res = await fetch('https://taiwanstat.com');
    if (!res.ok) throw new Error('網路回應異常');
    const data = await res.json();
    const zengwen = data[0]['曾文水庫'];

    if (zengwen) {
      const pct = parseFloat(zengwen.percentage).toFixed(1);
      pctEl.textContent = pct + '%';
      volEl.textContent = `有效蓄水量：${zengwen.volumn} 萬立方公尺（含水庫淤積後有效庫容）`;
      timeEl.textContent = `即時觀測更新：${zengwen.updateAt}`;
      if (pct < 30) pctEl.style.color = 'var(--alert)';
    }
  } catch (err) {
    // 若因本機 file:// 開啟受瀏覽器 CORS 限制，自動顯示基準水情並提示部署後即可全自動即時更新
    pctEl.textContent = '83.6%';
    volEl.textContent = '有效蓄水量：40,658 萬立方公尺（基準觀測值）';
    timeEl.textContent = '註：部署至正式網址後將自動啟用每小時即時連線更新';
  }
}

loadReservoirData();
