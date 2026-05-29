import { LitElement, html, css } from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

// ═══════════════════════════════════════════════════════════════════════════════
// 一、配置编辑器类（HelloVideoCardEditor）
// 负责：视频URL列表、播放设置、显示效果的配置界面
// ═══════════════════════════════════════════════════════════════════════════════

class HelloVideoCardEditor extends LitElement {

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
    const muted = this.config?.muted !== false;
    const loop = this.config?.loop !== false;
    const autoplay = this.config?.autoplay !== false;
    const objectFit = this.config?.object_fit || 'cover';

    return html`
      <div class="form">
        <div class="form-group">
          <label>视频垂直位置（top）</label>
          <input type="text" @change=${this._valueChanged} .value=${top} name="top" placeholder="如: 50vh, 200px, 30%" />
          <div class="help-text">设置视频背景在页面中的垂直位置，默认 50vh</div>
        </div>

        <div class="form-group">
          <label>视频填充模式</label>
          <select @change=${this._valueChanged} .value=${objectFit} name="object_fit" style="padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
            <option value="cover">cover（裁剪铺满）</option>
            <option value="contain">contain（完整显示）</option>
            <option value="fill">fill（拉伸变形）</option>
          </select>
          <div class="help-text">cover 类似图片的 background-size: cover</div>
        </div>

        <div class="checkbox-group">
          <input type="checkbox" @change=${this._checkboxChanged} .checked=${autoplay} name="autoplay" />
          <label>自动播放</label>
        </div>

        <div class="checkbox-group">
          <input type="checkbox" @change=${this._checkboxChanged} .checked=${muted} name="muted" />
          <label>静音播放</label>
        </div>

        <div class="checkbox-group">
          <input type="checkbox" @change=${this._checkboxChanged} .checked=${loop} name="loop" />
          <label>循环播放</label>
        </div>

        <div class="form-group">
          <label>视频 URL 列表（每行一个）</label>
          <textarea 
            @change=${this._urlsChanged} 
            .value=${urls.join('\n')} 
            placeholder="输入视频 URL，每行一个..."
            rows="6"
          ></textarea>
          <div class="help-text">支持多个视频地址，每次刷新随机抽取一个播放</div>
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
    this.config = { ...this.config, [name]: value };
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

customElements.define('hello-video-card-editor', HelloVideoCardEditor);


// ═══════════════════════════════════════════════════════════════════════════════
// 二、视频卡片显示类（HelloVideoCard）
// 负责：从配置的 URL 列表中随机抽取一个视频作为页面背景
// 特性：自动播放、静音、循环、随机抽取
// ═══════════════════════════════════════════════════════════════════════════════

class HelloVideoCard extends LitElement {

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
      .video-container {
        width: 100%;
        height: 100vh;
        position: relative;
        overflow: hidden;
      }
      video {
        width: 100%;
        height: 100%;
        object-fit: var(--video-object-fit, cover);
      }
      /* 暗色遮罩 */
      .overlay {
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0, 0, 0, var(--overlay-opacity, 0.15));
        pointer-events: none;
      }
      /* 无视频时的占位 */
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
    `;
  }

  // 【关键】返回配置编辑器，名称必须与 define 注册名一致
  static getConfigElement() {
    return document.createElement("hello-video-card-editor");
  }

  // 2.4 构造函数：初始化状态
  constructor() {
    super();
    this._currentVideoUrl = '';      // 当前播放的视频 URL
  }

  // 2.5 设置配置
  setConfig(config) {
    this.config = config;
    if (config.top) {
      this.style.setProperty('top', config.top);
    }
  }

  // 2.6 组件连接到 DOM
  connectedCallback() {
    super.connectedCallback();
    this._currentVideoUrl = this._getRandomVideoUrl();
  }

  // 2.7 组件更新后：确保视频正确加载播放
  updated() {
    const video = this.shadowRoot?.querySelector('video');
    if (video) {
      // 每次更新后重新加载视频源
      video.load();
      // 尝试播放（浏览器可能阻止自动播放，需要用户交互）
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.log('视频自动播放被浏览器阻止:', error);
        });
      }
    }
  }

  // 2.8 从 URL 列表中随机选择一个视频
  _getRandomVideoUrl() {
    const urls = this.config?.url || [];
    if (urls.length === 0) return '';
    const randomIndex = Math.floor(Math.random() * urls.length);
    return urls[randomIndex];
  }

  // 2.9 渲染视频背景
  render() {
    const urls = this.config?.url || [];
    const top = this.config?.top || '50vh';
    const muted = this.config?.muted !== false;
    const loop = this.config?.loop !== false;
    const autoplay = this.config?.autoplay !== false;
    const objectFit = this.config?.object_fit || 'cover';

    // 如果没有配置 URL，显示占位
    if (urls.length === 0) {
      return html`
        <div class="placeholder">
          <span>请配置视频 URL</span>
        </div>
      `;
    }

    return html`
      <div class="video-container" style="top: ${top}; --video-object-fit: ${objectFit};">
        <video
          src="${this._currentVideoUrl}"
          ?muted=${muted}
          ?loop=${loop}
          ?autoplay=${autoplay}
          playsinline
          preload="auto"
        ></video>
        <div class="overlay"></div>
      </div>
    `;
  }

  // 2.10 计算卡片尺寸
  getCardSize() {
    return 1;
  }
}

customElements.define('hello-video-card', HelloVideoCard);
