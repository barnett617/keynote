import Taro, { Component } from '@tarojs/taro'
import { View, Text, ScrollView, OpenData, Image } from '@tarojs/components'
import io from 'weapp.socket.io'
import dateFormat from '../../utils/dateFormat';
import { $wuxDialog } from '../../lib/index'

import './index.scss'

let socket;

class Index extends Component {

  config = {
    navigationBarTitleText: '聊天室',
    "usingComponents": {
      "wux-cell-group": "../../lib/cell-group/index",
      "wux-cell": "../../lib/cell/index",
      "wux-dialog": "../../lib/dialog/index",
      'wux-input': '../../lib/input/index',
    }
  }

  constructor(props) {
    super(props)
    this.state = {
      content: '',
      msgList: [],
      scrollTop: 0,
      avatar: '',
      openid: ''
    }
  }

  componentWillMount () {
    this.handleLogin();
    const userinfo = Taro.getStorageSync('userinfo');
    this.setState({
      avatar: userinfo.avatarUrl
    })
    this.socket(userinfo.nickName)
  }

  /**
   * 微信用户登录小程序
   * 获取用户唯一标识 openid
   */
  handleLogin () {
    const self = this;
    Taro.BaaS.login(false).then(res => {
      self.setState({
        openid: res.openid
      });
    }, err => {
      // 登录失败
      console.log('err: ' + err);
    })
  }

  socket(nickName) {
    socket = io('https://www.frontend.wang/', {
      // 实际使用中可以在这里传递参数
      query: {
        room: 'demo',
        // userId: `client_wangxin`,
        userId: `client_${Math.random()}`,
      },
      transports: ['websocket']
    });

    socket.on('connect', () => {
      const id = socket.id;
      console.log('#connect,', id, socket);
      // 监听自身 id 以实现 p2p 通讯
      socket.on(id, msg => {
        console.log('#receive,', msg);
      });
    });

    // 接收在线用户信息
    socket.on('online', msg => {
      console.log('#online,', msg);
    });

    // 系统事件
    socket.on('disconnect', msg => {
      console.log('#disconnect', msg);
    });

    socket.on('disconnecting', () => {
      console.log('#disconnecting');
    });

    socket.on('error', (e) => {
      console.log('#error' + e);
    });

    // 监听其他用户进入聊天室
    socket.on('usercome', (e) => {
      const loginTime = dateFormat.timestamp(e.meta.timestamp)
      const username = e.data.payload.msg;
      this.userLogin(username, loginTime)
    });

    // 监听消息
    socket.on('chat', (e) => {
      const msg = {
        time: dateFormat.timestamp(e.meta.timestamp),
        content: e.data.payload.msg,
        avatar: e.data.payload.avatar,
        openid: e.data.payload.openid
      }
      this.setState({
        msgList: this.state.msgList.concat(msg)
      })
    });

    // 连接socket通知环境内其他用户
    socket.emit('exchange', {
      // client: 'nNx88r1c5WuHf9XuAAAB',
      target: 'login',
      payload: {
        msg : nickName,
      },
    });

  }

  userLogin(name, time) {
    $wuxDialog().alert({
      resetOnClose: true,
      title: time,
      content: name + '进入了房间',
    })
  }

  onScrolltoupper(e) {
    console.log(e)
  }

  onScroll(e) {
    console.log(e)
  }

  /**
   * 发消息
   * @param {*} e 
   */
  handleCommit(e) {
    this.setState({
      content: ''
    })
    socket.emit('exchange', {
      // client: 'nNx88r1c5WuHf9XuAAAB',
      target: 'chat',
      payload: {
        msg : e.target.value,
        avatar: this.state.avatar,
        openid: this.state.openid
      },
    });
  }

  render () {
    const msgList = this.state.msgList;
    const msgListDom = msgList.map((each, index) => {
      return (
        each.openid === this.state.openid
        ?
        <View key={index} className='page-list-item-wrap right'>
          <View className='page-list-item-view-time'>
            <Text>{each.time}</Text>
          </View>
          <View className='page-list-item-view-wrap'>
            <View className='page-list-item-view-text-me' key={index}>
              <Text>{each.content}</Text>
            </View>
            <View className='page-list-item-view-wrap-avatar-me'>
              <Image src={this.state.avatar} data-src={this.state.avatar}></Image>
            </View>
          </View>
        </View>
        :
        <View key={index} className='page-list-item-wrap left'>
          <View className='page-list-item-view-time'>
            <Text>{each.time}</Text>
          </View>
          <View className='page-list-item-view-wrap'>
            <View className='page-list-item-view-wrap-avatar-other'>
              <Image src={this.state.avatar} data-src={this.state.avatar}></Image>
            </View>
            <View className='page-list-item-view-text-other' key={index}>
              <Text>{each.content}</Text>
            </View>
          </View>
        </View>
      )
    })
    return (
      <View className='page'>
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
                value={this.state.content} 
                controlled 
                type='text' 
                confirm-type='发送'
                confirmHold
                // onchange={this.handelChange.bind(this)}
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

export default Index
