import { LitElement, html, css } from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

// ═══════════════════════════════════════════════════════════════════════════════
// 一、配置编辑器类（HelloImageCardEditor）
// 负责：图片URL列表、刷新间隔、显示效果的配置界面
// ═══════════════════════════════════════════════════════════════════════════════

class HelloImageCardEditor extends LitElement {

  // 1.1 定义组件属性
  static get properties() {
    return {
      hass: { type: Object },
      config: { type: Object }
    };
  }

  // 1.2 定义组件样式
  static get styles() {
    return css`
      .form { display: flex; flex-direction: column; gap: 12px; padding: 8px; }
      .form-group { display: flex; flex-direction: column; gap: 4px; }
      label { font-weight: bold; font-size: 14px; }
      input[type="text"], input[type="number"] { 
        padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; 
      }
      textarea { 
        padding: 8px; border: 1px solid #ddd; border-radius: 4px; 
        font-size: 13px; min-height: 120px; font-family: monospace; resize: vertical;
      }
      .help-text { font-size: 12px; color: #666; margin-top: 4px; }
      .url-list { margin-top: 8px; }
      .url-item { 
        display: flex; align-items: center; gap: 8px; 
        padding: 6px; background: #f5f5f5; border-radius: 4px; margin-bottom: 4px;
        font-size: 12px; font-family: monospace;
      }
      .url-item button { 
        background: #f44336; color: white; border: none; border-radius: 4px; 
        padding: 2px 8px; cursor: pointer; font-size: 11px;
      }
      .checkbox-group { display: flex; align-items: center; gap: 8px; margin-top: 4px; }
      .checkbox-group input[type="checkbox"] { width: 18px; height: 18px; }
    `;
  }

  // 1.3 设置配置对象
  setConfig(config) {
    this.config = config;
  }

  // 1.4 渲染配置界面
  render() {
    if (!this.hass) return html``;
    const urls = this.config?.url || [];
    const top = this.config?.top || '50vh';
    const refreshInterval = this.config?.refresh_interval || 0;
    const showOverlay = this.config?.show_overlay !== false;
    const overlayOpacity = this.config?.overlay_opacity || 0.15;
    const clickRefresh = this.config?.click_refresh !== false;

    return html`
      <div class="form">
        <div class="form-group">
          <label>图片垂直位置（top）</label>
          <input type="text" @change=${this._valueChanged} .value=${top} name="top" placeholder="如: 50vh, 200px, 30%" />
          <div class="help-text">设置背景图在页面中的垂直位置，默认 50vh</div>
        </div>

        <div class="form-group">
          <label>自动刷新间隔（分钟，0 表示不自动刷新）</label>
          <input type="number" @change=${this._valueChanged} .value=${refreshInterval} name="refresh_interval" min="0" placeholder="0" />
          <div class="help-text">设置为 5 表示每 5 分钟自动随机切换一张新图片</div>
        </div>

        <div class="form-group">
          <label>暗色遮罩不透明度（0~1）</label>
          <input type="number" @change=${this._valueChanged} .value=${overlayOpacity} name="overlay_opacity" min="0" max="1" step="0.05" />
          <div class="help-text">0 表示无遮罩，1 表示全黑，默认 0.15</div>
        </div>

        <div class="checkbox-group">
          <input type="checkbox" @change=${this._checkboxChanged} .checked=${showOverlay} name="show_overlay" />
          <label>显示暗色遮罩</label>
        </div>

        <div class="checkbox-group">
          <input type="checkbox" @change=${this._checkboxChanged} .checked=${clickRefresh} name="click_refresh" />
          <label>点击切换图片</label>
        </div>

        <div class="form-group">
          <label>图片 URL 列表（每行一个）</label>
          <textarea 
            @change=${this._urlsChanged} 
            .value=${urls.join('\n')} 
            placeholder="输入图片 URL，每行一个..."
            rows="6"
          ></textarea>
          <div class="help-text">支持多个图片地址，随机抽取显示</div>
        </div>

        <div class="url-list">
          <label>当前已配置的 URL（${urls.length} 个）：</label>
          ${urls.map((url, index) => html`
            <div class="url-item">
              <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${url}</span>
              <button @click=${() => this._removeUrl(index)}>删除</button>
            </div>
          `)}
        </div>
      </div>
    `;
  }

