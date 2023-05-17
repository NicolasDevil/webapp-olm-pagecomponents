/**
 * Created by duanrunru on 23/10/17.
 */
import InlineMessage from '../message/src/inline-message.vue';

/* istanbul ignore next */
InlineMessage.install = function(Vue) {
  Vue.component(InlineMessage.name, InlineMessage);
};

export default InlineMessage;
