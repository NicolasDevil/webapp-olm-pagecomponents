<template>
  <transition name="el-loading-fade" @after-leave="handleAfterLeave">
    <div
      v-show="visible"
      class="el-loading-mask"
      :class="[customClass, { 'is-fullscreen': fullscreen }]">
      <div class="el-loading-spinner">
        <svg class="circular" viewBox="25 25 50 50">
          <!--wbx add begin-->
          <circle cx="50" cy="50" r="20" stroke-width="2" stroke="#D1D3D7" fill="none"></circle>
          <!--wbx add end-->
          <circle class="path" cx="50" cy="50" r="20" fill="none"/>
        </svg>
        <p v-if="text" class="el-loading-text">{{ text }}</p>
      </div>
    </div>
  </transition>
</template>

<script>
  export default {
    data() {
      return {
        text: null,
        fullscreen: true,
        visible: false,
        customClass: ''
      };
    },

    methods: {
      handleAfterLeave() {
        this.$emit('after-leave');
      },
      setText(text) {
        this.text = text;
      }
    }
  };
</script>
