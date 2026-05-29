# hello-card

Home Assistant 多功能合集卡片

**HACS安装方法**

如果是使用HACS安装，请选择右上角的三个点后，点选“自定义仓库”，
仓库地址为： https://github.com/ycxlb/hello-card
类型为：仪表盘（Dashboard）
添加完成后，在 HACS 里搜索和显示的名称就是 Hello Card，
然后下载安装并重启HA.

**添加卡片时注意选择为**

   以下操作一般都需要添加监控的实体数据，根据实体数据显示对应信息
默认监控的是实体的默认数据，也可以通过修改属性名称，监控对应数据的数据，
比如监控灯的亮度，亮度就是属性，而灯的默认数据是打开或者关闭
文件列表如下：

hello-world-card.js 在按钮上显示配置的文字

hello-image-card.js 多张图片随机背景，图片URL列表中每张图片地址输完回车

hello-video-card.js 多个视频随机背景，视频URL列表中每个视频地址输完回车

hello-infodata-button.js 根据实体属性按照设定好的换算条件计算后的数据再根据设定的过滤条件统计出符合条件的数据
                         个数并在界面显示按钮，点击按钮弹出详细信息，支持跨实体、多级公式和括号运行

hello-infodata-card.js 在界面上显示符合条件的数据

hello-todo-button.js 在界面上集成待办事项的个数按钮，点击按钮弹出待办详细信息

hello-todo-card.js 在界面上直接显示HA中的待办事项
