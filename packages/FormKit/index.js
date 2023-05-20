import FormKit from './src/index';

FormKit.install = function(Vue) {
  Vue.component(FormKit.name, FormKit);
};

export default FormKit;
