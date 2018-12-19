import Taro, { Component } from '@tarojs/taro'
import { View, Image, Button, OpenData } from '@tarojs/components'
// import { connect } from '@tarojs/redux'
// import { add, minus, asyncAdd } from '../../actions/counter'

import './index.scss'

// @connect(({ counter }) => ({
//   counter
// }), (dispatch) => ({
//   add () {
//     dispatch(add())
//   },
//   dec () {
//     dispatch(minus())
//   },
//   asyncAdd () {
//     dispatch(asyncAdd())
//   }
// }))
class Index extends Component {
  
  constructor (props) {
    super(props)
    this.state = {
      canIUse: Taro.canIUse('Button.openType.getUserInfo'),
    }
    this.env = process.env.TARO_ENV
  }

  config = {
    navigationBarTitleText: 'PickMee',
    "usingComponents": {
      "wux-icon": "../../lib/icon/index",
      "wux-button": "../../lib/button/index"
    },
    disableScroll: true
  }

  // 对应微信onLoad方法
  componentWillMount () {
  }

  componentDidMount () {
  }

  componentWillReceiveProps (nextProps) {
    console.log('this.props: ' + this.props);
    console.log('nextProps: ' + nextProps);
  }

  componentWillUnmount () { }

  componentDidShow () { }

  componentDidHide () { }

  bindGetUserInfo (res) {
    if(res.detail.userInfo) {
      Taro.showToast({
        title: 'HI,' + res.detail.userInfo.nickName,
        icon: 'success',
        duration: 2000
      })
      setTimeout(() => {
        Taro.navigateTo({
          url: '/pages/home/index'
        })
      }, 1000);
    }else {
      console.log('用户点击了取消按钮')
    }
  }

  bindGetUserInfoLong (res) {
    if(res.detail.userInfo) {
      Taro.navigateTo({
        url: '/pages/long/index'
      })
    }else {
      console.log('用户点击了取消按钮')
    }
  }

  render () {
    return (
      <View className='page'>
        <View className='page-wrap'>
          <View className='page-wrap-avatar'>
            <Image 
              data-src='https://cloud-minapp-22468.cloud.ifanrusercontent.com/1gZSU8ut5ibtlR1m.png' 
              src='https://cloud-minapp-22468.cloud.ifanrusercontent.com/1gZSU8ut5ibtlR1m.png'
            ></Image>
          </View>
          <View className='page-wrap-text'>
            <View>我是你的私人助理小P</View>
            <View>有什么想吐槽的跟我说吧~</View>
          </View>
          <View Taro-if='{{canIUse}}' 
            className='page-wrap-home'
          >
            <Button 
              block 
              type='royal'
              Taro-if={this.state.canIUse}
              openType='getUserInfo'
              onGetUserInfo={this.bindGetUserInfo}
            >小情绪</Button>
          </View>
          <View Taro-if='{{canIUse}}' 
            className='page-wrap-long'
          >
            <Button
              block 
              type='positive'
              Taro-if={this.state.canIUse}
              openType='getUserInfo'
              onGetUserInfo={this.bindGetUserInfoLong}
            >长篇大论</Button>
          </View>
        </View>
      </View>
    )
  }
}

export default Index
