<template>
  <div :class="[
    type === 'textarea' ? 'el-textarea' : 'el-input',
    size ? 'el-input--' + size : '',
    {
      'is-disabled': disabled,
      'el-input-group': $slots.prepend || $slots.append,
      'el-input-group--append': $slots.append,
      'el-input-group--prepend': $slots.prepend,
      'show-prefix-icon':showPrefixIcon,
      'input-placeholder':!isFocus && !value
    }
  ]">
    <template v-if="type !== 'textarea'">
      <!-- 前置元素 -->
      <div class="el-input-group__prepend" v-if="$slots.prepend">
        <slot name="prepend"></slot>
      </div>
      <div class="el-input-group__prepend" v-if="showPrefixIcon">
        <i class="el-input__icon" :tabindex="disableFocusIcon?'-1':'0'"
           :class="[
            'icon-' + prefixIcon,
            disableFocusIcon ? 'disableFocusIcon' : ''
          ]"
        >
        </i>
      </div>
      <!-- input 图标 -->
      <input
        v-if="type !== 'textarea'"
        class="el-input__inner"
        :aria-required="isRequired"
        :aria-label="ariaLabelAttr"
        :aria-labelledby="ariaLabelledby"
        :aria-expanded="ariaHaspopup?String(ariaExpanded):ariaExpanded"
        :aria-haspopup="ariaHaspopup"
        :aria-describedby="ariaDescribedby"
        v-bind="filterProps"
        :autocomplete="autoComplete"
        :value="currentValue"
        :id="id"
        :role="role"
        ref="input"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
      >
      <slot name="enableClean" v-if="enableClean">
        <i class="el-input__icon" :role="iRole" tabindex="0" :aria-label="clearLabel || clear"
           :class="[
            'icon-exit-contain' ,
            onIconClick ? 'is-clickable' : ''
          ]"
           v-if="showCleanIcon"
           @keyup.enter.stop="handleCleanIconClick"
           @click="handleCleanIconClick">
        </i>
      </slot>
      <slot name="icon">
        <i class="el-input__icon" :tabindex="disableFocusIcon?'-1':'0'" :aria-label="iconDescription" :role="iRole"
           :class="[
            'icon-' + icon,
            onIconClick ? 'is-clickable' : '',
            disableFocusIcon ? 'disableFocusIcon' : ''
          ]"

           v-if="icon"
           @keydown="handleIconKeyDown"
           @click="handleIconClick">
        </i>
      </slot>
      <i class="el-input__icon el-icon-loading" v-if="validating"></i>
      <!-- 后置元素 -->
      <div class="el-input-group__append" v-if="$slots.append">
        <slot name="append"></slot>
      </div>
    </template>
    <textarea
      v-else
      class="el-textarea__inner"
      :value="currentValue"
      @input="handleInput"
      :aria-label="ariaLabelAttr"
      :aria-describedby="ariaDescribedby"
      ref="textarea"
      v-bind="$props"
      :aria-required="isRequired"
      :style="textareaStyle"
      :id="id"
      @focus="handleFocus"
      @blur="handleBlur">
    </textarea>
  </div>
