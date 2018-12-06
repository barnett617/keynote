import Taro, { Component } from '@tarojs/taro'
import { View, Input, ScrollView, Text, Textarea, Button, Image } from '@tarojs/components'

import './index.scss'

class Home extends Component {

  config = {
    navigationBarTitleText: 'PickMee'
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
      canCommit: false,
      btnLoading: false,
      btnText: '+',
      type: '',
      // 图片列表
      imageList: []
    }
  }

  componentDidMount () {
    this.handleList();
  }

  componentWillReceiveProps (nextProps) {
    console.log('this.props: ' + this.props);
    console.log('nextProps: ' + nextProps);
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
        // self.setState({
        //   scrollViewHeight: res.windowHeight - 100
        // })
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
        res.data.objects.forEach(element => {
          if (element.type && element.type === 'image') {
            self.state.imageList.push(element.content);
          }
        });
      }
    }, err => {
      // err
      console.log(err)
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
    self.setState({
      canCommit: false,
      btnText: '',
      btnLoading: true
    });
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
                  content: self.state.content,
                  type: self.state.type
                }
                let tableID = 58649
                let SinglePost = new Taro.BaaS.TableObject(tableID)
                let postObj = SinglePost.create()
                postObj.set(params).save().then(resp => {
                  if (resp) {
                    self.setState({
                      canCommit: true,
                      btnText: '+',
                      btnLoading: false
                    });
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
                  self.setState({
                    canCommit: true,
                    btnText: '+',
                    btnLoading: false
                  });
                  console.log(err)
                })
              } else {
                self.setState({
                  canCommit: true,
                  btnText: '+',
                  btnLoading: false
                });
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
    console.log(e.target.value)
    if (e.target.value) {
      this.setState({
        content: e.target.value,
        type: 'text',
        canCommit: true
      });
    }
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
    const height = e.target.height;
  }

  handleBlur = (e) => {

  }

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
          // self.handleList();
          let MyFile = new Taro.BaaS.File()
          let fileParams = {filePath: res.tempFilePaths[0]}
          let metaData = {categoryName: 'SDK'}
      
          MyFile.upload(fileParams, metaData).then(uploadRes => {
            /*
            * 注: 只要是服务器有响应的情况都会进入 success, 即便是 4xx，5xx 都会进入这里
            * 如果上传成功则会返回资源远程地址,如果上传失败则会返回失败信息
            */
      
            let data = uploadRes.data  // res.data 为 Object 类型

            // 上传图片到资源库后，发送一条消息
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
                          content: data.path,
                          type: 'image'
                        }
                        let tableID = 58649
                        let SinglePost = new Taro.BaaS.TableObject(tableID)
                        let postObj = SinglePost.create()
                        postObj.set(params).save().then(resp => {
                          if (resp) {
                            self.setState({
                              canCommit: true,
                              btnText: '+',
                              btnLoading: false
                            });
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
                          self.setState({
                            canCommit: true,
                            btnText: '+',
                            btnLoading: false
                          });
                          console.log(err)
                        })
                      } else {
                        self.setState({
                          canCommit: true,
                          btnText: '+',
                          btnLoading: false
                        });
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
          }, err => {
            console.log('err: ' + err);
          })
        }
      }
    })
    // Taro.uploadImage();
  }

  previewImage = (e) => {
    const self = this;
    Taro.previewImage({
      current: e.currentTarget.dataset.src, // 当前显示图片的http链接
      urls: self.state.imageList // 需要预览的图片http链接列表
    })
  }

  render () {
    const postList = this.state.posts.map((item, index) => {
      return (
        item.type === 'image'
        ?
        <View className='home-list-item-view home-list-item-view-image' key={index}>
          <Image 
            onClick={this.previewImage}
            // 宽度不变，高度自动变化，保持原图宽高比不变
            mode='widthFix' 
            data-src={item.content}
            src={item.content}
          ></Image>
        </View>
        :
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
            <Text>在奋力加载内容哦~ n(*≧▽≦*)n</Text>
          </View>
          :
          <ScrollView
            className='home-scrollview'
            scrollY
            scrollWithAnimation
            scrollTop={this.state.scrollTop}
            // style={`height: ${this.state.scrollViewHeight}px;`}
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
              onConfirm={this.handleConfirm.bind(this)}
              type='text' 
              cursorSpacing={this.state.cursorSpacing}
              value={this.state.content}
              adjustPosition='true'
              placeholder='在这里输入内容吧' 
              auto-Height='true'
            />
          </View>
          <View className='home-input-view'>
            <Button
              onClick={this.uploadImage}
              className='home-input-icon-part'
              size='default'
              type='primary'
              plain='true'
              // loading={this.state.btnLoading ? true : false}
              // disabled={!this.state.canCommit ? true : false}
            >
                {this.state.btnText}
            </Button>
          </View>
        </View>
      </View>
    )
  }
}

export default Home
