import Taro, { Component } from '@tarojs/taro'
import { View, ScrollView, Text, Textarea, Button, Image } from '@tarojs/components'
import dateFormat from '../../utils/dateFormat';
import './index.scss'

class Home extends Component {

  config = {
    navigationBarTitleText: 'PickMee',
    "usingComponents": {
      "wux-icon": "../../lib/icon/index"
    }
    // enablePullDownRefresh: true
  }

  constructor(props) {
    super(props)
    this.state = {
      posts: [],
      // 输入框内的内容
      content: '',
      // scrollViewHeight: 100,
      // 滑动区域上滑距离
      scrollTop: 0,
      // 光标与键盘的距离，单位 px 
      cursorSpacing: 0,
      // 控制发送按钮，防止重复提交
      // canCommit: false,
      // btnLoading: false,
      // btnText: '+',
      type: '',
      // 图片列表
      imageList: [],
      // 用户唯一标示
      openId: '',
      analysisResult: []
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
    const self = this;
    Taro.BaaS.login(false).then(res => {
      self.setState({
        openId: res.openid
      }, self.handleList(res.openid));
    }, err => {
      // 登录失败
      console.log('err: ' + err);
    })
  }

  /**
   * 查询消息列表
   */
  handleList = (openId) => {
    const self = this;
    // 用户唯一标识
    const id = openId ? openId : self.state.openId;
    let tableID = 58649
    let TableObj = new Taro.BaaS.TableObject(tableID)
    var query = new Taro.BaaS.Query()
    query.compare('userUniformId', '=', id);
    TableObj.setQuery(query).limit(1000).find().then(res => {
      if (res.statusCode === 200) {
        Taro.stopPullDownRefresh();  
        Taro.hideNavigationBarLoading();  
        console.info('下拉数据加载完成.');  
        Taro.showToast({
          title: '叮叮盯盯',
          icon: 'none',
          duration: 2000
        })
        this.setState({
          posts: res.data.objects,
          scrollTop: 1000 * (res.data.objects.length)
        });
        res.data.objects.forEach(element => {
          if (element.type && element.type === 'image') {
            self.state.imageList.push(element.content);
          }
        });
      }
    }, err => {
      console.log('err: ' + err)
    })
  }

  /**
   * 内置监听下拉动作
   */
  onPullDownRefresh () {
    const self = this;
    Taro.showNavigationBarLoading();  
    // 显示 loading 提示框,在 ios 系统下，会导致顶部的加载的三个点看不见  
    // wx.showLoading({  
    //   title: '数据加载中...',  
    // });  
    setTimeout(function() {  
      self.handleList();  
    }, 1000);  
    // Taro.startPullDownRefresh(params).then(res => {
    //   Taro.showToast({
    //     title: '刷新成功',
    //     icon: 'none',
    //     duration: 2000
    //   })
    // }, err => {
    // });
  }

  componentWillReceiveProps (nextProps) {
    console.log('this.props: ' + this.props);
    console.log('nextProps: ' + nextProps);
  }

  componentWillUnmount () { }

  componentDidShow () { }

  componentDidHide () { }
  
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
    // self.setState({
    //   canCommit: false,
    //   btnText: '',
    //   btnLoading: true
    // });
    const params = {
      content: self.state.content,
      type: self.state.type,
      userUniformId: self.state.openId
    }
    let tableID = 58649
    let SinglePost = new Taro.BaaS.TableObject(tableID)
    let postObj = SinglePost.create()
    postObj.set(params).save().then(resp => {
      if (resp.statusCode === 201) {
        Taro.showToast({
          title: '发送成功',
          icon: 'success',
          duration: 2000
        })
        // 清空输入框
        self.setState({
          content: ''
        });
        self.analysis();
        // 重查数据
        self.handleList();
      }
    }, err => {
      console.log('err: ' + err)
    })
  }

