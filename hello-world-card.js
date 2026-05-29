import { LitElement, html, css } from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

// ═══════════════════════════════════════════════════════════════════════════════
// 一、配置编辑器类（HelloWorldCardEditor）
// 负责：卡片配置界面的渲染与交互
// 说明：这是最简单的配置编辑器，只提供一个文本输入框修改问候语
// ═══════════════════════════════════════════════════════════════════════════════

class HelloWorldCardEditor extends LitElement {

  // 1.1 定义组件属性
  // hass: HA 核心对象（必须，编辑器需要读取实体列表等）
  // config: 卡片的配置数据（必须，保存用户设置的参数）
  static get properties() {
    return {
      hass: { type: Object },
      config: { type: Object }
    };
  }

  // 1.2 定义组件样式
  // 使用 css`` 模板字符串定义样式，语法和普通 CSS 一样
  static get styles() {
    return css`
      .form { display: flex; flex-direction: column; gap: 16px; padding: 16px; }
      label { font-weight: bold; margin-bottom: 4px; }
      input { padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; }
      .help { font-size: 12px; color: #666; margin-top: 4px; }
    `;
  }

  // 1.3 设置配置对象（HA 调用，传入当前配置）
  setConfig(config) {
    this.config = config;
  }

  // 1.4 渲染配置界面
  // html`` 是 Lit 的模板标签，用于创建 HTML 模板
  render() {
    // 如果 hass 还没准备好，返回空模板
    if (!this.hass) return html``;

    return html`
      <div class="form">
        <div>
          <label>问候语</label>
          <!-- 
            @change: 输入框失去焦点或按回车时触发的事件
            .value: Lit 的绑定语法，将输入框的值与表达式绑定
            name="name": 用于 _entityChanged 中识别是哪个字段
          -->
          <input 
            type="text" 
            @change=${this._entityChanged} 
            .value=${this.config.name || 'Hello World'} 
            name="name" 
            placeholder="输入问候语..." 
          />
          <div class="help">这里输入的内容会显示在卡片上</div>
        </div>
      </div>
    `;
  }

  // 1.5 处理输入框变化
  // e.target 是触发事件的 DOM 元素（这里是 input）
  // e.target.name 是 "name"，e.target.value 是用户输入的内容
  _entityChanged(e) {
    const { name, value } = e.target;

    // 创建新的配置对象（不可变更新，避免直接修改原对象）
    // ...this.config: 展开原有配置
    // [name]: value: 用新的值覆盖或添加属性
    this.config = { ...this.config, [name]: value };

    // 触发自定义事件通知 HA 配置已变化
    // bubbles: true - 事件冒泡，让父元素也能捕获
    // composed: true - 允许事件穿透 Shadow DOM 边界
    this.dispatchEvent(new CustomEvent('config-changed', { 
      detail: { config: this.config }, 
      bubbles: true, 
      composed: true 
    }));
  }
}

// 1.6 注册自定义元素
// 第一个参数: 自定义标签名（必须在 HA 的 lovelace 配置中使用这个名称）
// 第二个参数: 组件类
// 命名规范: 必须包含连字符，小写，建议用项目前缀避免冲突
customElements.define('hello-world-card-editor', HelloWorldCardEditor);


// ═══════════════════════════════════════════════════════════════════════════════
// 二、卡片显示类（HelloWorldCard）
// 负责：卡片在前端界面的渲染
// 说明：最简单的卡片，只显示一行问候语
// ═══════════════════════════════════════════════════════════════════════════════

class HelloWorldCard extends LitElement {

  // 2.1 定义组件属性
  // hass: HA 核心对象（必须，用于读取实体状态等）
  // config: 卡片配置（包含用户在编辑器中设置的参数）
  static get properties() {
    return {
      hass: Object,
      config: Object
    };
  }

  // 2.2 定义组件样式
  static get styles() {
    return css`
      /* :host 指向自定义元素本身 */
      :host { display: block; }

      /* ha-card 是 HA 的标准卡片容器 */
      ha-card {
        padding: 24px;
        text-align: center;
        background: var(--ha-card-background, var(--card-background-color, white));
        border-radius: var(--ha-card-border-radius, 12px);
        box-shadow: var(--ha-card-box-shadow, 0 2px 8px rgba(0,0,0,0.1));
      }

      .greeting {
        font-size: 24px;
        font-weight: 500;
        color: var(--primary-text-color, #333);
        margin: 0;
      }
    `;
  }

  // 2.3 返回配置编辑器元素（供 HA 调用）
  // 当用户在 UI 中点击"配置卡片"时，HA 会调用这个方法获取编辑器
  static getConfigElement() {
    return document.createElement("hello-world-card-editor");
  }

  // 2.4 设置卡片配置
  // HA 在加载卡片时调用，传入用户在 lovelace 配置中写的配置
  setConfig(config) {
    this.config = config;
  }

  // 2.5 渲染卡片界面
  // 这是核心方法，每次 HA 认为需要刷新时都会调用
  render() {
    // 从配置中读取问候语，如果没有设置则使用默认值
    // this.config?.name: 可选链，如果 config 不存在不会报错
    const greeting = this.config?.name || 'Hello World';

    return html`
      <ha-card>
        <p class="greeting">${greeting}</p>
      </ha-card>
    `;
  }

  // 2.6 计算卡片尺寸（供 HA 布局使用）
  // 返回数字表示卡片占用的行数，帮助 HA 计算页面布局
  getCardSize() {
    return 3; // 这个卡片占用 3 行高度
  }
}

// 2.7 注册卡片组件
customElements.define('hello-world-card', HelloWorldCard);
