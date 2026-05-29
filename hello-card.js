console.info("%c 学习-通用卡 \n%c      v 1.0.0 ", "color: red; font-weight: bold; background: black", "color: white; font-weight: bold; background: black");

const loadCards = () => {
    import('./hello-world-card.js');
    import('./hello-image-card.js');
    import('./hello-video-card.js');
    import('./hello-infodata-card.js');
    import('./hello-infodata-button.js');
    import('./hello-todo-card.js');
    import('./hello-todo-button.js');
    
    window.customCards = window.customCards || [];
    window.customCards.push(...cardConfigs);
};

const cardConfigs = [
  {
    type: 'hello-world-card',
    name: '显示文字卡片',
    description: '显示文字卡片',
    preview: true
  },
  {
    type: 'hello-image-card',
    name: '显示背景图片卡片',
    description: '显示图片卡片',
    preview: true
  },
  {
    type: 'hello-video-card',
    name: '显示背景视频卡片',
    description: '显示背景视频卡片注意禁用才能动画',
    preview: true
  },
  {
    type: 'hello-infodata-card',
    name: '显示符合条件卡片',
    description: '显示符合条件信息卡片',
    preview: true
  },
  {
    type: 'hello-infodata-button',
    name: '显示符合条件按钮',
    description: '显示符合条件信息按钮',
    preview: true
  },
  {
    type: 'hello-todo-card',
    name: '显示待办条件卡片',
    description: '显示代办条件信息卡片',
    preview: true
  },
  {
    type: 'hello-todo-button',
    name: '显示待办条件按钮',
    description: '显示待办按钮点击信息显示',
    preview: true
  }
];

loadCards();
