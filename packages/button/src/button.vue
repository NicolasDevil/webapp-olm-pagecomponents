<template>
  <button :disabled="disabled" class="el-button"
    @click="handleClick"
          @keyup="showBorder = true"
          @blur="showBorder = false"
    :autofocus="autofocus"
    :type="nativeType"
    :class="[
      showBorder ? 'border' : '',
      type ? 'el-button--' + type : '',
      size ? 'el-button--' + size : '',
      {
        'is-disabled': disabled,
        'is-loading': loading,
        'is-plain': plain
      }
    ]"
  >
    <div class="loading—animation" v-if="loading">
      <div class="bounce1"></div>
      <div class="bounce2"></div>
      <div class="bounce3"></div>
    </div>
    <i :class="'icon-' + icon" v-if="icon && !loading"></i>
    <span v-if="$slots.default"><slot></slot></span>
  </button>
</template>
<script>
  export default {
    name: 'ElButton',

    props: {
      type: {
        type: String,
        default: 'default'
      },
      size: String,
      icon: {
        type: String,
        default: ''
      },
      nativeType: {
        type: String,
        default: 'button'
      },
      loading: Boolean,
      disabled: Boolean,
      plain: Boolean,
      autofocus: Boolean
    },
    data: function () {
      return {
        showBorder:false
      }
    },
    methods: {
      handleClick(evt) {
        this.$emit('click', evt);
        this.showBorder = false;
      }
    }
  };
</script>
