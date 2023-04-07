import Taro from '@tarojs/taro'
import React, { Component } from 'react'
import { View } from '@tarojs/components'
import dateFormat from '../../utils/dateFormat';
import './index.scss'
import { AtTimeline } from 'taro-ui';

class Index extends Component {

  constructor (props) {
    super(props)
    this.state = {
      datalist: [],
      pageSize: 50,
      currentPage: 0,
      openId: '',
      currentTab: '0'
    }
    this.changeTab = this.changeTab.bind(this);
  }



  // 对应微信onLoad方法
  UNSAFE_componentWillMount () {
    this.login()
  }

  componentDidMount () {
    this.setState({
      currentTab: '0'
    })
  }

  login () {
    Taro.showNavigationBarLoading();
    Taro.BaaS.login(false).then(res => {
      this.getData(res.openid)
      this.setState({
        openId: res.openid,
      });
    }, err => {
      console.log(err)
      // 登录失败
      Taro.showToast({
        title: '登录失败，未获取到用户信息~',
        icon: 'none',
        duration: 2000
      })
    })
  }

  getData(openId) {
    const id = openId ? openId : this.state.openId;
    let tableID = 58649
    let TableObj = new Taro.BaaS.TableObject(tableID)
    var query = new Taro.BaaS.Query()
    query.compare('userUniformId', '=', id);
    TableObj.setQuery(query).limit(this.state.pageSize).offset(this.state.currentPage).orderBy('-created_at').find().then(res => {
      Taro.hideNavigationBarLoading();
      if (res.statusCode === 200) {
        const data = res.data.objects
        this.setState({
          datalist: data
        })
      }
    }, err => {
      console.log(err)
      Taro.showToast({
        title: '服务错误~',
        icon: 'none',
        duration: 2000
      })
    })
  }

  changeTab(e) {
    const value = e.detail.key;
    this.setState({
      currentTab: value,
    })
    const map = {
      1: "/pages/home/index",
      2: "/pages/chat/index",
      3: "/pages/me/index"
    }
    const url = map[value];
    if (url) {
      Taro.navigateTo({
        url: url
      });
    }
  }

  render () {
    const listItems = this.state.datalist.map((item, index) => {
      const showTime = dateFormat.common(item.created_at)
      return <wux-timeline-item key={index} content={showTime} />
    })
    return (
      <View className='page'>
        <View className='page-timeline'>
        {
          this.state.datalist.length > 0
          ?
          <wux-timeline position='alternate'>
            {listItems}
          </wux-timeline>
          :
          <wux-prompt style='height: 100vh;' visible title='空空如也' text='暂时没有数据' />
        }
        </View>
        <View className='page-tab'>
          <wux-tabbar controlled current={this.state.currentTab} onchange={this.changeTab}>
            <wux-tabbar-item key='tab1' title='时间轴'>
                <wux-icon wux-class='icon' type='ios-alarm' size='22' slot='icon-on' />
                <wux-icon wux-class='icon' type='ios-alarm' size='22' slot='icon-off' />
            </wux-tabbar-item>
            <wux-tabbar-item key='tab2' title='小情绪'>
                <wux-icon wux-class='icon' type='ios-ice-cream' size='22' slot='icon-on' />
                <wux-icon wux-class='icon' type='ios-ice-cream' size='22' slot='icon-off' />
            </wux-tabbar-item>
            <wux-tabbar-item key='tab3' title='聊天室'>
                <wux-icon wux-class='icon' type='ios-aperture' size='22' slot='icon-on' />
                <wux-icon wux-class='icon' type='ios-aperture' size='22' slot='icon-off' />
            </wux-tabbar-item>
            <wux-tabbar-item key='tab4' title='关于我'>
                <wux-icon wux-class='icon' type='ios-person' size='22' slot='icon-on' />
                <wux-icon wux-class='icon' type='ios-person' size='22' slot='icon-off' />
            </wux-tabbar-item>
          </wux-tabbar>
        </View>
      </View>
    )
  }
}

export default Index
