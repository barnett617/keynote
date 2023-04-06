export default {
  pages: [
    'pages/index/index',
    'pages/home/index',
    'pages/list/index',
    'pages/chat/index',
    'pages/me/index',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: 'WeChat',
    navigationBarTextStyle: 'black',
    enablePullDownRefresh: true
  },
  plugins: {
    sdkPlugin: {
      "version": "1.13.0",
      "provider": "wxc6b86e382a1e3294"
    }
  }
}
