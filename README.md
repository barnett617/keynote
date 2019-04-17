# dailyhappy_miniprogram

## Daily Happy

### 特点

- 只能发送，不能撤回、删除
- 无评论、点赞

### 功能列表

- 内容编辑页：类似微信聊天页，发送内容支持文字、图片
- 列表查询页：支持按日期查询

### 方案设计

#### 列表页

1. 图片+标题 -> 点击图片或标题进入详情页，详情页包含图片、标题和正文
2. 图片+概要 -> 点击图片或概要进入详情页，详情页包含图片、标题和正文
3. 图片+正文 -> 点击不跳转

### 文档

- [Taro](https://nervjs.github.io/taro/docs/README.html)
- [小程序API](https://developers.weixin.qq.com/miniprogram/dev/api/wx.setNavigationBarTitle.html)
- [知晓云文档](https://doc.minapp.com/)
- [知晓云控制台](https://cloud.minapp.com/dashboard/#/)
- [小程序后台配置](https://mp.weixin.qq.com/wxopen/authprofile?action=index&use_role=1&token=1667199367&lang=zh_CN)
- [wux-ui](https://wux-weapp.github.io/wux-weapp-docs/#/quickstart)
- [解决nginx转发websocket报400错误](https://blog.godotdotdot.com/2017/12/04/%E8%A7%A3%E5%86%B3nginx%E8%BD%AC%E5%8F%91websocket%E6%8A%A5400%E9%94%99%E8%AF%AF/index.html)
- [nginx反向代理WebSocket](https://www.xncoding.com/2018/03/12/fullstack/nginx-websocket.html)
- [基于socket.io实现简单多人聊天室](https://segmentfault.com/a/1190000011538416)
- [全站 HTTPS 没你想象的那么简单](https://juejin.im/entry/5983ce176fb9a03c335a7b38)