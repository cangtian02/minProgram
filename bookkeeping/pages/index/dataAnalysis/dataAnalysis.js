let context  // canvas实例
let direction  // 点击的方位
let touchCurrentIndex = -1  // 选中的下标

// 圆饼的四个方位
const RIGHT_DOWN = 0
const LEFT_DOWN = 1
const LEFT_UP = 2
const RIGHT_UP = 3

const radius = 70  // 圆的半径
const max_radius = 80  // 选中后的那一个的半径
let axis_x = 0  // 圆心x坐标
let axis_y = 0  // 圆心y坐标

Component({
  /**
   * 组件的初始数据
   */
  data: {
    analysis: [
      {
        name: '吃',
        num: 30,
        price: 2999.68,
        color: '#2ED084',
      }, {
        name: '喝',
        num: 20,
        price: 2199.50,
        color: '#FDC604',
      }, {
        name: '玩',
        num: 18,
        price: 1599.50,
        color: '#F5554E',
      }, {
        name: '乐',
        num: 15,
        price: 1299.50,
        color: '#0EADFE',
      }, {
        name: '其他',
        num: 10,
        price: 900,
        color: '#8684F2',
      }, {
        name: '更多类别',
        num: 7,
        price: 600,
        color: '#0FB0FA',
      },
    ],
  },
  lifetimes: {
    attached: function () {
      // 获取canvas的宽高，设置圆心坐标
      const query = wx.createSelectorQuery().in(this)
      query.selectAll('#chart_content').boundingClientRect()
      query.exec(res => {
        res = res[0][0]
        axis_x = res.width / 2
        axis_y = res.height / 2
        // 开始绘制
        this.drawChart()
      })
    },
  },
  /**
   * 组件的方法列表
   */
  methods: {
    tranMonth() {
      console.log('tranMonth')
    },
    // 计算出开始的弧度和所占比例
    calPieAngle(series) {
      let startAngle = 0
      return series.map(item => {
        item.proportion = item.num / 100
        item.startAngle = startAngle
        startAngle += 2 * Math.PI * item.proportion
        item.endAngle = startAngle
        return item
      })
    },
    // 绘制饼图
    drawChart() {
      context = wx.createCanvasContext('chart', this)
      let pieSeries = this.calPieAngle(this.data.analysis)

      pieSeries.forEach((item, idx) => {
        context.beginPath()
        context.setFillStyle(item.color)
        context.moveTo(axis_x, axis_y)
        context.arc(axis_x, axis_y, idx === touchCurrentIndex ? max_radius : radius, item.startAngle, item.startAngle + 2 * Math.PI * item.proportion)
        context.closePath()
        context.fill()
      })

      // 选中了区块，绘制相对应的金额
      if (touchCurrentIndex > -1) {
        this.drawCurrentPrice()
      }

      context.draw()
    },
    // 绘制当前选中的一块的文字
    drawCurrentPrice() {
      let angle = 0  // 计算当前块一半的位置加上前面块一起的弧度
      let arr = this.data.analysis

      for (let i = 0; i < arr.length; i++) {
        let prevIndex = i === 0 ? 0 : i - 1
        let prevAngle = arr[prevIndex].endAngle / (Math.PI / 180)
        
        if (i === touchCurrentIndex) {
          angle = arr[i].endAngle / (Math.PI / 180)
          if (i === 0) {
            angle = angle / 2
          } else {
            angle = (angle - prevAngle) / 2
            angle = angle + prevAngle
          }
          break
        }
      }

      // 圆上x y轴坐标
      let x = Math.round(max_radius * Math.cos(angle * Math.PI / 180)) + axis_x
      let y = Math.round(max_radius * Math.sin(angle * Math.PI / 180)) + axis_y
      let turning_x_one = 0
      let turning_y_one = 0
      let turning_x_two = 0
      let turning_y_two = 0
      let text_top_x =0
      let text_top_y = 0
      let text_bot_x = 0
      let text_bot_y = 0
      
      turning_x_one = direction === RIGHT_DOWN || direction === RIGHT_UP ? x + 10 : x - 10
      turning_y_one = direction === RIGHT_DOWN || direction == LEFT_DOWN ? y + 10 : y - 10
      turning_x_two = direction === RIGHT_DOWN || direction === RIGHT_UP ? x + 35 : x - 35
      turning_y_two = direction === RIGHT_DOWN || direction == LEFT_DOWN ? y + 10 : y - 10

      text_top_x = direction === RIGHT_DOWN || direction === RIGHT_UP ? x + 42 : x - 42
      text_top_y = direction === RIGHT_DOWN || direction == LEFT_DOWN ? y + 5 : y - 15
      text_bot_x = direction === RIGHT_DOWN || direction === RIGHT_UP ? x + 40 : x - 40
      text_bot_y = direction === RIGHT_DOWN || direction == LEFT_DOWN ? y + 25 : y + 5

      context.beginPath()
      context.setStrokeStyle(arr[touchCurrentIndex].color)
      context.lineTo(x, y)
      context.lineTo(turning_x_one, turning_y_one)
      context.lineTo(turning_x_two, turning_y_two)
      context.stroke()

      context.setTextAlign(direction === LEFT_DOWN || direction === LEFT_UP ? 'right' : 'left')
      context.setFontSize(12)
      context.setFillStyle(arr[touchCurrentIndex].color)
      context.fillText(arr[touchCurrentIndex].name, text_top_x, text_top_y)
      context.fillText('￥' + arr[touchCurrentIndex].price, text_bot_x, text_bot_y)

      context.closePath()
    },
    // 饼图点击事件处理
    chartTouchStart(e) {
      let touches = e.touches
      if (touches.length > 1) return

      touches = touches[0]

      let {x, y} = touches
      let sx = axis_x - radius
      let ex = axis_x + radius
      let sy = axis_y - radius
      let ey = axis_y + radius

      // 点击区域不在饼状图内
      if (x < sx || x > ex || y < sy || y > ey) {
        touchCurrentIndex = -1
        this.drawChart()
        return
      } 

      // 点击坐标的正切值，相对圆心的四个方向
      let proportion = 0

      // 右下
      if (x > axis_x && y > axis_y) {
        let a = x - axis_x
        let b = y - axis_y
        proportion = Math.atan(b / a)
        direction = RIGHT_DOWN
      }

      // 左下
      if (x < axis_x && y > axis_y) {
        let a = axis_x - x
        let b = y - axis_y
        proportion = Math.atan(a / b) + (Math.PI / 2)
        direction = LEFT_DOWN
      }

      // 左上
      if (x < axis_x && y < axis_y) {
        let a = axis_x - x
        let b = axis_y - y
        proportion = Math.atan(b / a) + Math.PI
        direction = LEFT_UP
      }

      // 右上
      if (x > axis_x && y < axis_y) {
        let a = x - axis_x
        let b = axis_y - y
        proportion = Math.atan(a / b) + (Math.PI * 1.5)
        direction = RIGHT_UP
      }

      // 判断是否正好点在四条正角上
      proportion = x === axis_x ? y < axis_y ? Math.PI * 1.5 : Math.PI / 2 : proportion
      proportion = y === axis_y ? x < axis_x ? Math.PI : 0 : proportion

      if (this.getTouchCurrentIndex(proportion) !== touchCurrentIndex) {
        touchCurrentIndex = this.getTouchCurrentIndex(proportion)
        // 重新绘制
        this.drawChart()
      }
    },
    // 获取点击的是哪一块
    getTouchCurrentIndex(proportion) {
      let arr = this.data.analysis
      let currentIndex = 0

      for (let i = 0; i < arr.length; i++) {
        if (proportion <= arr[i].endAngle) {
          currentIndex = i
          break
        }
      }

      return currentIndex
    },
  }
});
