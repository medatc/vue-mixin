export default {
  isObject (obj) {
    return Object.prototype.toString.call(obj) === '[object Object]'
  },
  isArray (arr) {
    return Object.prototype.toString.call(arr) === '[object Array]'
  },
  isHas (obj, k) {
    return Object.prototype.hasOwnProperty.call(obj, k)
  },
  createComputed (store) {
    const computed = {}
    Object.keys(store).forEach((k) => {
      computed[k] = {
        get () {
          return store[k]
        },
        set (v) {
          store[k] = v
        }
      }
    })
    return computed
  }
}