  // 1.5 处理文本/数字字段变化
  _valueChanged(e) {
    const { name, value } = e.target;
    let finalValue = value;
    if (name === 'refresh_interval' || name === 'overlay_opacity') {
      finalValue = parseFloat(value) || 0;
    }
    this.config = { ...this.config, [name]: finalValue };
    this.dispatchEvent(new CustomEvent('config-changed', { 
      detail: { config: this.config }, bubbles: true, composed: true 
    }));
  }

  // 1.6 处理复选框变化
  _checkboxChanged(e) {
    const { name, checked } = e.target;
    this.config = { ...this.config, [name]: checked };
    this.dispatchEvent(new CustomEvent('config-changed', { 
      detail: { config: this.config }, bubbles: true, composed: true 
    }));
  }

  // 1.7 处理 URL 列表变化
  _urlsChanged(e) {
    const text = e.target.value;
    const urls = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    this.config = { ...this.config, url: urls };
    this.dispatchEvent(new CustomEvent('config-changed', { 
      detail: { config: this.config }, bubbles: true, composed: true 
    }));
  }

  // 1.8 删除单个 URL
  _removeUrl(index) {
    const urls = [...(this.config?.url || [])];
    urls.splice(index, 1);
    this.config = { ...this.config, url: urls };
    this.dispatchEvent(new CustomEvent('config-changed', { 
      detail: { config: this.config }, bubbles: true, composed: true 
    }));
    this.requestUpdate();
  }
}

customElements.define('hello-image-card-editor', HelloImageCardEditor);


// ═══════════════════════════════════════════════════════════════════════════════
// 二、图片卡片显示类（HelloImageCard）
// 负责：从配置的 URL 列表中随机抽取一张作为页面背景图
// 特性：定时自动刷新、点击切换、渐变过渡、暗色遮罩
// ═══════════════════════════════════════════════════════════════════════════════

class HelloImageCard extends LitElement {

  // 2.1 定义组件属性
  static get properties() {
    return {
      hass: Object,
      config: Object
    };
  }

  // 2.2 定义组件样式
  static get styles() {
    return css`
      :host { 
        display: block; 
        position: absolute;
        left: 0;
        right: 0;
        z-index: -1;
      }
      .image-container {
        width: 100%;
        height: 100vh;
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        /* 渐变过渡效果 */
        transition: background-image 0.8s ease-in-out, opacity 0.5s ease-in-out;
        position: relative;
        cursor: pointer;
      }
      /* 暗色遮罩 */
      .overlay {
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0, 0, 0, var(--overlay-opacity, 0.15));
        pointer-events: none;
        transition: background 0.5s ease;
      }
      /* 无图片时的占位 */
      .placeholder {
        width: 100%;
        height: 100vh;
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #888;
        font-size: 14px;
      }
      /* 刷新提示 */
      .refresh-hint {
        position: absolute;
        bottom: 16px;
        right: 16px;
        background: rgba(0,0,0,0.5);
        color: white;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 12px;
        opacity: 0;
        transition: opacity 0.3s;
        pointer-events: none;
      }
      .image-container:hover .refresh-hint {
        opacity: 1;
      }
    `;
  }

  // 2.3 返回配置编辑器
  static getConfigElement() {
    return document.createElement("hello-image-card-editor");
  }

  // 2.4 构造函数：初始化状态
  constructor() {
    super();
    this._currentImageUrl = '';      // 当前显示的图片 URL
    this._refreshTimer = null;       // 自动刷新定时器
    this._lastRefreshTime = 0;       // 上次刷新时间戳
  }

