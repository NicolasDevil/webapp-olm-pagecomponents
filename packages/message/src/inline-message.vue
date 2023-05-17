<template>
    <div
      class="el-message el-inline-message"
      :class="[
            type ? 'el-inline-message-' + type : '']"
      v-show="visible">
      <div class="el-message__group" :class="{ 'is-with-icon': iconClass }">
        <span><i :class="typeImg" ></i></span>
        <p v-html="message"></p>
        <div v-if="showClose" class="el-message__closeBtn icon-exit" @click="close"></div>
      </div>
    </div>
</template>

<script type="text/babel">
  export default {
    name: 'ElInlineMessage',
    props: {
      type: {
        type: String,
        default: 'info'
      },
      message: {
        type: String,
        default: ''
      },
      customClass: '',
      showClose: {
        type: Boolean,
        default: true
      },
      visible: {
        type: Boolean,
        default: true
      }
    },

    computed: {
      typeImg() {
        var map = {'success': 'icon-check', 'error': 'icon-error', 'message': 'icon-info', 'warning': 'icon-warning '};
        return map[this.type];
      }
    },

    methods: {
      close() {
        this.closed = true;
        if (typeof this.onClose === 'function') {
          this.onClose(this);
        }
      }
    },
    data() {
      return {
        iconClass: ''
      };
    }
  };
</script>
