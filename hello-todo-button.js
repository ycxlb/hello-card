import { LitElement, html, css } from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

class HelloTodoButtonEditor extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      config: { type: Object },
      _searchTerm: { type: String },
      _filteredEntities: { type: Array },
      _showEntityList: { type: Boolean }
    };
  }

  static get styles() {
    return css`
      .form {
        display: flex;
        flex-direction: column;
        gap: 10px;
        min-height: 500px;
      }
      .form-group {
        display: flex;
        flex-direction: column;
        gap: 5px;
      }
      label {
        font-weight: bold;
      }
      select, input, textarea {
        padding: 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
      }
      textarea {
        min-height: 80px;
        resize: vertical;
      }
      .help-text {
        font-size: 0.85em;
        color: #666;
        margin-top: 4px;
      }

      .entity-selector {
        position: relative;
      }

      .entity-search-input {
        width: 100%;
        padding: 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
        box-sizing: border-box;
      }

      .entity-dropdown {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        height: 300px;
        overflow-y: auto;
        background: white;
        border: 1px solid #ddd;
        border-radius: 4px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        z-index: 1000;
        margin-top: 2px;
      }

      .entity-option {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 12px;
        cursor: pointer;
        border-bottom: 1px solid #eee;
      }

      .entity-option:hover {
        background: #f5f5f5;
      }

      .entity-option.selected {
        background: #e3f2fd;
      }

      .entity-info {
        display: flex;
        align-items: center;
        gap: 8px;
        flex: 1;
      }

      .entity-details {
        flex: 1;
      }

      .entity-name {
        font-weight: 500;
        font-size: 14px;
        color: #000;
      }

      .entity-id {
        font-size: 12px;
        color: #000;
        font-family: monospace;
      }

      .check-icon {
        color: #4CAF50;
      }

      .no-results {
        padding: 12px;
        text-align: center;
        color: #666;
        font-style: italic;
      }

      .selected-entities {
        margin-top: 8px;
      }

      .selected-label {
        font-size: 12px;
        font-weight: bold;
        margin-bottom: 4px;
        color: #333;
      }

      .selected-entity {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        background: #f0f0f0;
        padding: 4px 8px;
        border-radius: 16px;
        margin: 2px 4px 2px 0;
        font-size: 12px;
        color: #000;
      }

      .remove-btn {
        background: none;
        border: none;
        cursor: pointer;
        padding: 0;
        display: flex;
        align-items: center;
        color: #f44336;
      }

      .remove-btn:hover {
        color: #d32f2f;
      }

      /*button新元素 开始*/
      .checkbox-group {
        display: flex;
        align-items: center;
        gap: 0;
        margin: 0;
        padding: 0;
      }

      .checkbox-input {
        margin: 0;
      }

      .checkbox-label {
        font-weight: normal;
        margin: 0;
      }
      /*button新元素 结束*/
    `;
  }

  render() {
    if (!this.hass) return html``;

    return html`
      <div class="form">

      <!-- button新元素 开始-->
        <div class="checkbox-group">
          <input 
            type="checkbox" 
            class="checkbox-input"
            @change=${this._entityChanged}
            .checked=${this.config.badge_mode === true}
            name="badge_mode"
            id="badge_mode"
          />
          <label for="badge_mode" class="checkbox-label" style="color: orange; font-weight: bold;"> 
            🏷️ 角标模式（勾选后只显示图标，数量>0时显示红色角标）
          </label>
        </div>

        <div class="checkbox-group">
          <input 
            type="checkbox" 
            class="checkbox-input"
            @change=${this._entityChanged}
            .checked=${this.config.auto_hide === true}
            name="auto_hide"
            id="auto_hide"
          />
          <label for="auto_hide" class="checkbox-label" style="color: orange; font-weight: bold;"> 
            🚫 自动隐藏（勾选后数量为0时完全不显示）
          </label>
        </div>

        <div class="form-group">
          <label>按钮显示文本
          <input 
            type="text" 
            @change=${this._entityChanged}
            .value=${this.config.button_text !== undefined ? this.config.button_text : '待办'}
            name="button_text"
            placeholder="待办"
          /></label>
        </div>

        <div class="form-group">
          <label>按钮显示图标
          <input 
            type="text" 
            @change=${this._entityChanged}
            .value=${this.config.button_icon !== undefined ? this.config.button_icon : 'mdi:clipboard-list'}
            name="button_icon"
            placeholder="mdi:clipboard-list"
          /></label>
        </div>

        <div class="checkbox-group">
          <input 
            type="checkbox" 
            class="checkbox-input"
            @change=${this._entityChanged}
            .checked=${this.config.transparent_bg === true}
            name="transparent_bg"
            id="transparent_bg"
          />
          <label for="transparent_bg" class="checkbox-label"> 
            （平板端特性）透明背景（勾选后按钮背景透明）
          </label>
        </div>
    
        <div class="checkbox-group">
          <input 
            type="checkbox" 
            class="checkbox-input"
            @change=${this._entityChanged}
            .checked=${this.config.lock_white_fg === true}
            name="lock_white_fg"
            id="lock_white_fg"
          />
          <label for="lock_white_fg" class="checkbox-label"> 
            （平板端特性）白色图标文字（勾选后锁定显示白色）
          </label>
        </div>
    
        <div class="checkbox-group">
          <input 
            type="checkbox" 
            class="checkbox-input"
            @change=${this._entityChanged}
            .checked=${this.config.hide_icon === true}
            name="hide_icon"
            id="hide_icon"
          />
          <label for="hide_icon" class="checkbox-label"> 
          （ 平板端特性）隐藏图标（勾选后隐藏图标）
          </label>
        </div>
    
        <div class="checkbox-group">
          <input 
            type="checkbox" 
            class="checkbox-input"
            @change=${this._entityChanged}
            .checked=${this.config.hide_colon === true}
            name="hide_colon"
            id="hide_colon"
          />
          <label for="hide_colon" class="checkbox-label"> 
          （平板端特性）隐藏冒号（勾选后不显示冒号，改为空格）
          </label>
        </div>
    
        <div class="checkbox-group">
          <input 
            type="checkbox" 
            class="checkbox-input"
            @change=${this._entityChanged}
            .checked=${this.config.hide_zero === true}
            name="hide_zero"
            id="hide_zero"
          />
          <label for="hide_zero" class="checkbox-label"> 
          （平板端特性）隐藏0值（勾选后数量为0时不显示数量）
          </label>
        </div>

        <div class="form-group">
          <label>按钮宽度：默认65px, 支持像素(px)和百分比(%)</label>
          <input 
            type="text" 
            @change=${this._entityChanged}
            .value=${this.config.button_width !== undefined ? this.config.button_width : '65px'}
            name="button_width"
            placeholder="默认65px"
          />
        </div>

        <div class="form-group">
          <label>按钮高度：支持像素(px)、百分比(%)和视窗高度(vh)，默认24px</label>
          <input 
            type="text" 
            @change=${this._entityChanged}
            .value=${this.config.button_height !== undefined ? this.config.button_height : '24px'}
            name="button_height"
            placeholder="默认24px"
            />
        </div>
        
        <div class="form-group">
          <label>按钮文字大小：支持像素(px)，默认11px</label>
          <input 
            type="text" 
            @change=${this._entityChanged}
            .value=${this.config.button_font_size !== undefined ? this.config.button_font_size : '11px'}
            name="button_font_size"
            placeholder="默认11px"
          />
        </div>
        
        <div class="form-group">
          <label>按钮图标大小：支持像素(px)，默认13px</label>
          <input 
            type="text" 
            @change=${this._entityChanged}
            .value=${this.config.button_icon_size !== undefined ? this.config.button_icon_size : '13px'}
            name="button_icon_size"
            placeholder="默认13px"
          />
        </div>

        <div class="form-group">
          <label>点击动作：点击按钮时触发的动作</label>
          <select 
            @change=${this._entityChanged}
            .value=${this.config.tap_action !== 'none' ? 'tap_action' : 'none'}
            name="tap_action"
          >
            <option value="tap_action">弹出待办信息卡片（默认）</option>
            <option value="none">无动作</option>
          </select>
        </div>

        <div class="form-group">
          <label>👇👇👇下方弹出的卡片可增加的其他卡片👇👇👇</label>
          <textarea 
            @change=${this._entityChanged}
            .value=${this.config.other_cards || ''}
            name="other_cards"
            placeholder='# 示例配置：添加button卡片
- type: custom:button-card
  template: 测试模板(最好引用模板，否则大概率会报错)
- type: custom:button-card
  template: 测试模板(最好引用模板，否则大概率会报错)'>
          </textarea>
        </div>

        <div class="checkbox-group">
          <input 
            type="checkbox" 
            class="checkbox-input"
            @change=${this._entityChanged}
            .checked=${this.config.no_preview === true}
            name="no_preview"
            id="no_preview"
          />
          <label for="no_preview" class="checkbox-label" style="color: red;"> 
            📻显示预览📻（ 请先勾选测试显示效果 ）
          </label>
        </div>


        <div class="form-group">
          <label> </label>
          <label>👇👇👇下方是弹出的主卡配置项👇👇👇</label>
          <label> </label>
        </div>

        <!-- button新元素 结束-->

        <div class="form-group">
          <label>卡片宽度：支持像素(px)和百分比(%)，默认100%</label>
          <input 
            type="text" 
            @change=${this._entityChanged}
            .value=${this.config.width !== undefined ? this.config.width : '100%'}
            name="width"
            placeholder="默认100%"
          />
        </div>
        
        <div class="form-group">
          <label>主题</label>
          <select 
            @change=${this._entityChanged}
            .value=${this.config.theme !== undefined ? this.config.theme : 'on'}
            name="theme"
          >
            <option value="on">浅色主题（白底黑字）</option>
            <option value="off">深色主题（深灰底白字）</option>
          </select>
        </div>
        
        <div class="form-group">
          <label>待办事项实体：搜索并选择实体</label>
          <div class="entity-selector">
            <input 
              type="text" 
              @input=${this._onEntitySearch}
              @focus=${this._onEntitySearch}
              .value=${this._searchTerm || ''}
              placeholder="搜索实体..."
              class="entity-search-input"
            />
            ${this._showEntityList ? html`
              <div class="entity-dropdown">
                ${this._filteredEntities.map(entity => html`
                  <div 
                    class="entity-option ${this.config.entities && this.config.entities.includes(entity.entity_id) ? 'selected' : ''}"
                    @click=${() => this._toggleEntity(entity.entity_id)}
                  >
                    <div class="entity-info">
                      <ha-icon icon="${entity.attributes.icon || 'mdi:help-circle'}"></ha-icon>
                      <div class="entity-details">
                        <div class="entity-name">${entity.attributes.friendly_name || entity.entity_id}</div>
                        <div class="entity-id">${entity.entity_id}</div>
                      </div>
                    </div>
                    ${this.config.entities && this.config.entities.includes(entity.entity_id) ? 
                      html`<ha-icon icon="mdi:check" class="check-icon"></ha-icon>` : ''}
                  </div>
                `)}
                ${this._filteredEntities.length === 0 ? html`
                  <div class="no-results">未找到匹配的实体</div>
                ` : ''}
              </div>
            ` : ''}
          </div>
          <div class="selected-entities">
            ${this.config.entities && this.config.entities.length > 0 ? html`
              <div class="selected-label">已选择的实体：</div>
              ${this.config.entities.map(entityId => {
                const entity = this.hass.states[entityId];
                return html`
                  <div class="selected-entity">
                    <ha-icon icon="${entity?.attributes.icon || 'mdi:help-circle'}"></ha-icon>
                    <span>${entity?.attributes.friendly_name || entityId}</span>
                    <button class="remove-btn" @click=${() => this._removeEntity(entityId)}>
                      <ha-icon icon="mdi:close"></ha-icon>
                    </button>
                  </div>
                `;
              })}
            ` : ''}
          </div>
          <div class="help-text">
            搜索并选择要显示的待办事项实体，支持多选
          </div>
        </div>
      </div>

    `;
  }

  _entityChanged(e) {

    /*button新按钮方法 开始*/
    const { name, value, type, checked } = e.target;
    
    let finalValue;
    // 处理复选框
    if (type === 'checkbox') {
      finalValue = checked;
    } else {
      if (!value && name !== 'theme' && name !== 'button_width' && name !== 'button_height' && name !== 'button_font_size' && name !== 'button_icon_size' && name !== 'width' && name !== 'tap_action') return;
      finalValue = value 
    }
    
    // 处理不同字段的默认值
    if (name === 'button_width') {
      finalValue = value || '100%';
    } else if (name === 'button_height') {
      finalValue = value || '24px';
    } else if (name === 'button_font_size') {
      finalValue = value || '11px';
    } else if (name === 'button_icon_size') {
      finalValue = value || '13px';
    } else if (name === 'width') {
      finalValue = value || '100%';
    } else if (name === 'tap_action') {
      // 处理 tap_action 的特殊逻辑
      if (value === 'tap_action') {
        // 如果是弹出卡片，则不设置 tap_action，让组件使用默认逻辑
        finalValue = undefined;
      } else {
        finalValue = value;
      }
    }
    /*button新按钮方法 结束*/
    
    this.config = {
      ...this.config,
      [name]: finalValue
    };
    
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: this.config },
      bubbles: true,
      composed: true
    }));
  }

  _onEntitySearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    this._searchTerm = searchTerm;
    this._showEntityList = true;
    
    if (!this.hass) return;
    
    // 获取所有实体
    const allEntities = Object.values(this.hass.states);
    
    // 过滤实体，默认只显示todo.开头的实体
    this._filteredEntities = allEntities.filter(entity => {
      const entityId = entity.entity_id.toLowerCase();
      const friendlyName = (entity.attributes.friendly_name || '').toLowerCase();
      
      // 默认只显示todo.开头的实体，或者搜索时匹配搜索词
      const isTodoEntity = entityId.startsWith('todo.');
      const matchesSearch = entityId.includes(searchTerm) || friendlyName.includes(searchTerm);
      
      return isTodoEntity && matchesSearch;
    }).slice(0, 50); // 限制显示数量
    
    this.requestUpdate();
  }

  _toggleEntity(entityId) {
    const currentEntities = this.config.entities || [];
    let newEntities;
    
    if (currentEntities.includes(entityId)) {
      // 移除实体
      newEntities = currentEntities.filter(id => id !== entityId);
    } else {
      // 添加实体
      newEntities = [...currentEntities, entityId];
    }
    
    this.config = {
      ...this.config,
      entities: newEntities
    };
    
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: this.config },
      bubbles: true,
      composed: true
    }));
    
    this.requestUpdate();
  }

  _removeEntity(entityId) {
    const currentEntities = this.config.entities || [];
    const newEntities = currentEntities.filter(id => id !== entityId);
    
    this.config = {
      ...this.config,
      entities: newEntities
    };
    
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: this.config },
      bubbles: true,
      composed: true
    }));
    
    this.requestUpdate();
  }

  // 点击外部关闭下拉列表
  firstUpdated() {
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.entity-selector')) {
        this._showEntityList = false;
        this.requestUpdate();
      }
    });
  }

  constructor() {
    super();
    this._searchTerm = '';
    this._filteredEntities = [];
    this._showEntityList = false;
  }

  setConfig(config) {
    this.config = config;
  }
} 
customElements.define('hello-todo-button-editor', HelloTodoButtonEditor);

