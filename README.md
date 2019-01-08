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