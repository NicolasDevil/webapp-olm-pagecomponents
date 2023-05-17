<template>
  <transition name="msgbox-fade">
    <div class="el-message-box__wrapper" tabindex="-1" v-show="visible" @click.self="handleWrapperClick">
      <div class="el-message-box" :class="customClass"  @keydown="handleKeyDown">
        <div class="el-message-box__header" v-if="title !== undefined">
          <h2 ref="title" class="el-message-box__title">{{ title || t('el.messagebox.title') }}</h2>
          <button ref="close" type="button" class="el-message-box__headerbtn" :aria-label="closeLabel"
                  v-if="showClose" @click="handleAction('cancel')">
            <i class="el-message-box__close icon-exit"></i>
          </button>
        </div>
        <div class="el-message-box__content" v-if="message !== ''">
          <div class="el-message-box__status" :class="[ typeClass ]"></div>
          <div class="el-message-box__message" :style="{ 'margin-left': typeClass ? '50px' : '0' }">
            <slot><p>{{ message }}</p></slot>
          </div>
          <div class="el-message-box__input" v-show="showInput">
            <el-input v-model="inputValue" @keyup.enter.native="handleAction('confirm')" :placeholder="inputPlaceholder" ref="input"></el-input>
            <div class="el-message-box__errormsg" :style="{ visibility: !!editorErrorMessage ? 'visible' : 'hidden' }">{{ editorErrorMessage }}</div>
          </div>
        </div>
        <div class="el-message-box__btns" ref="footer">
          <el-button
            :loading="cancelButtonLoading"
            :class="[ cancelButtonClasses ]"
            v-show="showCancelButton"
            @click.native="handleAction('cancel')">
            {{ cancelButtonText || t('el.messagebox.cancel') }}
          </el-button>
          <el-button
            :loading="confirmButtonLoading"
            ref="confirm"
            :class="[ confirmButtonClasses ]"
            v-show="showConfirmButton"
            @click.native="handleAction('confirm')" >
            {{ confirmButtonText || t('el.messagebox.confirm') }}
          </el-button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script type="text/babel">
  import Popup from '../../../src/utils/popup';
  import Locale from '../../../src/mixins/locale';
  import ElInput from '../../../packages/input';
  import ElButton from '../../../packages/button';
  import { addClass, removeClass } from '../../../src/utils/dom';
  import { t } from '../../../src/locale';

  let typeMap = {
    success: 'circle-check',
    info: 'information',
    warning: 'warning',
    error: 'circle-cross'
  };

  export default {
    mixins: [Popup, Locale],

    props: {
      modal: {
        default: true
      },
      lockScroll: {
        default: true
      },
      showClose: {
        type: Boolean,
        default: true
      },
      closeOnClickModal: {
        default: true
      },
      closeOnPressEscape: {
        default: true
      },
      focusOnOpen: {
        type: String,
        default: ''
      },
      focusOnClose: {
        type: String,
        default: ''
      }
    },
    components: {
      ElInput,
      ElButton
    },

    computed: {
      typeClass() {
        return this.type && typeMap[this.type] ? `el-icon-${ typeMap[this.type] }` : '';
      },

      confirmButtonClasses() {
        return `el-button--primary ${ this.confirmButtonClass }`;
      },
      cancelButtonClasses() {
        return `${ this.cancelButtonClass }`;
      }
    },

    methods: {
      handleKeyDown(e) {
        let footer = this.$el;
        e.stopPropagation();
        if (e.keyCode == 27 ){
          this.doClose();
          return;
        }
        if (footer) {
          let els = footer.querySelectorAll('button');
          let latest = els[els.length-1];
          let first = els[0];
          if(e.keyCode == 9){
            if (!e.shiftKey && e.target === latest) {
              e.preventDefault();
              e.stopPropagation();
              first.focus()
            } else if(e.shiftKey && e.target === first){
              e.preventDefault();
              e.stopPropagation();
              latest.focus()
            }
          }
        }
      },
      getSafeClose() {
        const currentId = this.uid;
        return () => {
          this.$nextTick(() => {
            if (currentId === this.uid) this.doClose();
          });
        };
      },
      doClose() {
        if (!this.visible) return;
        this.visible = false;
        this._closing = true;

        this.onClose && this.onClose();

        if (this.lockScroll) {
          setTimeout(() => {
            if (this.modal && this.bodyOverflow !== 'hidden') {
              document.body.style.overflow = this.bodyOverflow;
              document.body.style.paddingRight = this.bodyPaddingRight;
            }
            this.bodyOverflow = null;
            this.bodyPaddingRight = null;
          }, 200);
        }
        this.opened = false;
        if(this.focusOnClose){
          let ele;
          if(typeof(this.focusOnClose) === 'string'){
            let container = document.body;
            ele = container.querySelector(this.focusOnClose);
          }else{
            ele = this.focusOnClose;
          }
          this.$nextTick(()=>{
            ele && ele.focus()
          })

        }
        if (!this.transition) {
          this.doAfterClose();
        }
        if (this.action) this.callback(this.action, this);
      },

      handleWrapperClick() {
        if (this.closeOnClickModal) {
          this.handleAction('cancel');
        }
      },

      handleAction(action) {
        if (this.$type === 'prompt' && action === 'confirm' && !this.validate()) {
          return;
        }
        this.action = action;
        if (typeof this.beforeClose === 'function') {
          this.close = this.getSafeClose();
          this.beforeClose(action, this, this.close);
        } else {
          this.doClose();
        }
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
          }
          ele = container.querySelector(el);
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
        if(ele.className.indexOf('el-button') >=0){
          ele.classList.add('border');
        }
      },

      validate() {
        if (this.$type === 'prompt') {
          var inputPattern = this.inputPattern;
          if (inputPattern && !inputPattern.test(this.inputValue || '')) {
            this.editorErrorMessage = this.inputErrorMessage || t('el.messagebox.error');
            addClass(this.$refs.input.$el.querySelector('input'), 'invalid');
            return false;
          }
          var inputValidator = this.inputValidator;
          if (typeof inputValidator === 'function') {
            var validateResult = inputValidator(this.inputValue);
            if (validateResult === false) {
              this.editorErrorMessage = this.inputErrorMessage || t('el.messagebox.error');
              addClass(this.$refs.input.$el.querySelector('input'), 'invalid');
              return false;
            }
            if (typeof validateResult === 'string') {
              this.editorErrorMessage = validateResult;
              return false;
            }
          }
        }
        this.editorErrorMessage = '';
        removeClass(this.$refs.input.$el.querySelector('input'), 'invalid');
        return true;
      }
    },

    watch: {
      inputValue: {
        immediate: true,
        handler(val) {
          this.$nextTick(_ => {
            if (this.$type === 'prompt' && val !== null) {
              this.validate();
            }
          });
        }
      },

      visible(val) {
        if (val) this.uid++;
        if(val) {
          if (this.$type === 'alert' || this.$type === 'confirm' || !this.$type) {
            this.$nextTick(() => {
              if (this.focusOnOpen) {
                this.focusElement(this.focusOnOpen, false, false);
              } else {
                let el = this.$refs.confirm.$el;
                setTimeout(()=> {el.focus()}, 300);
                el.focus();
                el.classList.add('border');
              }
            });
          }
        }
        if (this.$type !== 'prompt') return;
        if (val) {
          setTimeout(() => {
            if (this.$refs.input && this.$refs.input.$el) {
              this.$refs.input.$el.querySelector('input').focus();
            }
          }, 500);
        } else {
          this.editorErrorMessage = '';
          removeClass(this.$refs.input.$el.querySelector('input'), 'invalid');
        }
      }

    },

    data() {
      return {
        uid: 1,
        title: undefined,
        message: '',
        type: '',
        customClass: '',
        showInput: false,
        inputValue: null,
        inputPlaceholder: '',
        inputPattern: null,
        inputValidator: null,
        inputErrorMessage: '',
        showConfirmButton: true,
        showCancelButton: false,
        action: '',
        confirmButtonText: '',
        cancelButtonText: '',
        confirmButtonLoading: false,
        cancelButtonLoading: false,
        confirmButtonClass: '',
        confirmButtonDisabled: false,
        cancelButtonClass: '',
        editorErrorMessage: null,
        callback: null,
        closeLabel: t('message.button.close') || 'Close'
      };
    }
  };
</script>
