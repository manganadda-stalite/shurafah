/* ═══════════════════════════════════════════════════════════════════════════
   SHURAFAH ADS MANAGEMENT SYSTEM
   Handles all ad placements, rendering, and user interactions
   ═══════════════════════════════════════════════════════════════════════════ */

/* ══ CONFIGURATION ══ */
const ADS_CONFIG = {
  enabled: true,
  publisherId: 'ca-pub-6173829384710284',
  
  /* User targeting */
  userType: 'guest', /* 'guest', 'free', 'premium' */
  showToGuests: true,
  showToFreeUsers: true,
  showToPremium: false,
  
  /* Placement settings */
  placements: {
    headerBanner: { enabled: true, size: '320x50', frequency: 'always' },
    inFeed: { enabled: true, frequency: 5, style: 'native' },
    downloadModal: { enabled: true, timer: 5, minTimer: 3, maxTimer: 8, showSkip: true },
    detailPageAds: { enabled: true, positions: ['below-player', 'in-description'] },
    profileAds: { enabled: true, size: '320x50' },
    libraryAds: { enabled: true, style: 'mixed' }
  },
  
  /* Frequency caps */
  frequencyCaps: {
    downloadModal: 5, /* max per day */
    inFeedAds: 8, /* max per page */
    bannerAds: 1 /* max per page */
  }
};

/* ══ AD DATA ══ */
const AD_UNITS = {
  headerBanner: {
    id: 'header-banner-unit',
    name: 'Header Banner 320×50',
    size: '320x50',
    code: '<ins class="adsbygoogle" style="display:inline-block;width:320px;height:50px" data-ad-client="ca-pub-6173829384710284" data-ad-slot="1234567890"></ins>'
  },
  inFeedNative: {
    id: 'infeed-native-unit',
    name: 'In-Feed Native Ad',
    size: 'responsive',
    code: '<ins class="adsbygoogle" style="display:block" data-ad-format="fluid" data-ad-layout-key="-6t+ed+2i-1n-4w" data-ad-client="ca-pub-6173829384710284" data-ad-slot="1122334455"></ins>'
  },
  downloadModal: {
    id: 'download-modal-unit',
    name: 'Download Interstitial',
    size: '300x250',
    code: '<ins class="adsbygoogle" style="display:inline-block;width:300px;height:250px" data-ad-client="ca-pub-6173829384710284" data-ad-slot="9876543210"></ins>'
  },
  detailRectangle: {
    id: 'detail-rectangle-unit',
    name: 'Detail Page Rectangle',
    size: '300x250',
    code: '<ins class="adsbygoogle" style="display:inline-block;width:300px;height:250px" data-ad-client="ca-pub-6173829384710284" data-ad-slot="5544332211"></ins>'
  },
  detailNative: {
    id: 'detail-native-unit',
    name: 'Detail Page Native',
    size: 'responsive',
    code: '<ins class="adsbygoogle" style="display:block" data-ad-format="native" data-ad-layout="in-article" data-ad-client="ca-pub-6173829384710284" data-ad-slot="6677889900"></ins>'
  }
};

/* ══ STATE MANAGEMENT ══ */
const ADS_STATE = {
  downloadModalShownToday: 0,
  inFeedAdsOnPage: 0,
  bannerAdsOnPage: 0,
  userDownloads: 0,
  sessionStartTime: Date.now(),
  adImpressions: [],
  adClicks: []
};

/* ══ UTILITIES ══ */

/**
 * Show toast notification
 */
function showAdToast(msg, type = 'info') {
  const toast = document.getElementById('toast') || createToastElement();
  const icons = { success: '✓', info: '💡', warn: '⚠', ad: '📢' };
  toast.innerHTML = `<svg viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/></svg>${msg}`;
  toast.className = `toast show ${type}`;
  setTimeout(() => toast.classList.remove('show'), 2800);
}

/**
 * Create toast element if it doesn't exist
 */
