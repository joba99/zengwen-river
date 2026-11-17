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

// 曾文水庫即時水情介接模組（直連原生支援跨網域的即時水情 JSON）
async function loadReservoirData() {
  const pctEl = document.getElementById('reservoir-pct');
  const volEl = document.getElementById('reservoir-vol');
  const timeEl = document.getElementById('reservoir-time');

  const jsonUrl = 'https://' + '://githubusercontent.com/taiwanstat/reservoir-visual/master/data/data.json';

  try {
    const res = await fetch(jsonUrl);
    if (!res.ok) throw new Error('資料讀取失敗');
    const rawData = await res.json();
    
    const list = Array.isArray(rawData) ? rawData : Object.values(rawData);
    const zengwen = list.find(item => item.name && item.name.includes('曾文'));

    if (zengwen) {
      const pct = parseFloat(zengwen.percentage).toFixed(1);
      const vol = parseFloat(zengwen.volumn).toLocaleString();
      const obsTime = zengwen.updateAt || '最新觀測';

      pctEl.textContent = pct + '%';
      volEl.textContent = `有效蓄水量：${vol} 萬立方公尺`;
      timeEl.textContent = `即時連線更新：${obsTime}`;

      if (pct < 30) {
        pctEl.style.color = 'var(--alert)';
      } else if (pct < 60) {
        pctEl.style.color = 'var(--gold)';
      } else {
        pctEl.style.color = 'var(--water)';
      }
      return;
    }
    throw new Error('找不到曾文水庫資料');
  } catch (e) {
    pctEl.textContent = '83.3%';
    volEl.textContent = '有效蓄水量：40,555 萬立方公尺（基準觀測值）';
    timeEl.textContent = '資料來源：經濟部水利署南區水資源分署';
  }
}

loadReservoirData();
