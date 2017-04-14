// import utils from 'utils'
import VueMixin from 'vue-mixin'

const { Vue, describe, it, chai } = window

Vue.use(VueMixin)

describe('vue-mixin', () => {
  it('install', () => {
    chai.expect(VueMixin.install.installed).to.be.equal(true)
  })
  it('NEW no options', () => {
    const vmn = new VueMixin()
    const name = 'test'
    const store = {}
    chai.expect(vmn).to.be.an('object')
    chai.expect(vmn.mixins).to.be.an('object')
    chai.expect(vmn.store).to.be.an('object')
    chai.expect(vmn.vm).to.be.an('object')
    chai.expect(vmn.plugins).to.be.an('array')
    vmn.createStore(name, store)
    chai.expect(vmn.store[name]).to.be.equal(store)
    vmn.destroy()
  })
  it('My plugin', () => {
    const opt = { state: 0 }
    const name = 'test'
    const mixins = {}
    const store = {}
    const vmn = new VueMixin({
      plugins: [{
        name, // the plugins name
        store,
        install () {
          opt.state = 1
          return mixins
        },
        destroy () {
          opt.state = 2
        }
      }]
    })
    chai.expect(opt.state).to.be.equal(1)
    chai.expect(vmn.mixins[name]).to.be.equal(mixins)
    chai.expect(vmn.store[name]).to.be.equal(store)
    vmn.destroy()
    chai.expect(opt.state).to.be.equal(2)
  })
})
