import { _Vue } from './install'
import utils from './utils'
/**
 * vue mixin插件
 * return {Class}
 */
export default class VueMixin {
  constructor (options) {
    this.mixins = {}
    this.store = {}
    this.plugins = options.plugins || []

    // 创建Vue实例
    this.vm = new _Vue({
      data: {
        store: this.store
      }
    })
    // 安装插件
    this.plugins.forEach((item) => {
      if (process.env.NODE_ENV !== 'production') {
        if (typeof item.name !== 'string' || this.mixins[item.name]) {
          return new Error({ msg: `[VueMixin] Plug in conflict [${item.name}]` })
        }
      }
      this.mixins[item.name] = Object.assign(item.install(this))
      if (utils.isObject(item.store)) {
        this.createStore(item.name, item.store)
      }
    })
  }
  createStore (name, store) { // 创建仓库
    _Vue.set(this.store, name, store)
  }
  destroyed () { // 销毁程序，释放内存
    this.plugins.forEach((item) => { // 销毁插件
      if (typeof item.destroyed === 'function') {
        item.destroyed()
      }
    })
    this.vm.destroyed() // 销毁vm
  }
}
