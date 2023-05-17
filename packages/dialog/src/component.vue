<template>
  <transition name="dialog-fade">
    <div role="dialog" :aria-label="title" class="el-dialog__wrapper" v-show="visible" @click.self="handleWrapperClick" @keydown="handleKeyDown">
      <div
        class="el-dialog"
        :class="[sizeClass, customClass]"
        ref="dialog"
        :style="style">
        <div class="el-dialog__textarea">
            <div class="el-dialog__header">
              <slot name="title">
                <h2 class="el-dialog__title">{{title}}</h2>
              </slot>
            </div>
        <div class="el-dialog__body" v-if="rendered"><slot></slot></div>
        </div>
        <div class="el-dialog__footer" v-if="$slots.footer">
          <slot name="footer"></slot>
        </div>
        <button type="button" class="el-dialog__headerbtn" :aria-label="t('el.dialog.close')" ref="close"
                v-if="showClose" @click="handleClose">
          <i class="el-dialog__close icon-exit"></i>
        </button>
      </div>
    </div>
  </transition>
</template>

<script>
  import Popup from '../../../src/utils/popup';
  import emitter from '../../../src/mixins/emitter';
  import Locale from '../../../src/mixins/locale';
  import {getFocusableItems} from "../../../src/utils/accessibility";

  export default {
    name: 'ElDialog',
    mixins: [Popup, emitter, Locale],
    props: {
      title: {
        type: String,
        default: ''
      },

      modal: {
        type: Boolean,
        default: true
      },

      modalAppendToBody: {
        type: Boolean,
        default: true
      },
      appendToBody: {
        type: Boolean,
        default: false
      },
      lockScroll: {
        type: Boolean,
        default: true
      },

      closeOnClickModal: {
        type: Boolean,
        default: true
      },

      closeOnPressEscape: {
        type: Boolean,
        default: true
      },

      showClose: {
        type: Boolean,
        default: true
      },

      size: {
        type: String,
        default: 'small'
      },

      customClass: {
        type: String,
        default: ''
      },

      top: {
        type: String,
        default: '15%'
      },
      beforeClose: Function,
      focusOnOpen: {
        type: String,
        default: ''
      },
      focusOnClose: {
        type: String,
        default: ''
      },
    },
    watch: {
      visible(val) {
        this.$emit('update:visible', val);
        if (val) {
          this.$emit('open');
          this.$el.addEventListener('scroll', this.updatePopper);
          this.$nextTick(() => {
            this.$refs.dialog.scrollTop = 0;
            if (this.focusOnOpen) {
                this.focusElement(this.focusOnOpen,false,true);
            }else {
              this.focusElement(this.$refs.close);
            }
          });
          if (this.appendToBody) {
            document.body.appendChild(this.$el);
          }
        } else {
          this.$el.removeEventListener('scroll', this.updatePopper);
          this.$emit('close');
          this.focusElement(this.focusOnClose,true);
        }
      }
    },
    computed: {
      sizeClass() {
        return `el-dialog--${ this.size }`;
      },
      style() {
        return this.size === 'full' ? {} : { 'top': this.top };
      }
    },
    methods: {

      handleKeyDown(e) {
        e.stopPropagation();
        let footer = this.$slots.footer || this.$slots.default;
        if (e.keyCode == 27) {
          this.handleClose();
          return;
        }
        let items = getFocusableItems(this.$el);
        let first = items[0];
        let latest = items[items.length-1]

        if(e.shiftKey){
          if( e.keyCode == 9 && e.target == first){
            e.preventDefault();
            latest.focus();
          }
        }else{
          if (latest && e.target === latest && e.keyCode == 9) {
            e.preventDefault();
            first.focus();
          }
        }
      },
      handleWrapperClick() {
        if (!this.closeOnClickModal) return;
        this.handleClose();
      },
      handleClose() {
        if (typeof this.beforeClose === 'function') {
          this.beforeClose(this.hide);
        } else {
          this.hide();
        }
      },
      hide(cancel) {
        if (cancel !== false) {
          this.$emit('update:visible', false);
          this.$emit('visible-change', false);
        }
      },
      updatePopper() {
        this.broadcast('ElSelectDropdown', 'updatePopper');
        this.broadcast('ElDropdownMenu', 'updatePopper');
      },
      getFocusElement(selector){
        let box = this.$slots.footer ;
        function getCanFocusEl(box,selector){
          let els = box.querySelectorAll(selector);
          let n = els.length-1;
          let i =0;
          let first = els[0];
          while (first && first.disabled && i <= n){
            i++;
            first = els[n];
          }
          return first;
        }
        let first ;
        if(box && box.length) {
          first = getCanFocusEl(box[0].elm, selector);
        }
        if(!first){
          first = getCanFocusEl(this.$slots.default[0].elm,selector)
        }
       return first;
      },
      focusElement(el,searchInBody,timeout) {
        let ele;
        if (!el) {
          return;
        }
        if(typeof(el) === 'string'){
          var container = this.$el;
          if(searchInBody){
            container = document.body;
            ele = container.querySelector(el);
          }else{
            ele = this.getFocusElement(el)
          }

          if(!ele){
            return;
          }
        }else{
          ele = el;
        }
        if(timeout){
          setTimeout(function () {
            ele.focus()
          },500);
        }
        ele.focus();
      }
    },
    mounted() {
      if (this.appendToBody && this.$el) {
        document.body.appendChild(this.$el);
      }
      if (this.visible) {
        this.rendered = true;
        this.open();
      }
    },

    destroyed() {
      // if appendToBody is true, remove DOM node after destroy
      if (this.appendToBody && this.$el && this.$el.parentNode) {
        this.$el.parentNode.removeChild(this.$el);
      }
    }
  };
</script>
