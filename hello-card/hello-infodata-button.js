import { LitElement, html, css } from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

class HelloInfoDataButtonEditor extends LitElement {
  // 1.1 定义组件属性，必须是这个名称，框架已经写死了
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
      .form { display: flex; flex-direction: column; gap: 10px; min-height: 500px; }
      .form-group { display: flex; flex-direction: column; gap: 5px; }
      label { font-weight: bold; }
      select, input, textarea { padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
      textarea { min-height: 80px; resize: vertical; }
      .help-text { font-size: 0.85em; color: #666; margin-top: 4px; }
      .entity-selector { position: relative; }
      .entity-search-input { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
      .entity-dropdown { position: absolute; top: 100%; left: 0; right: 0; height: 300px; overflow-y: auto; background: white; border: 1px solid #ddd; border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); z-index: 1000; margin-top: 2px; }
      .entity-option { display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; border-bottom: 1px solid #eee; }
      .entity-option:hover { background: #f5f5f5; }
      .entity-option.selected { background: #e3f2fd; }
      .entity-info { display: flex; align-items: center; gap: 8px; flex: 1; justify-content: space-between; }
      .entity-details { flex: 1; }
      .entity-name { font-weight: 500; font-size: 14px; color: #000; }
      .entity-id { font-size: 12px; color: #000; font-family: monospace; }
      .check-icon { color: #4CAF50; }
      .no-results { padding: 12px; text-align: center; color: #666; font-style: italic; }
      .selected-entities { margin-top: 8px; }
      .selected-label { font-size: 12px; font-weight: bold; margin-bottom: 4px; color: #333; }
      .selected-entity-config { margin-bottom: 8px; border: 1px solid #ddd; border-radius: 4px; padding: 8px; background: #f9f9f9; }
      .selected-entity { display: flex; align-items: center; gap: 4px; margin-bottom: 8px; font-size: 12px; color: #000; justify-content: space-between; }
      .attribute-config { margin-top: 4px; display: flex; flex-direction: column; gap: 4px; }
      .attribute-input { width: 100%; padding: 4px 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 12px; box-sizing: border-box; }
      .override-config { display: flex; align-items: center; gap: 4px; margin-top: 2px; }
      .override-checkbox { margin-right: 4px; }
      .override-input { flex: 1; padding: 2px 6px; border: 1px solid #ddd; border-radius: 3px; font-size: 11px; box-sizing: border-box; }
      .override-label { font-size: 11px; color: #666; white-space: nowrap; }
      .remove-btn { background: none; border: none; cursor: pointer; padding: 0; display: flex; align-items: center; color: #666; margin-left: auto; }
      .remove-btn:hover { color: #f44336; }
      .checkbox-group { display: flex; align-items: center; gap: 0; margin: 0; padding: 0; }
      .checkbox-input { margin: 0; }
      .checkbox-label { font-weight: normal; margin: 0; }
      .rules-section { margin-top: 8px; border-top: 1px dashed #ccc; padding-top: 8px; }
      .rules-label { font-size: 12px; font-weight: bold; color: #d32f2f; margin-bottom: 6px; }
      .rule-item { background: #fff3e0; border: 1px solid #ffcc80; border-radius: 4px; padding: 8px; margin-bottom: 6px; }
      .rule-header { display: flex; align-items: center; gap: 6px; margin-bottom: 6px; }
      .rule-number { background: #ff9800; color: white; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; flex-shrink: 0; }
      .rule-expression { flex: 1; font-family: monospace; font-size: 12px; }
      .add-rule-btn { background: #ff9800; color: white; border: none; border-radius: 4px; padding: 6px 12px; cursor: pointer; font-size: 12px; margin-top: 4px; }
      .add-rule-btn:hover { background: #f57c00; }
      .remove-rule-btn { background: #f44336; color: white; border: none; border-radius: 3px; padding: 4px 8px; cursor: pointer; font-size: 11px; }
      .remove-rule-btn:hover { background: #d32f2f; }
      .rule-help { font-size: 11px; color: #666; margin-top: 4px; font-style: italic; }
      .rule-help code { background: #f5f5f5; padding: 1px 4px; border-radius: 2px; font-family: monospace; }
      .rule-preview { font-size: 11px; color: #1976d2; margin-top: 4px; padding: 4px; background: #e3f2fd; border-radius: 3px; font-family: monospace; }
    `;
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
  firstUpdated() {
    this._outsideClickHandler = (e) => {
      if (!e.target.closest('.entity-selector')) {
        this._showEntityList = false;
        this.requestUpdate();
      }
    };
    document.addEventListener('click', this._outsideClickHandler);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._outsideClickHandler) {
      document.removeEventListener('click', this._outsideClickHandler);
      this._outsideClickHandler = null;
    }
  }
  render() {
    if (!this.hass) return html``;
    return html`
      <div class="form">
        <div class="checkbox-group">
          <input type="checkbox" class="checkbox-input" @change=${this._entityChanged}
            .checked=${this.config.badge_mode === true} name="badge_mode" id="badge_mode" />
          <label for="badge_mode" class="checkbox-label" style="color: orange; font-weight: bold;">
            🏷️ 角标模式（勾选后只显示图标，数量>0时显示红色角标）
          </label>
        </div>
        <div class="checkbox-group">
          <input type="checkbox" class="checkbox-input" @change=${this._entityChanged}
            .checked=${this.config.auto_hide === true} name="auto_hide" id="auto_hide" />
          <label for="auto_hide" class="checkbox-label" style="color: orange; font-weight: bold;">
            🚫 自动隐藏（勾选后数量为0时完全不显示）
          </label>
        </div>
        <div class="form-group">
          <label>按钮显示文本
            <input type="text" @change=${this._entityChanged}
              .value=${this.config.button_text !== undefined ? this.config.button_text : '耗材'}
              name="button_text" placeholder="耗材" />
          </label>
        </div>
        <div class="form-group">
          <label>按钮显示图标
            <input type="text" @change=${this._entityChanged}
              .value=${this.config.button_icon !== undefined ? this.config.button_icon : 'mdi:battery-sync'}
              name="button_icon" placeholder="mdi:battery-sync" />
          </label>
        </div>
        <div class="checkbox-group">
          <input type="checkbox" class="checkbox-input" @change=${this._entityChanged}
            .checked=${this.config.transparent_bg === true} name="transparent_bg" id="transparent_bg" />
          <label for="transparent_bg" class="checkbox-label">（平板端特性）透明背景（勾选后按钮背景透明）</label>
        </div>
        <div class="checkbox-group">
          <input type="checkbox" class="checkbox-input" @change=${this._entityChanged}
            .checked=${this.config.lock_white_fg === true} name="lock_white_fg" id="lock_white_fg" />
          <label for="lock_white_fg" class="checkbox-label">（平板端特性）白色图标文字（勾选后锁定显示白色）</label>
        </div>
        <div class="checkbox-group">
          <input type="checkbox" class="checkbox-input" @change=${this._entityChanged}
            .checked=${this.config.hide_icon === true} name="hide_icon" id="hide_icon" />
          <label for="hide_icon" class="checkbox-label">（平板端特性）隐藏图标（勾选后隐藏图标）</label>
        </div>
        <div class="checkbox-group">
          <input type="checkbox" class="checkbox-input" @change=${this._entityChanged}
            .checked=${this.config.hide_colon === true} name="hide_colon" id="hide_colon" />
          <label for="hide_colon" class="checkbox-label">（平板端特性）隐藏冒号（勾选后不显示冒号，改为空格）</label>
        </div>
        <div class="checkbox-group">
          <input type="checkbox" class="checkbox-input" @change=${this._entityChanged}
            .checked=${this.config.hide_zero === true} name="hide_zero" id="hide_zero" />
          <label for="hide_zero" class="checkbox-label">（平板端特性）隐藏0值（勾选后数量为0时不显示数量）</label>
        </div>
        <div class="form-group">
          <label>按钮宽度：默认65px, 支持像素(px)和百分比(%)</label>
          <input type="text" @change=${this._entityChanged}
            .value=${this.config.button_width !== undefined ? this.config.button_width : '65px'}
            name="button_width" placeholder="默认65px" />
        </div>
        <div class="form-group">
          <label>按钮高度：支持像素(px)、百分比(%)和视窗高度(vh)，默认24px</label>
          <input type="text" @change=${this._entityChanged}
            .value=${this.config.button_height !== undefined ? this.config.button_height : '24px'}
            name="button_height" placeholder="默认24px" />
        </div>
        <div class="form-group">
          <label>按钮文字大小：支持像素(px)，默认11px</label>
          <input type="text" @change=${this._entityChanged}
            .value=${this.config.button_font_size !== undefined ? this.config.button_font_size : '11px'}
            name="button_font_size" placeholder="默认11px" />
        </div>
        <div class="form-group">
          <label>按钮图标大小：支持像素(px)，默认13px</label>
          <input type="text" @change=${this._entityChanged}
            .value=${this.config.button_icon_size !== undefined ? this.config.button_icon_size : '13px'}
            name="button_icon_size" placeholder="默认13px" />
        </div>
        <div class="form-group">
          <label>点击动作：点击按钮时触发的动作</label>
          <select @change=${this._entityChanged}
            .value=${this.config.tap_action !== 'none' ? 'tap_action' : 'none'} name="tap_action">
            <option value="tap_action">弹出耗材卡片（默认）</option>
            <option value="none">无动作</option>
          </select>
        </div>
        <div class="form-group">
          <label>👇👇👇下方弹出的卡片可增加的其他卡片👇👇👇</label>
          <textarea @change=${this._entityChanged}
            .value=${this.config.other_cards || ''} name="other_cards"
            placeholder="# 示例配置：添加button卡片\n- type: custom:button-card\n  template: 测试模板(最好引用模板，否则大概率会报错)"></textarea>
        </div>
        <div class="checkbox-group">
          <input type="checkbox" class="checkbox-input" @change=${this._entityChanged}
            .checked=${this.config.yes_preview === true} name="yes_preview" id="yes_preview" />
          <label for="yes_preview" class="checkbox-label" style="color: red;">📻显示预览📻（请先勾选测试显示效果）</label>
        </div>
        <div class="form-group">
          <label></label>
          <label>👇👇👇下方是弹出的主卡配置项👇👇👇</label>
          <label></label>
        </div>
        <div class="form-group">
          <label>卡片宽度：支持像素(px)和百分比(%)，默认100%</label>
          <input type="text" @change=${this._entityChanged}
            .value=${this.config.width !== undefined ? this.config.width : '100%'}
            name="width" placeholder="默认100%" />
        </div>
        <div class="form-group">
          <label>标题名称：配置卡片显示的标题</label>
          <input type="text" @change=${this._entityChanged}
            .value=${this.config.name !== undefined ? this.config.name : '耗材信息统计'}
            name="name" placeholder="默认：耗材信息统计" />
        </div>
        <div class="form-group">
          <label>全局预警条件：当任一实体满足此条件时触发预警</label>
          <input type="text" @change=${this._entityChanged}
            .value=${this.config.global_warning !== undefined ? this.config.global_warning : ''}
            name="global_warning" placeholder="如: >10, <=5, ==on, ==off, =='hello world'" />
          <div class="help-text">
            全局预警条件：当任一实体满足此条件时，该实体显示为红色预警状态<br>
            优先级：明细预警 > 全局预警 > 无预警<br>
            预警基于换算后的结果进行判断（如果配置了换算）
          </div>
        </div>
        <div class="form-group">
          <label>列数：明细显示的列数</label>
          <select @change=${this._entityChanged}
            .value=${this.config.columns !== undefined ? this.config.columns : '2'} name="columns">
            <option value="1">1列</option>
            <option value="2">2列（默认）</option>
          </select>
        </div>
        <div class="form-group">
          <label>主题</label>
          <select @change=${this._entityChanged}
            .value=${this.config.theme !== undefined ? this.config.theme : 'on'} name="theme">
            <option value="on">浅色主题（白底黑字）</option>
            <option value="off">深色主题（深灰底白字）</option>
          </select>
        </div>
        <div class="form-group">
          <label>设备耗材实体：搜索并选择实体</label>
          <div class="entity-selector">
            <input type="text" @input=${this._onEntitySearch} @focus=${this._onEntitySearch}
              .value=${this._searchTerm || ''} placeholder="搜索实体..." class="entity-search-input" />
            ${this._showEntityList ? html`
              <div class="entity-dropdown">
                ${this._filteredEntities.map(entity => html`
                  <div class="entity-option ${this.config.entities && this.config.entities.some(e => e.entity_id === entity.entity_id) ? 'selected' : ''}"
                    @click=${() => this._toggleEntity(entity.entity_id)}>
                    <div class="entity-info">
                      <div class="entity-details">
                        <div class="entity-name">${entity.attributes.friendly_name || entity.entity_id}</div>
                        <div class="entity-id">${entity.entity_id}</div>
                      </div>
                      <ha-icon icon="${entity.attributes.icon || 'mdi:help-circle'}"></ha-icon>
                    </div>
                    ${this.config.entities && this.config.entities.some(e => e.entity_id === entity.entity_id)
                      ? html`<ha-icon icon="mdi:check" class="check-icon"></ha-icon>` : ''}
                  </div>
                `)}
                ${this._filteredEntities.length === 0 ? html`<div class="no-results">未找到匹配的实体</div>` : ''}
              </div>
            ` : ''}
          </div>
          <div class="selected-entities">
            ${this.config.entities && this.config.entities.length > 0 ? html`
              <div class="selected-label">已选择的实体：</div>
              ${this.config.entities.map((entityConfig, index) => {
                const entity = this.hass.states[entityConfig.entity_id];
                return html`
                  <div class="selected-entity-config">
                    <div class="selected-entity">
                      <span>${entity?.attributes.friendly_name || entityConfig.entity_id}</span>
                      <ha-icon icon="${entity?.attributes.icon || 'mdi:help-circle'}"></ha-icon>
                      <button class="remove-btn" @click=${() => this._removeEntity(index)}>
                        <ha-icon icon="mdi:close"></ha-icon>
                      </button>
                    </div>
                    <div class="attribute-config">
                      <input type="text" @change=${(e) => this._updateEntityAttribute(index, e.target.value)}
                        .value=${entityConfig.attribute || ''}
                        placeholder="留空使用实体状态(state)，或输入属性名（如 brightness, color_temp）"
                        class="attribute-input" />
                      <div class="override-config">
                        <input type="checkbox" class="override-checkbox"
                          @change=${(e) => this._updateEntityOverride(index, 'icon', e.target.checked)}
                          .checked=${entityConfig.overrides?.icon !== undefined} />
                        <span class="override-label">图标:</span>
                        <input type="text" class="override-input"
                          @change=${(e) => this._updateEntityOverrideValue(index, 'icon', e.target.value)}
                          .value=${entityConfig.overrides?.icon || ''} placeholder="mdi:icon-name"
                          ?disabled=${entityConfig.overrides?.icon === undefined} />
                      </div>
                      <div class="override-config">
                        <input type="checkbox" class="override-checkbox"
                          @change=${(e) => this._updateEntityOverride(index, 'name', e.target.checked)}
                          .checked=${entityConfig.overrides?.name !== undefined} />
                        <span class="override-label">名称:</span>
                        <input type="text" class="override-input"
                          @change=${(e) => this._updateEntityOverrideValue(index, 'name', e.target.value)}
                          .value=${entityConfig.overrides?.name || ''} placeholder="自定义名称"
                          ?disabled=${entityConfig.overrides?.name === undefined} />
                      </div>
                      <div class="override-config">
                        <input type="checkbox" class="override-checkbox"
                          @change=${(e) => this._updateEntityOverride(index, 'unit_of_measurement', e.target.checked)}
                          .checked=${entityConfig.overrides?.unit_of_measurement !== undefined} />
                        <span class="override-label">单位:</span>
                        <input type="text" class="override-input"
                          @change=${(e) => this._updateEntityOverrideValue(index, 'unit_of_measurement', e.target.value)}
                          .value=${entityConfig.overrides?.unit_of_measurement || ''} placeholder="自定义单位"
                          ?disabled=${entityConfig.overrides?.unit_of_measurement === undefined} />
                      </div>
                      <div class="override-config">
                        <input type="checkbox" class="override-checkbox"
                          @change=${(e) => this._updateEntityOverride(index, 'conversion', e.target.checked)}
                          .checked=${entityConfig.overrides?.conversion !== undefined} />
                        <span class="override-label">换算:</span>
                        <input type="text" class="override-input"
                          @change=${(e) => this._updateEntityOverrideValue(index, 'conversion', e.target.value)}
                          .value=${entityConfig.overrides?.conversion || ''}
                          placeholder="k+(2*k)/2-0.5，k代表当前实体值"
                          ?disabled=${entityConfig.overrides?.conversion === undefined} />
                      </div>
                      ${this._renderRulesEditor(entityConfig, index)}
                      <div class="help-text">
                        <strong>预警/异常规则：</strong>支持括号表达式、AND/OR 组合、跨实体引用<br>
                        <strong>表达式换算：</strong>使用 k 代表当前实体值，支持四则运算和括号，如 k*2+10, (k+5)/2<br>
                        <strong style="color:#d32f2f;">注意：属性留空时使用实体状态(state)判断，指定属性时使用属性值判断</strong>
                      </div>
                    </div>
                  </div>
                `;
              })}
            ` : ''}
          </div>
          <div class="help-text">
            搜索并选择要显示的设备耗材实体，支持多选。每个实体可以配置：<br>
            • 属性名：留空使用实体状态(state)，或输入属性名（如 light 的 brightness）<br>
            • 名称重定义：勾选后可自定义显示名称<br>
            • 图标重定义：勾选后可自定义图标（如 mdi:phone）<br>
            • 单位重定义：勾选后可自定义单位（如 元、$、kWh 等）<br>
            • 预警条件：勾选后设置预警条件，异常规则：支持括号表达式、AND/OR 组合、跨实体引用,多行条件之间为OR运行<br>
            • 换算：表达式换算：使用 k 代表当前实体值，支持四则运算和括号<br>
          </div>
        </div>
      </div>
    `;
  }
  // 1.7.1 渲染规则编辑器：每条规则是一个表达式字符串，多条为OR运算
  _renderRulesEditor(entityConfig, entityIndex) {
    const rules = entityConfig.rules || [];
    return html`
      <div class="rules-section">
        <div class="rules-label">🚨 异常检测规则（${rules.length > 0 ? '已启用' : '未启用'}）</div>
        ${rules.map((rule, ruleIndex) => html`
          <div class="rule-item">
            <div class="rule-header">
              <div class="rule-number">${ruleIndex + 1}</div>
              <input type="text" class="rule-expression"
                .value=${rule.expression || ''}
                @change=${(e) => this._updateRuleExpression(entityIndex, ruleIndex, e.target.value)}
                placeholder="输入条件表达式，如: <30, (brightness < 30) AND (sensor.x == 'on')" />
              <button class="remove-rule-btn" @click=${() => this._removeRule(entityIndex, ruleIndex)}>删除</button>
            </div>
            ${rule.expression ? html`
              <div class="rule-preview">解析: ${this._previewExpression(rule.expression, entityConfig.entity_id)}</div>
            ` : ''}
          </div>
        `)}
        <button class="add-rule-btn" @click=${() => this._addRule(entityIndex)}>+ 添加异常检测规则</button>
        <div class="rule-help">
          <strong>表达式语法，多条之间为OR运算：</strong><br>
          • 本实体状态条件：<code>&lt;30</code>、<code>==on</code>、<code>!=off</code>、<code>>100</code><br>
          • 本实体属性条件：<code>brightness &lt; 30</code>、<code>color_temp > 400</code><br>
          • 跨实体引用：<code>sensor.temperature > 30</code>、<code>light.bedroom == 'on'</code><br>
          • 跨实体属性：<code>light.bedroom.brightness < 100</code><br>
          • AND 组合：<code>(brightness &lt; 30) AND (sensor.motion == 'on')</code><br>
          • OR 组合：<code>(brightness &lt; 30) OR (brightness > 150)</code><br>
          • 嵌套括号：<code>((A > 10) AND (B &lt; 20)) OR (C == 'on')</code><br>
          • 字符串值用引号：<code>== 'hello'</code>、<code>!= "world"</code><br>
          <strong style="color:#d32f2f;">优先级：括号 > AND > OR，与常规逻辑一致</strong>
        </div>
      </div>
    `;
  }
  // 1.8 预览表达式解析结果
  _previewExpression(expression, defaultEntityId) {
    if (!expression || !expression.trim()) return '空表达式';
    try {
      let preview = expression;
      const entityPattern = /([a-zA-Z_][a-zA-Z0-9_]*\.[a-zA-Z_][a-zA-Z0-9_]*(?:\.[a-zA-Z_][a-zA-Z0-9_]*)?)\s*(>=|<=|>|<|==|!=)/g;
      preview = preview.replace(entityPattern, (match, fullRef, op) => {
        const parts = fullRef.split('.');
        const eid = parts.slice(0, 2).join('.');
        const attr = parts.length > 2 ? parts.slice(2).join('.') : null;
        return attr ? `${eid}.${attr} ${op}` : `${eid} ${op}`;
      });
      return preview;
    } catch (e) {
      return expression;
    }
  }
  // 1.9 规则编辑器：增加规则
  _addRule(entityIndex) {
    const currentEntities = this.config.entities || [];
    const newEntities = [...currentEntities];
    if (newEntities[entityIndex]) {
      const rules = [...(newEntities[entityIndex].rules || [])];
      rules.push({ expression: '' });
      newEntities[entityIndex] = { ...newEntities[entityIndex], rules };
    }
    this.config = { ...this.config, entities: newEntities };
    this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: this.config }, bubbles: true, composed: true }));
    this.requestUpdate();
  }
  // 1.10 规则编辑器：移除规则
  _removeRule(entityIndex, ruleIndex) {
    const currentEntities = this.config.entities || [];
    const newEntities = [...currentEntities];
    if (newEntities[entityIndex] && newEntities[entityIndex].rules) {
      const rules = newEntities[entityIndex].rules.filter((_, i) => i !== ruleIndex);
      newEntities[entityIndex] = { ...newEntities[entityIndex], rules };
      if (rules.length === 0) {
        const { rules, ...rest } = newEntities[entityIndex];
        newEntities[entityIndex] = rest;
      }
    }
    this.config = { ...this.config, entities: newEntities };
    this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: this.config }, bubbles: true, composed: true }));
    this.requestUpdate();
  }
  // 1.11 规则编辑器：更新规则
  _updateRuleExpression(entityIndex, ruleIndex, expression) {
    const currentEntities = this.config.entities || [];
    const newEntities = [...currentEntities];
    if (newEntities[entityIndex] && newEntities[entityIndex].rules && newEntities[entityIndex].rules[ruleIndex]) {
      const rules = [...newEntities[entityIndex].rules];
      rules[ruleIndex] = { ...rules[ruleIndex], expression: expression.trim() };
      newEntities[entityIndex] = { ...newEntities[entityIndex], rules };
    }
    this.config = { ...this.config, entities: newEntities };
    this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: this.config }, bubbles: true, composed: true }));
    this.requestUpdate();
  }
  // 1.12 通用配置项变更处理
  _entityChanged(e) {
    const { name, value, type, checked } = e.target;
    let finalValue;
    if (type === 'checkbox') {
      finalValue = checked;
    } else {
      if (!value && name !== 'theme' && name !== 'button_width' && name !== 'button_height'
        && name !== 'button_font_size' && name !== 'button_icon_size' && name !== 'width'
        && name !== 'tap_action') return;
      finalValue = value;
    }
    if (name === 'button_width') finalValue = value || '100%';
    else if (name === 'button_height') finalValue = value || '24px';
    else if (name === 'button_font_size') finalValue = value || '11px';
    else if (name === 'button_icon_size') finalValue = value || '13px';
    else if (name === 'width') finalValue = value || '100%';
    else if (name === 'tap_action') finalValue = value === 'tap_action' ? undefined : value;
    this.config = { ...this.config, [name]: finalValue };
    this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: this.config }, bubbles: true, composed: true }));
  }
  // 1.13 实体搜索处理
  _onEntitySearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    this._searchTerm = searchTerm;
    this._showEntityList = true;
    if (!this.hass) return;
    const allEntities = Object.values(this.hass.states);
    this._filteredEntities = allEntities.filter(entity => {
      const entityId = entity.entity_id.toLowerCase();
      const friendlyName = (entity.attributes.friendly_name || '').toLowerCase();
      return entityId.includes(searchTerm) || friendlyName.includes(searchTerm);
    }).slice(0, 50);
    this.requestUpdate();
  }
  // 1.14 切换实体选中/取消选中
  _toggleEntity(entityId) {
    const currentEntities = this.config.entities || [];
    let newEntities;
    if (currentEntities.some(e => e.entity_id === entityId)) {
      newEntities = currentEntities.filter(e => e.entity_id !== entityId);
    } else {
      newEntities = [...currentEntities, { entity_id: entityId, overrides: undefined }];
    }
    this.config = { ...this.config, entities: newEntities };
    this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: this.config }, bubbles: true, composed: true }));
    this.requestUpdate();
  }
  // 1.15 移除已选实体
  _removeEntity(index) {
    const currentEntities = this.config.entities || [];
    const newEntities = currentEntities.filter((_, i) => i !== index);
    this.config = { ...this.config, entities: newEntities };
    this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: this.config }, bubbles: true, composed: true }));
    this.requestUpdate();
  }
  // 1.16 更新实体属性名配置
  _updateEntityAttribute(index, attributeValue) {
    const currentEntities = this.config.entities || [];
    const newEntities = [...currentEntities];
    if (newEntities[index]) {
      const trimmedValue = attributeValue.trim();
      if (trimmedValue === '') {
        const { attribute, ...entityWithoutAttribute } = newEntities[index];
        newEntities[index] = entityWithoutAttribute;
      } else {
        newEntities[index] = { ...newEntities[index], attribute: trimmedValue };
      }
    }
    this.config = { ...this.config, entities: newEntities };
    this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: this.config }, bubbles: true, composed: true }));
    this.requestUpdate();
  }
  // 1.17 启用/禁用某项覆盖配置
  _updateEntityOverride(index, overrideType, enabled) {
    const currentEntities = this.config.entities || [];
    const newEntities = [...currentEntities];
    if (newEntities[index]) {
      const overrides = { ...newEntities[index].overrides };
      if (enabled) overrides[overrideType] = '';
      else delete overrides[overrideType];
      newEntities[index] = { ...newEntities[index], overrides: Object.keys(overrides).length > 0 ? overrides : undefined };
    }
    this.config = { ...this.config, entities: newEntities };
    this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: this.config }, bubbles: true, composed: true }));
    this.requestUpdate();
  }
  // 1.18 更新覆盖配置的具体值
  _updateEntityOverrideValue(index, overrideType, value) {
    const currentEntities = this.config.entities || [];
    const newEntities = [...currentEntities];
    if (newEntities[index] && newEntities[index].overrides && newEntities[index].overrides[overrideType] !== undefined) {
      const overrides = { ...newEntities[index].overrides };
      overrides[overrideType] = value.trim();
      newEntities[index] = { ...newEntities[index], overrides };
    }
    this.config = { ...this.config, entities: newEntities };
    this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: this.config }, bubbles: true, composed: true }));
    this.requestUpdate();
  }
}
// 1.19 注册编辑器组件（UI配置界面）
customElements.define('hello-infodata-button-editor', HelloInfoDataButtonEditor);

class HelloInfoDataButton extends LitElement {
  static get properties() {
    return {
      hass: Object,
      config: Object,
      _HelloInfoData: Array,
      _loading: Boolean,
      _refreshInterval: Number,
      _dataLoaded: Boolean,
      _popupOpen: Boolean,      // 【V9.2 新增】弹窗打开状态
      theme: { type: String }
    };
  }
  static get styles() {
    return css`
      :host { display: block; width: var(--card-width, 100%); }
      .infodata-status {
        width: var(--button-width, 65px); height: var(--button-height, 24px); padding: 0; margin: 0;
        background: var(--bg-color, #fff); color: var(--fg-color, #000); border-radius: 10px;
        font-size: var(--button-font-size, 11px); font-weight: 500; text-align: center;
        box-sizing: border-box; display: flex; align-items: center; justify-content: center;
        gap: 0; cursor: pointer; transition: background-color 0.2s, transform 0.1s;
        position: relative; user-select: none; -webkit-user-select: none;
        -webkit-tap-highlight-color: transparent;
      }
      .status-icon { --mdc-icon-size: var(--button-icon-size, 13px); color: var(--fg-color, #000); margin-right: 3px; }
      .infodata-status.badge-mode { width: var(--button-width, 65px); height: var(--button-height, 24px); border-radius: 10px; padding: 0; margin: 0; display: flex; align-items: center; justify-content: center; }
      .infodata-status.badge-mode .status-icon { color: rgb(128, 128, 128); transition: color 0.2s; }
      .infodata-status.badge-mode.has-warning .status-icon { color: rgb(255, 0, 0); }
      .badge-number { position: absolute; top: -6px; right: -6px; min-width: 12px; height: 12px; background: rgb(255, 0, 0); color: rgb(255, 255, 255); border-radius: 50%; font-size: 8px; font-weight: bold; display: flex; align-items: center; justify-content: center; padding: 0; box-sizing: border-box; line-height: 1; }

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

      ha-card { width: 100%; height: 100%; display: flex; flex-direction: column; background: var(--bg-color, #fff); border-radius: 12px; }
      .card-header { display: flex; justify-content: space-between; align-items: center; padding: 16px; padding-right: 50px; background: var(--bg-color, #fff); border-radius: 12px; }
      .offline-indicator { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 8px; }
      @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
      .card-title { font-size: 20px; font-weight: 500; color: var(--fg-color, #000); height: 30px; line-height: 30px; display: flex; align-items: center; justify-content: center; }
      .device-count { color: var(--fg-color, #000); border-radius: 8px; font-size: 13px; width: 30px; height: 30px; text-align: center; line-height: 30px; font-weight: bold; padding: 0px; }
      .device-count.non-zero { background: rgba(255, 0, 0, 0.7); color: #fff; }
      .device-count.zero { background: rgba(0, 205, 0, 0.7); color: #fff; }
      .refresh-btn { color: var(--fg-color, #fff); border: none; border-radius: 8px; padding: 5px; cursor: pointer; font-size: 13px; width: 50px; height: 30px; line-height: 30px; text-align: center; font-weight: bold; padding: 0px; }
      .section-divider { margin: 0 0 8px 0; padding: 8px 8px; background: var(--bg-color, #fff); font-weight: 500; color: var(--fg-color, #000); border-top: 1px solid rgb(150,150,150,0.5); border-bottom: 1px solid rgb(150,150,150,0.5); margin: 0 16px 0 16px; }
      .section-title { display: flex; align-items: center; justify-content: space-between; color: var(--fg-color, #000); font-size: 13px; }
      .section-count { background: rgb(255,0,0,0.5); color: var(--fg-color, #000); border-radius: 12px; width: 15px; height: 15px; text-align: center; line-height: 15px; padding: 3px; font-size: 12px; font-weight: bold; }
      .device-item { display: flex; align-items: center; justify-content: space-between; margin: 0px 16px; padding: 0; border-bottom: 1px solid rgb(150,150,150,0.5); cursor: pointer; transition: background-color 0.2s; min-height: 30px; max-height: 30px; }
      .device-item:first-child { border-top: 1px solid rgb(150,150,150,0.5); }
      .device-item:hover { background-color: rgba(150,150,150,0.1); }
      .devices-list { flex: 1; overflow-y: auto; min-height: 0; padding: 0 0 8px 0; }
      .devices-grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 0 15px; padding: 0px 16px; width: 100%; box-sizing: border-box; overflow: hidden; }
      .devices-grid > * { min-width: 0; width: 100%; box-sizing: border-box; overflow: hidden; }
      .devices-grid .device-item { margin: 0.5px 0; padding: 0; background: var(--bg-color, #fff); display: flex; align-items: center; justify-content: space-between; cursor: pointer; transition: background-color 0.2s; min-height: 30px; max-height: 30px; border-bottom: none; border-right: none; border-left: none; width: 100%; max-width: 100%; box-sizing: border-box; overflow: hidden; border-bottom: 1px solid rgb(150,150,150,0.5); }
      .devices-grid .device-item:hover { background-color: rgba(150,150,150,0.1); }
      .devices-grid .device-item:nth-child(1), .devices-grid .device-item:nth-child(2) { border-top: 1px solid rgb(150,150,150,0.5); }
      .devices-list.single-column { padding: 0 0 8px 0; }
      .device-left { display: flex; align-items: center; flex: 1; min-width: 0; overflow: hidden; }
      .device-icon { margin-right: 8px; color: var(--fg-color, #000); flex-shrink: 0; font-size: 11px; width: 12px; height: 12px; display: flex; align-items: center; justify-content: center; }
      .device-name { color: var(--fg-color, #000); font-size: 11px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1; min-width: 0; }
      .device-value { color: var(--fg-color, #000); font-size: 11px; flex-shrink: 0; font-weight: bold; max-width: 45%; text-align: right; overflow: hidden; white-space: nowrap; }
      .device-value.warning { color: #F44336; }
      .device-unit { font-size: 11px; color: var(--fg-color, #000); margin-left: 0.5px; font-weight: bold; white-space: nowrap; flex-shrink: 0; }
      .device-unit.warning { color: #F44336; }
      .no-devices { text-align: center; padding: 10px 0; color: var(--fg-color, #000); }
      .loading { text-align: center; padding: 10px 0; color: var(--fg-color, #000); }
    `;
  }
  static getConfigElement() { return document.createElement("hello-infodata-button-editor"); }
  static getStubConfig() { return { name: '数据集信息统计', entities: [] }; }
  constructor() {
    super();
    this._HelloInfoData = [];
    this._loading = false;
    this._refreshInterval = null;
    this._lastProcessedData = null;
    this._popupOpen = false;
    this._popupClosing = false;
    this._popupData = null;
    this._boundPopupKeyHandler = null;
    this.theme = 'on';
  }
  setConfig(config) {
    this.config = { ...config };
    this.style.setProperty('--button-width', config.button_width || '65px');
    this.style.setProperty('--button-height', config.button_height || '24px');
    this.style.setProperty('--button-font-size', config.button_font_size || '11px');
    this.style.setProperty('--button-icon-size', config.button_icon_size || '13px');
    this.style.setProperty('--card-width', config.width || '100%');
    if (config.theme) this.setAttribute('theme', config.theme);
  }
  connectedCallback() {
    super.connectedCallback();
    this.setAttribute('theme', this._evaluateTheme());
    this._refreshInterval = setInterval(() => this.requestUpdate(), 300000);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._refreshInterval) clearInterval(this._refreshInterval);
    if (this._boundPopupKeyHandler) {
      document.removeEventListener('keydown', this._boundPopupKeyHandler);
      this._boundPopupKeyHandler = null;
    }
    // 【V9.2】确保弹窗关闭时恢复背景滚动
    if (this._popupOpen) document.body.style.overflow = '';
  }
  // 2.8 强制刷新判断
  shouldUpdate(changedProperties) {
    // 【V9.2 修复】弹窗打开时强制刷新数据
    if (this._popupOpen) return true;
    if (!this._lastProcessedData || changedProperties.has('config')) return true;
    if (!this.hass) return false;
    const entities = this.config.entities || [];
    for (const entityConfig of entities) {
      const entityId = entityConfig.entity_id;
      const entity = this.hass.states[entityId];
      if (!entity) continue;
      const attributeName = entityConfig.attribute;
      let currentValue = entity.state;
      if (attributeName && entity.attributes && entity.attributes.hasOwnProperty(attributeName)) {
        currentValue = entity.attributes[attributeName];
      }
      const cachedData = this._lastProcessedData[entityId];
      if (!cachedData || String(currentValue) !== String(cachedData.value)) {
        console.log(`[hello-infodata-card][shouldUpdate] 实体 ${entityId} 变化: ${cachedData ? cachedData.value : 'null'} -> ${currentValue}`);
        return true;
      }
      if (entityConfig.rules) {
        for (const rule of entityConfig.rules) {
          if (rule.expression) {
            const referencedEntities = this._extractEntitiesFromExpression(rule.expression);
            for (const ref of referencedEntities) {
              const refEntity = this.hass.states[ref.entityId];
              if (!refEntity) continue;
              let refValue = refEntity.state;
              if (ref.attribute && refEntity.attributes && refEntity.attributes.hasOwnProperty(ref.attribute)) {
                refValue = refEntity.attributes[ref.attribute];
              }
              const cacheKey = `${ref.entityId}:${ref.attribute || 'state'}`;
              const cached = this._lastProcessedData[cacheKey];
              if (!cached || String(refValue) !== String(cached.value)) {
                console.log(`[hello-infodata-card][shouldUpdate] 规则引用实体 ${cacheKey} 变化: ${cached ? cached.value : 'null'} -> ${refValue}`);
                return true;
              }
            }
          }
        }
      }
    }
    return false;
  }
  // 【V9.2 优化】统一触觉反馈方法
  _sendHaptic() {
    const hapticEvent = new Event('haptic', { bubbles: true, cancelable: false, composed: true });
    hapticEvent.detail = 'light';
    this.dispatchEvent(hapticEvent);
  }

  /*button新元素 开始*/
  // 【V9.2 重构】_handleButtonClick 打开自定义弹窗，解决手机端无法点击外部关闭的问题
  _handleButtonClick() {
    if (this.config.tap_action === 'none') {
      this._sendHaptic();
      return;
    }
    this._openPopup();
    this._sendHaptic();
  }

  // 【V9.2 新增】打开自定义弹窗方法
  _openPopup() {
    const theme = this._evaluateTheme();
    const fgColor = theme === 'on' ? 'rgb(0, 0, 0)' : 'rgb(255, 255, 255)';
    const bgColor = theme === 'on' ? 'rgb(255, 255, 255)' : 'rgb(50, 50, 50)';
    const popupBg = theme === 'on' ? '#ffffff' : '#323232';
    const entities = this.config.entities || [];
    const infodataData = [];
    for (const entityConfig of entities) {
      const processed = this._processEntity(entityConfig);
      if (processed) infodataData.push(processed);
    }
    const warningCount = infodataData.filter(d => this._isWarning(d)).length;
    let additionalCards = [];
    if (this.config.other_cards && this.config.other_cards.trim()) {
      try {
        const parsedCards = this._parseYamlCards(this.config.other_cards);
        additionalCards = parsedCards.map(card => (!card.theme && this.config.theme) ? { ...card, theme: this.config.theme } : card);
      } catch (error) { console.error('解析附加卡片配置失败:', error); }
    }
    this._popupData = { theme, fgColor, bgColor, popupBg, infodataData, warningCount, additionalCards };
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
    // 【V9.2 修复】实时计算弹窗数据，确保数据随后台实时更新
    const theme = this._evaluateTheme();
    const fgColor = theme === 'on' ? 'rgb(0, 0, 0)' : 'rgb(255, 255, 255)';
    const bgColor = theme === 'on' ? 'rgb(255, 255, 255)' : 'rgb(50, 50, 50)';
    const popupBg = theme === 'on' ? '#ffffff' : '#323232';
    const entities = this.config.entities || [];
    const infodataData = [];
    for (const entityConfig of entities) {
      const processed = this._processEntity(entityConfig);
      if (processed) infodataData.push(processed);
    }
    const warningCount = infodataData.filter(d => this._isWarning(d)).length;
    let additionalCards = [];
    if (this.config.other_cards && this.config.other_cards.trim()) {
      try {
        const parsedCards = this._parseYamlCards(this.config.other_cards);
        additionalCards = parsedCards.map(card => (!card.theme && this.config.theme) ? { ...card, theme: this.config.theme } : card);
      } catch (error) { console.error('解析附加卡片配置失败:', error); }
    }
    const data = { theme, fgColor, bgColor, popupBg, infodataData, warningCount, additionalCards };
    const closingClass = this._popupClosing ? 'closing' : '';
    return html`
      <div class="popup-overlay ${closingClass}" @click=${this._handleOverlayClick}
           role="dialog" aria-modal="true" aria-label="耗材信息详情">
        <div class="popup-container ${closingClass}" 
             style="--popup-bg: ${data.popupBg}; --fg-color: ${data.fgColor};">
          <button class="popup-close-btn" @click=${this._closePopup} aria-label="关闭弹窗">×</button>
          <div class="popup-content">
            <ha-card style="--fg-color: ${data.fgColor}; --bg-color: ${data.bgColor};">
              <div class="card-header">
                <div class="card-title">
                  <span class="offline-indicator" style="background: ${data.warningCount === 0 ? 'rgb(0,255,0)' : 'rgb(255,0,0)'}; animation: pulse 2s infinite"></span>
                  ${this.config.name || '数据集信息统计'}
                </div>
                <div class="device-count ${data.warningCount > 0 ? 'non-zero' : 'zero'}">${data.warningCount}</div>
              </div>
              ${data.infodataData.length === 0 ? html`<div class="no-devices">请配置信息实体</div>` :
                this.config.columns === '1' ? html`
                  <div class="devices-list single-column">
                    ${data.infodataData.map(item => this._renderDeviceItem(item))}
                  </div>
                ` : html`
                  <div class="devices-grid">
                    ${data.infodataData.map(item => this._renderDeviceItem(item))}
                  </div>
                `
              }
            </ha-card>
            ${data.additionalCards.length > 0 ? html`
              <div style="margin-top: 8px;">
                ${data.additionalCards.map(card => html`
                  <ha-card style="--fg-color: ${data.fgColor}; --bg-color: ${data.bgColor}; margin-top: 8px;">
                    <div style="padding: 16px; color: ${data.fgColor};">
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

  _parseYamlCards(yamlString) {
    try {
      const lines = yamlString.split('\n');
      const cards = [];
      let currentCard = null;
      let indentStack = [];
      let contextStack = [];
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const indentLevel = line.length - line.trimStart().length;
        if (trimmed.startsWith('- type')) {
          if (currentCard) {
            cards.push(currentCard);
            currentCard = null;
            indentStack = [];
            contextStack = [];
          }
          const content = trimmed.substring(1).trim();
          if (content.includes(':')) {
            const [key, ...valueParts] = content.split(':');
            const value = valueParts.join(':').trim();
            currentCard = {};
            this._setNestedValue(currentCard, key.trim(), this._parseValue(value));
          } else {
            currentCard = { type: content };
          }
          indentStack = [indentLevel];
          contextStack = [currentCard];
        } else if (currentCard && trimmed.startsWith('-')) {
          while (indentStack.length > 1 && indentLevel <= indentStack[indentStack.length - 1]) {
            indentStack.pop();
            contextStack.pop();
          }
          let currentContext = contextStack[contextStack.length - 1];
          const itemValue = trimmed.substring(1).trim();
          if (!Array.isArray(currentContext)) {
            if (contextStack.length > 1) {
              const parentContext = contextStack[contextStack.length - 2];
              for (let key in parentContext) {
                if (parentContext[key] === currentContext) {
                  parentContext[key] = [];
                  contextStack[contextStack.length - 1] = parentContext[key];
                  currentContext = parentContext[key];
                  break;
                }
              }
            }
          }
          if (Array.isArray(currentContext)) {
            if (itemValue.includes(':')) {
              const [key, ...valueParts] = itemValue.split(':');
              const value = valueParts.join(':').trim();
              const obj = {};
              obj[key.trim()] = this._parseValue(value);
              currentContext.push(obj);
            } else {
              currentContext.push(this._parseValue(itemValue));
            }
          }
        } else if (currentCard && trimmed.includes(':')) {
          const [key, ...valueParts] = trimmed.split(':');
          const value = valueParts.join(':').trim();
          const keyName = key.trim();
          while (indentStack.length > 1 && indentLevel <= indentStack[indentStack.length - 1]) {
            indentStack.pop();
            contextStack.pop();
          }
          const currentContext = contextStack[contextStack.length - 1];
          if (value) {
            this._setNestedValue(currentContext, keyName, this._parseValue(value));
          } else {
            let nextLine = null, nextIndent = null;
            for (let j = i + 1; j < lines.length; j++) {
              const nextTrimmed = lines[j].trim();
              if (nextTrimmed && !nextTrimmed.startsWith('#')) {
                nextLine = nextTrimmed;
                nextIndent = lines[j].length - lines[j].trimStart().length;
                break;
              }
            }
            currentContext[keyName] = (nextLine && nextLine.startsWith('-') && nextIndent > indentLevel)
              ? [] : (currentContext[keyName] || {});
            indentStack.push(indentLevel);
            contextStack.push(currentContext[keyName]);
          }
        }
      }
      if (currentCard) cards.push(currentCard);
      return cards;
    } catch (error) {
      console.error('YAML解析错误:', error);
      return [];
    }
  }
  _parseValue(value) {
    if (!value) return '';
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      return value.slice(1, -1);
    }
    if (!isNaN(value) && value.trim() !== '') return Number(value);
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (value === 'null') return null;
    return value;
  }
  _setNestedValue(obj, path, value) {
    const keys = path.split('.');
    let current = obj;
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!current[key] || typeof current[key] !== 'object') current[key] = {};
      current = current[key];
    }
    current[keys[keys.length - 1]] = value;
  }
  /*button新元素 结束*/
  // 2.18 渲染设备项
  _renderDeviceItem(infodataData) {
    const isWarning = this._isWarning(infodataData);
    return html`
      <div class="device-item" @click=${(e) => { e.stopPropagation(); this._handleEntityClick(infodataData); }}>
        <div class="device-left">
          <ha-icon class="device-icon" icon="${infodataData.icon}"></ha-icon>
          <div class="device-name">${infodataData.friendly_name}</div>
        </div>
        <div class="device-value ${isWarning ? 'warning' : ''}">
          ${infodataData.value}
          <span class="device-unit ${isWarning ? 'warning' : ''}">${infodataData.unit}</span>
        </div>
      </div>
    `;
  }

  // 【V9.2 优化】_applyConversion 统一为表达式计算版本，与编辑器提示保持一致
  _applyConversion(value, expression) {
    if (!expression || value === undefined || value === null || value === '') return value;
    try {
      const numericValue = parseFloat(value);
      if (isNaN(numericValue)) {
        console.warn(`[hello-infodata-card] 无法将值 "${value}" 转换为数字进行表达式计算`);
        return value;
      }
      let evalExpression = expression.trim();
      // 安全检查：只允许数字、运算符、括号、小数点、k、K 和空格
      if (!/^[\d\+\-*/\(\)\.kK\s]+$/.test(evalExpression)) {
        console.warn(`[hello-infodata-card] 表达式包含非法字符: "${expression}"，只允许数字、+-*/()、小数点和k`);
        return value;
      }
      evalExpression = evalExpression.replace(/k/gi, numericValue.toString());
      const result = new Function('return ' + evalExpression)();
      if (typeof result !== 'number' || isNaN(result) || !isFinite(result)) {
        console.warn(`[hello-infodata-card] 表达式计算结果无效: "${expression}" -> ${result}`);
        return value;
      }
      console.log(`[hello-infodata-card][_applyConversion] 表达式 "${expression}" (k=${numericValue}) = ${result}`);
      return Number.isInteger(result) ? result.toString() : result.toFixed(2).toString();
    } catch (error) {
      console.error(`[hello-infodata-card] 表达式计算出错: ${error.message}`);
      return value;
    }
  }

  // 2.9 从表达式中提取引用的实体列表
  _extractEntitiesFromExpression(expression) {
    const results = [];
    if (!expression) return results;
    const entityPattern = /([a-zA-Z_][a-zA-Z0-9_]*\.[a-zA-Z_][a-zA-Z0-9_]*(?:\.[a-zA-Z_][a-zA-Z0-9_]*)?)\s*(>=|<=|>|<|==|!=)/g;
    let match;
    while ((match = entityPattern.exec(expression)) !== null) {
      const fullRef = match[1];
      const parts = fullRef.split('.');
      if (parts.length >= 2) {
        const entityId = parts.slice(0, 2).join('.');
        const attribute = parts.length > 2 ? parts.slice(2).join('.') : null;
        if (!results.some(r => r.entityId === entityId && r.attribute === attribute)) {
          results.push({ entityId, attribute });
        }
      }
    }
    return results;
  }

  // 【2.10】处理实体数据（含换算逻辑）：读取属性、应用换算、组装显示数据
  _processEntity(entityConfig) {
    const entityId = entityConfig.entity_id;
    const attributeName = entityConfig.attribute;
    const entity = this.hass.states[entityId];
    if (!entity) {
      console.warn(`[hello-infodata-card][_processEntity] 实体 ${entityId} 不存在于 hass.states`);
      return null;
    }
    const attributes = entity.attributes;
    let value = entity.state;
    let unit = '';
    // V9: 属性留空时使用 state 值，指定属性时使用属性值
    if (attributeName) {
      if (attributes && attributes.hasOwnProperty(attributeName) && attributes[attributeName] !== null && attributes[attributeName] !== undefined) {
        value = attributes[attributeName];
        console.log(`[hello-infodata-card][_processEntity] 实体 ${entityId} 读取属性 "${attributeName}": ${value} (类型: ${typeof value})`);
      } else {
        console.warn(`[hello-infodata-card][_processEntity] 实体 ${entityId} 不存在属性 "${attributeName}"，可用属性: ${Object.keys(attributes).join(', ')}`);
      }
    }
    if (attributes.unit_of_measurement) unit = attributes.unit_of_measurement;
    let friendlyName = attributes.friendly_name || entityId;
    let icon = attributes.icon || 'mdi:help-circle';
    let conversion = undefined;
    if (entityConfig.overrides) {
      if (entityConfig.overrides.name !== undefined && entityConfig.overrides.name !== '') friendlyName = entityConfig.overrides.name;
      if (entityConfig.overrides.icon !== undefined && entityConfig.overrides.icon !== '') icon = entityConfig.overrides.icon;
      if (entityConfig.overrides.unit_of_measurement !== undefined && entityConfig.overrides.unit_of_measurement !== '') unit = entityConfig.overrides.unit_of_measurement;
      if (entityConfig.overrides.conversion !== undefined && entityConfig.overrides.conversion !== '') conversion = entityConfig.overrides.conversion;
    }
    if (conversion && value !== undefined && value !== null && value !== '') {
      const converted = this._applyConversion(value, conversion);
      if (converted !== value) {
        value = converted;
        console.log(`[hello-infodata-card][_processEntity] 实体 ${entityId} 换算后: ${value}`);
      }
    }
    const originalValue = value;
    if (value !== undefined && value !== null) value = String(value);
    return {
      entity_id: entityId,
      friendly_name: friendlyName,
      value: value,
      unit: unit,
      icon: icon,
      rules: entityConfig.rules || [],
      attribute: attributeName,
      _originalValue: originalValue
    };
  }
  // 2.11 判断实体是否触发预警/异常
  _isWarning(infodataData) {
    const entityId = infodataData.entity_id;
    const value = infodataData.value;
    const rules = infodataData.rules || [];
    const attribute = infodataData.attribute;
    console.log(`[hello-infodata-card][_isWarning] 实体 ${entityId}${attribute ? '.' + attribute : ''}: value="${value}", rules数量=${rules.length}`);
    // V9: 使用新版规则引擎（表达式字符串）
    if (rules.length > 0) {
      for (let i = 0; i < rules.length; i++) {
        const rule = rules[i];
        if (!rule.expression || !rule.expression.trim()) continue;
        const ruleResult = this._evaluateExpression(rule.expression, entityId, value, attribute);
        console.log(`[hello-infodata-card][_isWarning] 实体 ${entityId} 规则${i + 1} "${rule.expression}": ${ruleResult ? '✅ 触发异常' : '❌ 未触发'}`);
        if (ruleResult) return true;
      }
      console.log(`[hello-infodata-card][_isWarning] 实体 ${entityId} 所有规则均未触发`);
      return false;
    }
    // V9: 全局预警条件
    if (this.config.global_warning !== undefined && this.config.global_warning !== null) {
      const globalWarning = String(this.config.global_warning).trim();
      if (globalWarning !== '') {
        const result = this._evaluateSimpleCondition(value, globalWarning);
        console.log(`[hello-infodata-card][_isWarning] 实体 ${entityId} 使用全局预警 "${globalWarning}": ${result}`);
        return result;
      }
    }
    console.log(`[hello-infodata-card][_isWarning] 实体 ${entityId} 无预警条件，返回 false`);
    return false;
  }

  // 2.12 评估完整表达式（支持括号、AND、OR、跨实体引用）
  _evaluateExpression(expression, defaultEntityId, defaultValue, defaultAttribute) {
    if (!expression || !expression.trim()) return false;
    console.log(`[hello-infodata-card][_evaluateExpression] 表达式: "${expression}"`);
    try {
      return this._evaluateExpressionWithParens(expression.trim(), defaultEntityId, defaultValue, defaultAttribute);
    } catch (e) {
      console.error(`[hello-infodata-card][_evaluateExpression] 表达式解析错误: ${e.message}`);
      return false;
    }
  }

  // 2.13: 递归处理括号
  _evaluateExpressionWithParens(expression, defaultEntityId, defaultValue, defaultAttribute) {
    expression = expression.trim();
    let depth = 0;
    let start = -1;
    for (let i = 0; i < expression.length; i++) {
      if (expression[i] === '(') {
        if (depth === 0) start = i;
        depth++;
      } else if (expression[i] === ')') {
        depth--;
        if (depth === 0 && start === 0) {
          const inner = expression.slice(1, i).trim();
          const rest = expression.slice(i + 1).trim();
          if (rest === '') {
            return this._evaluateExpressionWithParens(inner, defaultEntityId, defaultValue, defaultAttribute);
          }
        }
      }
    }
    // Step 2: 按 OR 分割（优先级最低）
    const orParts = this._splitByOperator(expression, 'OR');
    if (orParts.length > 1) {
      for (const part of orParts) {
        if (this._evaluateExpressionWithParens(part.trim(), defaultEntityId, defaultValue, defaultAttribute)) return true;
      }
      return false;
    }
    // Step 3: 按 AND 分割（优先级更高）
    const andParts = this._splitByOperator(expression, 'AND');
    if (andParts.length > 1) {
      for (const part of andParts) {
        if (!this._evaluateExpressionWithParens(part.trim(), defaultEntityId, defaultValue, defaultAttribute)) return false;
      }
      return true;
    }
    // Step 4: 单个条件
    return this._evaluateSingleCondition(expression.trim(), defaultEntityId, defaultValue, defaultAttribute);
  }

  // 2.14：按逻辑运算符分割表达式（考虑括号嵌套）
  _splitByOperator(expression, operator) {
    const parts = [];
    let current = '';
    let depth = 0;
    const opUpper = operator.toUpperCase();
    const opLower = operator.toLowerCase();
    const opLen = operator.length;
    for (let i = 0; i < expression.length; i++) {
      if (expression[i] === '(') {
        depth++;
        current += expression[i];
      } else if (expression[i] === ')') {
        depth--;
        current += expression[i];
      } else if (depth === 0) {
        const substr = expression.substring(i, i + opLen);
        if (substr.toUpperCase() === opUpper || substr.toLowerCase() === opLower) {
          const before = i > 0 ? expression[i - 1] : ' ';
          const after = i + opLen < expression.length ? expression[i + opLen] : ' ';
          if ((before === ' ' || before === '(') && (after === ' ' || after === ')')) {
            if (current.trim()) parts.push(current.trim());
            current = '';
            i += opLen - 1;
            continue;
          }
        }
        current += expression[i];
      } else {
        current += expression[i];
      }
    }
    if (current.trim()) parts.push(current.trim());
    return parts;
  }
  // 2.15: 评估单个条件（支持跨实体引用）
  _evaluateSingleCondition(condition, defaultEntityId, defaultValue, defaultAttribute) {
    condition = condition.trim();
    if (!condition) return false;
    console.log(`[hello-infodata-card][_evaluateSingleCondition] 条件: "${condition}"`);
    // 模式1: entity_id.attribute operator value (如 sensor.temperature > 30)
    const entityRefPattern = /^([a-zA-Z_][a-zA-Z0-9_]*\.[a-zA-Z_][a-zA-Z0-9_]*(?:\.[a-zA-Z_][a-zA-Z0-9_]*)?)\s*(>=|<=|>|<|==|!=)\s*(.+)$/;
    const entityMatch = condition.match(entityRefPattern);
    if (entityMatch) {
      const fullRef = entityMatch[1];
      const operator = entityMatch[2];
      let compareValue = entityMatch[3].trim();
      const parts = fullRef.split('.');
      const entityId = parts.slice(0, 2).join('.');
      const attribute = parts.length > 2 ? parts.slice(2).join('.') : null;
      const entity = this.hass.states[entityId];
      if (!entity) {
        console.warn(`[hello-infodata-card][_evaluateSingleCondition] 引用实体 ${entityId} 不存在`);
        return false;
      }
      let value = entity.state;
      if (attribute && entity.attributes && entity.attributes.hasOwnProperty(attribute) && entity.attributes[attribute] !== null && entity.attributes[attribute] !== undefined) {
        value = entity.attributes[attribute];
      }
      value = String(value);
      console.log(`[hello-infodata-card][_evaluateSingleCondition] 跨实体引用 ${entityId}${attribute ? '.' + attribute : ''}: value="${value}", op="${operator}", compare="${compareValue}"`);
      return this._evaluateSimpleCondition(value, `${operator}${compareValue}`);
    }
    // 模式3: attribute operator value (如 brightness < 30) - 本实体属性
    const attrPattern = /^([a-zA-Z_][a-zA-Z0-9_]+)\s*(>=|<=|>|<|==|!=)\s*(.+)$/;
    const attrMatch = condition.match(attrPattern);
    if (attrMatch) {
      const attrName = attrMatch[1];
      const operator = attrMatch[2];
      let compareValue = attrMatch[3].trim();
      // 排除 AND/OR 被误匹配
      if (['AND', 'OR', 'and', 'or'].includes(attrName)) {
        return this._evaluateSimpleCondition(defaultValue, condition);
      }
      // 【V9.1 修复】换算一致性：规则判断使用换算后的值
      let value;
      if (attrName === defaultAttribute) {
        value = String(defaultValue);
        console.log(`[hello-infodata-card][_evaluateSingleCondition] 本实体属性 ${defaultEntityId}.${attrName} (已换算): value="${value}", op="${operator}", compare="${compareValue}"`);
      } else {
        const entity = this.hass.states[defaultEntityId];
        if (!entity) return false;
        value = entity.state;
        if (entity.attributes && entity.attributes.hasOwnProperty(attrName) && entity.attributes[attrName] !== null && entity.attributes[attrName] !== undefined) {
          value = entity.attributes[attrName];
        } else {
          console.warn(`[hello-infodata-card][_evaluateSingleCondition] 本实体 ${defaultEntityId} 不存在属性 "${attrName}"`);
          return false;
        }
        value = String(value);
        console.log(`[hello-infodata-card][_evaluateSingleCondition] 本实体其他属性 ${defaultEntityId}.${attrName} (原始值): value="${value}", op="${operator}", compare="${compareValue}"`);
      }
      return this._evaluateSimpleCondition(value, `${operator}${compareValue}`);
    }
    // 默认模式: 直接使用本实体的默认值
    console.log(`[hello-infodata-card][_evaluateSingleCondition] 默认模式: value="${defaultValue}", condition="${condition}"`);
    return this._evaluateSimpleCondition(defaultValue, condition);
  }

  // 2.16: 评估简单条件（数值或字符串比较）
  _evaluateSimpleCondition(value, condition) {
    if (!condition || condition.trim() === '') return false;
    if (value === undefined || value === null) return false;
    const valueStr = String(value).trim();
    console.log(`[hello-infodata-card][_evaluateSimpleCondition] 评估: value="${valueStr}", condition="${condition}"`);
    const match = condition.trim().match(/^(>=|<=|>|<|==|!=)\s*(.+)$/);
    if (!match) {
      console.warn(`[hello-infodata-card] 无效的条件格式: "${condition}"，支持的格式: >10, >=10, <10, <=10, ==10, ==on, ==off, =="hello world", !=5`);
      return false;
    }
    const operator = match[1];
    let compareValue = match[2].trim();
    if ((compareValue.startsWith('"') && compareValue.endsWith('"')) ||
        (compareValue.startsWith("'") && compareValue.endsWith("'"))) {
      compareValue = compareValue.slice(1, -1);
    }
    const numericValue = parseFloat(valueStr);
    const numericCompare = parseFloat(compareValue);
    const isValueNumeric = /^-?\d+(?:\.\d+)?$/.test(valueStr);
    const isCompareNumeric = /^-?\d+(?:\.\d+)?$/.test(compareValue);
    if (isValueNumeric && isCompareNumeric && !isNaN(numericValue) && !isNaN(numericCompare)) {
      let result;
      switch (operator) {
        case '>': result = numericValue > numericCompare; break;
        case '>=': result = numericValue >= numericCompare; break;
        case '<': result = numericValue < numericCompare; break;
        case '<=': result = numericValue <= numericCompare; break;
        case '==': result = numericValue === numericCompare; break;
        case '!=': result = numericValue !== numericCompare; break;
        default: result = false;
      }
      console.log(`[hello-infodata-card][_evaluateSimpleCondition] 数值比较: ${numericValue} ${operator} ${numericCompare} = ${result}`);
      return result;
    }
    let result;
    switch (operator) {
      case '==': result = valueStr === compareValue; break;
      case '!=': result = valueStr !== compareValue; break;
      case '>': result = valueStr > compareValue; break;
      case '>=': result = valueStr >= compareValue; break;
      case '<': result = valueStr < compareValue; break;
      case '<=': result = valueStr <= compareValue; break;
      default: result = false;
    }
    console.log(`[hello-infodata-card][_evaluateSimpleCondition] 字符串比较: "${valueStr}" ${operator} "${compareValue}" = ${result}`);
    return result;
  }
  // 2.17: 渲染卡片主界面
  render() {
    if (!this.hass) {
      return html`<div class="loading">等待Home Assistant连接...</div>`;
    }
    const theme = this._evaluateTheme();
    const fgColor = theme === 'on' ? 'rgb(0, 0, 0)' : 'rgb(255, 255, 255)';
    const bgColor = theme === 'on' ? 'rgb(255, 255, 255)' : 'rgb(50, 50, 50)';
    const entities = this.config.entities || [];
    const infodataData = [];
    const newProcessedData = {};
    for (const entityConfig of entities) {
      const processed = this._processEntity(entityConfig);
      if (processed) {
        infodataData.push(processed);
        newProcessedData[processed.entity_id] = { value: processed._originalValue };
        if (entityConfig.rules) {
          for (const rule of entityConfig.rules) {
            if (rule.expression) {
              const referencedEntities = this._extractEntitiesFromExpression(rule.expression);
              for (const ref of referencedEntities) {
                const refEntity = this.hass.states[ref.entityId];
                if (refEntity) {
                  let refValue = refEntity.state;
                  if (ref.attribute && refEntity.attributes && refEntity.attributes.hasOwnProperty(ref.attribute)) {
                    refValue = refEntity.attributes[ref.attribute];
                  }
                  const cacheKey = `${ref.entityId}:${ref.attribute || 'state'}`;
                  newProcessedData[cacheKey] = { value: refValue };
                }
              }
            }
          }
        }
      }
    }
    this._lastProcessedData = newProcessedData;
    const warningCount = infodataData.filter(d => this._isWarning(d)).length;
    console.log(`[hello-infodata-card][render] 预警数量: ${warningCount}/${infodataData.length}`);

    const showPreview = this.config.yes_preview === true;
    const badgeMode = this.config.badge_mode === true;
    const transparentBg = this.config.transparent_bg === true;
    const hideIcon = this.config.hide_icon === true;
    const hideColon = this.config.hide_colon === true;
    const hideZero = this.config.hide_zero === true;
    const autoHide = this.config.auto_hide === true;
    const lockWhiteFg = this.config.lock_white_fg === true;
    const buttonText = this.config.button_text || '耗材';
    const buttonIcon = this.config.button_icon || 'mdi:battery-sync';
    const buttonBgColor = transparentBg ? 'transparent' : (theme === 'on' ? 'rgb(255, 255, 255, 0.6)' : 'rgb(83, 83, 83, 0.6)');
    const shouldAutoHide = autoHide && warningCount === 0;
    if (shouldAutoHide) return html`<div></div>`;

    let buttonHtml;
    if (badgeMode) {
      const hasWarning = warningCount > 0;
      buttonHtml = html`
        <div class="infodata-status badge-mode ${hasWarning ? 'has-warning' : ''}" style="--bg-color: ${buttonBgColor};" @click=${this._handleButtonClick}>
          <ha-icon class="status-icon" icon="${buttonIcon}"></ha-icon>
          ${hasWarning ? html`<div class="badge-number">${warningCount}</div>` : ''}
        </div>
      `;
    } else {
      let textColor, iconColor;
      if (warningCount === 0) {
        textColor = lockWhiteFg ? 'rgb(255, 255, 255)' : fgColor;
        iconColor = lockWhiteFg ? 'rgb(255, 255, 255)' : fgColor;
      } else {
        textColor = 'rgb(255, 0, 0)';
        iconColor = lockWhiteFg ? 'rgb(255, 255, 255)' : fgColor;
      }
      let displayText = buttonText;
      if (!hideColon) displayText += ':';
      else displayText += ' ';
      if (hideZero && warningCount === 0) displayText += '\u2002';
      else displayText += ` ${warningCount}`;
      buttonHtml = html`
        <div class="infodata-status" style="--fg-color: ${textColor}; --bg-color: ${buttonBgColor};" @click=${this._handleButtonClick}>
          ${!hideIcon ? html`<ha-icon class="status-icon" style="color: ${iconColor};" icon="${buttonIcon}"></ha-icon>` : ''}
          ${displayText}
        </div>
      `;
    }

    return html`
      ${buttonHtml}
      ${showPreview ? html`
        <div class="form-group"><label>👇👇👇下面是弹出卡片内容👇👇👇</label></div>
        <ha-card style="--fg-color: ${fgColor}; --bg-color: ${bgColor};">
          <div class="card-header">
            <div class="card-title">
              <span class="offline-indicator" style="background: ${warningCount === 0 ? 'rgb(0,255,0)' : 'rgb(255,0,0)'}; animation: pulse 2s infinite"></span>
              ${this.config.name || '数据集信息统计'}
            </div>
            <div class="device-count ${warningCount > 0 ? 'non-zero' : 'zero'}">${warningCount}</div>
          </div>
          ${infodataData.length === 0 ? html`<div class="no-devices">请配置信息实体</div>` :
            this.config.columns === '1' ? html`
              <div class="devices-list single-column">
                ${infodataData.map(data => this._renderDeviceItem(data))}
              </div>
            ` : html`
              <div class="devices-grid">
                ${infodataData.map(data => this._renderDeviceItem(data))}
              </div>
            `
          }
        </ha-card>
      ` : html``}
      ${this._renderPopup()}
    `;
  }

  // 2.19 处理实体点击
  _handleEntityClick(entity) {
    this._sendHaptic();
    if (entity.entity_id) {
      const evt = new Event('hass-more-info', { composed: true });
      evt.detail = { entityId: entity.entity_id };
      this.dispatchEvent(evt);
    }
  }

  // 2.22 评估主题
  _evaluateTheme() {
    try {
      if (!this.config || !this.config.theme) return 'on';
      if (typeof this.config.theme === 'function') return this.config.theme();
      if (typeof this.config.theme === 'string' && (this.config.theme.includes('return') || this.config.theme.includes('=>'))) {
        return (new Function(`return ${this.config.theme}`))();
      }
      return this.config.theme;
    } catch(e) {
      console.error('[hello-infodata-card] 计算主题时出错:', e);
      return 'on';
    }
  }
  getCardSize() {
    const baseSize = 3;
    const entitySize = Math.max(0, Math.min(this._HelloInfoData.length * 2, 10));
    return baseSize + entitySize;
  }
}
customElements.define('hello-infodata-button', HelloInfoDataButton);