class HelloTodoButton extends LitElement {
  static get properties() {
    return {
      hass: Object,
      config: Object,
      _todoData: Array,
      _loading: Boolean,
      _refreshInterval: Number,
      _dataLoaded: Boolean,   //button新元素
      theme: { type: String },
      _editingItem: { type: Object },
      _expandedAddForm: { type: Object },
      _popupOpen: { type: Boolean },
      _popupClosing: { type: Boolean }
    };
  }

  static get styles() {
    return css`
      :host {
        display: block;
        width: var(--card-width, 100%);
      }

      /*button新元素 开始*/
      .todo-status {
        width: var(--button-width, 65px);
        height: var(--button-height, 24px);
        padding: 0;
        margin: 0;
        background: var(--bg-color, #fff);
        color: var(--fg-color, #000);
        border-radius: 10px;
        font-size: var(--button-font-size, 11px);
        font-weight: 500;
        text-align: center;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0;
        cursor: pointer;
        transition: background-color 0.2s, transform 0.1s;
        position: relative;
      }

      .status-icon {
        --mdc-icon-size: var(--button-icon-size, 13px);
        color: var(--fg-color, #000);
        margin-right: 3px;
      }

      /* 角标模式样式 */
      .todo-status.badge-mode {
        width: var(--button-width, 65px);
        height: var(--button-height, 24px);
        border-radius: 10px;
        padding: 0;
        margin: 0;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .todo-status.badge-mode .status-icon {
        color: rgb(128, 128, 128);
        transition: color 0.2s;
      }

      .todo-status.badge-mode.has-warning .status-icon {
        color: rgb(255, 0, 0);
      }

      .badge-number {
        position: absolute;
        top: -6px;
        right: -6px;
        min-width: 12px;
        height: 12px;
        background: rgb(255, 0, 0);
        color: rgb(255, 255, 255);
        border-radius: 50%;
        font-size: 8px;
        font-weight: bold;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        box-sizing: border-box;
        line-height: 1;
      }

      /*button新元素 结束*/

      ha-card {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        background: var(--bg-color, #fff);
        border-radius: 12px;
      }

      /*标题容器*/
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px;
        padding-right: 50px;
        background: var(--bg-color, #fff);     
        border-radius: 12px;
      }

      /*标题红色圆点*/
      .offline-indicator {
        display: inline-block;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        margin-right: 8px;
        background: rgb(255, 165, 0);
      }

      /*标题红色圆点动画*/
      @keyframes pulse {
        0% { opacity: 1; }
        50% { opacity: 0.5; }
        100% { opacity: 1; }
      }

      /*标题*/
      .card-title {
        font-size: 20px;
        font-weight: 500;
        color: var(--fg-color, #000);
        height: 30px;
        line-height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;

      }

      /*标题统计数字*/
      .device-count {
        color: var(--fg-color, #000);
        border-radius: 8px;
        font-size: 13px;
        width: 30px;
        height: 30px;
        text-align: center;
        line-height: 30px;
        font-weight: bold;
        padding: 0px;
        background: rgb(255, 165, 0);
      }

      /*2级标题*/
      .section-divider {
        margin: 0 0 8px 0;
        padding: 8px 8px;
        background: var(--bg-color, #fff);
        font-weight: 500;
        color: var(--fg-color, #000);
        border-top: 1px solid rgb(150,150,150,0.5);
        border-bottom: 1px solid rgb(150,150,150,0.5);
        margin: 0 16px 0 16px;

      }
      
      /*2级标题字体*/
      .section-title {
        display: flex;
        align-items: center;
        justify-content: space-between;
        color: var(--fg-color, #000);
        font-size: 13px;
      }

      /*2级标题,统计数量字体*/
      .section-count {
        background: rgb(255,165,0);
        color: var(--fg-color, #000);
        border-radius: 12px;
        width: 15px;
        height: 15px;
        text-align: center;
        line-height: 15px;
        padding: 3px;
        font-size: 12px;
        font-weight: bold;
      }

      /*设备、实体明细*/
      .device-item {
        display: flex;
        align-items: center;
        padding: 0px;
        border-bottom: 1px solid rgb(150,150,150,0.2);
        margin: 0 32px 0px 32px;
      }

      /*设备、实体明细背景*/
      .devices-list {
        flex: 1;
        overflow-y: auto;
        min-height: 0;
        padding: 0 0 8px 0;
      }

      .device-icon {
        margin-right: 12px;
        color: var(--error-color);
      }

      .device-info {
        flex-grow: 1;
        padding: 6px 0;
      }

      .device-name {
        font-weight: 500;
        color: var(--fg-color, #000);
        padding: 6px 0 0 0;
      }

      .device-entity {
        font-size: 10px;
        color: var(--fg-color, #000);
        font-family: monospace;
      }

      .device-details {
        font-size: 10px;
        color: var(--fg-color, #000);
      }

      .device-last-seen {
        font-size: 10px;
        color: var(--fg-color, #000);
        margin-left: auto;
      }

      .no-devices {
        text-align: center;
        padding: 8px 0 0 0;
        color: var(--fg-color, #000);
      }

      .loading {
        text-align: center;
        padding: 0px;
        color: var(--fg-color, #000);
      }
      /* 【V9.2 新增】弹窗遮罩层样式 - 支持手机端点击关闭 */
      .popup-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.5); z-index: 1; display: flex; align-items: center; justify-content: center; padding: 16px; box-sizing: border-box; backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); animation: fadeIn 0.2s ease-out; }
      .popup-overlay.closing { animation: fadeOut 0.2s ease-in forwards; }
      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
      .popup-container { position: relative; width: 100%; max-width: 500px; max-height: 85vh; overflow-y: auto; background: var(--popup-bg, #fff); border-radius: 16px; box-shadow: 0 8px 32px rgba(0,0,0,0.3); animation: slideUp 0.3s ease-out; -webkit-overflow-scrolling: touch; }
      .popup-container.closing { animation: slideDown 0.2s ease-in forwards; }
      @keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      @keyframes slideDown { from { transform: translateY(0); opacity: 1; } to { transform: translateY(30px); opacity: 0; } }
      .popup-close-btn { position: absolute; top: 12px; right: 12px; width: 32px; height: 32px; border-radius: 50%; background: rgba(0,0,0,0.1); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 10; color: var(--fg-color, #000); font-size: 18px; padding: 0; transition: background 0.2s; }
      .popup-close-btn:hover { background: rgba(0,0,0,0.2); }
      .popup-content { padding: 0; overflow: hidden; border-radius: 16px; }
      @media (max-width: 768px) {
        .popup-overlay { padding: 8px; align-items: center; }
        .popup-container { max-height: 90vh; border-radius: 16px; animation: slideUpMobile 0.3s ease-out; }
        .popup-container.closing { animation: slideDownMobile 0.2s ease-in forwards; }
        @keyframes slideUpMobile { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes slideDownMobile { from { transform: translateY(0); } to { transform: translateY(100%); } }
        .popup-close-btn { width: 44px; height: 44px; top: 8px; right: 8px; }
      }


      /*加油图标样式*/
      .device-details ha-icon {
        --mdc-icon-size: 12px;
        color: var(--fg-color, #000);
      }

      /*待办事项样式*/
      .todo-item {
        transition: background-color 0.2s ease;
      }

      .todo-item:hover {
        background-color: rgba(150,150,150,0.1);
        border-radius: 4px;
      }

      .todo-item input[type="checkbox"] {
        cursor: pointer;
      }

      .todo-item button {
        background: none;
        border: none;
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        transition: background-color 0.2s ease;
      }

      .todo-item button {
        color: #f44336;
      }

      .todo-item button:hover {
        background-color: rgba(244, 67, 54, 0.1);
        color: #d32f2f;
      }

      .add-todo {
        display: flex;
        gap: 4px;
        margin-top: 8px;
      }
      
      .add-todo input {
        flex: 1;
        padding: 4px;
        border-radius: 4px;
        background: var(--bg-color, #fff);
        border: 1px solid var(--fg-color, #000);
        color: var(--fg-color, #000);
      }
      
      .add-todo button {
        padding: 4px 8px;
        border-radius: 4px;
        border: 1px solid var(--fg-color, #000);
        background: var(--bg-color, #fff);
        color: var(--fg-color, #000);
        cursor: pointer;
      }
      
      .add-todo input:focus {
        outline: none;
        border-color: #2196F3;
        box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.2);
      }

      .add-todo-expanded {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-top: 8px;
        padding: 8px;
        border: 1px solid var(--fg-color, #000);
        border-radius: 4px;
        background: var(--bg-color, #fff);
      }

      .add-todo-row {
        display: flex;
        gap: 8px;
        align-items: center;
      }

      .add-todo-description {
        flex: 1;
        padding: 4px;
        border: 1px solid var(--fg-color, #000);
        border-radius: 4px;
        background: var(--bg-color, #fff);
        color: var(--fg-color, #000);
        font-size: 13px;
      }

      .add-todo-description:focus {
        outline: none;
        border-color: #2196F3;
        box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.2);
      }

      .add-todo-date {
        padding: 4px;
        border: 1px solid var(--fg-color, #000);
        border-radius: 4px;
        background: var(--bg-color, #fff);
        color: var(--fg-color, #000);
        font-size: 12px;
        width: 120px;
      }

      /* 确保日期输入框显示正确的格式 */
      input[type="date"] {
        color-scheme: light dark;
      }

      input[type="date"]::-webkit-calendar-picker-indicator {
        cursor: pointer;
        filter: invert(0.5);
      }

      /* 深色主题下的日期选择器 */
      [theme="off"] input[type="date"]::-webkit-calendar-picker-indicator {
        filter: invert(1);
      }

      .add-todo-toggle {
        background: none;
        border: 1px solid var(--fg-color, #000);
        color: var(--fg-color, #000);
        padding: 4px 8px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        margin-top: 8px;
        margin-bottom: 2px;
      }

      .add-todo-toggle:hover {
        background-color: rgba(33, 150, 243, 0.1);
        border-color: #2196F3;
      }

      .todo-content {
        flex: 1;
        display: flex;
        flex-direction: column;
      }

      .todo-main {
        display: flex;
        align-items: center;
      }

      .todo-due {
        color: #ff9800;
        font-size: 12px;
        margin-left: 4px;
        font-weight: 500;
      }

      .todo-description {
        color: #999;
        font-size: 11px;
        margin-top: 2px;
        line-height: 1.3;
      }

      .todo-item.no-description {
        align-items: center;
      }

      .todo-item.no-description input[type="checkbox"] {
        margin-top: 0;
      }

      .todo-item .edit-btn {
        background: none;
        border: none;
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        transition: background-color 0.2s ease;
        color: #2196F3 !important;
        margin-right: 4px;
      }

      .todo-item .edit-btn:hover {
        background-color: rgba(33, 150, 243, 0.1);
        color: #1976D2 !important;
      }

      .edit-input {
        flex: 1;
        padding: 4px;
        border: 1px solid var(--fg-color, #000);
        border-radius: 4px;
        background: var(--bg-color, #fff);
        color: var(--fg-color, #000);
        font-size: 13px;
        margin-right: 8px;
      }

      .edit-input:focus {
        outline: none;
        border-color: #2196F3;
        box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.2);
      }
    `;
  }

