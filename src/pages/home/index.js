import Taro, { Component } from '@tarojs/taro'
import { View, ScrollView, Text, Textarea, Image, OpenData } from '@tarojs/components'
import dateFormat from '../../utils/dateFormat';
import './index.scss'
import '../../lib/styles/index.wxss';

class Home extends Component {

  config = {
    navigationBarTitleText: 'PickMee',
    'usingComponents': {
      'wux-icon': '../../lib/icon/index',
      'wux-notice-bar': '../../lib/notice-bar/index',
      'wux-spin': '../../lib/spin/index',
      'wux-button': '../../lib/button/index',
      'wux-card': '../../lib/card/index',
      'wux-wing-blank': '../../lib/wing-blank/index',
      // tab
      'wux-icon': '../../lib/icon/index',
      'wux-badge': '../../lib/badge/index',
      'wux-tabbar': '../../lib/tabbar/index',
      'wux-tabbar-item': '../../lib/tabbar-item/index',
    }
  }

  constructor(props) {
    super(props)
    this.state = {
      posts: [],
      content: '',
      // 滑动区域上滑距离
      scrollTop: 0,
      type: '',
      // 图片列表
      imageList: [],
      // 用户唯一标示
      openId: '',
      // 情绪分析结果
      analysisResult: [],
      // 更新通告
      notice: '',
      modal: 'hide',
      shadow: 'hide',
      currentTab: 'tab1',
      currentPage: 0,
      pageSize: 20,
    }
  }

  componentWillMount () {
    this.handleLogin();
  }

  componentDidMount () {
    
  }

  /**
   * 微信用户登录小程序
   * 获取用户唯一标识 openid
   */
  handleLogin () {
    const self = this;
    Taro.showNavigationBarLoading();  
    Taro.BaaS.login(false).then(res => {
      this.handleList(res.openid)
      self.setState({
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

  /**
   * 查询消息列表
   */
  handleList = (openId) => {
    // 用户唯一标识
    const id = openId ? openId : this.state.openId;
    let tableID = 58649
    let TableObj = new Taro.BaaS.TableObject(tableID)
    var query = new Taro.BaaS.Query()
    query.compare('userUniformId', '=', id);
    
    TableObj.setQuery(query).limit(this.state.pageSize).offset(this.state.currentPage).orderBy('-created_at').find().then(res => {
      Taro.hideNavigationBarLoading();  
      if (res.statusCode === 200) {
        const data = res.data.objects
        // 查询的最后十条倒序排正
        let arr = new Array(data.length)
        for (let i = 0; i < data.length; i++) {
          arr[data.length - 1 - i] = data[i]
        }
        this.setState({
          posts: arr.concat(this.state.posts),
          scrollTop: 1000 * (res.data.objects.length),
          currentPage: res.data.meta.offset + this.state.pageSize,
        });
        // 初始化预览图片列表
        res.data.objects.forEach(element => {
          if (element.type && element.type === 'image') {
            this.state.imageList.push(element.content);
          }
        });
      }
    }, err => {
      Taro.showToast({
        title: '服务错误~',
        icon: 'none',
        duration: 2000
      })
    })
  }

  /**
   * 内置监听下拉动作
   */
  onPullDownRefresh () {
    const self = this;
    console.log('下拉触发')
    Taro.showNavigationBarLoading();  
    // 显示 loading 提示框,在 ios 系统下，会导致顶部的加载的三个点看不见  
    setTimeout(function() {  
      self.handleList();  
    }, 1000);  
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
    const params = {
      content: self.state.content,
      type: this.state.type,
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
          content: '',
          currentPage: 1,
          posts: this.state.posts.concat(resp.data),
          scrollTop: 1000 * (this.state.posts.length + 1),
        });
        // self.handleList();
        self.analysis();
        // 重查数据
      }
    }, err => {
      Taro.showToast({
        title: '发送失败',
        icon: 'none',
        duration: 2000
      })
    })
  }

  /**
   * 情绪分析
   */
  analysis () {
    const self = this;
    let result = '';
    let content = self.state.content;
    // 这里的接口需要在备案域名机器下，并且配置app开发
    Taro.showLoading({
      title: '情绪分析中',
    })
    Taro.request({
      url: 'https://www.frontend.wang',
      // url: 'http://101.132.174.1:8082/analysis/',
      method: 'POST',
      data: {
        'content': self.state.content,
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      }
    }).then(res => {
      Taro.hideLoading()
      const data = res.data.package.data;
      data.forEach(element => {
        result += (element + ' ')
      });
      if (res && +res.data.status === 200) {
        self.setState({
          analysisResult: data
        })
      }
      Taro.showModal({
        title: '情绪评估',
        content: '我们对于内容【' + content + '】的评估结果是： \n' + result,
        confirmText: '对的！',
        cancelText: '不对~',
        success(successRes) {
          // if (successRes.confirm) {
          //   Taro.showToast({
          //     title: '你点击了对的！',
          //     icon: 'success',
          //     duration: 2000
          //   })
          // } else if (successRes.cancel) {
          //   Taro.showToast({
          //     title: '你点击了不对~',
          //     icon: 'success',
          //     duration: 2000
          //   })
          // }
        }
      })
    }, err => {
      Taro.hideLoading()
      Taro.showToast({
        title: '分析系统坏掉了哦~',
        icon: 'none',
        duration: 2000
      })
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
      });
    }
  }

