export const componentsList = {
  checkbox: () => import(`./modules/checkbox.vue`),
  customize: () => import(`./modules/customize.vue`),
  datetimerange: () => import(`./modules/datetimerange.vue`),
  inputNumber: () => import(`./modules/inputNumber.vue`),
  multipleImgUpload: () => import(`./modules/multipleImgUpload.vue`),
  radio: () => import(`./modules/radio.vue`),
  select: () => import(`./modules/select.vue`),
  singleImageUpload: () => import(`./modules/singleImageUpload.vue`)
}

const components = Object.keys(componentsList)

export default [
  'input',
  ...components
]
