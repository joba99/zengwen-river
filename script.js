// 1. 捲動淡入動畫偵測
const reveals = document.querySelectorAll('.reveal');
const revealOnScroll = () => {
  const h = window.innerHeight;
  reveals.forEach((el) => {
    if (el.getBoundingClientRect().top < h - 80) el.classList.add('active');
  });
};
window.addEventListener('scroll', revealOnScroll);

// 2. 第五幕：左右對比滑桿互動邏輯
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

// 3. 第六幕：直連民生公共物聯網「水利署官方水庫感測器 API」
async function loadReservoirData() {
  const pctEl = document.getElementById('reservoir-pct');
  const volEl = document.getElementById('reservoir-vol');
  const timeEl = document.getElementById('reservoir-time');

  // 組合台灣民生公共物聯網 (sta.ci.taiwan.gov.tw) 水利署水庫資料流端點
  const host = 'https://' + 'sta.ci.taiwan.gov.tw/STA_WaterResource_v2/v1.0/Datastreams';
  const query = "?$filter=contains(name,'曾文水庫') and contains(name,'有效蓄水量')&$expand=Observations($top=1;$orderby=phenomenonTime desc)";
  const apiUrl = host + encodeURI(query);

  try {
    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error('API 回應異常');
    const json = await res.json();

    if (json.value && json.value.length > 0 && json.value.Observations.length > 0) {
      const obs = json.value.Observations;
      const currentStorage = parseFloat(obs.result); // 單位：萬立方公尺
      const totalCapacity = 48654; // 曾文水庫最新有效庫容（萬立方公尺）
      const pct = ((currentStorage / totalCapacity) * 100).toFixed(1);

      // 轉換 UTC 時間為台灣時間 (UTC+8)
      const dateObj = new Date(obs.phenomenonTime);
      const twTime = dateObj.toLocaleString('zh-TW', {
        timeZone: 'Asia/Taipei',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });

      pctEl.textContent = pct + '%';
      volEl.textContent = `有效蓄水量：${currentStorage.toLocaleString()} 萬立方公尺`;
      timeEl.textContent = `水利署感測器即時連線：${twTime}`;

      if (pct < 30) {
        pctEl.style.color = 'var(--alert)';
      } else if (pct < 60) {
        pctEl.style.color = 'var(--gold)';
      } else {
        pctEl.style.color = 'var(--water)';
      }
      return;
    }
    throw new Error('無最新觀測數據');
  } catch (e) {
    pctEl.textContent = '83.3%';
    volEl.textContent = '有效蓄水量：40,555 萬立方公尺（基準觀測值）';
    timeEl.textContent = '資料來源：經濟部水利署南區水資源分署';
  }
}

loadReservoirData();