  onScrolltoupper = (e) => {
    console.log('滚动到顶部发生onScrolltoupper')
    Taro.showNavigationBarLoading();  
    this.handleList();  
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
      success: (res) => {
        if (res) {
          let MyFile = new Taro.BaaS.File()
          let fileParams = {filePath: res.tempFilePaths[0]}
          let metaData = {categoryName: 'SDK'}
          Taro.showToast({
            title: '上传中',
            icon: 'loading',
            duration: 10000
          })
          MyFile.upload(fileParams, metaData).then(uploadRes => {
            // Taro.hideLoading()
            Taro.hideToast();
            /*
            * 注: 只要是服务器有响应的情况都会进入 success, 即便是 4xx，5xx 都会进入这里
            * 如果上传成功则会返回资源远程地址,如果上传失败则会返回失败信息
            */
            let data = uploadRes.data  // res.data 为 Object 类型
            const imagePath = data.path
            debugger
            this.state.imageList.push(imagePath);
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
    Taro.showLoading({
      title: '发送中',
    })
    postObj.set(params).save().then(resp => {
      Taro.hideLoading()
      if (resp.statusCode === 201) {
        Taro.showToast({
          title: '发送成功',
          icon: 'success',
          duration: 2000
        })
        self.setState({
          currentPage: 1,
          posts: this.state.posts.concat(resp.data),
          scrollTop: 1500 * (this.state.posts.length + 1),
          // todo 图片预览列表
        })
      }
    }, err => {
      Taro.hideLoading()
      Taro.showToast({
        title: '网络连接失败',
        icon: 'none',
        duration: 2000
      })
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

  showNotice () {
    this.setState({
      modal: 'modal',
      shadow: 'shadow'
    })
  }

  hideModal () {
    this.setState({
      modal: 'hide',
      shadow: 'hide'
    })
  }

  changeTab(e) {
    this.setState({
      currentTab: e.detail.key,
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
          <View className='home-list-item-view-wrap' key={index}>
            <View className='home-list-item-view-wrap-avatar'>
              <OpenData type='userAvatarUrl' />
            </View>
            <View className='home-list-item-view-image' key={index}>
              <Image 
                onClick={this.previewImage}
                // 宽度不变，高度自动变化，保持原图宽高比不变
                mode='widthFix' 
                data-src={item.content}
                src={item.content}
              ></Image>
            </View>
          </View>
        </View>
        :
        <View className='home-list-item-wrap'>
          <View className='home-list-item-view-time'>
            <Text>{showTime}</Text>
          </View>
          <View className='home-list-item-view-wrap'>
            <View className='home-list-item-view-wrap-avatar'>
              <OpenData type='userAvatarUrl' />
            </View>
            <View className='home-list-item-view-text' key={index}>
              <Text>{item.content}</Text>
            </View>
          </View>
        </View>
      )
    });
    return (
        <View className='home'>
          <View className={this.state.notice} onClick={this.showNotice}>
            <wux-notice-bar
              content='有新功能更新哦~，点击查看'
              mode='closable'
            >
            </wux-notice-bar>
          </View>
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
          <View id='home-input' className='home-input'>
              <View onClick={this.uploadImage} className='home-input-btn-image'>
                <wux-icon size='28' color='#999999' type='md-images' />
              </View>
              <View>
                <Textarea className='home-input-content' 
                  onInput={this.handelChange.bind(this)} 
                  type='text' 
                  // onFocus={this.handleFocus}
                  cursorSpacing='9'
                  value={this.state.content}
                />
              </View>
              <View onClick={this.handleConfirm.bind(this)} className='home-input-btn-send'>
                <wux-icon size='28' color='#999999' type='md-paper-plane' />
              </View>
          </View>
          <View className={this.state.shadow}>
          </View>
          <View className={this.state.modal}>
            <View className='modal-title'>
              更新公告【版本1.3.4】
            </View>
            <View className='modal-content'>
              <View className='modal-content-text'>
                【修复】发送后不更新列表
                【修复】情绪分析
              </View>
            </View>
            <View onClick={this.hideModal} className='modal-btn'>
              好的
            </View>
          </View>
          {/* <wux-tabbar controlled current={this.state.currentTab} onchange={this.changeTab.bind(this)}>
            <wux-tabbar-item key='tab1' title='情绪'>
                <wux-icon wux-class='icon' type='ios-home' size='22' slot='icon-on' />
                <wux-icon wux-class='icon' type='ios-home' size='22' slot='icon-off' />
            </wux-tabbar-item>
            <wux-tabbar-item key='tab2' title='长篇'>
                <wux-icon wux-class='icon' type='ios-home' size='22' slot='icon-on' />
                <wux-icon wux-class='icon' type='ios-home' size='22' slot='icon-off' />
            </wux-tabbar-item>
            <wux-tabbar-item key='tab3' title='关于'>
                <wux-icon wux-class='icon' type='ios-home' size='22' slot='icon-on' />
                <wux-icon wux-class='icon' type='ios-home' size='22' slot='icon-off' />
            </wux-tabbar-item>
          </wux-tabbar> */}
        </View>
    )
  }
}

export default Home
