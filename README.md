## vue-mixin
```javascript
import VueMixin, { vueMixinFetchList, vueMixinFetchDetail, vueMixinStore } from 'vue-mixin'
```
### VueMixin
核心的程序，目前主要核心功能是给mixin提供一个跨组件数据存储的功能，提供了一个插件的机制
```javascript
new VueMixin({
  plugins: [
    // 使用vueMixinFetchList, vueMixinFetchDetail, vueMixinStore等各种插件
  ]
})
```

### vueMixinFetchList
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
}).mixins.fetchList

// list.vue
import FetchDataList from './FetchDataList'
export default {
  mixins: [FetchDataList],
  data () {
    return {
      query: { // 会将地址栏对应的参数，同步到声明的字段中
        page: 1,
        keyname: ''
      }
    }
  },
  created () {
    // 提供的API
    // this.$fetchList() // 拉取的数据
    // this.$fetchList.init() // 初始化页面的数据
    // this.$fetchList.search() // 查询页面的数据
    // this.$fetchList.syncQuery() // 同步地址栏的参数到组件中
  }
}
```

### vueMixinStore
提供了跨组件的数据按需加载，缓存，以及帮你处理更新
```javascript
// store.js
export default new VueMixin({
  plugins: [
    vueMixinStore({
      districts: {
        update: false, // 数据缓存之后，是否还向服务器更新数据
        fetch ()  {
          return Promise.resolve({
            // 缓存的数据，必须返回一个Promise对象
          })
        }
      },
      beijing: {
        base: ['districts'], // 依赖其他字段
        fetch (districts) { // 等districts请求完成之后，会触发相关的依赖任务
          return districts.xxx
        }
      }
    })
  ]
}).mixins.store
// xx.vue
import store from './store
export default {
  mixins: [store],
  data () {
    return {
      districts: {} // vueMixinStore会检测此字段自己是否存在，如果存在就会自动帮处理该字段的数据
    }
  }
}
```
