import install from './install'
import VueMixin from './vueMixin'
export { default as vueMixinFetchDetail } from './vueMixinFetchDetail'
export { default as vueMixinFetchList } from './vueMixinFetchList'
export { default as vueMixinStore } from './vueMixinStore'

export default VueMixin

VueMixin.install = install
