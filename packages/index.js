import Vue from 'vue'

const install = function (Vue) {
    if (install.installed) return
    components.forEach((component) => {
        Vue.component(component.name, component)
    })
}