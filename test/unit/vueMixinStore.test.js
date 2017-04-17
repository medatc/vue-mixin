// import utils from 'utils'
import VueMixin, { vueMixinStore } from 'vue-mixin'

const { Vue, describe, it, chai } = window
const { expect } = chai

Vue.use(VueMixin)

describe('vueMixinStore', () => {
  describe('update', () => {
    const { store } = new VueMixin({
      plugins: [
        vueMixinStore({
          user () {
            return new Promise((resolve, reject) => {
              setTimeout(() => {
                resolve({
                  id: 1000,
                  age: 18,
                  name: '人民的名义'
                })
              }, 200)
            })
          }
        })
      ]
    }).mixins
    Object.assign(store, {
      data () {
        return {
          user: {}
        }
      },
      render (h) {
        return h('div')
      }
    })
    it('fetch data', () => {
      return new Promise((resolve, reject) => {
        const Constructor = Vue.extend(store)
        const vm = new Constructor().$mount()
        vm.$watch('user', (newVal, oldVal) => {
          expect(newVal.id).to.be.equal(1000)
          vm.$destroy()
          resolve()
        })
      })
    })
    it('fetch update data', () => {
      return new Promise((resolve, reject) => {
        const Constructor = Vue.extend(store)
        const vm = new Constructor().$mount()
        vm.$watch('user', (newVal, oldVal) => {
          expect(newVal.id).to.be.equal(oldVal.id)
          vm.$destroy()
          resolve()
        })
      })
    })
  })
  describe('disable update', () => {
    const { store } = new VueMixin({
      plugins: [
        vueMixinStore({
          user: {
            update: false,
            fetch () {
              return new Promise((resolve, reject) => {
                setTimeout(() => {
                  resolve({
                    id: 1000,
                    age: 18,
                    name: '人民的名义'
                  })
                }, 200)
              })
            }
          }
        })
      ]
    }).mixins
    Object.assign(store, {
      data () {
        return {
          user: {}
        }
      },
      render (h) {
        return h('div')
      }
    })
    it('fetch data', () => {
      return new Promise((resolve, reject) => {
        const Constructor = Vue.extend(store)
        const vm = new Constructor().$mount()
        vm.$watch('user', (newVal, oldVal) => {
          expect(newVal.id).to.be.equal(1000)
          vm.$destroy()
          resolve()
        })
      })
    })
    it('fetch update data', () => {
      return new Promise((resolve, reject) => {
        const Constructor = Vue.extend(store)
        const vm = new Constructor().$mount()
        vm.$watch('user', (newVal, oldVal) => {
          vm.$destroy()
          reject(new Error({ msg: 'update is expected to be prohibited' }))
        })
        setTimeout(() => {
          vm.$destroy()
          resolve()
        }, 300)
      })
    })
  })
})
