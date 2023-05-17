<template>
  <form class="el-form" :class="[
    labelPosition ? 'el-form--label-' + labelPosition : '',
    { 'el-form--inline': inline }
  ]">
    <slot></slot>
  </form>
</template>
<script>
  export default {
    name: 'ElForm',

    componentName: 'ElForm',

    props: {
      model: Object,
      rules: Object,
      labelPosition: String,
      labelWidth: String,
      labelSuffix: {
        type: String,
        default: ''
      },
      inline: Boolean,
      showMessage: {
        type: Boolean,
        default: true
      }
    },
    watch: {
      rules() {
        this.validate();
      }
    },
    data() {
      return {
        fields: []
      };
    },
    created() {
      this.$on('el.form.addField', (field) => {
        if (field) {
          this.fields.push(field);
        }
      });
      /* istanbul ignore next */
      this.$on('el.form.removeField', (field) => {
        if (field.prop) {
          this.fields.splice(this.fields.indexOf(field), 1);
        }
      });
    },
    methods: {
      resetFields() {
        this.fields.forEach(field => {
          field.resetField();
        });
      },
      clearValidate(props = []) {
        const fields = props.length
          ? this.fields.filter(field => props.indexOf(field.prop) > -1)
          : this.fields;
        fields.forEach(field => {
          field.clearValidate();
        });
      },
      validate(callback) {
        let valid = true;
        let count = 0;
        // 如果需要验证的fields为空，调用验证时立刻返回callback
        if (this.fields.length === 0 && callback) {
          callback(true);
        }
        this.fields.forEach((field, index) => {
          field.validate('', errors => {
            if (errors) {
              valid = false;
            }
            if (typeof callback === 'function' && ++count === this.fields.length) {
              callback(valid);
            }
          });
        });
      },
      validateField(prop, cb) {
        var field = this.fields.filter(field => field.prop === prop)[0];
        if (!field) { throw new Error('must call validateField with valid prop string!'); }

        field.validate('', cb);
      }
    }
  };
</script>