  analysis () {
    const self = this;
    let result = '';
    let content = self.state.content;
    // 这里的接口需要在备案域名机器下，并且配置app开发
    Taro.request({
      url: 'http://101.132.174.1:8082/analysis/',
      method: 'POST',
      data: {
        sentence: self.state.content,
      },
      header: {
        'content-type': 'application/json'
      }
    }).then(res => {
      console.log('res: ' + JSON.stringify(res))
      console.log('res.data.data: ' + JSON.stringify(res.data.data))
      res.data.data.forEach(element => {
        result += (element + ' ')
      });
      if (res && +res.code === 200) {
        self.setState({
          analysisResult: res.data.data
        })
      }
      Taro.showModal({
        title: '情绪评估',
        content: '我们对于内容【' + content + '】的评估结果是： ' + result,
        confirmText: '对的！',
        cancelText: '不对~',
        success(successRes) {
          if (successRes.confirm) {
            Taro.showToast({
              title: '你点击了对的！',
              icon: 'success',
              duration: 2000
            })
          } else if (successRes.cancel) {
            Taro.showToast({
              title: '你点击了不对~',
              icon: 'success',
              duration: 2000
            })
          }
        }
      })
    }, err => {
      console.log('analysis error: ' + err)
      // 收集错误的事件
      Taro.BaaS.ErrorTracker.track(err)
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
        // canCommit: true
      });
    }
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

  /**
   * 监听输入法确定动作
   */
  handleConfirm = (e) => {
    this.handleCommit();
  }

  /**
   * 发送图片
   */
  uploadImage = () => {
    const self = this;
    Taro.chooseImage({
      success: function(res) {
        if (res) {
          let MyFile = new Taro.BaaS.File()
          let fileParams = {filePath: res.tempFilePaths[0]}
          let metaData = {categoryName: 'SDK'}
          MyFile.upload(fileParams, metaData).then(uploadRes => {
            /*
            * 注: 只要是服务器有响应的情况都会进入 success, 即便是 4xx，5xx 都会进入这里
            * 如果上传成功则会返回资源远程地址,如果上传失败则会返回失败信息
            */
            let data = uploadRes.data  // res.data 为 Object 类型
            const imagePath = data.path
            // 上传图片到资源库后，发送一条消息
            self.sendImageMessage(imagePath);
          }, err => {
            console.log('upload err: ' + err);
          })
        }
      }
    })
  }

  sendImageMessage (imagePath) {
    const self = this;
    const params = {
      content: imagePath,
      type: 'image',
      userUniformId: self.state.openId
    }
    let tableID = 58649
    let SinglePost = new Taro.BaaS.TableObject(tableID)
    let postObj = SinglePost.create()
    postObj.set(params).save().then(resp => {
      if (resp.statusCode === 201) {
        Taro.showToast({
          title: '发送成功',
          icon: 'success',
          duration: 2000
        })
        self.handleList();
      }
    }, err => {
      console.log('send image message err: ' + err)
    })
  }

  /**
   * 点击图片放大查看
   */
  previewImage = (e) => {
    const self = this;
    Taro.previewImage({
      current: e.currentTarget.dataset.src, // 当前显示图片的http链接
      urls: self.state.imageList // 需要预览的图片http链接列表
    })
  }

  render () {
    const postList = this.state.posts.map((item, index) => {
      const showTime = dateFormat.common(item.created_at)
      return (
        item.type === 'image'
        ?
        <View className='home-list-item-wrap'>
          <View className='home-list-item-view-time'>
            <Text>{showTime}</Text>
          </View>
          <View className='home-list-item-view home-list-item-view-image' key={index}>
            <Image 
              onClick={this.previewImage}
              // 宽度不变，高度自动变化，保持原图宽高比不变
              mode='widthFix' 
              data-src={item.content}
              src={item.content}
            ></Image>
          </View>
        </View>
        :
        <View className='home-list-item-wrap'>
          <View className='home-list-item-view-time'>
            <Text>{showTime}</Text>
          </View>
          <View className='home-list-item-view' key={index}>
            <Text className='home-list-item-view-text'>{item.content}</Text>
          </View>
        </View>
      )
    });
    return (
      <View className='home'>
        {
          this.state.posts.length < 1
          ?
          <View className='home-empty'>
            <Text>在奋力加载内容哦~ n(*≧▽≦*)n</Text>
          </View>
          :
          <ScrollView
            className='home-scrollview'
            scrollY
            scrollWithAnimation
            scrollTop={this.state.scrollTop}
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
              // onConfirm={this.handleConfirm.bind(this)}
              // onBlur={this.handleConfirm.bind(this)}
              type='text' 
              cursorSpacing={this.state.cursorSpacing}
              value={this.state.content}
              adjustPosition='true'
              // placeholder='在这里输入内容吧' 
              auto-Height='true'
            />
          </View>
          <View onClick={this.uploadImage} className='home-input-btn'>
            <wux-icon size='28' color='#999999' type='md-images' />
          </View>
          <View onClick={this.handleConfirm.bind(this)} className='home-input-btn'>
            <wux-icon size='28' color='#999999' type='md-paper-plane' />
          </View>
        </View>
      </View>
    )
  }
}

export default Home
