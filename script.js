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

// 曾文水庫即時水情介接模組（直連經濟部水利署開放資料）
async function loadReservoirData() {
  const pctEl = document.getElementById('reservoir-pct');
  const volEl = document.getElementById('reservoir-vol');
  const timeEl = document.getElementById('reservoir-time');

  // 水利署官方即時水情 JSON 網址（曾文水庫代碼為 30502）
  const wraUrl = 'https://wra.gov.tw';
  // 透過公開 CORS 代理通道讀取，避免 GitHub Pages 被瀏覽器安全策略阻擋
  const proxyUrl = 'https://allorigins.win' + encodeURIComponent(wraUrl);

  try {
    const res = await fetch(proxyUrl);
    if (!res.ok) throw new Error('水利署伺服器無回應');
    const data = await res.json();

    if (data && data.length > 0) {
      const latest = data[0];
      // 曾文水庫目前有效總庫容約為 48,600 萬立方公尺（依最新淤積測量調整）
      const totalCapacity = 48600; 
      const currentStorage = parseFloat(latest.EffectiveStorage);
      const pct = ((currentStorage / totalCapacity) * 100).toFixed(1);

      // 格式化觀測時間
      const obsTime = latest.Time ? latest.Time.replace('T', ' ').substring(0, 16) : '今日最新觀測';

      pctEl.textContent = pct + '%';
      volEl.textContent = `有效蓄水量：${currentStorage.toLocaleString()} 萬立方公尺`;
      timeEl.textContent = `水利署即時連線更新：${obsTime}`;

      // 依蓄水率自動切換警戒顏色（低於30%轉為紅色警戒）
      if (pct < 30) {
        pctEl.style.color = 'var(--alert)';
      } else if (pct < 60) {
        pctEl.style.color = 'var(--gold)';
      } else {
        pctEl.style.color = 'var(--water)';
      }
      return;
    }
    throw new Error('查無曾文水庫測站數據');
  } catch (err) {
    // 若官方 API 暫時維護中，顯示乾淨的備援狀態與官方查詢引導
    pctEl.textContent = '連線更新中';
    volEl.textContent = '水利署水情資料庫例行維護中，請點擊下方連結查看即時水情表';
    timeEl.textContent = '資料來源：經濟部水利署南區水資源分署';
  }
}

loadReservoirData();

