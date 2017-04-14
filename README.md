## vue-mixin
```javascript
import VueMixin, { vueMixinFetchList, vueMixinFetchDetail, vueMixinStore } from 'vue-mixin'
```
**VueMixin**  
核心的程序，目前主要核心功能是给mixin提供一个跨组件数据存储的功能，提供了一个插件的机制
```javascript
new VueMixin({
  plugins: [
    // 使用vueMixinFetchList, vueMixinFetchDetail, vueMixinStore等各种插件
  ]
})
```

**vueMixinFetchList**    
负责处理路由的列表，包含了地址栏的参数映射到组件的某个对象，路由参数变化自动请求数据，自动清理数据，后续还会提供滚动条位置还原功能
```javascript
// FetchDataList.js
export default new VueMixin({
  plugins: [
    vueMixinFetchList({
      pagekey: 'page', // 分页的key值
      queryKey: 'query', // 地址栏的参数同步到组件的哪个对象中
      model () {
        return {
          list: []
        }
      },
      fetch () { // 必须返回一个Promise对象和model中对应的数据结构
        return fetch('https://cnodejs.org/api/v1/topics')
        .then((res) => res.json())
        .then((res) => ({ list: res.data }))
      }
    })
  ]
})

// list.vue
import FetchDataList from './FetchDataList'
export default {
  mixins: [FetchDataList],
  created () {
    this.$fetchList() // 拉取的数据
    this.$fetchList.init() // 初始化页面的数据
    this.$fetchList.search() // 查询页面的数据
    this.$fetchList.syncQuery() // 同步地址栏的参数到组件中
  }
}
```
