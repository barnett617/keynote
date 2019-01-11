import Taro, { Component } from '@tarojs/taro'
import { View } from '@tarojs/components'
import dateFormat from '../../utils/dateFormat';
import './index.scss'

class Index extends Component {
  constructor (props) {
    super(props)
    this.state = {
      datalist: [],
      pageSize: 50,
      currentPage: 0,
      openId: '',
      currentTab: 'tab1'
    }
    this.env = process.env.TARO_ENV
  }
  config = {
    navigationBarTitleText: '时间轴',
    "usingComponents": {
      "wux-cell-group": "../../lib/cell-group/index",
      "wux-cell": "../../lib/cell/index",
      "wux-icon": "../../lib/icon/index",
      "wux-timeline": "../../lib/timeline/index",
      "wux-timeline-item": "../../lib/timeline-item/index",
      // tab
      'wux-icon': '../../lib/icon/index',
      'wux-badge': '../../lib/badge/index',
      'wux-tabbar': '../../lib/tabbar/index',
      'wux-tabbar-item': '../../lib/tabbar-item/index',
      "wux-prompt": "../../lib/prompt/index"
    },
  }

  // 对应微信onLoad方法
  componentWillMount () {
    this.login()
  }

  componentDidMount () {
    this.setState({
      currentTab: 'tab1'
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
    this.setState({
      currentTab: e.detail.key,
    })
    if (e.target.key === 'tab2') {
      Taro.navigateTo({
        url: '/pages/home/index'
      })
    } else if (e.target.key === 'tab3') {
      Taro.navigateTo({
        url: '/pages/chat/index'
      })
    } else if (e.target.key === 'tab4') {
      Taro.navigateTo({
        url: '/pages/me/index'
      })
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
          <wux-tabbar controlled current={this.state.currentTab} onchange={this.changeTab.bind(this)}>
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
