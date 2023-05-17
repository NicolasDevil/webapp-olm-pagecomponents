<template>
  <transition name="el-message-fade">
    <div
      role="alert"
      class="el-message"
      :class="[
            type ? 'el-message-' + type : '']"
      v-show="visible"
      @mouseenter="clearTimer"
      @mouseleave="startTimer">
      <div class="el-message__group" :class="{ 'is-with-icon': iconClass }">
        <span><i :class="typeImg" ></i></span>
         <slot><p>{{ message }}</p></slot>
        <div v-if="showClose" class="el-message__closeBtn icon-exit" @click="close"></div>
      </div>
    </div>
  </transition>
</template>

<script type="text/babel">
  export default {

    data() {
      return {
        visible: false,
        message: '',
        duration: 3000,
        type: 'info',
        iconClass: '',
        customClass: '',
        onClose: null,
        showClose: false,
        closed: false,
        timer: null
      };
    },

    computed: {
      typeImg() {
        var map = {'success': 'icon-ng-mark', 'error': 'icon-ng-error', 'message': 'icon-info-alt-outline', 'warning': 'icon-warning '};
        return map[this.type];
      }
    },

    watch: {
      closed(newVal) {
        if (newVal) {
          this.visible = false;
          this.$el.addEventListener('transitionend', this.destroyElement);
        }
      }
    },

    methods: {
      destroyElement() {
        this.$el.removeEventListener('transitionend', this.destroyElement);
        this.$destroy(true);
        this.$el.parentNode.removeChild(this.$el);
      },

      close() {
        this.closed = true;
        if (typeof this.onClose === 'function') {
          this.onClose(this);
        }
      },

      clearTimer() {
        clearTimeout(this.timer);
      },

      startTimer() {
        if (this.duration > 0) {
          this.timer = setTimeout(() => {
            if (!this.closed) {
              this.close();
            }
          }, this.duration);
        }
      }
    },

    mounted() {
      this.startTimer();
    }
  };
</script>
