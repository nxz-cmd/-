//index.js

const util = require('../../utils/util.js')

Page({

  data: {
    pickerRange:[1,2,3,4,5,6,7,8,9],  //最多9个最少1个骰子，注意如果拓展到十几甚至几十个，将导致下方whetherOverlap反复执行甚至死循环
    number:6,                         //初始指定6个骰子
    switchText:'隐藏骰子',
    diceList:[],
    countList:['?','?','?','?','?','?'],
    countSum:'???',
  
    clicked:false                     //用于指示是否已经开始执行
  },

  onLoad: function (options) {
    //摇一摇
    util.shake(this.play)
    
  },

  onReady: function () {

  },

  onShow: function () {
    this.setData({
      clicked: false
    })
  },

  onHide: function () {

  },

  onUnload: function () {

  },

  onPullDownRefresh: function () {

  },

  onReachBottom: function () {

  },

  onShareAppMessage: function () {

  },

  //用户点击switchText
  changeSwitch:function(){
    var switchText = this.data.switchText
    if(switchText == '隐藏骰子'){
      switchText = '展示骰子'
    }
    else{
      switchText = '隐藏骰子'
    }
    this.setData({
      switchText:switchText,
      clicked:false
    })
  },

  //用户改变骰子个数
  changeNumber:function(event){
    var value = event.detail.value
    this.setData({
      number:Number(value) + 1
    })
  },

  //用户摇晃手机超过阈值，执行回调函数
  play:function(){
    var that = this
    //先判断clicked的值，若为true说明正在动画中，不再摇骰子；若为false则继续
    //同时判断switchText的值，当用户隐藏时，不再摇骰子，相当于暂时关闭了摇一摇功能
    if(that.data.clicked || that.data.switchText == '展示骰子'){
      return
    }
    else{
      //立即把clicked赋值为true，避免用户多次摇晃反复执行，动画结束后再把clicked置回false
      that.setData({
        clicked: true
      })
      wx.showLoading({
        title:'执行中…',
        mask:true
      })
      //先销毁之前的骰子，直接把diceList清空
      that.setData({
        diceList:[]
      })
      that.creatediceList()
      that.start()
    }
  },

  //以骰子个数为基础实例化新的骰子数组
  creatediceList:function(){
    var that = this
    var number = that.data.number
    var tempdiceList = []
    for(let i=0;i<number;i++){
      tempdiceList.push({
        value:1,
        animationData:null
      })
    }
    that.setData({
      diceList:tempdiceList
    })
  },

  //开始摇骰子
  start:function(){
    var that = this
    var diceList = that.data.diceList
    var length = diceList.length
    var valueList = that.creatValueList(length)   //获取各个骰子的4个value值，用于产生骰子的点数和动画
    for(let i=0;i<length;i++){
      diceList[i].value = valueList[i].value
      diceList[i].animationData = that.createAnimationData(valueList[i].left,valueList[i].top,valueList[i].rotate)
    }
    that.setData({
      diceList:diceList
    })
    wx.hideLoading()
  },

  //随机产生各个骰子的点数、最终位置、旋转角度，并计算出countList里的6个取值和countSum的值
  creatValueList:function(num){
    var valueList = []
    var countList = [0,0,0,0,0,0]
    var countSum = 0
    //此函数用于判断骰子最终位置是否与之前的骰子重叠
    function whetherOverlap(left,top){
      for(let j=0;j<valueList.length;j++){
        if((Math.pow((valueList[j].left - left),2) + Math.pow((valueList[j].top - top),2)) < 15000){
          //此时两个骰子中心连线的线段长度的平方小于15000
          console.log('overlap!')
          return true
        }
      }
      //至此for循环结束，那么本次随机产生的位置与之前的均无重叠（连线的平方均>=15000）
      return false
    }
    for(let i=0;i<num;i++){
      let temp1 = parseInt(Math.random() * 6)   //随机产生骰子的点数(0~5)
      let temp2 = 0
      let temp3 = 0
      do{
        temp2 = Math.random() * 650             //随机产生骰子的最终left(0~650)
        temp3 = Math.random() * 737 + 200       //随机产生骰子的最终top(200~937)
      }while(whetherOverlap(temp2,temp3))
      let temp4 = Math.random() * 360 + 360     //随机产生骰子的旋转角度(360~720)
      valueList.push({
        value:temp1+1,
        left:temp2,
        top:temp3,
        rotate:temp4
      })
      countList[temp1]++
      countSum += (temp1 + 1)
    }
    this.setData({
      countList:countList,
      countSum:countSum
    })

    // var dianSum = [0,0,0,0,0,0]
    // var j = 0
    // for(var i = 0; i<countList.length;i++)
    // {
    //   j =countList[i]
    //   dianSum[j] = dianSum[j] + 1
    // }


    // //进行获得称号的判断



    setTimeout(function () {

      if(countList[0] == 2 && countList[3] == 4 ){
        wx.showModal({
          title: '恭喜您',
        content: '您获得的是冠军称号：状元插金花！！！',
        success: function (res) {
          if (res.confirm) {//这里是点击了确定以后
            console.log('用户点击确定')
  
          } else {//这里是点击了取消以后
            console.log('用户点击取消')
          }
        }  
      })
      }
       else if(countList[3] == 6 ){
        wx.showModal({
          title: '恭喜您',
        content: '您获得的是亚军称号：六杯红！！',
        success: function (res) {
          if (res.confirm) {
            console.log('用户点击确定')
  
          } else {
            console.log('用户点击取消')
          }
        }  
      })
      }
      else if(countList[0] == 6 ||countList[1] == 6 ||countList[2] == 6 ||countList[3] == 6 ||countList[4] == 6 ||countList[5] == 6){
        wx.showModal({
          title: '恭喜您',
        content: '您获得的是季军称号：遍地锦！',
        success: function (res) {
          if (res.confirm) {
            console.log('用户点击确定')
  
          } else {
            console.log('用户点击取消')
          }
        }  
      })
      }
      else if(countList[3] == 5){
        wx.showModal({
          title: '恭喜您',
        content: '您获得的称号是：五红（称号榜第四）',
        success: function (res) {
          if (res.confirm) {
            console.log('用户点击确定')
  
          } else {
            console.log('用户点击取消')
          }
        }  
      })
      }
     else  if(countList[0] == 5||countList[1] == 5||countList[2] == 5||countList[4] == 5||countList[5] == 5){
        wx.showModal({
          title: '恭喜您',
        content: '您获得的称号是：五子登科（称号排行榜第五）',
        success: function (res) {
          if (res.confirm) {
            console.log('用户点击确定')
  
          } else {
            console.log('用户点击取消')
          }
        }  
      })
      }
     else  if(countList[3] == 4){
        wx.showModal({
          title: '恭喜您',
        content: '您获得的称号是：状元（称号排行榜第六）',
        success: function (res) {
          if (res.confirm) {
            console.log('用户点击确定')
  
          } else {
            console.log('用户点击取消')
          }
        }  
      })
      }
      else if(countList[0] == 1 && countList[1] == 1&&countList[2] == 1 && countList[3] == 1&&countList[4] == 1 && countList[5] == 1 ){
        wx.showModal({
          title: '恭喜您',
        content: '您获得的称号是：对堂（称号排行榜第七）',
        success: function (res) {
          if (res.confirm) {
            console.log('用户点击确定')
  
          } else {
            console.log('用户点击取消')
          }
        }  
      })
      }
     else  if(countList[3] == 3){
        wx.showModal({
          title: '恭喜您',
        content: '您获得的称号是：三红（称号排行榜第八）',
        success: function (res) {
          if (res.confirm) {
            console.log('用户点击确定')
  
          } else {
            console.log('用户点击取消')
          }
        }  
      })
      }
     else  if(countList[0] == 4 || countList[1] == 4 || countList[2] == 4 || countList[3] == 4 || countList[4] == 4 || countList[5] == 4 ){
        wx.showModal({
          title: '恭喜您',
        content: '您获得的称号是：四进（称号排行榜第九）',
        success: function (res) {
          if (res.confirm) {
            console.log('用户点击确定')
  
          } else {
            console.log('用户点击取消')
          }
        }  
      })
      }
      else if(countList[3] == 2){
        wx.showModal({
          title: '恭喜您',
        content: '您获得的称号是：二举（称号排行榜第十）',
        success: function (res) {
          if (res.confirm) {
            console.log('用户点击确定')
  
          } else {
            console.log('用户点击取消')
          }
        }  
      })
      }
      else if(countList[3] == 1){
        wx.showModal({
          title: '恭喜您',
        content: '您获得的称号是：一秀（称号排行榜第十一）',
        success: function (res) {
          if (res.confirm) {
            console.log('用户点击确定')
  
          } else {
            console.log('用户点击取消')
          }
        }  
      })
      }
      else{
        wx.showModal({
          title: '太遗憾了',
        content: '您没有博到饼',
        success: function (res) {
          if (res.confirm) {
            console.log('用户点击确定')
  
          } else {
            console.log('用户点击取消')
          }
        }  
      })
      }


      //要延时执行的代码
     }, 850) //延迟时间 这里是1秒













      // title: '恭喜您',
      // content: '您获得的称号是：',
      // success: function (res) {
      //   if (res.confirm) {
      //     console.log('用户点击确定')

      //   } else {
      //     console.log('用户点击取消')
      //   }
      // }


    return valueList
  },

  // jieguo:function(){

  //     //   setInterval(function () {
  //     // //循环执行代码
  //     // }, 1000) //循环时间 这里是1秒  


    

  // },
  //根据骰子的最终位置和旋转角度创建动画数据
  createAnimationData:function(left,top,rotate){
    var animation = wx.createAnimation({
      duration:1500,
      timingFunction:'ease-out'
    })
    animation.left(String(left) + 'rpx')
    animation.top(String(top) + 'rpx')
    animation.rotate(rotate)
    animation.step()
    return animation.export()
  },

  //动画结束的回调函数
  end:function(){







    //每次动画结束，把clicked置回false



    // wx.showModal({
    //   title: '提示',
    //   content: '这是一个模态弹窗',
    //   success: function (res) {
    //     if (res.confirm) {//这里是点击了确定以后
    //       console.log('用户点击确定')
    //     } else {//这里是点击了取消以后
    //       console.log('用户点击取消')
    //     }
    //   }
    // })

    this.setData({
      clicked:false
    })


  }

})
