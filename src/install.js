export let _Vue

export default function install (Vue) {
  if (install.installed) return
  install.installed = true
  _Vue = Vue
}
