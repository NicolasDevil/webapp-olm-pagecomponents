import Popper from '../../../src/utils/vue-popper';
import debounce from 'throttle-debounce/debounce';
import { getFirstComponentChild } from '../../../src/utils/vdom';
import Vue from 'vue';

let count = 0;

export default {
  name: 'ElTooltip',

  mixins: [Popper],

  props: {
    openDelay: {
      type: Number,
      default: 0
    },
    alwaysShow:Boolean,
    disabled: Boolean,
    manual: Boolean,
    effect: {
      type: String,
      default: 'dark'
    },
    popperClass: String,
    content: String,
    visibleArrow: {
      default: true
    },
    transition: {
      type: String,
      default: 'el-fade-in-linear'
    },
    popperOptions: {
      default() {
        return {
          boundariesPadding: 10,
          gpuAcceleration: false
        };
      }
    },
    enterable: {
      type: Boolean,
      default: true
    },
    role: String
  },

  beforeCreate() {
    if (this.$isServer) return;

    this.popperVM = new Vue({
      data: { node: '' },
      render(h) {
        return this.node;
      }
    }).$mount();

    this.debounceClose = debounce(200, () => this.handleClosePopper());
  },

  render(h) {
    if (this.popperVM) {
      this.popperVM.node = (
        <transition
          name={ this.transition }
          onAfterLeave={ this.doDestroy }>
          <div
            onMouseleave={ () => { this.setExpectedState(false); this.debounceClose(); } }
            onMouseenter= { () => { this.setExpectedState(true); } }
            ref="popper"
            aria-live="polite"
            v-show={!this.disabled && this.showPopper}
            class={
              ['el-tooltip__popper', 'is-' + this.effect, this.popperClass]
            }>
            { this.$slots.content || this.content }
          </div>
        </transition>);
    }

    if (!this.$slots.default || !this.$slots.default.length) return this.$slots.default;

    const vnode = getFirstComponentChild(this.$slots.default);
    if (!vnode) return vnode;
    const data = vnode.data = vnode.data || {};
    const on = vnode.data.on = vnode.data.on || {};
    on.keydown = this.addEventHandle(on.keydown, (e) => {
      if (e.keyCode === 13 || e.keyCode === 32) {
        e.stopPropagation();
        this.keyEventOccurred = true;
        setTimeout(() => {
          this.keyEventOccurred = false;
        }, 10)
        this.togglePopper(e);
      } else if (e.keyCode === 27) {
        e.stopPropagation();
        this.showPopper = false;
      }
    });
    on.click = this.addEventHandle(on.click, (e) => {
      e.stopPropagation();
      if (!this.keyEventOccurred)  {
        // Jaws triger the event by click
        this.togglePopper(e);
      }
    });

    on.blur = this.addEventHandle(on.blur, (e) => {
      this.setExpectedState(false);
      this.debounceClose();
    });

    on.mouseenter = this.addEventHandle(on.mouseenter, () => {
      this.setExpectedState(true);
      this.handleShowPopper();
    });
    on.mouseleave = this.addEventHandle(on.mouseleave, () => {
      this.setExpectedState(false);
      this.debounceClose();
    });
    data.staticClass = this.concatClass(data.staticClass, 'el-tooltip');

    return vnode;
  },

  mounted() {
    this.referenceElm = this.$el;
    if(this.alwaysShow){
      this.$nextTick(()=>{
        this.setExpectedState(true);
        this.handleShowPopper();
      })
    }
  },

  methods: {
    addEventHandle(old, fn) {
      return old ? Array.isArray(old) ? old.concat(fn) : [old, fn] : fn;
    },

    concatClass(a, b) {
      if (a && a.indexOf(b) > -1) return a;
      return a ? b ? (a + ' ' + b) : a : (b || '');
    },

    handleShowPopper() {
      if (!this.expectedState || this.manual) return;
      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => {
        this.showPopper = true;
      }, this.openDelay);
    },

    handleClosePopper() {
      if (this.enterable && this.expectedState || this.manual) return;
      clearTimeout(this.timeout);
      if(!this.alwaysShow) {
        this.showPopper = false;
      }
    },

    togglePopper (e) {
      this.setExpectedState(!this.showPopper);
      this.showPopper ? this.handleClosePopper() : this.handleShowPopper();
    },

    setExpectedState(expectedState) {
      if(this.alwaysShow &&!expectedState){
        return;
      }
      this.expectedState = expectedState;
    },
    updatePopper () {
      this.popperJS ? this.popperJS.update() : this.createTooltipPopper();
    },
    createTooltipPopper () {
      this.createPopper();
      this.tooltipsId = `tolltip-content-${count++}`;
      // this.$el.setAttribute('aria-labelledby', this.tooltipsId);
      if (this.popperVM.$el.setAttribute) {
        this.popperVM.$el.setAttribute('id', this.tooltipsId);
        this.popperVM.$el.setAttribute('role', this.role || 'region');
        this.popperVM.$el.setAttribute('aria-live', 'polite');
      }
      this.updateAria(this.alwaysShow || this.showPopper);
    },
    updateAria(value) {
      if (this.$el) {
        this.$el.setAttribute('aria-expanded', value);
        if (value) {
          this.$el.setAttribute('aria-describedby', this.tooltipsId);
        } else {
          this.$el.removeAttribute('aria-describedby');
        }
      }
    }
  },
  watch: {
    showPopper: { handler: 'updateAria' }
  }
};
