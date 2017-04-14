import utils from './utils'
/**
 * vue列表使用的mixin
 * @param {Object} options
 *  - {String} [pagekey] - 分页的唯一标识
 *  - {String} [queryKey] - 地址栏参数的key
 *  - {Function} [fetch] - 请求列表的调用的钩子函数，需要return Promise 类型
 *  - {Function} [model] - 列表的字段模型
 * @return {Object}
 */
export default function vueMixinFetchList (options) {
  // 必传选项验证
  if (process.env.NODE_ENV !== 'production') {
    if (typeof options.pagekey !== 'string') {
      return new Error({ msg: '[vueMixinFetchList] get options typeof string' })
    }
    if (typeof options.queryKey !== 'string') {
      return new Error({ msg: '[vueMixinFetchList] get options typeof string' })
    }
    if (typeof options.fetch !== 'function') {
      return new Error({ msg: '[vueMixinFetchList] get options typeof function' })
    }
    if (typeof options.model !== 'function') {
      return new Error({ msg: '[vueMixinFetchList] get options typeof function' })
    }
  }
  const name = 'fetchList'
  const store = options.model()

  return {
    name,
    store,
    install (VueMixin) { // 安装程序
      let dataSearch = ''
      return {
        beforeRouteEnter (to, from, next) {
          // 如果不是在当前模块内跳转，并且列表关联的key和现在的key不一致，则清除数据)
          if (getSearch(to.query) !== dataSearch) {
            listInit()
          }
          next()
        },
        computed: {
          ...utils.createComputed(store),
          $fetchList () {
            const self = this
            /**
             * 获取列表的数据
             */
            function fetchList () {
              const search = getSearch(self.$route.query)
              return options.fetch.call(self).then((res) => {
                if (search !== getSearch(self.$route.query)) return false // 数据请求回来，页面已经发生改变了
                Object.assign(store, res)
                dataSearch = search
              })
            }
            fetchList.init = function init () {
              listInit.apply(self, arguments)
            }
            /**
             * 查询页面的数据
             */
            fetchList.search = function search (...arg) {
              let query = {}
              /* eslint-disable no-undef */
              if (event === arg[0]) { // 事件触发传进来的参数不要
                arg[0] = {}
              }
              if (utils.isObject(arg[0])) {
                query = arg[0]
              } else if (typeof arg[0] === 'string') {
                query[arg[0]] = arg[1]
              }
              query = Object.assign({}, self.$route.query, { [options.pagekey]: 1 }, self[options.queryKey], query)
              self.$router.push({
                ...this.$route,
                query
              })
            }
            /**
             * 将地址栏的参数同步到组件中
             */
            fetchList.syncQuery = function syncQuery () {
              const query = self[options.queryKey]
              if (utils.isObject(query)) { // 将地址栏的参数，还原到对应的字段中去
                Object.keys(query).forEach((k) => {
                  if (Object.prototype.hasOwnProperty.call(self.$route.query, k)) {
                    query[k] = self.$route.query[k]
                  }
                })
              }
            }
            return fetchList
          }
        },
        created () {
          this.$fetchList.syncQuery()
          this.$fetchList()
        },
        watch: {
          '$route.query' (val, oldVal) {
            this.$fetchList.syncQuery()
            if (getSearch(val) === getSearch(oldVal)) return false // 对象被改变了，但是url并没有改变
            this.$fetchList()
          }
        }
      }
    },
    destroyed (VueMixin) { // 卸载程序
    }
  }

  function getSearch (query) { // 获取地址栏?后面的参数
    const arr = []
    Object.keys(query).forEach((k) => arr.push(`${k}=${query[k]}`))
    return arr.join('&')
  }
  function listInit () { // 初始化状态
    const model = options.model()
    Object.assign(store, model)
  }
}