function createToastElement() {
  const toast = document.createElement('div');
  toast.id = 'toast';
  toast.className = 'toast';
  document.body.appendChild(toast);
  
  const style = document.createElement('style');
  style.textContent = `
    .toast {
      position: fixed; bottom: 24px; right: 24px;
      padding: 12px 18px; border-radius: 12px;
      font-family: sans-serif; font-size: 12px; font-weight: 700;
      display: flex; align-items: center; gap: 8px;
      z-index: 9999; box-shadow: 0 6px 24px rgba(0,0,0,0.5);
      opacity: 0; transform: translateY(8px);
      transition: all 0.3s; pointer-events: none;
    }
    .toast.show { opacity: 1; transform: translateY(0); }
    .toast.success { background: #2ECC8F; color: white; }
    .toast.info { background: #F4A900; color: #000; }
    .toast.warn { background: #FFD166; color: #000; }
    .toast.ad { background: #4D9FFF; color: white; }
    .toast svg { width: 14px; height: 14px; fill: none; stroke: currentColor; stroke-width: 2.5; }
  `;
  document.head.appendChild(style);
  return toast;
}

/**
 * Check if user should see ads
 */
function shouldShowAds() {
  if (!ADS_CONFIG.enabled) return false;
  
  const userType = ADS_CONFIG.userType;
  if (userType === 'guest' && !ADS_CONFIG.showToGuests) return false;
  if (userType === 'free' && !ADS_CONFIG.showToFreeUsers) return false;
  if (userType === 'premium' && !ADS_CONFIG.showToPremium) return false;
  
  return true;
}

/**
 * Track ad impression
 */
function trackAdImpression(placementId, unitId) {
  ADS_STATE.adImpressions.push({
    placementId,
    unitId,
    timestamp: Date.now(),
    userType: ADS_CONFIG.userType
  });
}

/**
 * Track ad click
 */
function trackAdClick(placementId, unitId) {
  ADS_STATE.adClicks.push({
    placementId,
    unitId,
    timestamp: Date.now(),
    userType: ADS_CONFIG.userType
  });
}

/* ══ AD RENDERING FUNCTIONS ══ */

/**
 * Render header banner ad
 * @param {string} containerId - ID of container element
 */
function renderHeaderBanner(containerId = 'ad-header-banner') {
  if (!shouldShowAds() || !ADS_CONFIG.placements.headerBanner.enabled) return;
  
  const container = document.getElementById(containerId);
  if (!container) return;
  
  const adHtml = `
    <div class="ad-header-banner" style="
      margin: 12px 14px 0;
      background: linear-gradient(135deg, var(--surface), var(--surface2));
      border-radius: 12px;
      padding: 8px;
      border: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 58px;
      position: relative;
      overflow: hidden;
    ">
      <div style="
        width: 100%;
        height: 50px;
        background: linear-gradient(135deg, rgba(77,159,255,0.1), rgba(155,107,255,0.1));
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        color: var(--text3);
        font-family: sans-serif;
        font-weight: 700;
      ">
        📢 Advertisement
      </div>
    </div>
  `;
  
  container.innerHTML = adHtml;
  ADS_STATE.bannerAdsOnPage++;
  trackAdImpression('header-banner', AD_UNITS.headerBanner.id);
}

/**
 * Render in-feed ad card
 * @returns {HTMLElement} Ad card element
 */
