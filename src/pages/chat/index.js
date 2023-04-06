import Taro from '@tarojs/taro';
import React, { Component } from 'react'
import { View, Text, ScrollView, Image } from '@tarojs/components';
import io from 'weapp.socket.io';
import dateFormat from '../../utils/dateFormat';
import { $wuxDialog } from '../../lib/index';
import './index.scss';

let socket;
let openIdList = []
let userAvatarList = []

class Chat extends Component {

  constructor(props) {
    super(props)
    this.state = {
      // 聊天内容
      message: '',
      // 消息列表
      msgList: [],
      scrollTop: 0,
      // 当前用户信息（三要素）
      userId: null,
      userNick: null,
      userAvatar: null,
      openIdList: []
    }
  }

  UNSAFE_componentWillMount () {
    this.handleLogin();
    const userinfo = Taro.getStorageSync('userinfo');
    this.setState({
      userNick: userinfo.nickName,
      userAvatar: userinfo.avatarUrl,
    })
  }

  /**
   * 微信用户登录小程序
   * 获取用户唯一标识 openid
   */
  handleLogin () {
    const self = this;
    Taro.BaaS.login(false).then(res => {
      self.setState({
        userId: res.openid
      }, this.socket(res.openid));
    }, err => {
      // 登录失败
      // console.log('err: ' + err);
    })
  }

  componentDidMount () {
    const self = this;
    socket.on('receiveMessage', function (msg) {
      let newList;
      let showTime = true;
      if (self.state.msgList && self.state.msgList.length > 0) {
        showTime = dateFormat.gapfivemin(self.state.msgList[self.state.msgList.length - 1].originTime, msg.time)
      }
      let time;
      if (showTime) {
        time = dateFormat.timestamp(msg.time)
      } else {
        time = null
      }
      if (msg.userType === 'sys') {
        newList = self.state.msgList.concat({
          userType: 'sys',
          message: msg.message,
          originTime: msg.time,
          time: time,
        })
      } else {
        newList = self.state.msgList.concat({
          userId: msg.userId,
          userNick: msg.userNick,
          userAvatar: msg.userAvatar,
          message: msg.message,
          originTime: msg.time,
          time: time,
        })
      }
      self.setState({
        msgList: newList,
        scrollTop: 1000 * (newList.length + 1),
      })
    })

    /*登录成功*/
    socket.on('loginSuccess', function (user) {
      if (user.userId) {
        // 登录成功
        // let existUser = true
        // if (self.state.openIdList && self.state.openIdList.length > 0) {
        //   self.state.openIdList.forEach(element => {
        //     if (element === user.userId) {
        //       existUser = true;
        //       return false
        //     }
        //   });
        // } else {
        //   existUser = false
        // }
        // if (!existUser) {
        //   self.setState({
        //     openIdList: self.state.openIdList.concat(user.userId)
        //   })
        // }
      } else {
      }
    })

    /*新人加入提示*/
    socket.on('newJoin', function (user) {
      let existUser = true
      if (openIdList && openIdList.length > 0) {
        openIdList.forEach(element => {
          if (element === user.userId) {
            existUser = true;
            return false
          }
        });
      } else {
        existUser = false
        openIdList.push(user.userId);
        userAvatarList.push(user.userAvatar);
      }
      if (user && user.userNick && !existUser) {
        socket.emit('sendMessage', {
          userType: 'sys',
          message: user.userNick + '加入群聊',
          time: new Date()
        });
      }
    })
  }

  componentWillUnmount() {
    // const self = this;
    // socket.emit('logout', {
    //   userId: self.state.userId,
    //   userNick: self.state.userNick
    // })
  }

