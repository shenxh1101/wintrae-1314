export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/list/index',
    'pages/announcement/index',
    'pages/submit/index',
    'pages/detail/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#1677ff',
    navigationBarTitleText: '小区报修',
    navigationBarTextStyle: 'white',
    backgroundColor: '#f5f7fa'
  },
  tabBar: {
    color: '#86909c',
    selectedColor: '#1677ff',
    backgroundColor: '#ffffff',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '首页'
      },
      {
        pagePath: 'pages/list/index',
        text: '进度'
      },
      {
        pagePath: 'pages/announcement/index',
        text: '公告'
      }
    ]
  }
})
