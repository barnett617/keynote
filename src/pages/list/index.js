import Taro, { Component } from '@tarojs/taro'
import { View, Image, Button } from '@tarojs/components'
import './index.scss'

class Index extends Component {
  constructor (props) {
    super(props)
    this.state = {
      datalist: []
    }
    this.env = process.env.TARO_ENV
  }
  config = {
    navigationBarTitleText: '',
    "usingComponents": {
      "wux-cell-group": "../../lib/cell-group/index",
      "wux-cell": "../../lib/cell/index"
    },
  }

  // 对应微信onLoad方法
  componentWillMount () {
    this.login()
  }

  componentDidMount () {
    this.getData()
  }

  componentWillReceiveProps (nextProps) {
    console.log('this.props: ' + this.props);
    console.log('nextProps: ' + nextProps);
  }

  componentWillUnmount () { }

  componentDidShow () { }

  componentDidHide () { }

  login () {
    Taro.showNavigationBarLoading();  
    Taro.BaaS.login(false).then(res => {
      this.getData(res.openid)
      this.setState({
        openId: res.openid,
      });
    }, err => {
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
      }
    }, err => {
      Taro.showToast({
        title: '服务错误~',
        icon: 'none',
        duration: 2000
      })
    })
  }

  render () {
    const listItems = this.state.datalist.map((each) => {
      return <wux-cell title={each.datetime} is-link></wux-cell>
    })
    return (
      <View className='page'>
         {listItems}
      </View>
    )
  }
}

export default Index
