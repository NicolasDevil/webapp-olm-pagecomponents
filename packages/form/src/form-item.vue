<template>
  <div class="el-form-item" :class="{
    'is-error': validateState === 'error',
    'is-validating': validateState === 'validating',
    'is-required': isRequired
  }">
    <div class="el-form-item__label" v-bind:style="labelStyle" v-if="label || $slots.label">
      <label :for="labelFor"><slot name="label">{{label + form.labelSuffix}}</slot></label>
      <slot name="icon"></slot>
    </div>
    <!--<label :for="labelFor" class="el-form-item__label" v-bind:style="labelStyle" v-if="label || $slots.label">
      <slot name="label">{{label + form.labelSuffix}}</slot>
    </label>-->
    <div class="el-form-item__content" v-bind:style="contentStyle">
      <slot :aria-required="isRequired"></slot>
      <transition name="el-zoom-in-top">
        <div class="el-form-item__error" role="alert" v-if="validateState === 'error' && showMessage && form.showMessage"><i class="icon-ng-inline-error" :title="title"></i><div class="el-form-item__errorinfo" :id="errorInfoId">{{validateMessage}}</div></div>
      </transition>
    </div>
  </div>
</template>
<script>
  import AsyncValidator from 'async-validator';
  import emitter from '../../../src/mixins/emitter';
  import Locale from '../../../src/mixins/locale';

  function noop() {}

  function getPropByPath(obj, path) {
    let tempObj = obj;
    path = path.replace(/\[(\w+)\]/g, '.$1');
    path = path.replace(/^\./, '');

    let keyArr = path.split('.');
    let i = 0;

    for (let len = keyArr.length; i < len - 1; ++i) {
      let key = keyArr[i];
      if (key in tempObj) {
        tempObj = tempObj[key];
      } else {
        throw new Error('please transfer a valid prop path to form item!');
      }
    }
    return {
      o: tempObj,
      k: keyArr[i],
      v: tempObj[keyArr[i]]
    };
  }

  export default {
    name: 'ElFormItem',

    componentName: 'ElFormItem',

    mixins: [emitter, Locale],

    props: {
      label: String,
      labelWidth: String,
      prop: String,
      required: Boolean,
      rules: [Object, Array],
      error: String,
      labelFor: String,
      validateStatus: String,
      showMessage: {
        type: Boolean,
        default: true
      }
    },
    watch: {
      error(value) {
        this.validateMessage = value;
        this.validateState = value ? 'error' : '';
      },
      validateStatus(value) {
        this.validateState = value;
      }
    },
    computed: {
      errorInfoId() {
        return this.labelFor + '-alert'
      },
      labelStyle() {
        var ret = {};
        if (this.form.labelPosition === 'top') return ret;
        var labelWidth = this.labelWidth || this.form.labelWidth;
        if (labelWidth) {
          ret.width = labelWidth;
        }
        return ret;
      },
      contentStyle() {
        var ret = {};
        if (this.form.labelPosition === 'top' || this.form.inline) return ret;
        var labelWidth = this.labelWidth || this.form.labelWidth;
        if (labelWidth) {
          ret.marginLeft = labelWidth;
        }
        return ret;
      },
      form() {
        var parent = this.$parent;
        while (parent.$options.componentName !== 'ElForm') {
          parent = parent.$parent;
        }
        return parent;
      },
      fieldValue: {
        cache: false,
        get() {
          var model = this.form.model;
          if (!model || !this.prop) { return; }

          var path = this.prop;
          if (path.indexOf(':') !== -1) {
            path = path.replace(/:/, '.');
          }

          return getPropByPath(model, path).v;
        }
      }
    },
    data() {
      return {
        validateState: '',
        validateMessage: '',
        validateDisabled: false,
        validator: {},
        isRequired: this.required,
        title: this.t('message.common.errorTitle') || 'Error'
      };
    },
    methods: {
      validate(trigger, callback = noop) {
        var rules = this.getFilteredRule(trigger);
        if (!rules || rules.length === 0) {
          callback();
          return true;
        }

        this.validateState = 'validating';

        var descriptor = {};
        descriptor[this.prop] = rules;

        var validator = new AsyncValidator(descriptor);
        var model = {};

        model[this.prop] = this.fieldValue;

        validator.validate(model, { firstFields: true }, (errors, fields) => {
          this.validateState = !errors ? 'success' : 'error';
          this.validateMessage = errors ? errors[0].message : '';
          let component = this.$slots.default[0].componentInstance;
          if (component) {
            let input = component.$el.querySelector('input');
            let describedby = component.id + '-alert';
            if (!errors) {
              describedby = '';
            }
            if (input) {
              let defDescribeby = input.getAttribute('aria-describedby');
              let cacheDescribeby = input.dataset.describedby;
              if (defDescribeby && !cacheDescribeby) {
                input.dataset.describedby = defDescribeby;
              }
              if (describedby) {
                input.setAttribute('aria-describedby', describedby);
              } else {
                if (cacheDescribeby) {
                  input.setAttribute('aria-describedby', cacheDescribeby);
                } else {
                  input.removeAttribute('aria-describedby');
                }
              }
            }
          }
          callback(this.validateMessage);
        });
      },
      clearValidate() {
        this.validateState = '';
        this.validateMessage = '';
        this.validateDisabled = false;
      },
      resetField() {
        this.validateState = '';
        this.validateMessage = '';

        let model = this.form.model;
        let value = this.fieldValue;
        let path = this.prop;
        if (path.indexOf(':') !== -1) {
          path = path.replace(/:/, '.');
        }

        let prop = getPropByPath(model, path);

        if (Array.isArray(value)) {
          this.validateDisabled = true;
          prop.o[prop.k] = [].concat(this.initialValue);
        } else {
          this.validateDisabled = true;
          prop.o[prop.k] = this.initialValue;
        }
      },
      getRules() {
        var formRules = this.form.rules;
        var selfRuels = this.rules;

        formRules = formRules ? formRules[this.prop] : [];

        return [].concat(selfRuels || formRules || []);
      },
      getFilteredRule(trigger) {
        var rules = this.getRules();

        return rules.filter(rule => {
          return !rule.trigger || rule.trigger.indexOf(trigger) !== -1;
        });
      },
      onFieldBlur() {
        this.validate('blur');
      },
      onFieldChange() {
        if (this.validateDisabled) {
          this.validateDisabled = false;
          return;
        }

        this.validate('change');
      }
    },
    mounted() {
      if (this.prop) {
        this.dispatch('ElForm', 'el.form.addField', [this]);
//        let item = this.$slots.default[0];
//        let id = this.labelFor
//
        let initialValue = this.fieldValue;
        if (Array.isArray(initialValue)) {
          initialValue = [].concat(initialValue);
        }
        Object.defineProperty(this, 'initialValue', {
          value: initialValue
        });

        let rules = this.getRules();

        if (rules.length) {
          rules.every(rule => {
            if (rule.required) {
              this.isRequired = true;
              return false;
            }
          });
          this.$on('el.form.blur', this.onFieldBlur);
          this.$on('el.form.change', this.onFieldChange);
        }
      }
    },
    beforeDestroy() {
      this.dispatch('ElForm', 'el.form.removeField', [this]);
    }
  };
</script>
