// pages/index/content/content.js
Component({
  properties: {
    
  },
  data: {
    itemArr: [{
      name: '餐',
      content: '餐饮',
      price: '-15',
      date: '11月12日 12:20',
    }, {
      name: '零',
      content: '零食',
      price: '-30',
      date: '11月12日 14:20',
    }, {
      name: '餐',
      content: '晚餐',
      price: '-15',
      date: '11月12日 18:20',
    }],
    expenditure: 1988.95,
    income: 2000,
  },
  methods: {
    tapLookAll() {
      console.log('tapLookAll')
    },
    saveItem() {
      console.log('saveItem')
    },
  }
})
