<template>
  <div
    tabindex="-1"
    class="el-select-dropdown"
    :class="[{ 'is-multiple': $parent.multiple }, popperClass]"
    :style="{ minWidth: minWidth }">
    <slot></slot>
  </div>
</template>

<script type="text/babel">
  import Popper from '../../../src/utils/vue-popper';

  export default {
    name: 'ElSelectDropdown',

    componentName: 'ElSelectDropdown',

    mixins: [Popper],

    props: {
      id: String,
      placement: {
        default: 'bottom-start'
      },

      boundariesPadding: {
        default: 0
      },

      popperOptions: {
        default() {
          return {
            gpuAcceleration: false
          };
        }
      }
    },

    data() {
      return {
        minWidth: ''
      };
    },

    computed: {
      popperClass() {
        return this.$parent.popperClass;
      },
      parent() {
        var parent = this.$parent;
        while (parent.$options.componentName !== 'ElSelect') {
          parent = parent.$parent;
        }
        return parent;
      }
    },

    watch: {
      'parent.inputWidth'() {
        this.minWidth = this.$parent.$el.getBoundingClientRect().width + 'px';
      }
    },

    mounted() {
      this.referenceElm = this.parent.$refs.reference.$el;
      this.parent.popperElm = this.popperElm = this.$el;
      this.$on('updatePopper', () => {
        this.minWidth = this.$parent.$el.getBoundingClientRect().width + 'px';
        if (this.parent.visible && this.appendToBody) {
          this.updatePopper();
        }
      });
      this.$on('destroyPopper', this.destroyPopper);
    }
  };
</script>
