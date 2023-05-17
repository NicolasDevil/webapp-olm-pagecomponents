import Expand from './src/main';

/* istanbul ignore next */
Expand.install = function(Vue) {
  Vue.component(Expand.name, Expand);
};

export default Expand;
