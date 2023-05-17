<template>
  <button class="el-switch" :disabled="disabled" type="button" :class="{ 'is-disabled': disabled, 'el-switch--wide': hasText, 'is-checked': checked }"
     @click="handleClick" role="switch" :aria-checked="checked+''" :id="id">
    <div class="el-switch__mask" v-show="disabled" ></div>
    <input
      class="el-switch__input"
      type="checkbox"
      @change="handleChange"
      ref="input"
      :name="name"
      :true-value="onValue"
      :false-value="offValue"
      :disabled="disabled">
    <span class="el-switch__core" ref="core" :style="{ 'width': coreWidth + 'px' }" :id="id" >
      <span class="el-switch__button" :style="{ transform }"></span>
    </span>
    <transition name="label-fade">
      <div
        class="el-switch__label el-switch__label--left"
        v-show="checked"
        :style="{ 'width': coreWidth + 'px' }">
        <i :class="[onIconClass]" v-if="onIconClass"></i>
        <span :class="[!showText || onIconClass?'el-hide':'']" v-if="onText">{{ onText }}</span>
      </div>
    </transition>
    <transition name="label-fade">
      <div
        class="el-switch__label el-switch__label--right"
        v-show="!checked"
        :style="{ 'width': coreWidth + 'px' }">
        <i :class="[offIconClass]" v-if="offIconClass"></i>
        <span :class="[!showText || onIconClass?'el-hide':'']" v-if="offText">{{ offText }}</span>
      </div>
    </transition>
  </button>
</template>

<script>
  export default {
    name: 'ElSwitch',
    props: {
      value: {
        type: [Boolean, String, Number],
        default: true
      },
      disabled: {
        type: Boolean,
        default: false
      },
      width: {
        type: Number,
        default: 0
      },
      onIconClass: {
        type: String,
        default: ''
      },
      offIconClass: {
        type: String,
        default: ''
      },
      onText: {
        type: String,
        default: 'ON'
      },
      offText: {
        type: String,
        default: 'OFF'
      },
      onColor: {
        type: String,
        default: ''
      },
      offColor: {
        type: String,
        default: ''
      },
      onValue: {
        type: [Boolean, String, Number],
        default: true
      },
      offValue: {
        type: [Boolean, String, Number],
        default: false
      },
      name: {
        type: String,
        default: ''
      },
      showText: {
        type: Boolean,
        default: false
      },
      id: {
        type: String,
        default: ''
      }
    },
    data() {
      return {
        coreWidth: this.width
      };
    },
    created() {
      if (!~[this.onValue, this.offValue].indexOf(this.value)) {
        this.$emit('input', this.offValue);
      }
    },
    computed: {
      checked() {
        return this.value === this.onValue;
      },
      hasText() {
        /* istanbul ignore next */
        return this.onText || this.offText;
      },
      transform() {
        return this.checked ? `translate(${ this.coreWidth - 19 }px, 4px)` : 'translate(4px, 4px)';
      }
    },
    watch: {
      checked() {
        if (this.onColor || this.offColor) {
          this.setBackgroundColor();
        }
      }
    },
    methods: {
      handleChange(event) {
        this.$emit('change', !this.checked ? this.onValue : this.offValue);
        this.$emit('input', !this.checked ? this.onValue : this.offValue);
        this.$nextTick(() => {
          // set input's checked property
          // in case parent refuses to change component's value
          this.$refs.input.checked = this.checked;
        });
      },
      setBackgroundColor() {
        let newColor = this.checked ? this.onColor : this.offColor;
        this.$refs.core.style.borderColor = newColor;
        this.$refs.core.style.backgroundColor = newColor;
      },
      handleClick(){
         this.$refs.input.click();
      },
    },
    mounted() {
      /* istanbul ignore if */
      if (this.width === 0) {
        this.coreWidth = this.hasText && this.showText ? 58 : 38;
      }
      if (this.onColor || this.offColor) {
        this.setBackgroundColor();
      }
      this.$refs.input.checked = this.checked;
    }
  };
</script>
