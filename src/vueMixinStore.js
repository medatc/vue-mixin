import { _Vue } from './install'
import utils from './utils'
/**
 * 缓存列表的数据
 * @param {Array} options
 * - {Array} [base] - 依赖其他的请求
 * - {Boolean} [update] - 是否更新数据
 * - {Function} [fetch] - 请求数据
 */
export default function vueMixinStore (options) {
  const name = 'store'
  const store = {} // 仓库，所有的数据存储在这里
  const task = {} // 所有的任务
  /**
   * 一项默认的配置
   */
  const defaults = {
    base: [], // 这一项，基于谁
    update: true, // 是否更新数据
    fetch: () => Promise.resolve({}) // 处理请求的钩子函数可以依赖其他请求
  }
  Object.keys(options).forEach((k) => {
    const unknown = options[k]
    if (utils.isObject(unknown)) {
      task[k] = Object.assign({}, defaults, unknown)
    } else if (typeof unknown === 'function') {
      task[k] = Object.assign({}, defaults, { fetch: unknown })
    }
  })
  return {
    name,
    store,
    install (VueMixin) {
      return {
        created () {
          const fetchTask = {} // 仓库的请求任务

          Object.keys(task).forEach((k) => {
            if (!utils.isHas(this.$data, k)) return false // 组件没有使用这个仓库的数据
            if (utils.isHas(store, k)) { // 仓库已经存在数据
              this.$data[k] = store[k] // 从仓库中还原数据
            } else {
              _Vue.set(store, k, this.$data[k]) // 在仓库中创建默认的数据
            }
            const item = task[k]
            const data = store[k]
            if (!item.update && data._ok_) return false // 数据无需更新
            if (item.base.length === 0) {
              fetchTask[k] = item
            } else {
              // 将依赖的任务添加进来
              addBaseTask(item.base)
            }
          })

          vueMixinStoreFetch.call(this, fetchTask)
          function addBaseTask (base) {
            base.forEach((k) => {
              fetchTask[k] = task[k]
            })
          }
          function vueMixinStoreFetch (fetchTask) {
            const fetch = []
            const queue = Object.keys(fetchTask)
            const storeUpdate = (k, data) => {
              Object.defineProperty(data, '_ok_', { // 此数据是否是已经加载过了
                value: true,
                enumerable: false, // 不可枚举
                configurable: false, // 属性不可删除
                writable: true // 值允许可写
              })
              this.$data[k] = store[k] = data
            }

            queue.forEach((k) => {
              const item = fetchTask[k]
              const promise = item.fetch.call(this).then((res) => {
                storeUpdate(k, res)
                return res
              })
              fetch.push(promise)
            })
            return Promise.all(fetch).then((arg) => {
              Object.keys(task).forEach((k) => {
                const list = []
                const item = task[k]
                if (!item.base.length) return false // 没有依赖任务
                for (let i = 0; i < item.base.length; i++) {
                  const index = queue.indexOf(item.base[i])
                  if (index > -1) {
                    list.push(arg[index])
                  } else {
                    break
                  }
                }
                if (list.length === item.base.length) { // 执行依赖的任务
                  storeUpdate(k, item.fetch.apply(this, list))
                }
              })
            })
          }
        },
        computed: {
          $vueMixinStore () {
            return store
          }
        }
      }
    }
  }
}
