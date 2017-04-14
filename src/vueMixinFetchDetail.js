import utils from './utils'
/**
 * 详情，修改，新增可共用的mixin
 * 路由匹配规则：
 * /module
 * /module/create
 * /module/:id/edit
 * /module/:id
 * @param {Object} options 选项
 *  - {String} [key] - 详情的id的key路径
 *  - {Object|Array} [mixins] - 加入你自定义的mixins
 *  - {Function} [fetch] - 请求列表的调用的钩子函数，需要return Promise 类型
 *  - {Function} [model] - 数据的字段集合
 * @return {Object}
 */
export default function vueMixinFetchDetail (options) {
  if (process.env.NODE_ENV !== 'production') {
    if (typeof options.fetch !== 'function') {
      return new Error({ msg: '[vueMixinFetchDetail] get options typeof function' })
    }
    if (typeof options.model !== 'function') {
      return new Error({ msg: '[vueMixinFetchDetail] get options typeof function' })
    }
  }
  // 处理key值
  if (typeof options.key === 'string') {
    const [detailName, keyName] = options.key.split('.')
    options.detailName = detailName
    options.keyName = keyName
  } else {
    return
  }
  // 处理mixins
  if (utils.isObject(options.mixins)) {
    options.mixins = [options.mixins]
  } else if (!utils.isArray(options.mixins)) {
    options.mixins = []
  }
  const name = 'fetchDetail'
  const store = options.model()
  return {
    name,
    store,
    install (VueMixin) { // 安装程序
      const { fetchList } = VueMixin.store
      if (process.env.NODE_ENV !== 'production') {
        if (!utils.isObject(fetchList)) {
          return new Error({ msg: 'Please install the FetchList plugin' })
        }
      }
      function getListItemIndex (key) { // 获取当前页面在列表中的索引，此处可使用算法来优化查找的性能、待续。。。
        const { list, list: { length } } = fetchList
        for (let i = 0; i < length; i++) {
          if (String(list[i][options.keyName]) === String(key)) { // 路由传来的key可能是字符串，也可能是数字
            return i
          }
        }
        return -1
      }

      this.listUnwatch = VueMixin.vm.$watch('store.fetchList.list', (list) => { // 监听列表的数据改变
        const index = getListItemIndex(store[options.detailName][options.keyName])
        if (index < 0) return false
        const detail = list[index]
        Object.keys(store[options.detailName]).forEach((k) => {
          if (Object.prototype.hasOwnProperty.call(detail, k)) { // 如果存在这个属性，才更新到详情中
            store[options.detailName][k] = detail[k]
          }
        })
      }, { deep: true })
      this.detailUnwatch = VueMixin.vm.$watch(`store.${name}.${options.detailName}`, (detail) => { // 监听详情的数据改变
        const index = getListItemIndex(store[options.detailName][options.keyName])
        if (index < 0) return false
        Object.keys(fetchList.list[index]).forEach((k) => {
          fetchList.list[index][k] = detail[k]
        })
      }, { deep: true })
      return {
        mixins: options.mixins,
        props: [options.keyName],
        beforeRouteEnter (to, from, next) { // 每次路由变化都会调用此钩子函数
          const toKey = String(to.params[options.keyName])
          const key = String(store[options.detailName][options.keyName])
          if (toKey !== key) { // 判断详情的数据和路由要跳转的页面是否一致
            const index = getListItemIndex(to.params[options.keyName])
            Object.assign(store[options.detailName], options.model()[options.detailName], fetchList.list[index] || {})
          }
          next()
        },
        computed: {
          ...utils.createComputed(store),
          $fetchDetail () {
            const self = this
            function fetchDetail () {
              if (!self[options.keyName]) return
              return options.fetch.call(self).then((res) => {
                Object.assign(store, res)
              })
            }
            return fetchDetail
          }
        },
        created () {
          this.$fetchDetail()
        },
        watch: {
          [options.keyName] () {
            this.$fetchDetail()
          }
        }
      }
    },
    destroyed () { // 销毁插件，释放内存
      this.listUnwatch()
      this.detailUnwatch()
    }
  }
}
