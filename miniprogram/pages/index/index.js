import Canvas from 'canvas.js'
//index.js
const app = getApp()
const db = wx.cloud.database({});
const table = db.collection('food');
const _ = db.commond

Page({
  data: {
    avatarUrl: './user-unlogin.png',
    userInfo: {},
    logged: false,
    takeSession: false,
    requestResult: '',
    search_text: '',
    sugar_desp: "",
    gWidth: 1,
    gHeight: 1,
    showResult:false,
    foodList:["梨", "苹果", "荔枝", "葡萄", "草莓", "西瓜"]
  },

  onReady() {
    // 使用 wx.createContext 获取绘图上下文 context
    var that = this
    wx.getSystemInfo({
      success(res) {
        console.log(res.model)
        console.log(res.pixelRatio)
        console.log(res.windowWidth)
        console.log(res.windowHeight)
        console.log(res.language)
        console.log(res.version)
        console.log(res.platform)
        console.log(res.environment)
        that.setData({ gWidth: res.windowWidth, gHeight: res.windowHeight })
      }
    })


  },

  onLoad: function () {
    if (!wx.cloud) {
      wx.redirectTo({
        url: '../chooseLib/chooseLib',
      })
      return
    }

    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              this.setData({
                avatarUrl: res.userInfo.avatarUrl,
                userInfo: res.userInfo
              })
            }
          })
        }
      }
    })
  },

  onGetUserInfo: function (e) {
    if (!this.data.logged && e.detail.userInfo) {
      this.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo
      })
    }
  },

  searchFood: function(event){

    var that = this
    
    console.log(event.currentTarget.dataset.food)
    that.setData({search_text: event.currentTarget.dataset.food})
    that.btnclick()
  },

  btnclick: function (e) {
    var that = this
    
    console.log('123');
    //var onOff = this.data.onOff;
    console.log(that.data.search_text)
    that.setData({showResult: true})

    table.where({
      title: that.data.search_text
    }).get({
      //若成功获取,异步操作注意异常
      success: res => {
        //打印记录中第一条里goodName属性
        let len = res.data.length
        console.log(res.data.length)
        //console.log(res.data[0]._id)  //放到这里，如果查不到会报错
        if (res.data.length >= 1) {
          console.log(res.data[0]._id)
          console.log("每100克" + res.data[0].title + '含糖', res.data[0].sugar + "克")
          that.setData({ sugar_desp: "每100克" + res.data[0].title + '含糖' + res.data[0].sugar + "克" })
          that.onShow()
          var context = wx.createCanvasContext('myCanvas')
          var w=that.data.gWidth/2
          var h= 100
          var c = res.data[0].sugar
          context.setStrokeStyle("#cccccc")
          context.setLineWidth(5)
          //context.moveTo(160, 100)
          context.arc(that.data.gWidth/2, 100, 60, 0, 2 * Math.PI, true)
          context.stroke();
          //context.moveTo(160, 100)
          context.setStrokeStyle("#ff5000")
          context.setLineWidth(10)
          context.beginPath()
          context.arc(that.data.gWidth/2, 100, 60, -0.5 * Math.PI, ( (res.data[0].sugar/100)*2 -0.5) * Math.PI)
          context.stroke()
          context.stroke();
          //开始绘制百分比数字
          context.beginPath();
          context.setFontSize(30); // 字体大小 注意不要加引号
          context.setFillStyle("#ff5000");	 // 字体颜色
          context.setTextAlign("center");	 // 字体位置
          context.setTextBaseline("middle");	 // 字体对齐方式
          context.fillText(c + "%", w, h);	 // 文字内容和文字坐标
          context.draw()
          that.onShow()
        }
        else {
          that.setData({ sugar_desp: '   未查到该食品，数据持续更新中，过段时间再试试吧' })
          console.log('未查到该食品，数据持续更新中，过段时间再来看看')

          // var context = wx.createCanvasContext('myCanvas')
          // context.setStrokeStyle("#cccccc")
          // context.setLineWidth(5)
          // context.arc(200, 100, 60, 0, 2 * Math.PI, true)
          // context.stroke();
          // context.draw()
          // that.onShow()

          var context = wx.createCanvasContext('myCanvas')
          var w=that.data.gWidth/2
          var h= 100
          var c = "^   ^   "
          context.setStrokeStyle("#cccccc")
          context.setLineWidth(5)
          //context.moveTo(160, 100)
          context.arc(that.data.gWidth/2, 100, 60, 0, 2 * Math.PI, true)
          context.stroke();
          //context.moveTo(160, 100)
          context.setStrokeStyle("#ff5000")
          context.setLineWidth(10)
    
          //开始绘制百分比数字
          context.beginPath();
          context.setFontSize(30); // 字体大小 注意不要加引号
          context.setFillStyle("#ff5000");	 // 字体颜色
          context.setTextAlign("center");	 // 字体位置
          context.setTextBaseline("middle");	 // 字体对齐方式
          context.fillText(c, w, h);	 // 文字内容和文字坐标
          context.draw()
          that.onShow()
          
        }

      }
    })


    table.doc("994c5b685f608dee0005a4c31cb9ba09").get({
      success: function (res) {
        console.log(res.data)
      }
    });
    //console.log(e.detail.value);
  },

  inputclick: function (e) {
    this.setData({ search_text: e.detail.value });
    this.setData({showResult: false})
  },

  onGetOpenid: function () {
    // 调用云函数
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        console.log('[云函数] [login] user openid: ', res.result.openid)
        app.globalData.openid = res.result.openid
        wx.navigateTo({
          url: '../userConsole/userConsole',
        })
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
        wx.navigateTo({
          url: '../deployFunctions/deployFunctions',
        })
      }
    })
  },

  // 上传图片
  doUpload: function () {
    // 选择图片
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {

        wx.showLoading({
          title: '上传中',
        })

        const filePath = res.tempFilePaths[0]

        // 上传图片
        const cloudPath = 'my-image' + filePath.match(/\.[^.]+?$/)[0]
        wx.cloud.uploadFile({
          cloudPath,
          filePath,
          success: res => {
            console.log('[上传文件] 成功：', res)

            app.globalData.fileID = res.fileID
            app.globalData.cloudPath = cloudPath
            app.globalData.imagePath = filePath

            wx.navigateTo({
              url: '../storageConsole/storageConsole'
            })
          },
          fail: e => {
            console.error('[上传文件] 失败：', e)
            wx.showToast({
              icon: 'none',
              title: '上传失败',
            })
          },
          complete: () => {
            wx.hideLoading()
          }
        })

      },
      fail: e => {
        console.error(e)
      }
    })
  },

})
