/* ═══════════════════════════════════════════════════════════════
   GLOBAL COLOR MANAGER - Applies accent color across all admin pages
   Theme switching is handled by admin-topbar.js
   ═══════════════════════════════════════════════════════════════ */

class ThemeManager {
  constructor() {
    this.defaultColor = '#FF6B35';
    this.init();
  }

  init() {
    this.loadSavedColor();
    this.applyColor();
    this.watchForChanges();
  }

  loadSavedColor() {
    this.currentColor = localStorage.getItem('accentColor') || this.defaultColor;
  }

  applyColor() {
    const root = document.documentElement;
    root.style.setProperty('--accent', this.currentColor);
    
    const hex = this.currentColor;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    root.style.setProperty('--accent-rgb', `${r},${g},${b}`);
  }

  setColor(color) {
    this.currentColor = color;
    localStorage.setItem('accentColor', color);
    this.applyColor();
    this.broadcastChange('color', color);
  }

  broadcastChange(type, value) {
    const event = new CustomEvent('themeChanged', {
      detail: { type, value }
    });
    window.dispatchEvent(event);
  }

  watchForChanges() {
    window.addEventListener('storage', (e) => {
      if (e.key === 'accentColor') {
        this.currentColor = e.newValue || this.defaultColor;
        this.applyColor();
      }
    });

    window.addEventListener('themeChanged', (e) => {
      if (e.detail.type === 'color') {
        this.currentColor = e.detail.value;
        this.applyColor();
      }
    });
  }

  getColor() {
    return this.currentColor;
  }
}

const themeManager = new ThemeManager();