  // 2.5 设置配置
  setConfig(config) {
    this.config = config;
    // 设置垂直位置
    if (config.top) {
      this.style.setProperty('top', config.top);
    }
  }

  // 2.6 组件连接到 DOM
  connectedCallback() {
    super.connectedCallback();
    // 首次加载时随机选择一张图片
    this._currentImageUrl = this._getRandomImageUrl();
    // 启动自动刷新定时器
    this._startAutoRefresh();
  }

  // 2.7 组件从 DOM 卸载：清理定时器，防止内存泄漏
  disconnectedCallback() {
    super.disconnectedCallback();
    this._stopAutoRefresh();
  }

  // 2.8 启动自动刷新定时器
  _startAutoRefresh() {
    const intervalMinutes = parseFloat(this.config?.refresh_interval) || 0;
    // 如果间隔为 0 或无效，不启动定时器
    if (intervalMinutes <= 0) return;

    // 转换为毫秒
    const intervalMs = intervalMinutes * 60 * 1000;

    // 清除已有定时器
    this._stopAutoRefresh();

    // 创建新定时器
    this._refreshTimer = setInterval(() => {
      this._switchImage();
    }, intervalMs);
  }

  // 2.9 停止自动刷新定时器
  _stopAutoRefresh() {
    if (this._refreshTimer) {
      clearInterval(this._refreshTimer);
      this._refreshTimer = null;
    }
  }

  // 2.10 切换图片（随机抽取一张新的）
  _switchImage() {
    const urls = this.config?.url || [];
    if (urls.length === 0) return;

    // 如果只有一张图片，直接返回
    if (urls.length === 1) {
      this._currentImageUrl = urls[0];
      this.requestUpdate();
      return;
    }

    // 随机抽取，尽量不与当前相同
    let newUrl = this._currentImageUrl;
    let attempts = 0;
    while (newUrl === this._currentImageUrl && attempts < 10) {
      const randomIndex = Math.floor(Math.random() * urls.length);
      newUrl = urls[randomIndex];
      attempts++;
    }

    this._currentImageUrl = newUrl;
    this._lastRefreshTime = Date.now();
    this.requestUpdate();
  }

  // 2.11 处理点击事件
  _handleClick() {
    // 如果配置允许点击刷新
    if (this.config?.click_refresh !== false) {
      this._switchImage();
      // 触发触觉反馈
      const hapticEvent = new Event('haptic', { bubbles: true, cancelable: false, composed: true });
      hapticEvent.detail = 'light';
      this.dispatchEvent(hapticEvent);
    }
  }

  // 2.12 从 URL 列表中随机选择一张
  _getRandomImageUrl() {
    const urls = this.config?.url || [];
    if (urls.length === 0) return '';
    const randomIndex = Math.floor(Math.random() * urls.length);
    return urls[randomIndex];
  }

  // 2.13 渲染图片背景
  render() {
    const urls = this.config?.url || [];
    const showOverlay = this.config?.show_overlay !== false;
    const overlayOpacity = this.config?.overlay_opacity || 0.15;
    const clickRefresh = this.config?.click_refresh !== false;
    const top = this.config?.top || '50vh';

    // 如果没有配置 URL，显示占位
    if (urls.length === 0) {
      return html`
        <div class="placeholder">
          <span>请配置图片 URL</span>
        </div>
      `;
    }

    return html`
      <div 
        class="image-container" 
        style="background-image: url('${this._currentImageUrl}'); top: ${top};"
        @click=${this._handleClick}
      >
        ${showOverlay ? html`
          <div class="overlay" style="--overlay-opacity: ${overlayOpacity};"></div>
        ` : ''}
        ${clickRefresh ? html`
          <div class="refresh-hint">点击切换图片</div>
        ` : ''}
      </div>
    `;
  }

  // 2.14 计算卡片尺寸
  getCardSize() {
    return 1;
  }
}

customElements.define('hello-image-card', HelloImageCard);
