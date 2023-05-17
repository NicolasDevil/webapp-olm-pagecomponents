<template>
  <label class="el-radio" :for="id">
    <span class="el-radio__input"
      :class="{
        'is-disabled': isDisabled,
        'is-checked': model === label,
        'is-focus': focus,
      }"
    >
      <span class="el-radio__inner"
            :class="{
        'border': showBorder
      }"
      ></span>
      <input
        :id="id"
        class="el-radio__original"
        :value="label"
        type="radio"
        v-model="model"
        ref="focusInput"
        @focus="focus = true"
        @keydown="keyupHandler"
        @blur="blurHandler"
        :name="name"
        :disabled="isDisabled"
        :tabIndex="tabIndex"
        >
    </span>
    <span class="el-radio__label">
      <slot></slot>
      <template v-if="!$slots.default">{{label}}</template>
    </span>
  </label>
</template>
<script>
  import Emitter from '../../../src/mixins/emitter';

  export default {
    name: 'ElRadio',

    mixins: [Emitter],

    componentName: 'ElRadio',

    props: {
      value: {},
      label: {},
      disabled: Boolean,
      name: String,
      id: String
    },

    data() {
      return {
        focus: false,
        showBorder: false
      };
    },

    computed: {
      isGroup() {
        let parent = this.$parent;
        while (parent) {
          if (parent.$options.componentName !== 'ElRadioGroup') {
            parent = parent.$parent;
          } else {
            this._radioGroup = parent;
            return true;
          }
        }
        return false;
      },

      model: {
        get() {
          return this.isGroup ? this._radioGroup.value : this.value;
        },

        set(val) {
          if (this.isGroup) {
            this.dispatch('ElRadioGroup', 'input', [val]);
          } else {
            this.$emit('input', val);
          }
        }
      },
      data(){
        return{
          focus : false,
          showBorder : false
        }
      },
      isDisabled() {
        return this.isGroup
          ? this._radioGroup.disabled || this.disabled
          : this.disabled;
      },
      tabIndex() {
        return this.model === this.label ? 0 : -1;
      }
    },
    methods: {
      keyupHandler (event) {
        console.log(event);
        this.showBorder = true;
        if (this.isGroup) {
          if (event.keyCode === 39 || event.keyCode === 40) {
            this.selectNextItem();
            event.preventDefault()
            event.stopPropagation()
          } else if (event.keyCode === 37| event.keyCode === 38) {
            this.selectPreviousItem();
            event.preventDefault()
            event.stopPropagation()
          }// else if (event.keyCode === 9 && this.focus) {
            // console.log('enter blur handler!!!');
            // this.blurHandler();
          //}
        }
      },
      blurHandler () {
        this.focus = false;
        this.showBorder=false
      },
      selectNextItem () {
        let allRadios = this._radioGroup.$children;
        let currentIndex = this.getCurrentItemIndex();
        let nextItemIndex = currentIndex + 1;
        if (nextItemIndex == allRadios.length) {
          nextItemIndex = 0;
        }
        this.setNewGroupValue(nextItemIndex);
      },
      selectPreviousItem () {
        let allRadios = this._radioGroup.$children;
        let currentIndex = this.getCurrentItemIndex();
        let prevItemIndex = currentIndex - 1;
        if (prevItemIndex < 0) {
          prevItemIndex = allRadios.length - 1;
        }
        this.setNewGroupValue(prevItemIndex);
      },
      getCurrentItemIndex () {
        let allRadios = this._radioGroup.$children;
        let currentIndex = null;
        for (let i = 0; i < allRadios.length; i++) {
          let item = allRadios[i];
          if (this.model === item.label) {
            currentIndex = i;
            break;
          }
        }
        return currentIndex;
      },
      setNewGroupValue (itemIndex) {
        let newValue = this._radioGroup.$children[itemIndex].label;
        this.dispatch('ElRadioGroup', 'input', [newValue]);
        this._radioGroup.$children[itemIndex].$refs.focusInput.focus();
      }
    }
  };
</script>
