// import utils from 'utils'
import VueMixin from 'vue-mixin'

const { Vue, describe, it, chai } = window
const { expect } = chai

Vue.use(VueMixin)

describe('vue-mixin', () => {
  it('install', () => {
    chai.expect(VueMixin.install.installed).to.be.equal(true)
  })
  it('new no options', () => {
    const vmn = new VueMixin()
    const name = 'test'
    const store = {}
    // Test data type
    expect(vmn).to.be.an('object')
    expect(vmn.mixins).to.be.an('object')
    expect(vmn.store).to.be.an('object')
    expect(vmn.vm).to.be.an('object')
    expect(vmn.plugins).to.be.an('array')
    // Test createStore mothod
    vmn.createStore(name, store)
    expect(vmn.store[name]).to.be.equal(store)
    vmn.destroy()
  })
  it('my plugin', () => {
    const opt = { state: 0 }
    const name = 'test'
    const mixins = {
      render (h) {
        return h('div', 'ok')
      }
    }
    const store = {}
    const vmn = new VueMixin({
      plugins: [{
        name, // The plugins name
        store,
        install (vueMixin) {
          setTimeout(() => {
            expect(vueMixin).to.be.equal(vmn)
          }, 0)
          opt.state = 1
          return mixins
        },
        destroy (vueMixin) {
          expect(vueMixin).to.be.equal(vmn)
          opt.state = 2
        }
      }]
    })
    // Test plugin expected value
    expect(opt.state).to.be.equal(1)
    expect(vmn.mixins[name]).to.be.equal(mixins)
    expect(vmn.store[name]).to.be.equal(store)
    // Test mixins call
    const Constructor = Vue.extend(vmn.mixins[name])
    const vm = new Constructor().$mount()
    expect(vm.$el.innerHTML).to.be.equal('ok')
    // Test plugin destroy
    vmn.destroy()
    expect(opt.state).to.be.equal(2)
  })
})
