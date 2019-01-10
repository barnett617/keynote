import Taro, { Component } from '@tarojs/taro'
import '@tarojs/async-await'
import { Provider } from '@tarojs/redux'
import './assets/styles/weui.wxss';
// import './assets/styles/skyvow.wxss';    // 重写全局样式

import Index from './pages/index'

import configStore from './store'

import './app.scss'

const store = configStore()

class App extends Component {

  config = {
    pages: [
      'pages/index/index',
      'pages/home/index',
      'pages/long/index',
      'pages/list/index',
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

  componentDidMount () {
    const clientId = 'dd35dbb2deae1a25bc6d'
    Taro.BaaS = Taro.requirePlugin('sdkPlugin')
    //让插件帮助完成登录、支付等功能
    Taro.BaaS.wxExtend(Taro.login,
      Taro.getUserInfo,
      Taro.requestPayment)
    Taro.BaaS.init(clientId)
    Taro.BaaS.ErrorTracker.enable()  // 开启 bugout 功能
  }

  onError(res) {
    // 当小程序产生错误时，会进行上报
    Taro.BaaS.ErrorTracker.track(res)
  }

  componentDidShow () {}

  componentDidHide () {}

  componentCatchError () {}

  render () {
    return (
      <Provider store={store}>
        <Index />
      </Provider>
    )
  }
}

Taro.render(<App />, document.getElementById('app'))
