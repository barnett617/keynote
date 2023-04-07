import Taro from '@tarojs/taro'
import React, { Component } from 'react'
import { View, Image, Button } from '@tarojs/components'
import StartImg from '../../assets/images/min.jpeg'

import './index.scss'

class Index extends Component {

  constructor (props) {
    super(props)
    this.state = {
      canIUse: Taro.canIUse('Button.openType.getUserInfo'),
    }
  }

  // 对应微信onLoad方法
  UNSAFE_componentWillMount () {
    Taro.setNavigationBarColor({
      frontColor: '#000000',
      backgroundColor: '#FCFCFC',
      animation: {
        duration: 400,
        timingFunc: 'easeIn'
      }
    })
  }

  bindGetUserInfo (res) {
    if(res.detail.userInfo) {
      Taro.setStorageSync('userinfo', res.detail.userInfo);
      Taro.navigateTo({
        url: '/pages/list/index'
      })
    }else {
      console.log('用户点击了取消按钮')
    }
  }

  render () {
    return (
      <View className='page'>
        <View className='page-img'>
          <Image src={StartImg} data-src={StartImg}></Image>
        </View>
        <Button
          className='btn'
          block
          type='royal'
          Taro-if={this.state.canIUse}
          openType='getUserInfo'
          onGetUserInfo={this.bindGetUserInfo}
        >进入PickMe</Button>
      </View>
    )
  }
}

export default Index
