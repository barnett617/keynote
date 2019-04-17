import Taro, { Component } from '@tarojs/taro'
import { View, ScrollView, Text, Image, OpenData, Video, Textarea } from '@tarojs/components'
import dateFormat from '../../utils/dateFormat';
import './index.scss'
import '../../lib/styles/index.wxss';
import camera from '../../assets/images/_ionicons_svg_md-camera.svg';
import mic from '../../assets/images/_ionicons_svg_ios-mic.svg';
import pic from '../../assets/images/_ionicons_svg_md-images.svg';
import edit from '../../assets/images/_ionicons_svg_ios-create.svg';
import film from '../../assets/images/_ionicons_svg_ios-film.svg';
import { $wuxDialog } from '../../lib/index'

let recorderManager;

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
      //
      'wux-fab-button': '../../lib/fab-button/index',
      // input
      'wux-cell-group': '../../lib/cell-group/index',
      'wux-cell': '../../lib/cell/index',
      'wux-input': '../../lib/input/index',
      // popup
      'wux-button': '../../lib/button/index',
      'wux-popup': '../../lib/popup/index',
      // grid
      'wux-icon': '../../lib/icon/index',
      'wux-grids': '../../lib/grids/index',
      'wux-grid': '../../lib/grid/index',
      'wux-search-bar': '../../lib/search-bar/index',
      "wux-prompt": "../../lib/prompt/index",
      "wux-dialog": "../../lib/dialog/index",
      "wux-textarea": "../../lib/textarea/index"
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
      modal: 'hide',
      showMultiText: 'hide',
      shadow: 'hide',
      currentPage: 0,
      pageSize: 20,
      // 浮动按钮
      types: ['topLeft', 'topRight', 'bottomLeft', 'bottomRight', 'center'],
      typeIndex: 3,
      colors: [ '#1AAD19', 'light', 'stable', 'positive', 'calm', 'balanced', 'energized', 'assertive', 'royal', 'dark'],
      colorIndex: 1,
      dirs: ['horizontal', 'vertical', 'circle'],
      dirIndex: 1,
      sAngle: 0,
      eAngle: 360,
      spaceBetween: 10,
      popupShow: false,
      searchValue: '',
      showSearch: 'hide',
      scrollSearch: true,
      // 光标与键盘的距离，单位 px 
      cursorSpacing: 80,
      textareaRows: 3,
    }
  }

  componentWillMount () {
    this.handleLogin();
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
      console.log(err)
      Taro.showToast({
        title: '登录失败，未获取到用户信息~',
        icon: 'none',
        duration: 2000
      })
    })
  }

  showLoad() {
    Taro.showNavigationBarLoading();
  }

  hideLoad() {
    Taro.hideNavigationBarLoading();
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
    this.showLoad()
    TableObj.setQuery(query).limit(this.state.pageSize).offset(this.state.currentPage).orderBy('-created_at').find().then(res => {
      this.hideLoad() 
      if (res.statusCode === 200) {
        const data = res.data.objects
        // 查询的最后十条倒序排正
        let arr = new Array(data.length)
        for (let i = 0; i < data.length; i++) {
          arr[data.length - 1 - i] = data[i]
        }
        this.setState({
          posts: arr.concat(this.state.posts),
          scrollTop: 2000 * (res.data.objects.length),
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
      console.log(err)
      Taro.showToast({
        title: '服务错误~',
        icon: 'none',
        duration: 2000
      })
    })
  }
  
  /**
   * 提交输入文本
   */
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
    this.showLoad()
    postObj.set(params).save().then(resp => {
      if (resp.statusCode === 201) {
        this.hideLoad()
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
      console.log(err)
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
    Taro.showNavigationBarLoading();
    // 这里的接口需要在备案域名机器下，并且配置app开发
    Taro.request({
      url: 'https://www.trigolds.com',
      // url: 'https://www.frontend.wang',
      // url: 'http://101.132.174.1:8082/analysis/',
      method: 'POST',
      data: {
        'content': self.state.content,
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      }
    }).then(res => {
      this.hideLoad()
      const data = res.data.package.data;
      data.forEach(element => {
        result += (element + ' ')
      });
      Taro.showModal({
        title: '情绪评估',
        content: '我们对于内容【' + content + '】的评估结果是： \n' + result,
        confirmText: '对的！',
        cancelText: '不对~',
      })
    }, err => {
      console.log(err)
      this.hideLoad()
      Taro.showToast({
        title: '分析系统坏掉了哦~',
        icon: 'none',
        duration: 2000
      })
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
   * 滚动到顶部发生
   */
  onScrolltoupper = (e) => {
    console.log(e)
    if (this.state.scrollSearch) {
      Taro.showNavigationBarLoading();  
      this.handleList();  
    }
  }

  /**
   * 滑动监听
   */
  onScroll = (e) => {
    console.log(e)
    // 上滑隐藏搜索框
    // if (e.target.deltaY < 0) {
    //   this.setState({
    //     showSearch: 'hide'
    //   })
    // } else {
    //   this.setState({
    //     showSearch: ''
    //   })
    // }
  }

  /**
   * 发送图片
   */
  uploadImage = (type) => {
    const self = this;
    this.setState({
      showMultiText: 'hide'
    })
    let sourceType = []
    if (type === 'image') {
      sourceType.push('album')
    } else if (type === 'camera') {
      sourceType.push('camera')
    }
    Taro.chooseImage({
      sourceType: sourceType,
      success: (res) => {
        this.closePop()
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

  /**
   * 发送图片消息
   * @param {*} imagePath 图片路径
   */
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
    this.showLoad()
    postObj.set(params).save().then(resp => {
      this.hideLoad()
      if (resp.statusCode === 201) {
        self.setState({
          currentPage: 1,
          posts: this.state.posts.concat(resp.data),
          scrollTop: 1500 * (this.state.posts.length + 1),
          // todo 图片预览列表
        })
      }
    }, err => {
      console.log(err)
      this.hideLoad()
      Taro.showToast({
        title: '网络连接失败',
        icon: 'none',
        duration: 2000
      })
    })
  }

  sendRecordMessage(path) {
    const self = this;
    const params = {
      content: path,
      type: 'audio',
      userUniformId: self.state.openId
    }
    let tableID = 58649
    let SinglePost = new Taro.BaaS.TableObject(tableID)
    let postObj = SinglePost.create()
    this.showLoad()
    postObj.set(params).save().then(resp => {
      this.hideLoad()
      if (resp.statusCode === 201) {
        self.setState({
          currentPage: 1,
          posts: this.state.posts.concat(resp.data),
          scrollTop: 1500 * (this.state.posts.length + 1),
          // todo 图片预览列表
        })
      }
    }, err => {
      console.log(err)
      this.hideLoad()
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

  hideNotice () {
    this.setState({
      modal: 'hide',
      shadow: 'hide'
    })
  }

  // 浮动按钮
  changeFab(e) {
    console.log(e)
  }

  clickFab(e) {
    if (e.target.index === 1) {
      this.showNotice()
    } else if (e.target.index === 2) {
      this.showSearch()
    }
  }

  contactFab(e) {
    console.log('onContact', e)
  }

  onGotUserInfo(e) {
    console.log('onGotUserInfo', e)
  }

  showPopup() {
    this.setState({
      popupShow: true,
    })
  }

  closePop() {
    this.setState({
      popupShow: false,
      showMultiText: 'hide'
    })
  }

  searchChange(e) {
    console.log(e)
  }

  searchFocus(e) {
    console.log(e)
  }

  searchBlue(e) {
    console.log(e)
  }

  searchConfirm(e) {
    const id = this.state.openId;
    let tableID = 58649
    let TableObj = new Taro.BaaS.TableObject(tableID)
    var query = new Taro.BaaS.Query()
    query.compare('userUniformId', '=', id);
    query.contains('content', e.target.value);
    this.showLoad()
    TableObj.setQuery(query).find().then(res => {
      this.hideLoad()
      if (res.statusCode === 200) {
        const data = res.data.objects
        this.setState({
          posts: data,
          scrollTop: 2000 * (data.length),
          scrollSearch: false
        });
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

  searchClear(e) {
    console.log(e)
  }

  searchCancel(e) {
    console.log(e)
    this.setState({
      showSearch: 'hide'
    })
    this.handleList();
    // this.setState({
    //   scrollSearch: true
    // })
  }

  stopRecord() {
    Taro.hideToast()
    recorderManager.stop()
  }

  startRecord() {
    this.setState({
      showMultiText: 'hide'
    })
    Taro.showToast({
      title: '录制中',
      icon: 'loading',
      duration: 10000
    })
    recorderManager = Taro.getRecorderManager()
    recorderManager.onStop((res) => {
      console.log('recorder stop', res)
      this.uploadRecord(res)
    })
    recorderManager.start({
      duration: 10000,
      sampleRate: 44100,
      numberOfChannels: 1,
      encodeBitRate: 192000,
      format: 'mp3',
      frameSize: 50
    })
  }

  uploadRecord(record) {
    let MyFile = new Taro.BaaS.File()
    let fileParams = {filePath: record.tempFilePath}
    let metaData = {categoryID: 'audio'}
    Taro.showToast({
      title: '上传中',
      icon: 'loading',
      duration: 10000
    })
    MyFile.upload(fileParams, metaData).then(uploadRes => {
      this.closePop()
      Taro.hideToast();
      /*
      * 注: 只要是服务器有响应的情况都会进入 success, 即便是 4xx，5xx 都会进入这里
      * 如果上传成功则会返回资源远程地址,如果上传失败则会返回失败信息
      */
      let data = uploadRes.data  // res.data 为 Object 类型
      this.sendRecordMessage(data.path);
    }, err => {
      console.log('upload err: ' + err);
    })
  }

  playRecord(record) {
    const innerAudioContext = Taro.createInnerAudioContext()
    innerAudioContext.src = record
    innerAudioContext.play()
    innerAudioContext.onPlay(() => {
      console.log('开始播放')
    })
    innerAudioContext.onError((res) => {
      console.log(res.errMsg)
      console.log(res.errCode)
    })
  }

  chooseVideo() {
    this.setState({
      showMultiText: 'hide'
    })
    Taro.chooseVideo({
      sourceType: ['album', 'camera'],
      maxDuration: 60,
      camera: 'back',
      success: (res) => {
        this.uploadVideo(res.tempFilePath)
      }
    })
  }

  uploadVideo(path) {
    let MyFile = new Taro.BaaS.File()
    let fileParams = {filePath: path}
    let metaData = {categoryID: 'video'}
    Taro.showToast({
      title: '上传中',
      icon: 'loading',
      duration: 10000
    })
    MyFile.upload(fileParams, metaData).then(uploadRes => {
      this.closePop()
      Taro.hideToast();
      /*
      * 注: 只要是服务器有响应的情况都会进入 success, 即便是 4xx，5xx 都会进入这里
      * 如果上传成功则会返回资源远程地址,如果上传失败则会返回失败信息
      */
      let data = uploadRes.data  // res.data 为 Object 类型
      this.sendVideoMessage(data.path);
    }, err => {
      console.log('upload err: ' + err);
    })
  }

  sendVideoMessage(path) {
    const self = this;
    const params = {
      content: path,
      type: 'video',
      userUniformId: self.state.openId
    }
    let tableID = 58649
    let SinglePost = new Taro.BaaS.TableObject(tableID)
    let postObj = SinglePost.create()
    this.showLoad()
    postObj.set(params).save().then(resp => {
      this.hideLoad()
      if (resp.statusCode === 201) {
        self.setState({
          currentPage: 1,
          posts: this.state.posts.concat(resp.data),
          scrollTop: 1500 * (this.state.posts.length + 1),
          // todo 图片预览列表
        })
      }
    }, err => {
      console.log(err)
      this.hideLoad()
      Taro.showToast({
        title: '网络连接失败',
        icon: 'none',
        duration: 2000
      })
    })
  }

  playVideo() {
    const videoContext = Taro.createVideoContext('video')
    videoContext.play()
    videoContext.sendDanmu({
      text: '啦啦啦啦啦啦',
      color: 'red'
    })
  }

  showSearch() {
    this.setState({
      showSearch: ''
    })
  }

  multiText() {
    // const alert = (content) => {
    //   $wuxDialog('#wux-dialog--alert').alert({
    //       resetOnClose: true,
    //       title: '提示',
    //       content: content,
    //   })
    // }
    // $wuxDialog().prompt({
    //     resetOnClose: true,
    //     title: '多行输入',
    //     // content: '密码为8位数字',
    //     fieldtype: 'text',
    //     defaultText: '',
    //     // placeholder: '请输入Wi-Fi密码',
    //     maxlength: 140,
    //     onConfirm(e, response) {
    //         const content = response
    //         // alert(content)
    //     },
    // })
    this.setState({
      popupShow: false,
      showMultiText: 'modal'
    })
  }

  commitLong() {
    this.setState({
      popupShow: false,
      showMultiText: 'hide'
    })
    this.handleCommit();
  }

  render () {
    const icon = 'data:image/png;base64,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'
    const buttons = [
      {
        openType: 'share',
        label: '分享',
        icon,
      },
      {
        label: '通告',
        icon
      },
      {
        label: '搜索',
        icon
      },
    ]
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
        item.type === 'audio'
        ?
        <View className='home-list-item-wrap'>
          <View className='home-list-item-view-time'>
            <Text>{showTime}</Text>
          </View>
          <View className='home-list-item-view-wrap'>
            <View className='home-list-item-view-wrap-avatar'>
              <OpenData type='userAvatarUrl' />
            </View>
            <View onClick={this.playRecord.bind(this, item.content)} className='home-list-item-view-text-audio' key={index}>
              <wux-icon size={16} type='ios-musical-note' />
              <Text>点击播放</Text>
            </View>
          </View>
        </View>
        :
        item.type === 'video'
        ?
        <View className='home-list-item-wrap'>
          <View className='home-list-item-view-time'>
            <Text>{showTime}</Text>
          </View>
          <View className='home-list-item-view-wrap'>
            <View className='home-list-item-view-wrap-avatar'>
              <OpenData type='userAvatarUrl' />
            </View>
            <View>
              <Video
                src={item.content}
                controls
                autoplay={false}
                poster='http://misc.aotu.io/booxood/mobile-video/cover_900x500.jpg'
                initialTime='0'
                id='video'
                loop={false}
                muted={false}
              />
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
          {
            this.state.posts.length > 0
            ?
            <View>
              <View className={this.state.showSearch}>
                <wux-search-bar 
                  clear 
                  show-cancel 
                  value={this.state.searchValue}
                  controlled 
                  placeholder='搜索' 
                  onchange={this.searchChange.bind(this)}
                  onfocus={this.searchFocus.bind(this)}
                  onblur={this.searchBlue.bind(this)} 
                  onconfirm={this.searchConfirm.bind(this)} 
                  onclear={this.searchClear.bind(this)}
                  oncancel={this.searchCancel.bind(this)}
                />
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
            </View>
            :
            <wux-prompt style='height: 100%;' visible title='空空如也' text='暂时没有数据' />
          }
          <View id='home-input' className='home-input'>
              <View className='home-input-box'>
                <wux-cell hover-class='none'>
                  <wux-input 
                    value={this.state.content} 
                    controlled 
                    type='text' 
                    confirm-type='send'
                    confirmHold
                    onchange={this.handelChange.bind(this)}
                    onconfirm={this.handleCommit.bind(this)}
                  />
                </wux-cell>
              </View>
              <View onClick={this.showPopup} className='home-input-btn-send'>
                <wux-icon type='ios-add-circle-outline' />
              </View>
          </View>
          <View className={this.state.shadow}>
          </View>
          <View className={this.state.modal}>
            <View className='modal-title'>
              更新公告【版本1.4.1】
            </View>
            <View className='modal-content'>
              <View className='modal-content-text'>
                【升级】多行输入不限字数
              </View>
              {/* <View className='modal-content-text'>
                【优化】单独提供多行输入
              </View> */}
            </View>
            <View onClick={this.hideNotice} className='modal-btn'>
              好的
            </View>
          </View>
          <View className={this.state.showMultiText}>
            <View className='modal-textarea'>
              <wux-textarea
                onchange={this.handelChange.bind(this)} 
                cursorSpacing={this.state.textareaRows}
                value={this.state.content}
                placeholder='这里可以输入多行文本呦~'
                rows={this.state.textareaRows}
                hasCount
                maxlength={5000}
                clear
                autoHeight
                adjust-position
              ></wux-textarea>
            </View>
            <View className='modal-textarea-btn'>
              <wux-button onclick={this.commitLong.bind(this)} block type='positive'>发送</wux-button>
            </View>
          </View>
          <wux-fab-button 
            position={this.state.types[this.state.typeIndex]}
            theme={this.state.colors[this.state.colorIndex]}
            direction={this.state.dirs[this.state.dirIndex]}
            reverse={this.state.reverse} 
            spaceBetween={this.state.spaceBetween}
            sAngle={this.state.sAngle} 
            eAngle={this.state.eAngle}
            buttons={buttons}
            onchange={this.changeFab.bind(this)}
            onclick={this.clickFab.bind(this)}
            oncontact={this.contactFab.bind(this)}
            oncetuserinfo={this.onGotUserInfo.bind(this)}
          />
          <wux-popup position='bottom' maskClosable visible={this.state.popupShow} onclose={this.closePop.bind(this)}>
            <wux-grids col={3}>
              <wux-grid onclick={this.uploadImage.bind(this, 'image')} thumb={pic} label='图片' />
              <wux-grid ontouchstart={this.startRecord.bind(this)} ontouchend={this.stopRecord.bind(this)} thumb={mic} label='语音输入' />
              <wux-grid onclick={this.uploadImage.bind(this, 'camera')} thumb={camera} label='拍照' />
            </wux-grids>
            <wux-grids col={3}>
              <wux-grid onclick={this.chooseVideo.bind(this)} thumb={film} label='录影' />
              <wux-grid onclick={this.multiText.bind(this)} thumb={edit} label='多行输入' />
            </wux-grids>
          </wux-popup>
          <wux-dialog id='wux-dialog' />
          <wux-dialog id='wux-dialog--alert' />
        </View>
    )
  }
}

export default Home