  constructor() {
    super();
    this._todoData = [];
    this._loading = false;
    this._refreshInterval = null;
    this.theme = 'on';
    this._editingItem = null;
    this._expandedAddForm = {};
    this._popupOpen = false;
    this._popupClosing = false;
    this._popupData = null;
    this._boundPopupKeyHandler = null;
  }

  static getConfigElement() {
    return document.createElement("hello-todo-button-editor");
  }

  connectedCallback() {
    super.connectedCallback();
    this._loadTodoData();
    
    // 设置主题属性
    this.setAttribute('theme', this._evaluateTheme());

    // 每300秒刷新一次数据，减少频繁刷新

  }

  _evaluateTheme() {
    try {
      if (!this.config || !this.config.theme) return 'on';
      if (typeof this.config.theme === 'function') {
          return this.config.theme();
      }
      if (typeof this.config.theme === 'string' && 
              (this.config.theme.includes('return') || this.config.theme.includes('=>'))) {
          return (new Function(`return ${this.config.theme}`))();
      }
      return this.config.theme;
    } catch(e) {
      console.error('计算主题时出错:', e);
      return 'on';
    }
  }

  // 检测 todo 实体状态变化，实现真正的实时更新（无轮询）
  shouldUpdate(changedProperties) {
    if (changedProperties.has('hass') && this.hass) {
      const entities = this.config.entities || [];
      let hasChanged = false;

      for (const entityId of entities) {
        const entity = this.hass.states[entityId];
        if (!entity) continue;

        const oldHass = changedProperties.get('hass');
        if (oldHass) {
          const oldEntity = oldHass.states[entityId];
          if (!oldEntity || oldEntity.state !== entity.state || 
              JSON.stringify(oldEntity.attributes) !== JSON.stringify(entity.attributes)) {
            hasChanged = true;
            break;
          }
        }
      }

      if (hasChanged) {
        this._loadTodoData(true);
      }
    }
    return true;
  }

