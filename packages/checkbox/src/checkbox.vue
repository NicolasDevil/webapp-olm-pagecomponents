<template>
  <label class="el-checkbox" :for="id">
    <span class="el-checkbox__input"
      :class="{
        'is-disabled': disabled,
        'is-checked': isChecked,
        'is-indeterminate': indeterminate,
        'is-focus': focus
      }"
    >
      <span class="el-checkbox__inner"
            :class="{
            'border': showBorder
            }"
      ></span>
      <input :aria-label="ariaLabel"
        v-if="trueLabel || falseLabel"
        class="el-checkbox__original"
        type="checkbox"
        :name="name"
        :disabled="disabled"
        :true-value="trueLabel"
        :false-value="falseLabel"
        v-model="model"
        @change="handleChange"
        @focus="focus = true;$emit('focus')"
        @keyup="showBorder = true"
        @blur="focus = false;showBorder=false;$emit('blur')">
      <input
        v-else
        class="el-checkbox__original"
        type="checkbox"
        :disabled="disabled"
        :value="label"
        :name="name"
        :id="id"
        v-model="model"
        @change="handleChange"
        @focus="focus = true;$emit('focus')"
        @keyup="showBorder = true"
        @blur="focus = false;showBorder=false;$emit('blur')">
    </span>
    <span class="el-checkbox__label" v-if="$slots.default || label">
      <slot></slot>
      <template v-if="!$slots.default">{{label}}</template>
    </span>
  </label>
</template>
<script>
  import Emitter from '../../../src/mixins/emitter';
  import Locale from '../../../src/mixins/locale';
  export default {
    name: 'ElCheckbox',

    mixins: [Emitter, Locale],

    componentName: 'ElCheckbox',

    data() {
      return {
        selfModel: false,
        focus: false
      };
    },
    computed: {
      ariaLabel() {
        if (this.$slots.default) {
          return this.$slots.default[0].text;
        }
      },
      model: {
        get() {
          return this.isGroup
            ? this.store : this.value !== undefined
            ? this.value : this.selfModel;
        },

        set(val) {
          if (this.isGroup) {
            let isLimitExceeded = false;
            (this._checkboxGroup.min !== undefined &&
              val.length < this._checkboxGroup.min &&
              (isLimitExceeded = true));

            (this._checkboxGroup.max !== undefined &&
              val.length > this._checkboxGroup.max &&
              (isLimitExceeded = true));

            isLimitExceeded === false &&
            this.dispatch('ElCheckboxGroup', 'input', [val]);

          } else if (this.value !== undefined) {
            this.$emit('input', val);
          } else {
            this.selfModel = val;
          }
        }
      },

      isChecked() {
        if ({}.toString.call(this.model) === '[object Boolean]') {
          return this.model;
        } else if (Array.isArray(this.model)) {
          return this.model.indexOf(this.label) > -1;
        } else if (this.model !== null && this.model !== undefined) {
          return this.model === this.trueLabel;
        }
      },

      isGroup() {
        let parent = this.$parent;
        while (parent) {
          if (parent.$options.componentName !== 'ElCheckboxGroup') {
            parent = parent.$parent;
          } else {
            this._checkboxGroup = parent;
            return true;
          }
        }
        return false;
      },

      store() {
        return this._checkboxGroup ? this._checkboxGroup.value : this.value;
      }
    },

    props: {
      value: {},
      label: {},
      indeterminate: Boolean,
      disabled: Boolean,
      checked: Boolean,
      name: String,
      id: String,
      trueLabel: [String, Number],
      falseLabel: [String, Number]
    },

    methods: {
      addToStore() {
        if (
          Array.isArray(this.model) &&
          this.model.indexOf(this.label) === -1
        ) {
          this.model.push(this.label);
        } else {
          this.model = this.trueLabel || true;
        }
      },
      handleChange(ev) {
        this.$emit('change', ev);
        if (this.isGroup) {
          this.$nextTick(_ => {
            this.dispatch('ElCheckboxGroup', 'change', [this._checkboxGroup.value]);
          });
        }
      }
    },
    data(){
      return{
        focus : false,
        showBorder : false,
      }
    },
    created() {
      this.checked && this.addToStore();
    }
  };
</script>
