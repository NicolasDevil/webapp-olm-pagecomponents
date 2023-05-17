<template>
  <div class="el-expand" ref="wrapper">
    <div
      v-if="$slots['left-side']"
      class="el-expand__item el-expand__item--left-side"
      :style="{ width: $slots['right-side'] && $slots['left-side'] ? `calc(${width}% + 12px)` : '100%' }"
    >
      <slot name="left-side" />

      <button
        v-show="$slots['right-side'] && $slots['left-side']"
        ref="handler"
        :class="[handlerClass, { grabbing }]"
        :aria-label="btnTip"
      >
        <i
          class="cui-icon icon icon-arrow-right expand__btn-icon"
          :class="{ 'el-expand__btn-icon--rotated': width === max }"
          aria-hidden="true"
        />
      </button>
    </div>

    <div
      v-if="$slots['right-side']"
      class="el-expand__item el-expand__item--right-side"
      :class="{'el-expand__item--border-left': $slots['left-side']}"
      :style="{ width: $slots['right-side'] && $slots['left-side'] ? null : '100%' }"
    >
      <slot name="right-side" />
    </div>
  </div>
</template>

<script>
import Locale from '../../../src/mixins/locale';

export default {
  name: 'ElExpand',
  mixins: [Locale],
  props: {
    min: {
      type: Number,
      default: 30
    },
    max: {
      type: Number,
      default: 70
    },
    defaultLeftSideWidth: {
      type: Number,
      default: 50
    }
  },

  data() {
    return {
      handler: null,
      wrapper: null,
      grabbing: false,
      width: this.defaultLeftSideWidth,
      previousWidth: this.defaultLeftSideWidth,
      btnTip: this.t('message.common.resizeBtn') || 'Resize container button'
    };
  },

  computed: {
    handlerClass: () => 'el-expand__btn'
  },

  mounted() {
    this.wrapper = this.$refs.wrapper;
    this.handler = this.$refs.handler;

    document.addEventListener('mousedown', this.handleMousedown);
    document.addEventListener('mouseup', this.handleMouseup);
    document.addEventListener('mousemove', this.handleResize);
  },

  beforeDestroy() {
    document.removeEventListener('mousedown', this.handleMousedown);
    document.removeEventListener('mouseup', this.handleMouseup);
    document.removeEventListener('mousemove', this.handleResize);
  },

  methods: {
    handleMousedown(e) {
      const btn = this.closest(e.target, `.${this.handlerClass}`);

      if (btn === this.handler) {
        this.grabbing = true;
      }
    },
    handleMouseup() {
      if (this.previousWidth === this.width && this.grabbing) {
        this.width = this.width === this.max ? 50 : this.max;
      }

      this.grabbing = false;
      this.previousWidth = this.width;
    },
    setWidth(width) {
      if (width >= this.max) {
        this.width = this.max;
      } else if (width <= this.min) {
        this.width = this.min;
      } else {
        this.width = width;
      }
    },
    handleResize(e) {
      if (!this.grabbing) {
        return false;
      }

      const containerWidth = this.wrapper.clientWidth;
      const offset = this.wrapper.getBoundingClientRect().left;
      const width = ((e.clientX - offset) / containerWidth) * 100;

      this.setWidth(width);
    },
    closest(node, css) {
      while (node) {
        if (node.matches(css)) return node;
        node = node.parentElement;
      }
      return null;
    }
  }
};
</script>
