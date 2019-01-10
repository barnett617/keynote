import Taro, { Component } from '@tarojs/taro'
import { View, Textarea, Button } from '@tarojs/components'
import './index.scss'

class Home extends Component {

  config = {
    navigationBarTitleText: 'PickMee',
  }

  constructor(props) {
    super(props)
    this.state = {
      // 输入框内的内容
      content: '',
      // 光标与键盘的距离，单位 px 
      cursorSpacing: 0,
      // 用户唯一标示
      openId: '',
    }
  }

  componentDidMount () {
    this.handleLogin();
  }

  /**
   * 微信用户登录小程序
   * 获取用户唯一标识 openid
   */
  handleLogin () {
    Taro.BaaS.login(false).then(res => {
      this.setState({
        openId: res.openid
      });
    }, err => {
      // 登录失败
      console.log('err: ' + err);
    })
  }
  
  handleCommit = () => {
    const self = this;
    if (!this.state.content) {
      Taro.showToast({
        title: '要输入内容才能发送哦',
        icon: 'none',
        duration: 2000
      })
      return
    }
    const params = {
      content: self.state.content,
      type: this.state.type,
      userUniformId: this.state.openId
    }
    let tableID = 58649
    let SinglePost = new Taro.BaaS.TableObject(tableID)
    let postObj = SinglePost.create()
    Taro.showLoading({
      title: '发送中',
    })
    postObj.set(params).save().then(resp => {
      if (resp.statusCode === 201) {
        Taro.hideLoading()
        Taro.showToast({
          title: '发送成功',
          icon: 'success',
          duration: 2000
        })
        // 清空输入框
        self.setState({
          content: ''
        });
        setTimeout(function () {
          Taro.navigateTo({
            url: '/pages/home/index'
          })
        }, 2000);
      }
    }, err => {
      console.log('err: ' + err)
    })
  }

  /**
   * 监听输入框输入
   */
  handelChange = (e) => {
    if (e.target.value) {
      this.setState({
        content: e.target.value,
        type: 'text',
      });
    }
  }

  /**
   * 监听输入法确定动作
   */
  handleConfirm = (e) => {
    console.log(e)
    this.handleCommit();
  }

  handleClear () {
    this.setState({
      content: ''
    });
  }

  render () {
    return (
      <View className='long-input'>
        <View>长篇大论写在这里吧~</View>
        <Textarea className='long-input-textarea' 
          onInput={this.handelChange.bind(this)} 
          type='text' 
          cursorSpacing={this.state.cursorSpacing}
          value={this.state.content}
          adjustPosition='true'
          auto-Height='true'
          maxlength='-1'
        />
        <View className='long-input-btn'>
          <View>
            <Button onClick={this.handleConfirm.bind(this)}>发送</Button>
          </View>
          <View>
            <Button onClick={this.handleClear.bind(this)}>重写</Button>
          </View>
        </View>
      </View>
    )
  }
}

export default Home
