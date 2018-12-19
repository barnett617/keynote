import Taro from '@tarojs/taro'
import { getGlobalData } from '../constants/globalData'

const appid = 'wx1849501120de4702'
const secret = 'e7fca835157c518362d86873de388796'

async function getUserInfo () {
  const userData = getGlobalData('userData')
  if (userData) {
    return userData
  }
  try {
    const userData = await Taro.getUserInfo()
    return userData
  } catch (err) {
    console.log(err)
    console.log('微信登录或用户接口故障')
    return null
  }
}

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