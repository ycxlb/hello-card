import { LitElement, html, css } from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

// ═══════════════════════════════════════════════════════════════════════════════
// 数据集信息卡片 V9.1
// 
// 【V9.1 修复】换算一致性：规则判断使用换算后的值
// 问题：当实体配置了 conversion（如 brightness 的 k/2.55）时，
//       显示值是换算后的（如 38.82%），但规则判断却读取了原始属性值（如 99）。
//       导致 "brightness > 90" 判断为 True（99>90），错误触发红色预警。
// 修复：_evaluateSingleCondition 中，当规则引用的属性名 == 实体配置的 attribute 时，
//       使用已换算的 defaultValue，而非重新读取原始属性值。
//
// 【V9 核心改进】
// 1. 规则系统重构：单条表达式字符串，支持括号控制 AND/OR 优先级
// 2. 表达式语法：
//    - 本实体状态条件：>10, <30, ==on, !=off
//    - 本实体属性条件：brightness < 30, color_temp > 400
//    - 跨实体引用：sensor.temperature > 30, light.bedroom == 'on'
//    - 跨实体属性：light.bedroom.brightness < 100
//    - 组合条件：(brightness < 30) AND (sensor.motion == 'on')
//    - OR 组合：(brightness < 30) OR (brightness > 150)
//    - 嵌套括号：((A > 10) AND (B < 20)) OR (C == 'on')
// 3. 默认使用实体 state 值，属性名可选
// 4. 彻底移除旧版 warning 配置
// 5. 复选框逻辑：勾选才启用，不勾选不处理
// ═══════════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════════
// 【文件总览】数据集信息卡片 V9.1 - Hello 版本
// 
// 文件名: infodata-card-v9.1-hello.js
// 版本: V9.1
// 最后更新: 2026-05-28
// 
// 【V9 核心改进】
// 1. 规则系统重构：单条表达式字符串，支持括号控制 AND/OR 优先级
// 2. 表达式语法：
//    - 本实体状态条件：>10, <30, ==on, !=off
//    - 本实体属性条件：brightness < 30, color_temp > 400
//    - 跨实体引用：sensor.temperature > 30, light.bedroom == 'on'
//    - 跨实体属性：light.bedroom.brightness < 100
//    - 组合条件：(brightness < 30) AND (sensor.motion == 'on')
//    - OR 组合：(brightness < 30) OR (brightness > 150)
//    - 嵌套括号：((A > 10) AND (B < 20)) OR (C == 'on')
// 3. 默认使用实体 state 值，属性名可选
// 4. 彻底移除旧版 warning 配置
// 5. 复选框逻辑：勾选才启用，不勾选不处理
// 
// 【类结构】
// 类1: HelloInfodataCardEditor - 配置编辑器（UI配置界面）
// 类2: HelloInfodataCard       - 卡片显示（前端渲染）
// 
// 【函数编号索引 - 编辑器类】
// 【1.1】properties     - 定义组件属性
// 【1.2】styles          - 定义组件样式
// 【1.3】constructor     - 构造函数初始化
// 【1.4】setConfig       - 设置配置对象
// 【1.5】firstUpdated    - 首次渲染后注册事件
// 【1.6】disconnectedCallback - 组件卸载清理
// 【1.7】render          - 渲染配置界面主函数
// 【1.7.1】_renderRulesEditor - 渲染规则编辑器
// 【1.8】_previewExpression   - 预览表达式解析
// 【1.9】_addRule        - 添加规则
// 【1.10】_removeRule    - 删除规则
// 【1.11】_updateRuleExpression - 更新规则表达式
// 【1.12】_entityChanged  - 通用配置项变更
// 【1.13】_onEntitySearch - 实体搜索处理
// 【1.14】_toggleEntity   - 切换实体选中
// 【1.15】_removeEntity   - 移除已选实体
// 【1.16】_updateEntityAttribute - 更新属性名
// 【1.17】_updateEntityOverride   - 启用/禁用覆盖
// 【1.18】_updateEntityOverrideValue - 更新覆盖值
// 【1.19】注册编辑器组件
// 
// 【V9.1 修复点】_evaluateSingleCondition 函数【2.15】
//   当规则中的属性名 == 实体配置的 attribute 时，使用已换算的 defaultValue
//
// 【函数编号索引 - 卡片类】
// 【2.1】properties     - 定义组件属性
// 【2.2】styles          - 定义组件样式
// 【2.3】getConfigElement - 返回配置编辑器
// 【2.4】constructor     - 构造函数初始化
// 【2.5】setConfig       - 设置卡片配置
// 【2.6】connectedCallback - 组件连接
// 【2.7】disconnectedCallback - 组件卸载
// 【2.8】shouldUpdate     - 强制刷新判断
// 【2.9】_extractEntitiesFromExpression - 提取引用实体
// 【2.10】_processEntity  - 处理实体数据（含换算逻辑）
// 【2.11】_isWarning      - 判断是否预警
// 【2.12】_evaluateExpression - 评估表达式
// 【2.13】_evaluateExpressionWithParens - 递归处理括号
// 【2.14】_splitByOperator - 按运算符分割
// 【2.15】_evaluateSingleCondition - 评估单条件（V9.1修复：换算一致性）
// 【2.16】_evaluateSimpleCondition - 评估简单条件
// 【2.17】render          - 渲染卡片主界面
// 【2.18】_renderDeviceItem - 渲染设备项
// 【2.19】_handleEntityClick - 处理点击
// 【2.20】_handleClick    - 触觉反馈
// 【2.21】_applyConversion - 数值换算
// 【2.22】_evaluateTheme  - 评估主题
// 【2.23】getCardSize     - 计算卡片尺寸
// 【2.24】注册卡片组件
// ═══════════════════════════════════════════════════════════════════════════════

