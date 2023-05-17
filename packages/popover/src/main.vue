<template>
  <span>
    <transition :name="transition" @after-leave="doDestroy">
      <div
        :role="role"
        aria-live="polite"
        :aria-labelledby="ariaLabelledby"
        class="el-popover"
        :class="[popperClass,effect?'is-'+effect:'']"
        ref="popper"
        :id="popoverId"
        v-show="!disabled && showPopper"
        :style="{ width: width + 'px' }"
      >
        <div class="el-popover__title" v-if="title" v-text="title"></div>
        <span>
          <slot>{{ content }}</slot>
        </span>
      </div>
    </transition>
    <slot name="reference"></slot>
  </span>
</template>

<script>
import Popper from '../../../src/utils/vue-popper';
import { on, off } from '../../../src/utils/dom';
import { KEY_CODES } from '../../date-picker/src/util';
import { getFocusableItems } from '../../../src/utils/accessibility';
export default {
  name: 'ElPopover',

  mixins: [Popper],
  props: {
    role: {
      type: String,
      default: 'region'
    },
    ariaLabelledby: {
      type: String
    },
    trigger: {
      type: String,
      default: 'click',
      validator: value => ['click', 'focus', 'hover', 'manual'].indexOf(value) > -1
    },
    openDelay: {
      type: Number,
      default: 0
    },
    title: String,
    disabled: Boolean,
    content: String,
    id: String,
    reference: {},
    popperClass: String,
    width: {},
    effect: {
      type: String,
      default: ''
    },
    visibleArrow: {
      default: true
    },
    transition: {
      type: String,
      default: 'fade-in-linear'
    },
    focusSelector: '',

    appendToBody: {
      type: Boolean,
      default: false
    },
    focusCyle: {
      type: Boolean,
      default: false
    },
    tabClose: {
      type: Boolean,
      default: true
    },
    needAriaExpanded: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return { popoverId: this.id || `popover_content_${Math.floor(Math.random() * 1000)}_${Math.floor(Math.random() * 1000)}` };
  },

  watch: {
    showPopper(newVal, oldVal) {
      this.updateArai(newVal);
      newVal ? this.$emit('show') : this.$emit('hide');
      if (newVal) {
        if (this.focusCyle || this.focusSelector) {
          this.focusFirstItem();
        }
      } else if (!newVal && this.trigger === 'click') {
        // focus on next pop
        this.$nextTick(() => {
          this.referenceElm.focus();
        });
      }
    }
  },

  mounted() {
    let reference = this.reference || this.$refs.reference;
    const popper = this.popper || this.$refs.popper;

    if (!reference && this.$slots.reference && this.$slots.reference[0]) {
      reference = this.referenceElm = this.$slots.reference[0].elm;
    }
    if (this.trigger === 'click') {
      on(reference, 'click', this.doToggle);
      on(document, 'click', this.handleDocumentClick);
      // on(reference, 'blur', this.doCloseBlur);
    } else if (this.trigger === 'hover') {
      on(reference, 'mouseenter', this.handleMouseEnter);
      on(popper, 'mouseenter', this.handleMouseEnter);
      on(reference, 'mouseleave', this.handleMouseLeave);
      on(popper, 'mouseleave', this.handleMouseLeave);
      on(reference, 'click', this.doToggle);
      on(document, 'click', this.handleDocumentClick);

    } else if (this.trigger === 'focus') {
      let found = false;

      if ([].slice.call(reference.children).length) {
        const children = reference.childNodes;
        const len = children.length;
        for (let i = 0; i < len; i++) {
          if (children[i].nodeName === 'INPUT' ||
              children[i].nodeName === 'TEXTAREA') {
            on(children[i], 'focus', this.doShow);
            on(children[i], 'blur', this.doClose);
            found = true;
            break;
          }
        }
      }
      if (found) return;
      if (reference.nodeName === 'INPUT' ||
        reference.nodeName === 'TEXTAREA') {
        on(reference, 'focus', this.doShow);
        on(reference, 'blur', this.doClose);
      } else {
        on(reference, 'mousedown', this.doShow);
        on(reference, 'mouseup', this.doClose);
        // on(reference, 'keydown', this.handleTriggerKeyDown)
        // on(reference, 'keyup', this.handleTriggerKeyUp)
      }
    }
    this.handleAccessbility(reference, popper);
  },

  methods: {
    handleAccessbility(reference, popover) {
      const that = this;
      let items = getFocusableItems(popover);
      items.forEach((item)=>{
        if (item.parentNode.classList.contains('disabled')) {
          item.setAttribute('tabindex', -1);
        }
        if (item.getAttribute('autofocus') === 'autofocus') {
          item.focus();
          return false;
        }
      });
      this._handleTabOut = (e)=> {
        items = getFocusableItems(popover);
        let ref = that.referenceElm;
        if (e.keyCode === KEY_CODES.TAB) {
          if (e.target === items[items.length - 1] && items.length - 1 !== 0) {
            if (!e.shiftKey) {
              if (this.focusCyle) {
                e.preventDefault();
                items[0].focus();
                return;
              }
              if (this.tabClose) {
                if (ref) {
                  e.preventDefault();
                  ref.focus();
                }
                that.doClose();
              }
            }
          } else if (e.target === items[0]) {
            if (e.shiftKey) {
              if (this.focusCyle) {
                e.preventDefault();
                items[items - 1].focus();
                return;
              }
              if (this.tabClose) {
                if (ref) {
                  e.preventDefault();
                  ref.focus();
                }
                that.doClose();
              }
            } else {
              if (items.length === 1) {
                if (this.tabClose) {
                  if (ref) {
                    ref.focus();
                  }
                  e.preventDefault();
                  that.doClose();
                }
              }
            }
          }
        } else if (e.keyCode === KEY_CODES.ESC) {
          that.doClose();
        }
      };
      this._handleTriggerKeyDown = (e) => {
        items = getFocusableItems(popover);

        if (e.target === that.referenceElm) {
          if (e.keyCode === KEY_CODES.ENTER || e.keyCode === KEY_CODES.SPACE) {
            e.preventDefault();
            if (that.trigger === 'hover') {
              that.keyEventOccurred = true;
              setTimeout(() => {
                that.keyEventOccurred = false;
              }, 10);
            }
            that.doToggle(e);
          }
          if (e.keyCode === KEY_CODES.ESC) {
            that.doClose(e);
          }
          if (e.keyCode === KEY_CODES.TAB) {
            if (e.shiftKey) {
              that.doClose(e);
            } else {
              if (items.length === 0) {
                that.doClose(e);
              } else {
                if (that.showPopper) {
                  e.preventDefault();
                  that.focusFirstItem();
                }
              }
            }
          }
          if (e.keyCode === KEY_CODES.DOWN) {
            e.preventDefault();
            if (items.length) {
              setTimeout(()=>{
                that.focusFirstItem();
              }, 10);
            }
          }
        }
      };
      on(popover, 'keydown', this._handleTabOut);
      if (that.reference || that.referenceElm) {
        on(reference, 'keydown', this._handleTriggerKeyDown);
      } else if (that.$refs.reference) {
        on(that.$refs.reference, 'keydown', this._handleTriggerKeyDown);
      }
    },
    handleTriggerKeyDown(e) {
      if (e.keyCode === KEY_CODES.TAB) {
        this.doClose();
      }
    },
    focusFirstItem() {
      const item = this.getFirstItem();
      if (item) {
        this.$nextTick(() => {
          item.focus();
        });
      }
    },
    getFirstItem() {
      const items = this.getItems();
      let focusItem = items[0];
      items.forEach((el) => {
        if (el.getAttribute('autofocus') === 'autofocus') {
          focusItem = el;
        }
      });
      return focusItem;
    },
    getItems() {
      const popper = this.$refs.popper || this.popper;
      if (popper) {
        return getFocusableItems(popper);
      }
      return [];
    },
    doToggle(e) {
      e.stopPropagation();
      if (this.trigger === 'hover') {
        if (e instanceof KeyboardEvent) {
          this.showPopper = !this.showPopper;
        } else if (!this.keyEventOccurred)  {
          // Only triggered by prress event
          this.showPopper = !this.showPopper;
        }
      } else {
        this.showPopper = !this.showPopper;
      }

    },
    doShow() {
      this.showPopper = true;
    },
    doClose() {
      console.debug('close');
      this.showPopper = false;
    },
    doCloseBlur() {
      if (this.showPopper == true && !this.focusSelector) {
        this.showPopper = false;
      }
    },
    handleMouseEnter() {
      clearTimeout(this._timer);
      if (this.openDelay) {
        this._timer = setTimeout(() => {
          this.showPopper = true;
        }, this.openDelay);
      } else {
        this.showPopper = true;
      }
    },
    handleMouseLeave() {
      this._timer = setTimeout(() => {
        this.showPopper = false;
      }, 200);
    },
    handleDocumentClick(e) {
      let reference = this.reference || this.$refs.reference;
      const popper = this.popper || this.$refs.popper;

      if (!reference && this.$slots.reference && this.$slots.reference[0]) {
        reference = this.referenceElm = this.$slots.reference[0].elm;
      }
      if (!this.$el ||
        !reference ||
        this.$el.contains(e.target) ||
        reference.contains(e.target) ||
        !popper ||
        popper.contains(e.target)) return;
      this.showPopper = false;
    },
    updateArai(value) {
      let popper = this.popper || this.$refs.popper;
      let reference = this.reference || this.$refs.reference;
      let popoverId = '';
      if (popper) {
        popoverId = popper.getAttribute('id');
        popper.setAttribute('aria-hidden', !value);
      }
      if (!reference && this.$slots.reference && this.$slots.reference[0]) {
        reference = this.referenceElm = this.$slots.reference[0].elm;
      }

      if (reference) {
        if(this.needAriaExpanded){
          reference.setAttribute('aria-expanded', value);
        }
        if (value) {
          reference.setAttribute('aria-describedby', popoverId);
        } else {
          reference.removeAttribute('aria-describedby');
        }
      }
    }
  },
  destroyed() {
    const reference = this.reference;
    const popper = this.popper || this.$refs.popper;

    off(reference, 'click', this.doToggle);
    off(reference, 'mouseup', this.doClose);
    off(reference, 'mousedown', this.doShow);
    off(reference, 'focus', this.doShow);
    off(reference, 'blur', this.doClose);
    off(reference, 'mouseleave', this.handleMouseLeave);
    off(reference, 'mouseenter', this.handleMouseEnter);
    off(document, 'click', this.handleDocumentClick);

    if (this._handleTriggerKeyDown) {
      off(popper, 'keydown', this._handleTabOut);
      off(reference, 'keydown', this._handleTriggerKeyDown);
    }
  }
};
</script>