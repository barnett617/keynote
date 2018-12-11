import Taro, { Component } from '@tarojs/taro'
import { View, Button } from '@tarojs/components'
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
      canIUse: Taro.canIUse('Button.open-type.getUserInfo'),
    }
  }

  config = {
    navigationBarTitleText: 'PickMee'
  }

  componentWillMount () {
    // 进入首页时异步获取用户信息
    this.getSetting();
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

  handleClick = () => {
    if (this.state.canIUse) {
      Taro.navigateTo({
        url: '/pages/home/index'
      })
    } else {
      Taro.showToast({
        title: '正在识别你的身份，稍等哦~',
        icon: 'none',
        duration: 2000
      })
    }
  }

  getSetting() {
    const self = this;
    Taro.getSetting({
      success (settingRes){
        if (settingRes.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称
          Taro.getUserInfo({
            success: function(userinfoRes) {
              Taro.showToast({
                title: 'biubiubiu~ 可以进啦！',
                icon: 'none',
                duration: 2000
              })
              self.setState({ canIUse: true })
              console.log('userInfo: ' + JSON.stringify(userinfoRes.userInfo));
            }
          })
        }
      }
    })
  }

  bindGetUserInfo (e) {
    console.log(e.detail.userInfo)
    Taro.navigateTo({
      url: '/pages/home/index'
    })
  }

  render () {
    return (
      <View className='index'>
        <Button 
          Taro-if='{{canIUse}}' 
          onClick={this.handleClick} 
          open-type='getUserInfo'
        >Pick Me!</Button>
      </View>
    )
  }
}

export default Index
