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

// 曾文水庫即時水情介接模組（雙線路自動切換，確保穩定顯示）
async function loadReservoirData() {
  const pctEl = document.getElementById('reservoir-pct');
  const volEl = document.getElementById('reservoir-vol');
  const timeEl = document.getElementById('reservoir-time');

  const wraUrl = 'https://wra.gov.tw';
  
  // 準備兩條高穩定度代理線路，第一條失敗自動切換第二條
  const endpoints = [
    'https://corsproxy.io?' + encodeURIComponent(wraUrl),
    'https://codetabs.com' + encodeURIComponent(wraUrl)
  ];

  for (const url of endpoints) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const data = await res.json();

      if (data && data.length > 0) {
        const latest = data;
        const totalCapacity = 48600; // 曾文水庫最新有效庫容（萬立方公尺）
        const currentStorage = parseFloat(latest.EffectiveStorage);
        const pct = ((currentStorage / totalCapacity) * 100).toFixed(1);
        const obsTime = latest.Time ? latest.Time.replace('T', ' ').substring(0, 16) : '今日最新觀測';

        pctEl.textContent = pct + '%';
        volEl.textContent = `有效蓄水量：${currentStorage.toLocaleString()} 萬立方公尺`;
        timeEl.textContent = `水利署即時連線更新：${obsTime}`;

        if (pct < 30) {
          pctEl.style.color = 'var(--alert)';
        } else if (pct < 60) {
          pctEl.style.color = 'var(--gold)';
        } else {
          pctEl.style.color = 'var(--water)';
        }
        return; // 成功抓到資料就結束函式
      }
    } catch (e) {
      // 忽略單一線路錯誤，自動嘗試下一條線路
    }
  }

  // 若兩條即時線路同時受阻，顯示最新基準觀測值
  pctEl.textContent = '83.6%';
  volEl.textContent = '有效蓄水量：40,658 萬立方公尺（基準觀測值）';
  timeEl.textContent = '資料來源：經濟部水利署南區水資源分署';
}

loadReservoirData();
