import Taro, { Component } from '@tarojs/taro'
import { View, Image, Text } from '@tarojs/components'
import './index.scss'

const langEnum = {
  "zh_CN": '中文',
  "zh_TW": '繁体',
  "en": '英文'
}

class Index extends Component {

  config = {
    navigationBarTitleText: '',
    "usingComponents": {
      "wux-cell-group": "../../lib/cell-group/index",
      "wux-cell": "../../lib/cell/index"
    }
  }

  constructor(props) {
    super(props)
    this.state = {
      userinfo: null
    }
  }

  componentWillMount () {
    const userinfo = Taro.getStorageSync('userinfo');
    this.setState({
      userinfo: userinfo
    });
  }

  componentDidMount () {
    this.handleLogin();
  }

  /**
   * 微信用户登录小程序
   * 获取用户唯一标识 openid
   */
  handleLogin () {
    const self = this;
    Taro.BaaS.login(false).then(res => {
      self.setState({
        openId: res.openid
      });
    }, err => {
      // 登录失败
      console.log('err: ' + err);
    })
  }

  onGotUserInfo(e) {
  }

  onGotOpenSetting(e) {
  }

  componentWillReceiveProps (nextProps) {
    console.log('this.props: ' + this.props);
    console.log('nextProps: ' + nextProps);
  }

  showLoad() {
    Taro.showNavigationBarLoading();
  }

  hideLoad() {
    Taro.hideNavigationBarLoading();
  }

  ajax() {
    this.showLoad();
    Taro.request({
      url: 'https://www.frontend.wang/search',
      method: 'GET',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      }
    }).then(res => {
      console.log(res)
      this.hideLoad()
    }, err => {
      console.log(err)
      this.hideLoad()
    })
  }

  click() {
    this.ajax()
  }

  render () {
    return (
      <View className='page'>
        <View className='page-main'>
          <View className='page-main-head'>
            <View className='page-main-head-image'>
              <Image src={this.state.userinfo.avatarUrl} data-src={this.state.userinfo.avatarUrl}></Image>
            </View>
            <View>
              <Text>{this.state.userinfo.nickName ? this.state.userinfo.nickName : ''}</Text>
            </View>
          </View>
          <View className='page-main-list'>
            <wux-cell-group label='本内容根据微信获取，如有不准请见谅'>
              <wux-cell title='我的性别' extra={this.state.userinfo.gender === 1 ? '男' : '女'}></wux-cell>
              <wux-cell title='所在国家' extra={this.state.userinfo.country ? this.state.userinfo.country : ''}></wux-cell>
              <wux-cell title='所在省' extra={this.state.userinfo.province ? this.state.userinfo.province : ''}></wux-cell>
              <wux-cell title='我的城市' extra={this.state.userinfo.city ? this.state.userinfo.city : ''}></wux-cell>
              <wux-cell title='使用语言' extra={langEnum[this.state.userinfo.language]}></wux-cell>
              <wux-cell title='授权设置' is-link open-type='openSetting' ongetopensetting={this.onGotOpenSetting.bind(this)}></wux-cell>
              <wux-cell title='调用接口' is-link onclick={this.click.bind(this)}></wux-cell>
            </wux-cell-group>
          </View>
        </View>
      </View>
    )
  }
}

export default Index
