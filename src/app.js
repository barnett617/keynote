import Taro from '@tarojs/taro'
import { Component } from 'react'
import './assets/styles/weui.wxss';
import './app.scss'

class App extends Component {
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

  render () {
    return this.props.children
  }
}

export default App