</template>
<script>
  import emitter from '../../../src/mixins/emitter';
  import calcTextareaHeight from './calcTextareaHeight';
  import merge from '../../../src/utils/merge';
  import Locale from '../../../src/mixins/locale';
  import { randomId } from './util.js';
  export default {
    name: 'ElInput',

    componentName: 'ElInput',

    mixins: [emitter, Locale],

    data() {
      return {
        currentValue: this.value,
        textareaCalcStyle: {},
        isFocus: false,
        clear: this.t('message.common.clearInput') || 'Clear input',
        descById: randomId(),
        iRole: this.disableFocusIcon ? undefined : this.iconRole
      };
    },

    props: {
      value: [String, Number],
      placeholder: String,
      size: String,
      resize: String,
      id: String,
      iconRole: {
        type: String,
        default: 'button'
      },
      ariaHaspopup: [String, Boolean],
      ariaExpanded: Boolean,
      ariaDescribedby: String,
      readonly: Boolean,
      autofocus: Boolean,
      enableClean: {
        type: Boolean,
        default: false
      },
      ariaRequired: {
        type: Boolean
      },
      required: {
        type: Boolean
      },
      disableFocusIcon: {
        type: Boolean,
        default: false
      },
      prefixIcon: String,
      icon: String,
      iconDescription: String,
      disabled: Boolean,
      type: {
        type: String,
        default: 'text'
      },
      name: String,
      autosize: {
        type: [Boolean, Object],
        default: false
      },
      rows: {
        type: Number,
        default: 2
      },
      autoComplete: {
        type: String,
        default: 'off'
      },
      form: String,
      maxlength: Number,
      minlength: Number,
      max: {},
      min: {},
      step: {},
      validateEvent: {
        type: Boolean,
        default: true
      },
      onIconClick: Function,
      ariaLabel: String,
      debounce: {
        type: Number,
        default: 0
      },
      focusIcon: {
        type: Boolean,
        default: true
      },
      ariaLabelledby: {
        type: String
      },
      role: String,
      clearLabel: String
    },

    computed: {
      filterProps() {
        let keys = Object.keys(this.$props);
        let props = {};
        keys.filter((key) => {
          return key.indexOf('aria') < 0 && key.indexOf('ole') < 0;
        }).forEach((key)=>{
          props[key] = this.$props[key];
        });
        return props;
      },
      validating() {
        return this.$parent.validateState === 'validating';
      },
      textareaStyle() {
        return merge({}, this.textareaCalcStyle, { resize: this.resize });
      },
      ariaLabelAttr() {
        return this.ariaLabel || (this.ariaLabelledby ? null : this.placeholder) ;
      },
      showPrefixIcon() {
        return this.prefixIcon;
      },
      showCleanIcon() {
        return this.enableClean && this.currentValue && this.currentValue.length > 0;
      },
      isRequired() {
        if (this.$parent && this.$parent.isRequired !== undefined) {
          return this.$parent.isRequired;
        }
        if (this.required !== undefined) {
          return this.required;
        }
        if (this.ariaRequired !== undefined) {
          return this.ariaRequired;
        }
        return undefined;
      }
    },

    watch: {
      'value'(val, oldValue) {
        this.setCurrentValue(val);
      }
    },

    methods: {
      handleBlur(event) {
        if (this.changeTimer && this.__handleInput){
          this.__handleInput();
          clearTimeout(this.changeTimer);
        }
        this.$emit('blur', event);
        this.isFocus = false;
        if (this.validateEvent) {
          this.dispatch('ElFormItem', 'el.form.blur', [this.currentValue]);
        }
      },
      inputSelect() {
        this.$refs.input.select();
      },
      resizeTextarea() {
        if (this.$isServer) return;
        var { autosize, type } = this;
        if (!autosize || type !== 'textarea') return;
        const minRows = autosize.minRows;
        const maxRows = autosize.maxRows;

        this.textareaCalcStyle = calcTextareaHeight(this.$refs.textarea, minRows, maxRows);
      },
      handleFocus(event) {
        this.$emit('focus', event);
        this.isFocus = true;
      },
      handleInput(event) {
        let processInput = (event) =>{
          return ()=> {
            this.__handleInput = null;
            const value = event.target.value;
            this.$emit('input', value);
            this.setCurrentValue(value);
            this.$emit('change', value);
            // wbx add begin
          };
        };
        if (!this.debounce) {
          processInput(event)();
          return;
        }
        if (this.changeTimer) {
          clearTimeout(this.changeTimer);
          this.changeTimer = 0;
        }
        this.__handleInput = processInput(event);
        this.changeTimer = setTimeout(this.__handleInput, 300);
      },
      handleCleanIconClick(event) {
        let value = '';
        this.$emit('input', value);
        this.setCurrentValue(value);
        this.$emit('change', value);
        this.$refs.input.focus();
      },
        // wbx add end
      handleIconKeyDown(event) {
        if (event.keyCode === 13) {
          this.handleIconClick(event);
        }
      },
      handleIconClick(event) {
        if (this.onIconClick) {
          this.onIconClick(event);
        }
        this.$emit('click', event);
      },
      setCurrentValue(value) {
        if (value === this.currentValue) return;
        this.$nextTick(_ => {
          this.resizeTextarea();
        });
        this.currentValue = value;
        if (this.validateEvent) {
          this.dispatch('ElFormItem', 'el.form.change', [value]);
        }
      }
    },
    created() {
      this.$on('inputSelect', this.inputSelect);
    },

    mounted() {
      this.resizeTextarea();
      if ((this.required || this.required === 'required') && this.$refs.input) {
        if (this.$refs.input) {
          this.$refs.input.removeAttribute('required');
        }
        if (this.$refs.textarea) {
          this.$refs.textarea.removeAttribute('required');
        }
      }
    }
  };
</script>