  _formatDate(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    
    // 检查日期是否有效
    if (isNaN(date.getTime())) {
      return dateString; // 如果无法解析，返回原字符串
    }
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  }

  _formatDateForInput(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    
    // 检查日期是否有效
    if (isNaN(date.getTime())) {
      return '';
    }
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  }

  _calculateDueDate(dueDate) {
    if (!dueDate) return '';
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const due = new Date(dueDate);
    
    // 检查日期是否有效
    if (isNaN(due.getTime())) {
      return dueDate; // 如果无法解析，返回原字符串
    }
    
    due.setHours(0, 0, 0, 0);
    
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return '今天';
    } else if (diffDays === 1) {
      return '明天';
    } else if (diffDays === -1) {
      return '昨天';
    } else if (diffDays > 0 && diffDays <= 7) {
      return `${diffDays}天后`;
    } else if (diffDays > 7) {
      return this._formatDate(dueDate);
    } else {
      return `${Math.abs(diffDays)}天前`;
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._boundPopupKeyHandler) {
      document.removeEventListener('keydown', this._boundPopupKeyHandler);
      this._boundPopupKeyHandler = null;
    }
    if (this._popupOpen) document.body.style.overflow = '';
  }

  async _loadTodoData(silent = false) {
    if (!this.hass) return;
    
    // 静默更新时不显示 loading，避免界面闪烁
    if (!silent) {
      this._loading = true;
      this.requestUpdate();
    }

    try {
      const entities = this.config.entities || [];
      const todoData = [];

      for (const entityId of entities) {
        const entity = this.hass.states[entityId];
        if (!entity) continue;

        // 获取待办事项项目
        let todoItems = [];
        try {
          // 获取所有待办事项 - 使用 WebSocket API
          const result = await this.hass.callWS({
            type: 'todo/item/list',
            entity_id: entityId
          });
          
          todoItems = result.items || [];
        } catch (error) {
          console.error(`获取待办事项失败 ${entityId}:`, error);
        }

        const attributes = entity.attributes;
        todoData.push({
          entity_id: entityId,
          friendly_name: attributes.friendly_name || entityId,
          icon: attributes.icon || 'mdi:format-list-checks',
          state: entity.state || '0',
          items: todoItems,
          incomplete_count: todoItems.filter(item => item.status === 'needs_action').length,
          completed_count: todoItems.filter(item => item.status === 'completed').length
        });
      }

      this._todoData = todoData;
    } catch (error) {
      console.error('加载待办事项数据失败:', error);
      this._todoData = [];
    }

    this._loading = false;
  }

  _handleEntityClick(entity) {
    this._handleClick();
    // 点击实体时打开实体详情页
    if (entity.entity_id) {
      const evt = new Event('hass-more-info', { composed: true });
      evt.detail = { entityId: entity.entity_id };
      this.dispatchEvent(evt);
    }
  }

  _handleClick(){
    const hapticEvent = new Event('haptic', {
      bubbles: true,
      cancelable: false,
      composed: true
    });
    hapticEvent.detail = 'light';
    this.dispatchEvent(hapticEvent);
  }

  /*button新元素 开始*/
  // 【V9.2 重构】_handleButtonClick 打开自定义弹窗，解决手机端无法点击外部关闭的问题
  _handleButtonClick() {
    if (this.config.tap_action === 'none') {
      this._handleClick();
      return;
    }
    this._openPopup();
    this._handleClick();
  }

  // 【V9.2 新增】打开自定义弹窗方法
  _openPopup() {
    const theme = this._evaluateTheme();
    const fgColor = theme === 'on' ? 'rgb(0, 0, 0)' : 'rgb(255, 255, 255)';
    const bgColor = theme === 'on' ? 'rgb(255, 255, 255)' : 'rgb(50, 50, 50)';
    const popupBg = theme === 'on' ? '#ffffff' : '#323232';

    const totalIncompleteCount = this._todoData.reduce((sum, todo) => sum + todo.incomplete_count, 0);

    let additionalCards = [];
    if (this.config.other_cards && this.config.other_cards.trim()) {
      try {
        const parsedCards = this._parseYamlCards(this.config.other_cards);
        additionalCards = parsedCards.map(card => (!card.theme && this.config.theme) ? { ...card, theme: this.config.theme } : card);
      } catch (error) {
        console.error('解析附加卡片配置失败:', error);
      }
    }

    this._popupData = { theme, fgColor, bgColor, popupBg, totalIncompleteCount, additionalCards };
    this._popupOpen = true;
    this._popupClosing = false;
    this.requestUpdate();

    if (!this._boundPopupKeyHandler) {
      this._boundPopupKeyHandler = (e) => { if (e.key === 'Escape' && this._popupOpen) this._closePopup(); };
      document.addEventListener('keydown', this._boundPopupKeyHandler);
    }
    document.body.style.overflow = 'hidden';
  }

  // 【V9.2 新增】关闭弹窗方法（带动画）
  _closePopup() {
    if (!this._popupOpen || this._popupClosing) return;
    this._popupClosing = true;
    this.requestUpdate();
    setTimeout(() => {
      this._popupOpen = false;
      this._popupClosing = false;
      this._popupData = null;
      this.requestUpdate();
      document.body.style.overflow = '';
    }, 250);
  }

  // 【V9.2 新增】处理弹窗遮罩层点击（点击弹窗内容外部时关闭）
  _handleOverlayClick(e) {
    if (e.target === e.currentTarget) this._closePopup();
  }

  // 【V9.2 新增】渲染弹窗内容
  _renderPopup() {
    if (!this._popupOpen) return html``;

    const theme = this._evaluateTheme();
    const fgColor = theme === 'on' ? 'rgb(0, 0, 0)' : 'rgb(255, 255, 255)';
    const bgColor = theme === 'on' ? 'rgb(255, 255, 255)' : 'rgb(50, 50, 50)';
    const popupBg = theme === 'on' ? '#ffffff' : '#323232';
    const totalIncompleteCount = this._todoData.reduce((sum, todo) => sum + todo.incomplete_count, 0);

    let additionalCards = [];
    if (this.config.other_cards && this.config.other_cards.trim()) {
      try {
        const parsedCards = this._parseYamlCards(this.config.other_cards);
        additionalCards = parsedCards.map(card => (!card.theme && this.config.theme) ? { ...card, theme: this.config.theme } : card);
      } catch (error) {
        console.error('解析附加卡片配置失败:', error);
      }
    }

    const closingClass = this._popupClosing ? 'closing' : '';

    return html`
      <div class="popup-overlay ${closingClass}" @click=${this._handleOverlayClick}
           role="dialog" aria-modal="true" aria-label="待办事项详情">
        <div class="popup-container ${closingClass}"
             style="--popup-bg: ${popupBg}; --fg-color: ${fgColor};">
          <button class="popup-close-btn" @click=${this._closePopup} aria-label="关闭弹窗">×</button>
          <div class="popup-content">
            <ha-card style="--fg-color: ${fgColor}; --bg-color: ${bgColor};">
              <div class="card-header">
                <div class="card-title">
                  <span class="offline-indicator"></span>
                  待办事项
                </div>
                <div style="display: flex; align-items: center; gap: 8px; ">
                    <span class="device-count">${totalIncompleteCount}</span>
                </div>
              </div>
              <div class="devices-list">
                ${this._loading ?
                  html`<div class="loading">加载中...</div>` :
                  this._todoData.length === 0 ?
                    html`<div class="no-devices">请配置待办事项实体</div>` :
                    html`
                      ${this._todoData.map(todoData => html`
                        <div class="section-divider">
                          <div class="section-title">
                            <span>${todoData.friendly_name}</span>
                            <span class="section-count">${todoData.incomplete_count}</span>
                          </div>
                        </div>
                        <div class="device-item">
                          <div class="device-info">
                            ${todoData.items.length === 0 ?
                              html`<div class="no-devices">暂无待办事项</div>` :
                              html`
                                ${(() => {
                                  const itemsWithoutTime = todoData.items.filter(item => !item.due);
                                  const itemsWithTime = todoData.items.filter(item => item.due);
                                  itemsWithoutTime.sort((a, b) => (a.summary || '').localeCompare(b.summary || ''));
                                  itemsWithTime.sort((a, b) => {
                                    const dateA = new Date(a.due);
                                    const dateB = new Date(b.due);
                                    return dateA - dateB;
                                  });
                                  const sortedItems = [...itemsWithoutTime, ...itemsWithTime];
                                  return sortedItems.map(item => {
                                    const dueText = this._calculateDueDate(item.due);
                                    const isEditing = this._editingItem && this._editingItem.entityId === todoData.entity_id && this._editingItem.uid === item.uid;
                                    return html`
                                      <div class="todo-item ${!item.description ? 'no-description' : ''}" style="display: flex; padding: 4px 0; border-bottom: 1px solid rgba(150,150,150,0.1);">
                                        <input
                                          type="checkbox"
                                          .checked=${item.status === 'completed'}
                                          @change=${(e) => {
                                            this._updateTodoItem(todoData.entity_id, item.summary || item.uid, e.target.checked ? 'completed' : 'needs_action');
                                            this._handleClick();
                                          }}
                                          style="margin-right: 8px; margin-top: 2px;"
                                        />
                                        ${isEditing ? html`
                                          <div style="flex: 1; display: flex; flex-direction: column; gap: 4px;">
                                            <input
                                              class="edit-input"
                                              type="text"
                                              .value=${this._editingItem.summary}
                                              @input=${(e) => {
                                                this._editingItem.summary = e.target.value;
                                                this.requestUpdate();
                                              }}
                                            />
                                            <textarea
                                              class="edit-input"
                                              style="min-height: 40px; resize: vertical;"
                                              placeholder="描述（可选）..."
                                              .value=${this._editingItem.description || ''}
                                              @input=${(e) => {
                                                this._editingItem.description = e.target.value;
                                                this.requestUpdate();
                                              }}
                                            ></textarea>
                                            <div style="display: flex; gap: 8px; align-items: center;">
                                              <input
                                                type="date"
                                                class="edit-input"
                                                style="width: auto; flex: none;"
                                                .value=${this._editingItem.due || ''}
                                                @input=${(e) => {
                                                  this._editingItem.due = e.target.value;
                                                  this.requestUpdate();
                                                  this._handleClick();
                                                }}
                                              />
                                              <button
                                                style="padding: 4px 8px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;"
                                                @click=${() => {
                                                  this._editTodoItem(todoData.entity_id, item.summary || item.uid, this._editingItem.summary, this._editingItem.description, this._editingItem.due);
                                                  this._editingItem = null;
                                                  this.requestUpdate();
                                                  this._handleClick();
                                                }}
                                              >保存</button>
                                              <button
                                                style="padding: 4px 8px; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer;"
                                                @click=${() => {
                                                  this._editingItem = null;
                                                  this.requestUpdate();
                                                  this._handleClick();
                                                }}
                                              >取消</button>
                                            </div>
                                          </div>
                                        ` : html`
                                          <div class="todo-content">
                                            <div class="todo-main" style="text-decoration: ${item.status === 'completed' ? 'line-through' : 'none'}; color: ${item.status === 'completed' ? '#999' : 'var(--fg-color, #000)'};">
                                              <span>${item.summary}</span>
                                              ${dueText ? html`<span class="todo-due">(${dueText})</span>` : ''}
                                            </div>
                                            ${item.description ? html`<div class="todo-description">${item.description}</div>` : ''}
                                          </div>
                                        `}
                                        ${!isEditing ? html`
                                          <button
                                            class="edit-btn"
                                            @click=${() => {
                                              this._editingItem = {
                                                entityId: todoData.entity_id,
                                                uid: item.uid,
                                                summary: item.summary,
                                                description: item.description || '',
                                                due: this._formatDateForInput(item.due) || ''
                                              };
                                              this.requestUpdate();
                                              this._handleClick();
                                            }}
                                            style="margin-left: 8px; margin-top: 2px;"
                                            title="修改"
                                          ><ha-icon icon="mdi:pencil"></ha-icon></button>
                                        ` : ''}
                                        <button
                                          class="remove-btn"
                                          @click=${() => {
                                            this._removeTodoItem(todoData.entity_id, item.summary || item.uid);
                                            this._handleClick();
                                          }}
                                          style="margin-left: 4px; margin-top: 2px;"
                                          title="删除"
                                        ><ha-icon icon="mdi:delete"></ha-icon></button>
                                      </div>
                                    `;
                                  });
                                })()}
                              `
                            }
                            <div>
                              <button
                                class="add-todo-toggle"
                                @click=${() => {
                                  this._expandedAddForm = {
                                    ...this._expandedAddForm,
                                    [todoData.entity_id]: !this._expandedAddForm[todoData.entity_id]
                                  };
                                  this.requestUpdate();
                                  this._handleClick();
                                }}
                              >${this._expandedAddForm[todoData.entity_id] ? '收起' : '添加新待办事项'}</button>
                              ${this._expandedAddForm[todoData.entity_id] ? html`
                                <div class="add-todo-expanded">
                                  <input
                                    type="text"
                                    class="add-todo-description"
                                    placeholder="待办事项名称..."
                                    @keypress=${(e) => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        const descInput = e.target.parentElement.querySelector('.add-todo-description:nth-of-type(2)');
                                        const dateInput = e.target.parentElement.querySelector('.add-todo-date');
                                        if (e.target.value.trim()) {
                                          this._addTodoItem(todoData.entity_id, e.target.value.trim(), descInput.value, dateInput.value);
                                          e.target.value = '';
                                          descInput.value = '';
                                          dateInput.value = '';
                                        }
                                      }
                                    }}
                                  />
                                  <input
                                    type="text"
                                    class="add-todo-description"
                                    placeholder="描述（可选）..."
                                  />
                                  <div class="add-todo-row">
                                    <input
                                      type="date"
                                      class="add-todo-date"
                                      placeholder="截止日期（可选）"
                                    />
                                    <button
                                      @click=${(e) => {
                                        const nameInput = e.target.closest('.add-todo-expanded').querySelector('.add-todo-description:first-of-type');
                                        const descInput = e.target.closest('.add-todo-expanded').querySelector('.add-todo-description:nth-of-type(2)');
                                        const dateInput = e.target.closest('.add-todo-expanded').querySelector('.add-todo-date');
                                        if (nameInput.value.trim()) {
                                          this._addTodoItem(todoData.entity_id, nameInput.value.trim(), descInput.value, dateInput.value);
                                          nameInput.value = '';
                                          descInput.value = '';
                                          dateInput.value = '';
                                        }
                                        this._handleClick();
                                      }}
                                    >添加</button>
                                  </div>
                                </div>
                              ` : ''}
                            </div>
                          </div>
                        </div>
                      `)}
                    `
                }
              </div>
            </ha-card>
            ${additionalCards.length > 0 ? html`
              <div style="margin-top: 8px;">
                ${additionalCards.map(card => html`
                  <ha-card style="--fg-color: ${fgColor}; --bg-color: ${bgColor}; margin-top: 8px;">
                    <div style="padding: 16px; color: ${fgColor};">
                      <div style="font-size: 12px; opacity: 0.7;">附加卡片: ${card.type || 'unknown'}</div>
                    </div>
                  </ha-card>
                `)}
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }
  /*button新元素 结束*/
  
  async _addTodoItem(entityId, item, description = '', due = '') {
    try {
      const params = {
        entity_id: entityId,
        item: item
      };
      
      // 只有当描述不为空时才添加
      if (description && description.trim()) {
        params.description = description.trim();
      }
      
      // 只有当日期不为空时才添加
      if (due && due.trim()) {
        params.due_date = due.trim();
      }
      
      await this.hass.callService('todo', 'add_item', params);
      this._loadTodoData(); // 重新加载数据
    } catch (error) {
      console.error('添加待办事项失败:', error);
    }
  }

  async _removeTodoItem(entityId, item) {
    try {
      await this.hass.callService('todo', 'remove_item', {
        entity_id: entityId,
        item: item
      });
      this._loadTodoData(); // 重新加载数据
    } catch (error) {
      console.error('删除待办事项失败:', error);
    }
  }

  async _updateTodoItem(entityId, item, status) {
    try {
      await this.hass.callService('todo', 'update_item', {
        entity_id: entityId,
        item: item,
        status: status
      });
      this._loadTodoData(); // 重新加载数据
    } catch (error) {
      console.error('更新待办事项失败:', error);
    }
  }

  async _editTodoItem(entityId, oldItem, newItem, description = '', due = '') {
    try {
      // 先删除旧的待办事项，然后添加新的
      await this.hass.callService('todo', 'remove_item', {
        entity_id: entityId,
        item: oldItem
      });
      
      const params = {
        entity_id: entityId,
        item: newItem
      };
      
      // 只有当描述不为空时才添加
      if (description && description.trim()) {
        params.description = description.trim();
      }
      
      // 只有当日期不为空时才添加
      if (due && due.trim()) {
        params.due_date = due.trim();
      }
      
      await this.hass.callService('todo', 'add_item', params);
      this._loadTodoData(); // 重新加载数据
    } catch (error) {
      console.error('修改待办事项失败:', error);
    }
  }

  render() {
    if (!this.hass) {
      return html`<div class="loading">等待Home Assistant连接...</div>`;
    }
    // 获取主题和颜色
    const theme = this._evaluateTheme();
    const fgColor = theme === 'on' ? 'rgb(0, 0, 0)' : 'rgb(255, 255, 255)';
    const bgColor = theme === 'on' ? 'rgb(255, 255, 255)' : 'rgb(50, 50, 50)';
    
    // 计算总待办数量
    const totalIncompleteCount = this._todoData.reduce((sum, todo) => sum + todo.incomplete_count, 0);


    /*button新元素 前9行和最后1行开始*/
    const showPreview = this.config.no_preview === true;
    
    // 获取新参数
    const badgeMode = this.config.badge_mode === true;
    const transparentBg = this.config.transparent_bg === true;
    const hideIcon = this.config.hide_icon === true;
    const hideColon = this.config.hide_colon === true;
    const hideZero = this.config.hide_zero === true;
    const autoHide = this.config.auto_hide === true;
    const lockWhiteFg = this.config.lock_white_fg === true;
    const buttonText = this.config.button_text || '待办';
    const buttonIcon = this.config.button_icon || 'mdi:clipboard-list';
    
    // 设置背景颜色
    const buttonBgColor = transparentBg ? 'transparent' : theme === 'on' ? 'rgb(255, 255, 255, 0.6)' : 'rgb(83, 83, 83, 0.6)';
    
    // 检查是否需要自动隐藏（只有数据加载完成且数量为0时才考虑隐藏）
    const shouldAutoHide =  autoHide && totalIncompleteCount === 0;
    
    // 如果需要自动隐藏，返回空div
    if (shouldAutoHide) {
      return html`<div></div>`;
    }
    
    // 渲染按钮
    let buttonHtml;
  
    // 数据加载完成后
    if (badgeMode) {
      // 角标模式：只显示图标，根据数量显示角标
      const hasWarning = totalIncompleteCount > 0;
      buttonHtml = html`
        <div class="todo-status badge-mode ${hasWarning ? 'has-warning' : ''}" style="--bg-color: ${buttonBgColor};" @click=${this._handleButtonClick}>
          <ha-icon class="status-icon" icon="${buttonIcon}"></ha-icon>
          ${hasWarning ? html`<div class="badge-number">${totalIncompleteCount}</div>` : ''}
        </div>
      `;
    } else {
      // 普通模式：显示文本和数量
      // 应用锁定白色功能，但预警颜色（红色）不受影响
      let textColor, iconColor;
      if (totalIncompleteCount === 0) {
        // 非预警状态：根据锁定白色设置决定颜色
        textColor = lockWhiteFg ? 'rgb(255, 255, 255)' : fgColor;
        iconColor = lockWhiteFg ? 'rgb(255, 255, 255)' : fgColor;
      } else {
        // 预警状态：始终使用红色，不受锁定白色影响
        textColor = 'rgb(255, 0, 0)';
        iconColor = lockWhiteFg ? 'rgb(255, 255, 255)' : fgColor;
      }
      
      // 构建显示文本
      let displayText = buttonText;
      
      // 根据hide_colon参数决定是否显示冒号
      if (!hideColon) {
        displayText += ':';
      } else {
        displayText += ' ';
      }
      
      // 根据hide_zero参数和实际数量决定是否显示数量
      if (hideZero && totalIncompleteCount === 0) {
        // 隐藏0值时使用CSS空格占位符，保持布局稳定
        displayText += '\u2002'; // 两个en空格，大约等于数字"0"的宽度
      } else {
        displayText += ` ${totalIncompleteCount}`;
      }
      
      buttonHtml = html`
        <div class="todo-status" style="--fg-color: ${textColor}; --bg-color: ${buttonBgColor};" @click=${this._handleButtonClick}>
          ${!hideIcon ? html`<ha-icon class="status-icon" style="color: ${iconColor};" icon="${buttonIcon}"></ha-icon>` : ''}
          ${displayText}
        </div>
      `;
    }

    // 返回最终的渲染结果（包括按钮和预览卡片）
    return html`
      ${buttonHtml}
      ${showPreview ? html`
      <div class="form-group">
        <label>👇👇👇下面是弹出卡片内容👇👇👇</label>
      </div>

      <ha-card style="--fg-color: ${fgColor}; --bg-color: ${bgColor};">
        <div class="card-header">
          <div class="card-title">
            <span class="offline-indicator"></span>
            待办事项
          </div>
          <div style="display: flex; align-items: center; gap: 8px; ">
              <span class="device-count">
                 ${totalIncompleteCount}
              </span>

          </div>
        </div>
        
        <div class="devices-list">
          ${this._loading ? 
            html`<div class="loading">加载中...</div>` :
            
            this._todoData.length === 0 ? 
              html`<div class="no-devices">请配置待办事项实体</div>` :
              html`
                ${this._todoData.map(todoData => html`
                  <div class="section-divider">
                    <div class="section-title">
                      <span>${todoData.friendly_name}</span>
                      <span class="section-count">${todoData.incomplete_count}</span>
                    </div>
                  </div>
                  <div class="device-item">
                    <div class="device-info">
                      ${todoData.items.length === 0 ? 
                        html`<div class="no-devices">暂无待办事项</div>` :
                        html`
                          ${(() => {
                            // 将待办事项分为有时间和无时间两组
                            const itemsWithoutTime = todoData.items.filter(item => !item.due);
                            const itemsWithTime = todoData.items.filter(item => item.due);
                            
                            // 没有时间的按名称排序
                            itemsWithoutTime.sort((a, b) => (a.summary || '').localeCompare(b.summary || ''));
                            
                            // 有时间的按时间排序
                            itemsWithTime.sort((a, b) => {
                              const dateA = new Date(a.due);
                              const dateB = new Date(b.due);
                              return dateA - dateB;
                            });
                            
                            // 合并结果：无时间的在前，有时间的在后
                            const sortedItems = [...itemsWithoutTime, ...itemsWithTime];
                            
                            return sortedItems.map(item => {
                            const dueText = this._calculateDueDate(item.due);
                            const isEditing = this._editingItem && this._editingItem.entityId === todoData.entity_id && this._editingItem.uid === item.uid;
                            
                            return html`
                              <div class="todo-item ${!item.description ? 'no-description' : ''}" style="display: flex; padding: 4px 0; border-bottom: 1px solid rgba(150,150,150,0.1);">
                                <input 
                                  type="checkbox" 
                                  .checked=${item.status === 'completed'}
                                  @change=${(e) => {
                                    this._updateTodoItem(todoData.entity_id, item.summary || item.uid, e.target.checked ? 'completed' : 'needs_action'); 
                                    this._handleClick();
                                  }}
                                  style="margin-right: 8px; margin-top: 2px;"
                                />
                                ${isEditing ? html`
                                  <div style="flex: 1; display: flex; flex-direction: column; gap: 4px;">
                                    <input 
                                      class="edit-input"
                                      type="text" 
                                      .value=${this._editingItem.summary}
                                      @input=${(e) => {
                                        this._editingItem.summary = e.target.value;
                                        this.requestUpdate();
                                      }}
                                    />
                                    <textarea 
                                      class="edit-input"
                                      style="min-height: 40px; resize: vertical;"
                                      placeholder="描述（可选）..."
                                      .value=${this._editingItem.description || ''}
                                      @input=${(e) => {
                                        this._editingItem.description = e.target.value;
                                        this.requestUpdate();
                                      }}
                                    ></textarea>
                                    <div style="display: flex; gap: 8px; align-items: center;">
                                      <input 
                                        type="date" 
                                        class="edit-input"
                                        style="width: auto; flex: none;"
                                        .value=${this._editingItem.due || ''}
                                        @input=${(e) => {
                                          this._editingItem.due = e.target.value;
                                          this.requestUpdate();
                                          this._handleClick();
                                        }}
                                      />
                                      <button 
                                        style="padding: 4px 8px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;"
                                        @click=${() => {
                                          this._editTodoItem(todoData.entity_id, item.summary || item.uid, this._editingItem.summary, this._editingItem.description, this._editingItem.due);
                                          this._editingItem = null;
                                          this.requestUpdate();
                                          this._handleClick();
                                        }}
                                      >
                                        保存
                                      </button>
                                      <button 
                                        style="padding: 4px 8px; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer;"
                                        @click=${() => {
                                          this._editingItem = null;
                                          this.requestUpdate();
                                          this._handleClick();
                                        }}
                                      >
                                        取消
                                      </button>
                                    </div>
                                  </div>
                                ` : html`
                                  <div class="todo-content">
                                    <div class="todo-main" style="text-decoration: ${item.status === 'completed' ? 'line-through' : 'none'}; color: ${item.status === 'completed' ? '#999' : 'var(--fg-color, #000)'};">
                                      <span>${item.summary}</span>
                                      ${dueText ? html`<span class="todo-due">(${dueText})</span>` : ''}
                                    </div>
                                    ${item.description ? html`<div class="todo-description">${item.description}</div>` : ''}
                                  </div>
                                `}
                                ${!isEditing ? html`
                                  <button 
                                    class="edit-btn" 
                                    @click=${() => {
                                      this._editingItem = {
                                        entityId: todoData.entity_id,
                                        uid: item.uid,
                                        summary: item.summary,
                                        description: item.description || '',
                                        due: this._formatDateForInput(item.due) || ''
                                      };
                                      this.requestUpdate();
                                      this._handleClick();
                                    }}
                                    style="margin-left: 8px; margin-top: 2px;"
                                    title="修改"
                                  >
                                    <ha-icon icon="mdi:pencil"></ha-icon>
                                  </button>
                                ` : ''}
                                <button 
                                  class="remove-btn" 
                                  @click=${() => {
                                    this._removeTodoItem(todoData.entity_id, item.summary || item.uid);
                                    this._handleClick();
                                  }}
                                  style="margin-left: 4px; margin-top: 2px;"
                                  title="删除"
                                >
                                  <ha-icon icon="mdi:delete"></ha-icon>
                                </button>
                              </div>
                            `;
                          });
                          })()}
                        `
                      }
                      <div>
                        <button 
                          class="add-todo-toggle"
                          @click=${() => {
                            this._expandedAddForm = {
                              ...this._expandedAddForm,
                              [todoData.entity_id]: !this._expandedAddForm[todoData.entity_id]
                            };
                            this.requestUpdate();
                            this._handleClick();
                          }}
                        >
                          ${this._expandedAddForm[todoData.entity_id] ? '收起' : '添加新待办事项'}
                        </button>
                        
                        ${this._expandedAddForm[todoData.entity_id] ? html`
                          <div class="add-todo-expanded">
                            <input 
                              type="text" 
                              class="add-todo-description"
                              placeholder="待办事项名称..." 
                              @keypress=${(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  const descInput = e.target.parentElement.querySelector('.add-todo-description:nth-of-type(2)');
                                  const dateInput = e.target.parentElement.querySelector('.add-todo-date');
                                  if (e.target.value.trim()) {
                                    this._addTodoItem(todoData.entity_id, e.target.value.trim(), descInput.value, dateInput.value);
                                    e.target.value = '';
                                    descInput.value = '';
                                    dateInput.value = '';
                                  }
                                }
                              }}
                            />
                            <input 
                              type="text" 
                              class="add-todo-description"
                              placeholder="描述（可选）..."
                            />
                            <div class="add-todo-row">
                              <input 
                                type="date" 
                                class="add-todo-date"
                                placeholder="截止日期（可选）"
                              />
                              <button 
                                @click=${(e) => {
                                  const nameInput = e.target.closest('.add-todo-expanded').querySelector('.add-todo-description:first-of-type');
                                  const descInput = e.target.closest('.add-todo-expanded').querySelector('.add-todo-description:nth-of-type(2)');
                                  const dateInput = e.target.closest('.add-todo-expanded').querySelector('.add-todo-date');
                                  if (nameInput.value.trim()) {
                                    this._addTodoItem(todoData.entity_id, nameInput.value.trim(), descInput.value, dateInput.value);
                                    nameInput.value = '';
                                    descInput.value = '';
                                    dateInput.value = '';
                                  }
                                  this._handleClick();
                                }}
                              >
                                添加
                              </button>
                            </div>
                          </div>
                        ` : ''}
                      </div>
                    </div>
                  </div>
                `)}
              `
          }
        </div>
      </ha-card>
      ` : html``}
      ${this._renderPopup()}
    `;
     /*button新元素 结束*/
  }

  setConfig(config) {
    /*button新元素 开始*/
    // 不设置默认值，只有明确配置时才添加 no_preview
    this.config = {
      ...config
    };
    if (config.button_width) {
      this.style.setProperty('--button-width', config.button_width);
    } else {
      this.style.setProperty('--button-width', '65px');
    }
    
    // 设置按钮高度（只控制 todo-status）
    if (config.button_height) {
      this.style.setProperty('--button-height', config.button_height);
    } else {
      this.style.setProperty('--button-height', '24px');
    }
    
    // 设置按钮文字大小（只控制 todo-status）
    if (config.button_font_size) {
      this.style.setProperty('--button-font-size', config.button_font_size);
    } else {
      this.style.setProperty('--button-font-size', '11px');
    }
    
    // 设置按钮图标大小（只控制 todo-status）
    if (config.button_icon_size) {
      this.style.setProperty('--button-icon-size', config.button_icon_size);
    } else {
      this.style.setProperty('--button-icon-size', '13px');
    }
    
    // 设置卡片宽度（控制原来的 UI）
    if (config.width) {
      this.style.setProperty('--card-width', config.width);
    } else {
      this.style.setProperty('--card-width', '100%');
    }
    /*button新元素 结束*/
    
    // 设置主题
    if (config.theme) {
      this.setAttribute('theme', config.theme);
    }
  }

  getCardSize() {
    // 根据待办事项实体数量动态计算卡片大小
    const baseSize = 3;
    const entitySize = Math.max(0, Math.min(this._todoData.length * 2, 10));
    return baseSize + entitySize;
  }
}
customElements.define('hello-todo-button', HelloTodoButton);