function createInFeedAdCard() {
  if (!shouldShowAds() || !ADS_CONFIG.placements.inFeed.enabled) return null;
  if (ADS_STATE.inFeedAdsOnPage >= ADS_CONFIG.frequencyCaps.inFeedAds) return null;
  
  const card = document.createElement('div');
  card.className = 'ad-infeed-card';
  card.style.cssText = `
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 9px 10px;
    border-radius: 13px;
    background: linear-gradient(135deg, var(--surface2), var(--surface3));
    border: 1px solid var(--border);
    margin: 3px 14px;
    cursor: pointer;
    transition: all 0.15s;
    position: relative;
  `;
  
  card.innerHTML = `
    <div style="
      width: 48px;
      height: 48px;
      border-radius: 11px;
      background: linear-gradient(135deg, #4D9FFF, #9B6BFF);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      flex-shrink: 0;
    ">📢</div>
    <div style="flex: 1; min-width: 0;">
      <div style="
        font-family: sans-serif;
        font-size: 12px;
        font-weight: 700;
        margin-bottom: 2px;
      ">Sponsored Content</div>
      <div style="
        font-size: 10px;
        color: var(--text2);
        margin-bottom: 3px;
      ">Discover amazing products</div>
      <div style="
        display: flex;
        gap: 6px;
        font-size: 9px;
        color: var(--text3);
      ">
        <span>📊 Trending</span>
        <span>⭐ Popular</span>
      </div>
    </div>
    <div style="
      width: 22px;
      height: 22px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      border-radius: 50%;
      flex-shrink: 0;
    ">→</div>
  `;
  
  card.addEventListener('click', () => {
    trackAdClick('in-feed', AD_UNITS.inFeedNative.id);
    showAdToast('Opening advertiser page…', 'ad');
  });
  
  card.addEventListener('mouseenter', () => {
    card.style.transform = 'translateY(-1px)';
    card.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)';
  });
  
  card.addEventListener('mouseleave', () => {
    card.style.transform = 'translateY(0)';
    card.style.boxShadow = 'none';
  });
  
  ADS_STATE.inFeedAdsOnPage++;
  trackAdImpression('in-feed', AD_UNITS.inFeedNative.id);
  
  return card;
}

/**
 * Insert in-feed ads into song list
 * @param {string} listSelector - CSS selector for list container
 */
function insertInFeedAds(listSelector = '.songs-list') {
  if (!shouldShowAds() || !ADS_CONFIG.placements.inFeed.enabled) return;
  
  const list = document.querySelector(listSelector);
  if (!list) return;
  
  const rows = list.querySelectorAll('.srow');
  const frequency = ADS_CONFIG.placements.inFeed.frequency;
  
  let adCount = 0;
  for (let i = frequency; i < rows.length; i += frequency) {
    if (adCount >= ADS_CONFIG.frequencyCaps.inFeedAds) break;
    
    const adCard = createInFeedAdCard();
    if (!adCard) break;
    
    rows[i].parentNode.insertBefore(adCard, rows[i]);
    adCount++;
  }
}

/**
 * Render download interstitial modal
 * @param {Function} onComplete - Callback when timer completes
 */
