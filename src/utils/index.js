import Taro from '@tarojs/taro'

const appid = 'wx1849501120de4702'

async function getOpenId () {
  let openId = Taro.getStorageSync('taro_demo_openid')
  if (openId) {
    return openId
  } else {
    const loginRes = await Taro.login()
    const res = await Taro.request({
      url: `https://api.weixin.qq.com/sns/jscode2session?appid=${appid}&secret=${secret}&js_code=${loginRes.code}&grant_type=authorization_code`
    })
    openId = res.data.openid
    Taro.setStorage({key: 'taro_demo_openid', data: openId})
    return openId
  }
}

async function getIsAuth () {
  const openid = await getOpenId()
  let {userInfo} = await getUserInfo()
  let isAuth = false
  if (userInfo) {
    userInfo.isAuth = true
    userInfo._id = openid
    isAuth = true
  } else {
    userInfo = {
      _id: openid,
      isAuth: false
    }
  }
  return isAuth
}

export {
  getUserInfo,
  getOpenId,
  getIsAuth,
}
