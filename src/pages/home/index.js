import Taro, { Component } from '@tarojs/taro'
import { View, Input, ScrollView, Text, Icon, Textarea } from '@tarojs/components'
// import { AtToast, AtLoadMore } from "taro-ui"

import './index.scss'

class Home extends Component {

  config = {
    navigationBarTitleText: 'PickMee'
  }

  constructor(props) {
    super(props)
    this.state = {
      posts: [],
      content: '',
      scrollViewHeight: 100,
      scrollTop: 0,
      cursorSpacing: 0,
    }
  }

  componentDidMount () {
    this.handleList();
  }

  componentWillReceiveProps (nextProps) {
    console.log(this.props, nextProps)
  }

  componentWillUnmount () { }

  componentDidShow () { }

  componentDidHide () { }

  handleList = () => {
    const self = this;
    // var query = Taro.createSelectorQuery()
    // let inputHeight;
    // query.select('#home-input')
    // query.exec(function(res){
    //   inputHeight = res[0].height       // #the-id节点的上边界坐标
    // })
    Taro.getSystemInfo({
      success (res) {
        console.log(res.windowHeight)
        self.setState({
          scrollViewHeight: res.windowHeight - 100
        })
      }
    });
    let tableID = 58649
    let TableObj = new Taro.BaaS.TableObject(tableID)
    var query = new Taro.BaaS.Query()
    TableObj.setQuery(query).limit(1000).find().then(res => {
      if (res.statusCode === 200) {
        this.setState({
          posts: res.data.objects,
          scrollTop: 1000 * (res.data.objects.length)
        });
      }
    }, err => {
      // err
      console.log(err)
    })
  }

  handleCommit = () => {
    const self = this;
    let canCommit;
    if (canCommit !== undefined && !canCommit) {
      Taro.showToast({
        title: '要等上一条消息发送完才能发送下一条哦',
        icon: 'none',
        duration: 2000
      })
      return
    }
    canCommit = false 
    if (!this.state.content) {
      Taro.showToast({
        title: '要输入内容才能发送哦',
        icon: 'none',
        duration: 2000
      })
      return
    }
    Taro.getSetting({
      success: function(res){
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称
          Taro.getUserInfo({
            success: function(userRes) {
              var userInfo = userRes.userInfo
              var gender = userInfo.gender //性别 0：未知、1：男、2：女
              const nickname = userInfo.nickName;
              if (gender === 2 || nickname === '王艺谋') {
                const params = {
                  content: self.state.content
                }
                let tableID = 58649
                let SinglePost = new Taro.BaaS.TableObject(tableID)
                let postObj = SinglePost.create()
                postObj.set(params).save().then(resp => {
                  if (resp) {
                    canCommit = true
                  }
                  if (resp.statusCode === 201) {
                    Taro.showToast({
                      title: '发送成功',
                      icon: 'success',
                      duration: 2000
                    })
                    self.setState({
                      content: ''
                    });
                    self.handleList();
                  }
                }, err => {
                  canCommit = true
                  console.log(err)
                })
              } else {
                Taro.showToast({
                  title: '你不是星星不能发送哦',
                  icon: 'none',
                  duration: 2000
                })
                return
              }
            }
          })
        }
      }
    })
  }

  handelChange = (e) => {
    this.setState({
      content: e.target.value
    });
  }

  handleClickMore = (e) => {
    console.log('click handle more: ' + e);
  }

  onScrolltoupper = (e) => {
    console.log('滚动到顶部发生onScrolltoupper')
    console.log('scrollHeight: ' + e.target.scrollHeight)
    console.log('scrollTop: ' + e.target.scrollTop)
  }

  onScroll = (e) => {
    console.log('onScroll')
    console.log('scrollHeight: ' + e.target.scrollHeight)
    console.log('scrollTop: ' + e.target.scrollTop)
  }

  handleFocus = (e) => {
  }

  handleBlur = (e) => {

  }

  render () {
    const postList = this.state.posts.map((item, index) => {
      return (
        <View className='home-list-item-view' key={index}>
          <Text className='home-list-item-view-text'>{item.content}</Text>
        </View>
      )
    });
    return (
      <View className='home'>
        {
          this.state.posts.length < 1
          ?
          <View className='home-empty'>
            <Text>还没有内容哦，快去写些吧!</Text>
          </View>
          :
          <ScrollView
            className='home-scrollview'
            scrollY
            scrollWithAnimation
            scrollTop={this.state.scrollTop}
            style={`height: ${this.state.scrollViewHeight}px;`}
            lowerThreshold='20'
            upperThreshold='20'
            onScrolltoupper={this.onScrolltoupper}
            onScroll={this.onScroll}
          >
            { postList }
          </ScrollView>
        }
        <View id='home-input' className='home-input'>
          <View className='home-input-wrap'>
            <Textarea className='home-input-content' 
              onInput={this.handelChange.bind(this)} 
              onFocus={this.handleFocus.bind(this)}
              onBlur={this.handleBlur.bind(this)}
              type='text' 
              cursor-spacing={this.state.cursorSpacing}
              value={this.state.content}
              placeholder='在这里输入内容吧' 
              auto-Height='true'
            />
          </View>
          <View onClick={this.handleCommit} className='home-input-icon-part'>
            <Icon className='home-input-icon' type='success' color='lavenderblush' />
          </View>
        </View>
      </View>
    )
  }
}

export default Home