  socket(openid) {
    socket = io('wss://im.trigolds.com');
    // 连接socket后使用当前openid登录聊天室
    socket.emit('login',{
      userId: openid,
      userNick: this.state.userNick,
      userAvatar: this.state.userAvatar,
    })



    /*登录失败*/
    socket.on('loginFail', function () {
      $wuxDialog().alert({
        resetOnClose: true,
        content: '您已在其他设备登录',
      })
    })

    /*退出群聊提示*/
    socket.on('leave',function (userNick) {
      if (userNick != null) {
        socket.emit('sendMessage', {
          userType: 'sys',
          message: user.userNick + '退出群聊',
          time: new Date()
        });
      }
    })
  }

  onScrolltoupper(e) {
    // console.log(e)
  }

  onScroll(e) {
    // console.log(e)
  }

  /**
   * 监听输入框输入
   */
  handelChange = (e) => {
    if (e.target.value) {
      this.setState({
        message: e.target.value,
      });
    }
  }

  /**
   * 发消息
   * @param {*} e
   */
  handleCommit(e) {
    this.setState({
      message: '',
      scrollTop: 1000 * (this.state.msgList.length + 1),
    })
    socket.emit('sendMessage', {
      userId: this.state.userId,
      userNick: this.state.userNick,
      userAvatar: this.state.userAvatar,
      message: e.target.value,
      time: new Date()
    });
  }

  render () {
    const msgList = this.state.msgList;
    const avatarDomList = userAvatarList.map((each, index) => {
      return (
        <Image key={index} src={each} data-src={each}></Image>
      )
    })
    const msgListDom = msgList.map((each, index) => {
      return (
        each.userType ==='sys'
        ?
        <View className='page-list-item-wrap-sys' key={index}>
          <View className='page-list-item-view-time'>
            <Text>{each.time}</Text>
          </View>
          <View className='page-list-item-view-text-sys'>
            <Text>{each.message}</Text>
          </View>
        </View>
        :
        (
          each.userId === this.state.userId
          ?
          <View key={index} className='page-list-item-wrap-me'>
            {
              each.time !== null
              ?
              <View className='page-list-item-view-time'>
                <Text>{each.time}</Text>
              </View>
              :
              <View></View>
            }
            <View className='page-list-item-view-wrap-me' key={index}>
              <View className='page-list-item-view-text-me'>
                <Text>{each.message}</Text>
              </View>
              <View className='page-list-item-view-wrap-me-avatar'>
                <Image src={each.userAvatar} data-src={each.userAvatar}></Image>
              </View>
            </View>
          </View>
          :
          <View key={index} className='page-list-item-wrap-other'>
            {
              each.time !== null
              ?
              <View className='page-list-item-view-time'>
                <Text>{each.time}</Text>
              </View>
              :
              <View></View>
            }
            <View className='page-list-item-view-wrap-other' key={index}>
              <View className='page-list-item-view-wrap-other-avatar'>
                <Image src={each.userAvatar} data-src={each.userAvatar}></Image>
              </View>
              <View className='page-list-item-view-text-other'>
                <Text>{each.message}</Text>
              </View>
            </View>
          </View>
        )
      )
    })
    return (
      <View className='page'>
        <View className='page-avatar-list'>
          <Text>当前在线用户：</Text>
          { avatarDomList }
        </View>
        <ScrollView
          className='page-scrollview'
          scrollY
          scrollWithAnimation
          scrollTop={this.state.scrollTop}
          lowerThreshold='20'
          upperThreshold='20'
          onScrolltoupper={this.onScrolltoupper}
          onScroll={this.onScroll}
        >
          { msgListDom }
        </ScrollView>
        <View className='page-input'>
          <View className='page-input-box'>
            <wux-cell hover-class='none'>
              <wux-input
                value={this.state.message}
                controlled
                type='text'
                confirm-type='send'
                confirmHold
                onchange={this.handelChange.bind(this)}
                onconfirm={this.handleCommit.bind(this)}
              />
            </wux-cell>
          </View>
        </View>
        <wux-dialog id='wux-dialog' />
      </View>
    )
  }
}
export default Chat