class HelloInfodataCardEditor extends LitElement {

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

      /* V9 规则编辑器样式 */
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
        <div class="form-group">
          <label>卡片宽度：支持像素(px)和百分比(%)，默认100%</label>
          <input type="text" @change=${this._entityChanged} .value=${this.config.width !== undefined ? this.config.width : '100%'} name="width" placeholder="默认100%" />
        </div>
        <div class="form-group">
          <label>标题名称：配置卡片显示的标题</label>
          <input type="text" @change=${this._entityChanged} .value=${this.config.name !== undefined ? this.config.name : '数据信息统计'} name="name" placeholder="默认：数据信息统计" />
        </div>
        <div class="form-group">
          <label>全局预警条件：当任一实体满足此条件时触发预警</label>
          <input type="text" @change=${this._entityChanged} .value=${this.config.global_warning !== undefined ? this.config.global_warning : ''} name="global_warning" placeholder="如: >10, <=5, ==on, ==off, =='hello world'" />
          <div class="help-text">
            全局预警条件：当任一实体满足此条件时，该实体显示为红色预警状态<br>
            优先级：明细规则 > 全局预警 > 无预警<br>
            预警基于换算后的结果进行判断（如果配置了换算）<br>
            <strong style="color:#d32f2f;">提示：清空输入框并失去焦点即可删除全局预警条件</strong>
          </div>
        </div>
        <div class="form-group">
          <label>列数：明细显示的列数</label>
          <select @change=${this._entityChanged} .value=${this.config.columns !== undefined ? this.config.columns : '2'} name="columns">
            <option value="1">1列</option>
            <option value="2">2列（默认）</option>
          </select>
        </div>
        <div class="form-group">
          <label>主题</label>
          <select @change=${this._entityChanged} .value=${this.config.theme !== undefined ? this.config.theme : 'on'} name="theme">
            <option value="on">浅色主题（白底黑字）</option>
            <option value="off">深色主题（深灰底白字）</option>
          </select>
        </div>
        <div class="form-group">
          <label>设备信息实体：搜索并选择实体</label>
          <div class="entity-selector">
            <input type="text" @input=${this._onEntitySearch} @focus=${this._onEntitySearch} .value=${this._searchTerm || ''} placeholder="搜索实体..." class="entity-search-input" />
            ${this._showEntityList ? html`
              <div class="entity-dropdown">
                ${this._filteredEntities.map(entity => html`
                  <div class="entity-option ${this.config.entities && this.config.entities.some(e => e.entity_id === entity.entity_id) ? 'selected' : ''}" @click=${() => this._toggleEntity(entity.entity_id)}>
                    <div class="entity-info">
                      <div class="entity-details">
                        <div class="entity-name">${entity.attributes.friendly_name || entity.entity_id}</div>
                        <div class="entity-id">${entity.entity_id}</div>
                      </div>
                      <ha-icon icon="${entity.attributes.icon || 'mdi:help-circle'}"></ha-icon>
                    </div>
                    ${this.config.entities && this.config.entities.some(e => e.entity_id === entity.entity_id) ? html`<ha-icon icon="mdi:check" class="check-icon"></ha-icon>` : ''}
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
                      <button class="remove-btn" @click=${() => this._removeEntity(index)}><ha-icon icon="mdi:close"></ha-icon></button>
                    </div>
                    <div class="attribute-config">
                      <input type="text" @change=${(e) => this._updateEntityAttribute(index, e.target.value)} .value=${entityConfig.attribute || ''} placeholder="留空使用实体状态(state)，或输入属性名（如 brightness, color_temp）" class="attribute-input" />
                      <div class="override-config">
                        <input type="checkbox" class="override-checkbox" @change=${(e) => this._updateEntityOverride(index, 'icon', e.target.checked)} .checked=${entityConfig.overrides?.icon !== undefined} />
                        <span class="override-label">图标:</span>
                        <input type="text" class="override-input" @change=${(e) => this._updateEntityOverrideValue(index, 'icon', e.target.value)} .value=${entityConfig.overrides?.icon || ''} placeholder="mdi:icon-name" ?disabled=${entityConfig.overrides?.icon === undefined} />
                      </div>
                      <div class="override-config">
                        <input type="checkbox" class="override-checkbox" @change=${(e) => this._updateEntityOverride(index, 'name', e.target.checked)} .checked=${entityConfig.overrides?.name !== undefined} />
                        <span class="override-label">名称:</span>
                        <input type="text" class="override-input" @change=${(e) => this._updateEntityOverrideValue(index, 'name', e.target.value)} .value=${entityConfig.overrides?.name || ''} placeholder="自定义名称" ?disabled=${entityConfig.overrides?.name === undefined} />
                      </div>
                      <div class="override-config">
                        <input type="checkbox" class="override-checkbox" @change=${(e) => this._updateEntityOverride(index, 'unit_of_measurement', e.target.checked)} .checked=${entityConfig.overrides?.unit_of_measurement !== undefined} />
                        <span class="override-label">单位:</span>
                        <input type="text" class="override-input" @change=${(e) => this._updateEntityOverrideValue(index, 'unit_of_measurement', e.target.value)} .value=${entityConfig.overrides?.unit_of_measurement || ''} placeholder="自定义单位" ?disabled=${entityConfig.overrides?.unit_of_measurement === undefined} />
                      </div>
                      <div class="override-config">
                        <input type="checkbox" class="override-checkbox" @change=${(e) => this._updateEntityOverride(index, 'conversion', e.target.checked)} .checked=${entityConfig.overrides?.conversion !== undefined} />
                        <span class="override-label">换算:</span>
                        <input type="text" class="override-input" @change=${(e) => this._updateEntityOverrideValue(index, 'conversion', e.target.value)} .value=${entityConfig.overrides?.conversion || ''} placeholder="k+(2*k)/2-0.5，k代表当前实体值" ?disabled=${entityConfig.overrides?.conversion === undefined} />
                      </div>

                      <!-- V9 规则编辑器 -->
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
            搜索并选择要显示的设备信息实体，支持多选。每个实体可以配置：<br>
            &bull; 属性名：留空使用实体状态(state)，或输入属性名（如 light 的 brightness）<br>
            &bull; 名称/图标/单位重定义：勾选后可自定义显示<br>
            &bull; <strong style="color:#d32f2f;">异常规则：支持括号表达式、AND/OR 组合、跨实体引用</strong><br>
            &bull; 表达式换算：使用 k 代表当前实体值，支持四则运算和括号<br>
          </div>
        </div>
      </div>
    `;
  }

  // V9 规则编辑器：每条规则是一个表达式字符串
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

        <button class="add-rule-btn" @click=${() => this._addRule(entityIndex)}>
          + 添加异常检测规则
        </button>

        <div class="rule-help">
          <strong>表达式语法（V9 新语法）：</strong><br>
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

  // V9 预览表达式解析结果
  _previewExpression(expression, defaultEntityId) {
    if (!expression || !expression.trim()) return '空表达式';
    try {
      let preview = expression;
      // 高亮实体引用 - 匹配 entity_id.attribute operator 或 entity_id operator
      const entityPattern = /([a-zA-Z_][a-zA-Z0-9_]*\.[a-zA-Z_][a-zA-Z0-9_]*(?:\.[a-zA-Z_][a-zA-Z0-9_]*)?)\s*(>=|<=|>|<|==|!=)/g;
      preview = preview.replace(entityPattern, (match, fullRef, op) => {
        const parts = fullRef.split('.');
        const eid = parts.slice(0, 2).join('.');
        const attr = parts.length > 2 ? parts.slice(2).join('.') : null;
        if (attr) {
          return eid + '.' + attr + ' ' + op;
        }
        return eid + ' ' + op;
      });
      return preview;
    } catch (e) {
      return expression;
    }
  }

  _addRule(entityIndex) {
    const currentEntities = this.config.entities || [];
    const newEntities = [...currentEntities];
    if (newEntities[entityIndex]) {
      const rules = [...(newEntities[entityIndex].rules || [])];
      rules.push({ expression: '' });
      newEntities[entityIndex] = {...newEntities[entityIndex], rules};
    }
    this.config = {...this.config, entities: newEntities};
    this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: this.config }, bubbles: true, composed: true }));
    this.requestUpdate();
  }

  _removeRule(entityIndex, ruleIndex) {
    const currentEntities = this.config.entities || [];
    const newEntities = [...currentEntities];
    if (newEntities[entityIndex] && newEntities[entityIndex].rules) {
      const rules = newEntities[entityIndex].rules.filter((_, i) => i !== ruleIndex);
      newEntities[entityIndex] = {...newEntities[entityIndex], rules};
      if (rules.length === 0) {
        const {rules, ...rest} = newEntities[entityIndex];
        newEntities[entityIndex] = rest;
      }
    }
    this.config = {...this.config, entities: newEntities};
    this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: this.config }, bubbles: true, composed: true }));
    this.requestUpdate();
  }

  _updateRuleExpression(entityIndex, ruleIndex, expression) {
    const currentEntities = this.config.entities || [];
    const newEntities = [...currentEntities];
    if (newEntities[entityIndex] && newEntities[entityIndex].rules && newEntities[entityIndex].rules[ruleIndex]) {
      const rules = [...newEntities[entityIndex].rules];
      rules[ruleIndex] = {...rules[ruleIndex], expression: expression.trim()};
      newEntities[entityIndex] = {...newEntities[entityIndex], rules};
    }
    this.config = {...this.config, entities: newEntities};
    this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: this.config }, bubbles: true, composed: true }));
    this.requestUpdate();
  }

  _entityChanged(e) {
    const { name, value } = e.target;
    const allowEmptyFields = ['global_warning', 'name'];
    if (!value && !allowEmptyFields.includes(name) && name !== 'theme' && name !== 'width') return;
    let finalValue = value;
    if (name === 'width') finalValue = value || '100%';
    this.config = { ...this.config, [name]: finalValue };
    this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: this.config }, bubbles: true, composed: true }));
  }

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

  _removeEntity(index) {
    const currentEntities = this.config.entities || [];
    const newEntities = currentEntities.filter((_, i) => i !== index);
    this.config = { ...this.config, entities: newEntities };
    this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: this.config }, bubbles: true, composed: true }));
    this.requestUpdate();
  }

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

  _updateEntityOverrideValue(index, overrideType, value) {
    const currentEntities = this.config.entities || [];
    const newEntities = [...currentEntities];
    if (newEntities[index] && newEntities[index].overrides && newEntities[index].overrides[overrideType] !== undefined) {
      const overrides = { ...newEntities[index].overrides };
      overrides[overrideType] = value.trim();
      newEntities[index] = { ...newEntities[index], overrides: overrides };
    }
    this.config = { ...this.config, entities: newEntities };
    this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: this.config }, bubbles: true, composed: true }));
    this.requestUpdate();
  }
}

customElements.define('hello-infodata-card-editor', HelloInfodataCardEditor);

// ═══════════════════════════════════════════════════════════════════════════════
// 卡片显示类 V9
// ═══════════════════════════════════════════════════════════════════════════════

class HelloInfodataCard extends LitElement {

  static get properties() {
    return {
      hass: Object,
      config: Object,
      _loading: Boolean,
      theme: { type: String }
    };
  }

  static get styles() {
    return css`
      :host { display: block; width: var(--card-width, 100%); }
      ha-card { width: 100%; height: 100%; display: flex; flex-direction: column; background: var(--bg-color, #fff); border-radius: 12px; }
      .card-header { display: flex; justify-content: space-between; align-items: center; padding: 16px; background: var(--bg-color, #fff); border-radius: 12px; }
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

  static getConfigElement() {
    return document.createElement("hello-infodata-card-editor");
  }

  static getStubConfig() {
    return { name: '数据集信息统计', entities: [] };
  }

  constructor() {
    super();
    this._loading = false;
    this.theme = 'on';
    this._refreshTimer = null;
    this._lastProcessedData = null;
  }

  setConfig(config) {
    this.config = config;
    if (config.width) this.style.setProperty('--card-width', config.width);
    if (config.theme) this.setAttribute('theme', config.theme);
  }

  connectedCallback() {
    super.connectedCallback();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._refreshTimer) {
      clearTimeout(this._refreshTimer);
      this._refreshTimer = null;
    }
  }

  shouldUpdate(changedProperties) {
    if (!this._lastProcessedData || changedProperties.has('config')) {
      return true;
    }
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
      // V9: 检查规则表达式中引用的所有实体是否变化
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

  // V9: 从表达式中提取引用的实体列表
  _extractEntitiesFromExpression(expression) {
    const results = [];
    if (!expression) return results;

    // 匹配模式：entity_id.attribute operator value 或 entity_id operator value
    // 如：sensor.temperature > 30, light.bedroom.brightness < 100, switch.kitchen == 'on'
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

  // 【2.10】处理实体数据：读取属性、应用换算、组装显示数据
  // 
  // 处理流程：
  // 1. 读取实体 state 或指定 attribute 的原始值
  // 2. 如果配置了 conversion（如 k/2.55），对原始值进行换算
  // 3. 将换算后的值转为字符串，用于显示
  // 4. 同时保留 _originalValue（换算后的数值），供规则判断使用
  //
  // 注意：规则判断时，如果规则引用的属性名 == 当前 attribute，
  //       则使用 _originalValue（已换算），确保显示与判断一致。
  //       详见【2.15】_evaluateSingleCondition 的 V9.1 修复。
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

    // V9: 不再硬编码转换状态，保持原始值让用户自行判断

    if (attributes.unit_of_measurement) unit = attributes.unit_of_measurement;

    let friendlyName = attributes.friendly_name || entityId;
    let icon = attributes.icon || 'mdi:help-circle';
    let conversion = undefined;

    if (entityConfig.overrides) {
      if (entityConfig.overrides.name !== undefined && entityConfig.overrides.name !== '')
        friendlyName = entityConfig.overrides.name;
      if (entityConfig.overrides.icon !== undefined && entityConfig.overrides.icon !== '')
        icon = entityConfig.overrides.icon;
      if (entityConfig.overrides.unit_of_measurement !== undefined && entityConfig.overrides.unit_of_measurement !== '')
        unit = entityConfig.overrides.unit_of_measurement;
      if (entityConfig.overrides.conversion !== undefined && entityConfig.overrides.conversion !== '')
        conversion = entityConfig.overrides.conversion;
    }

    if (conversion && value !== undefined && value !== null && value !== '') {
      const converted = this._applyConversion(value, conversion);
      if (converted !== value) {
        value = converted;
        console.log(`[hello-infodata-card][_processEntity] 实体 ${entityId} 换算后: ${value}`);
      }
    }

    const originalValue = value;
    if (value !== undefined && value !== null) {
      value = String(value);
    }

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

  // 【2.11】判断实体是否触发预警/异常
  //
  // 判断优先级：明细规则 > 全局预警 > 无预警
  //
  // 关于换算一致性（V9.1 修复）：
  // - _processEntity 已将原始值换算后存入 infodataData.value
  // - 当规则中不写属性名（如 ">10"）时，直接使用 defaultValue（已换算）
  // - 当规则中写属性名（如 "brightness < 30"）且 attrName == defaultAttribute 时，
  //   _evaluateSingleCondition【2.15】会使用 defaultValue（已换算），而非原始值
  // - 这样确保：显示值 38.82% 与规则判断值 38.82 完全一致
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

  // V9: 评估完整表达式（支持括号、AND、OR、跨实体引用）
  _evaluateExpression(expression, defaultEntityId, defaultValue, defaultAttribute) {
    if (!expression || !expression.trim()) return false;

    console.log(`[hello-infodata-card][_evaluateExpression] 表达式: "${expression}"`);

    try {
      // Step 1: 处理括号 - 递归解析
      return this._evaluateExpressionWithParens(expression.trim(), defaultEntityId, defaultValue, defaultAttribute);
    } catch (e) {
      console.error(`[hello-infodata-card][_evaluateExpression] 表达式解析错误: ${e.message}`);
      return false;
    }
  }

  // V9: 递归处理括号
  _evaluateExpressionWithParens(expression, defaultEntityId, defaultValue, defaultAttribute) {
    expression = expression.trim();

    // 找到最外层括号
    let depth = 0;
    let start = -1;

    for (let i = 0; i < expression.length; i++) {
      if (expression[i] === '(') {
        if (depth === 0) start = i;
        depth++;
      } else if (expression[i] === ')') {
        depth--;
        if (depth === 0 && start === 0) {
          // 检查是否整个表达式被括号包裹
          const inner = expression.slice(1, i).trim();
          const rest = expression.slice(i + 1).trim();
          if (rest === '') {
            // 整个表达式就是 (xxx)，递归解析内部
            return this._evaluateExpressionWithParens(inner, defaultEntityId, defaultValue, defaultAttribute);
          }
        }
      }
    }

    // Step 2: 按 OR 分割（优先级最低）
    const orParts = this._splitByOperator(expression, 'OR');
    if (orParts.length > 1) {
      for (const part of orParts) {
        if (this._evaluateExpressionWithParens(part.trim(), defaultEntityId, defaultValue, defaultAttribute)) {
          return true;
        }
      }
      return false;
    }

    // Step 3: 按 AND 分割（优先级更高）
    const andParts = this._splitByOperator(expression, 'AND');
    if (andParts.length > 1) {
      for (const part of andParts) {
        if (!this._evaluateExpressionWithParens(part.trim(), defaultEntityId, defaultValue, defaultAttribute)) {
          return false;
        }
      }
      return true;
    }

    // Step 4: 单个条件
    return this._evaluateSingleCondition(expression.trim(), defaultEntityId, defaultValue, defaultAttribute);
  }

  // V9: 按逻辑运算符分割表达式（考虑括号嵌套）
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
        // 检查是否匹配运算符（前后需要是空格或边界）
        const substr = expression.substring(i, i + opLen);
        if (substr.toUpperCase() === opUpper || substr.toLowerCase() === opLower) {
          // 检查前后是否是单词边界
          const before = i > 0 ? expression[i - 1] : ' ';
          const after = i + opLen < expression.length ? expression[i + opLen] : ' ';
          if ((before === ' ' || before === '(') && (after === ' ' || after === ')')) {
            if (current.trim()) {
              parts.push(current.trim());
            }
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

    if (current.trim()) {
      parts.push(current.trim());
    }

    return parts;
  }

  // V9: 评估单个条件（支持跨实体引用）
  _evaluateSingleCondition(condition, defaultEntityId, defaultValue, defaultAttribute) {
    condition = condition.trim();
    if (!condition) return false;

    console.log(`[hello-infodata-card][_evaluateSingleCondition] 条件: "${condition}"`);

    // 解析条件，识别是否包含跨实体引用
    // 模式1: entity_id.attribute operator value (如 sensor.temperature > 30)
    // 模式2: entity_id operator value (如 light.bedroom == 'on')
    // 模式3: attribute operator value (如 brightness < 30) - 本实体属性
    // 模式4: operator value (如 <30, ==on) - 本实体默认值

    // 先尝试匹配包含实体ID的模式
    const entityRefPattern = /^([a-zA-Z_][a-zA-Z0-9_]*\.[a-zA-Z_][a-zA-Z0-9_]*(?:\.[a-zA-Z_][a-zA-Z0-9_]*)?)\s*(>=|<=|>|<|==|!=)\s*(.+)$/;
    const entityMatch = condition.match(entityRefPattern);

    if (entityMatch) {
      const fullRef = entityMatch[1];
      const operator = entityMatch[2];
      let compareValue = entityMatch[3].trim();

      // 解析实体ID和属性
      const parts = fullRef.split('.');
      const entityId = parts.slice(0, 2).join('.');
      const attribute = parts.length > 2 ? parts.slice(2).join('.') : null;

      // 获取被引用实体的值
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

    // 尝试匹配本实体属性模式: attribute operator value
    // 如: brightness < 30, color_temp > 400
    const attrPattern = /^([a-zA-Z_][a-zA-Z0-9_]+)\s*(>=|<=|>|<|==|!=)\s*(.+)$/;
    const attrMatch = condition.match(attrPattern);

    if (attrMatch) {
      const attrName = attrMatch[1];
      const operator = attrMatch[2];
      let compareValue = attrMatch[3].trim();

      // 排除 AND/OR 被误匹配
      if (['AND', 'OR', 'and', 'or'].includes(attrName)) {
        // 这不是属性模式，回退到默认条件模式
        return this._evaluateSimpleCondition(defaultValue, condition);
      }

      // ═══════════════════════════════════════════════════════════════════════
      // 【V9.1 修复】换算一致性：规则判断使用换算后的值
      // 
      // 问题描述：当实体配置了 conversion（如 brightness 的 k/2.55）时，
      // 显示值是换算后的（如 38.82%），但规则判断却读取了原始属性值（如 99）。
      // 导致 "brightness > 90" 判断为 True（99>90），错误触发红色预警。
      //
      // 修复逻辑：
      // 1. 如果规则中的属性名(attrName) == 实体配置的attribute(defaultAttribute)
      //    说明用户在规则中引用的是"当前正在显示的属性"，应使用已换算的 defaultValue
      // 2. 如果 attrName != defaultAttribute，说明引用的是其他属性，读取原始值
      // ═══════════════════════════════════════════════════════════════════════
      let value;
      if (attrName === defaultAttribute) {
        // 规则引用的是当前显示属性 → 使用已换算的值（与显示一致）
        value = String(defaultValue);
        console.log(`[hello-infodata-card][_evaluateSingleCondition] 本实体属性 ${defaultEntityId}.${attrName} (已换算): value="${value}", op="${operator}", compare="${compareValue}"`);
      } else {
        // 规则引用的是其他属性 → 从实体原始数据中读取
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

  // V9: 评估简单条件（数值或字符串比较）
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

  render() {
    if (!this.hass) return html`<div class="loading">等待Home Assistant连接...</div>`;

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
        newProcessedData[processed.entity_id] = {
          value: processed._originalValue
        };
        // V9: 缓存规则表达式中引用的实体数据
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

    return html`
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
    `;
  }

  _renderDeviceItem(infodataData) {
    const isWarning = this._isWarning(infodataData);

    return html`
      <div class="device-item" @click=${() => this._handleEntityClick(infodataData)}>
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

  _handleEntityClick(entity) {
    this._handleClick();
    if (entity.entity_id) {
      const evt = new Event('hass-more-info', { composed: true });
      evt.detail = { entityId: entity.entity_id };
      this.dispatchEvent(evt);
    }
  }

  _handleClick() {
    const hapticEvent = new Event('haptic', { bubbles: true, cancelable: false, composed: true });
    hapticEvent.detail = 'light';
    this.dispatchEvent(hapticEvent);
  }

  _applyConversion(value, expression) {
    if (!expression || value === undefined || value === null || value === '') return value;
    try {
      const numericValue = parseFloat(value);
      if (isNaN(numericValue)) {
        console.warn(`[hello-infodata-card] 无法将值 "${value}" 转换为数字进行表达式计算`);
        return value;
      }

      // V9: 表达式换算 - 使用 k 代表当前实体值
      // 支持四则运算、括号、小数，例如: k*2+10, (k+5)/2, k+(2*k)/2-0.5
      let evalExpression = expression.trim();

      // 安全检查：只允许数字、运算符、括号、小数点、k、K 和空格
      if (!/^[\d\+\-*/\(\)\.kK\s]+$/.test(evalExpression)) {
        console.warn(`[hello-infodata-card] 表达式包含非法字符: "${expression}"，只允许数字、+-*/()、小数点和k`);
        return value;
      }

      // 将 k/K 替换为实际数值
      evalExpression = evalExpression.replace(/k/gi, numericValue.toString());

      // 使用 Function 安全计算表达式
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
    const entitySize = Math.max(0, Math.min((this.config.entities || []).length * 2, 10));
    return baseSize + entitySize;
  }
}

customElements.define('hello-infodata-card', HelloInfodataCard);
