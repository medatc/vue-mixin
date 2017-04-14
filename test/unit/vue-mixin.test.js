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
    chai.expect(vmn).to.be.an('object')
    chai.expect(vmn.mixins).to.be.an('object')
    chai.expect(vmn.store).to.be.an('object')
    chai.expect(vmn.vm).to.be.an('object')
    chai.expect(vmn.plugins).to.be.an('array')
  })
})