function renderDownloadModal(onComplete) {
  if (!shouldShowAds() || !ADS_CONFIG.placements.downloadModal.enabled) {
    if (onComplete) onComplete();
    return;
  }
  
  if (ADS_STATE.downloadModalShownToday >= ADS_CONFIG.frequencyCaps.downloadModal) {
    if (onComplete) onComplete();
    return;
  }
  
  const timer = ADS_CONFIG.placements.downloadModal.timer;
  const allowSkip = ADS_CONFIG.placements.downloadModal.showSkip !== false;
  
  const modal = document.createElement('div');
  modal.id = 'ad-download-modal';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.85);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9998;
    backdrop-filter: blur(4px);
    animation: fadeIn 0.3s ease;
  `;
  
  let remaining = timer;
  const timerInterval = setInterval(() => {
    remaining--;
    const timerEl = document.getElementById('ad-timer-display');
    if (timerEl) timerEl.textContent = remaining;
    
    if (remaining <= 0) {
      clearInterval(timerInterval);
      const skipBtn = document.getElementById('ad-skip-btn');
      if (skipBtn && allowSkip) skipBtn.style.opacity = '1';
      const dlBtn = document.getElementById('ad-dl-btn');
      if (dlBtn) dlBtn.style.opacity = '1';
    }
  }, 1000);
  
  modal.innerHTML = `
    <div style="
      background: var(--surface);
      border-radius: 16px;
      padding: 20px;
      max-width: 320px;
      width: 90%;
      border: 1px solid var(--border);
      box-shadow: 0 20px 60px rgba(0,0,0,0.6);
      animation: slideUp 0.3s ease;
    ">
      <div style="
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 16px;
      ">
        <div style="
          font-family: sans-serif;
          font-size: 14px;
          font-weight: 800;
          color: var(--text);
        ">Your Download Starts In</div>
        <div style="
          width: 28px;
          height: 28px;
          background: var(--surface2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border: 1px solid var(--border);
        " onclick="document.getElementById('ad-download-modal').remove()">
          ✕
        </div>
      </div>
      
      <div style="
        background: linear-gradient(135deg, rgba(77,159,255,0.15), rgba(155,107,255,0.15));
        border-radius: 12px;
        padding: 20px;
        text-align: center;
        margin-bottom: 16px;
        border: 1px solid var(--border);
      ">
        <div style="
          font-size: 9px;
          color: var(--text3);
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-family: sans-serif;
          font-weight: 700;
        ">Advertisement</div>
        <div style="
          width: 100%;
          height: 120px;
          background: var(--surface2);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text3);
          font-size: 11px;
          font-family: sans-serif;
        ">
          [Ad Unit Here]
        </div>
      </div>
      
      <div style="
        background: var(--surface2);
        border-radius: 12px;
        padding: 14px;
        margin-bottom: 14px;
        text-align: center;
        border: 1px solid var(--border);
      ">
        <div style="
          font-size: 10px;
          color: var(--text3);
          margin-bottom: 6px;
        ">Download starts in</div>
        <div style="
          font-family: sans-serif;
          font-size: 32px;
          font-weight: 800;
          color: var(--accent);
        " id="ad-timer-display">${remaining}</div>
        <div style="
          font-size: 9px;
          color: var(--text3);
          margin-top: 4px;
        ">seconds</div>
      </div>
      
      <div style="display: flex; gap: 8px;">
        <button id="ad-skip-btn" style="
          flex: 1;
          padding: 10px 14px;
          background: var(--surface2);
          border: 1px solid var(--border);
          border-radius: 10px;
          color: var(--text2);
          font-family: sans-serif;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          ${allowSkip ? '' : 'display:none;'}
          opacity: ${remaining <= 0 ? '1' : '0.3'};
          pointer-events: ${remaining <= 0 ? 'auto' : 'none'};
          transition: all 0.2s;
        " onclick="
          document.getElementById('ad-download-modal').remove();
          if (window.adDownloadCallback) window.adDownloadCallback();
        ">Skip</button>
        <button id="ad-dl-btn" style="
          flex: 1;
          padding: 10px 14px;
          background: var(--green);
          border: 1px solid var(--green);
          border-radius: 10px;
          color: white;
          font-family: sans-serif;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          opacity: ${remaining <= 0 ? '1' : '0.3'};
          pointer-events: ${remaining <= 0 ? 'auto' : 'none'};
          transition: all 0.2s;
        " onclick="
          document.getElementById('ad-download-modal').remove();
          if (window.adDownloadCallback) window.adDownloadCallback();
        ">⬇ Download Now</button>
      </div>
    </div>
    
    <style>
      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    </style>
  `;
  
  document.body.appendChild(modal);
  ADS_STATE.downloadModalShownToday++;
  trackAdImpression('download-modal', AD_UNITS.downloadModal.id);
}

/**
 * Initialize download button with ad modal
 * @param {string} buttonSelector - CSS selector for download button
 */
function initDownloadAds(buttonSelector = '.dl-btn, [onclick*="download"]') {
  const buttons = document.querySelectorAll(buttonSelector);
  buttons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      if (!shouldShowAds() || !ADS_CONFIG.placements.downloadModal.enabled) return;
      
      e.preventDefault();
      window.adDownloadCallback = () => {
        showAdToast('Download starting…', 'success');
        /* Actual download logic would go here */
      };
      renderDownloadModal(window.adDownloadCallback);
    });
  });
}

/**
 * Render detail page ads
 * @param {string} belowPlayerSelector - Selector for element to insert ad below
 */
function renderDetailPageAds(belowPlayerSelector = '.hero') {
  if (!shouldShowAds() || !ADS_CONFIG.placements.detailPageAds.enabled) return;
  
  const targetElement = document.querySelector(belowPlayerSelector);
  if (!targetElement) return;
  
  const adContainer = document.createElement('div');
  adContainer.className = 'ad-detail-container';
  adContainer.style.cssText = `
    margin: 16px 14px;
    background: linear-gradient(135deg, var(--surface), var(--surface2));
    border-radius: 14px;
    padding: 14px;
    border: 1px solid var(--border);
  `;
  
  adContainer.innerHTML = `
    <div style="
      width: 100%;
      height: 250px;
      background: linear-gradient(135deg, rgba(77,159,255,0.1), rgba(155,107,255,0.1));
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text3);
      font-size: 11px;
      font-family: sans-serif;
      font-weight: 700;
    ">
      📢 Advertisement (300×250)
    </div>
  `;
  
  targetElement.parentNode.insertBefore(adContainer, targetElement.nextSibling);
  trackAdImpression('detail-page', AD_UNITS.detailRectangle.id);
}

/**
 * Initialize all ads on page
 * @param {Object} options - Configuration options
 */
function initializeAds(options = {}) {
  /* Merge options with config */
  Object.assign(ADS_CONFIG, options);
  
  /* Check if user should see ads */
  if (!shouldShowAds()) {
    console.log('Ads disabled for this user');
    return;
  }
  
  /* Render header banner */
  if (ADS_CONFIG.placements.headerBanner.enabled) {
    renderHeaderBanner();
  }
  
  /* Insert in-feed ads */
  if (ADS_CONFIG.placements.inFeed.enabled) {
    insertInFeedAds();
  }
  
  /* Initialize download ads */
  if (ADS_CONFIG.placements.downloadModal.enabled) {
    initDownloadAds();
  }
  
  /* Render detail page ads */
  if (ADS_CONFIG.placements.detailPageAds.enabled) {
    renderDetailPageAds();
  }
  
  console.log('Ads initialized successfully', ADS_STATE);
}

/**
 * Get ad statistics
 */
function getAdStats() {
  return {
    impressions: ADS_STATE.adImpressions.length,
    clicks: ADS_STATE.adClicks.length,
    ctr: ADS_STATE.adImpressions.length > 0 
      ? ((ADS_STATE.adClicks.length / ADS_STATE.adImpressions.length) * 100).toFixed(2) + '%'
      : '0%',
    downloadModalsShown: ADS_STATE.downloadModalShownToday,
    inFeedAdsOnPage: ADS_STATE.inFeedAdsOnPage,
    bannerAdsOnPage: ADS_STATE.bannerAdsOnPage
  };
}

/**
 * Disable ads temporarily
 */
function disableAds() {
  ADS_CONFIG.enabled = false;
  showAdToast('Ads disabled', 'info');
}

/**
 * Enable ads
 */
function enableAds() {
  ADS_CONFIG.enabled = true;
  showAdToast('Ads enabled', 'info');
}

/**
 * Set user type
 */
function setUserType(type) {
  if (['guest', 'free', 'premium'].includes(type)) {
    ADS_CONFIG.userType = type;
    console.log('User type set to:', type);
  }
}

/* Export functions for use in pages */
window.ADS = {
  init: initializeAds,
  renderHeaderBanner,
  insertInFeedAds,
  renderDownloadModal,
  initDownloadAds,
  renderDetailPageAds,
  getStats: getAdStats,
  disable: disableAds,
  enable: enableAds,
  setUserType,
  config: ADS_CONFIG,
  state: ADS_STATE
};

console.log('Shurafah Ads System loaded');
