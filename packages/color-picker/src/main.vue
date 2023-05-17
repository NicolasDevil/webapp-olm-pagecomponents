<template>
  <div class="el-color-picker" v-clickoutside="hide" @keyup.enter.native="openPickerDropdown">
    <div class="el-color-picker__trigger"  role="button"  @click="openPickerDropdown" tabindex="0" @keyup.enter.native="openPickerDropdown">
      <span v-if="defaultTrigger" class="el-color-picker__color" :class="{ 'is-alpha': showAlpha }">
        <span class="el-color-picker__color-inner"
              :style="{
            backgroundColor: displayedColor
          }"></span>
        <span class="el-color-picker__empty el-icon-close" v-if="!value && !showPanelColor"></span>
      </span>
      <span v-if="!defaultTrigger"><slot></slot></span>
      <span class="el-color-picker__icon el-icon-caret-bottom"></span>
    </div>
    <picker-dropdown
            ref="dropdown"
            class="el-color-picker__panel"
            v-model="showPicker"
            v-if="showPicker"
            @closePicker="hide"
            @change="handleChange"
            :color="color"
            :title="title"
            :ariaLabel="ariaLabel"
            :ariaLabelledby="ariaLabelledby"
            :svPanelAriaLabel="svPanelAriaLabel"
            :huePanelAriaLabel="huePanelAriaLabel"
            :arrowKeyAriaLabel="arrowKeyAriaLabel"
            :show-alpha="showAlpha">
    </picker-dropdown>
  </div>
</template>

<script>
  import Color from './color';
  import PickerDropdown from './components/picker-dropdown.vue';
  import Clickoutside from '../../../src/utils/clickoutside';

  export default {
    name: 'ElColorPicker',

    props: {
      value: {
        type: String
      },
      defaultTrigger: {
        type: Boolean,
        default: true
      },
      showAlpha: {
        type: Boolean
      },
      colorFormat: {
        type: String
      },
      focusOnClose: {
        type: String,
        default: ''
      },
      title: {
        type: String,
        default: 'Color'
      },
      ariaLabel: String,
      ariaLabelledby: String,
      svPanelAriaLabel: {
        type: String,
        default: 'Current color hex: #FFFFFF.Use arrow key to select color.'
      },
      huePanelAriaLabel: {
        type: String,
        default: 'customized color selected.'
      },
      arrowKeyAriaLabel: {
        type: String,
        default: 'Use arrow key to select color.'
      }
    },

    directives: { Clickoutside },

    computed: {
      displayedColor() {
        if (!this.value && !this.showPanelColor) {
          return 'transparent';
        } else {
          const { r, g, b } = this.color.toRgb();
          return this.showAlpha
                  ? `rgba(${ r }, ${ g }, ${ b }, ${ this.color.get('alpha') / 100 })`
                  : `rgb(${ r }, ${ g }, ${ b })`;
        }
      }
    },

    watch: {
      value(val) {
        if (!val) {
          this.showPanelColor = false;
        } else if (val && val !== this.color.value) {
          this.color.fromString(val);
        }
      },
      color: {
        deep: true,
        handler() {
          this.showPanelColor = true;
        }
      },
      showPicker(val) {
        this.$emit('update:showPicker', val);
        if (!val) {
          this.focusElement(this.focusOnClose,true);
        }
      }
    },

    methods: {
      // confirmValue(value) {
      //   this.$emit('input', this.color.value);
      //   this.$emit('change', this.color.value);
      //   this.showPicker = false;
      // },
      // clearValue() {
      //   this.$emit('input', null);
      //   this.$emit('change', null);
      //   this.showPanelColor = false;
      //   this.showPicker = false;
      //   this.resetColor();
      // },
      openPickerDropdown() {
        this.showPicker = !this.showPicker;
        document.querySelector('#svpanel').focus();
      },
      hide() {
        this.showPicker = false;
      },
      handleChange(e) {
        this.$emit('change', e);
      },
      resetColor() {
        this.$nextTick(_ => {
          if (this.value) {
            this.color.fromString(this.value);
          } else {
            this.showPanelColor = false;
          }
        });
      },
      getFocusElement(selector){
        let box = this.$slots.footer ;
        function getCanFocusEl(box,selector){
          let els = box.querySelectorAll(selector);
          let n = els.length-1;
          let i =0;
          let first = els[0];
          while (first && first.disabled && i <= n){
            i++;
            first = els[n];
          }
          return first;
        }
        let first ;
        if(box && box.length) {
          first = getCanFocusEl(box[0].elm, selector);
        }
        if(!first){
          first = getCanFocusEl(this.$slots.default[0].elm,selector)
        }
        return first;
      },
      focusElement(el,searchInBody,timeout) {
        let ele;
        if (!el) {
          return;
        }
        if(typeof(el) === 'string'){
          var container = this.$el;
          if(searchInBody){
            container = document.body;
            ele = container.querySelector(el);
          }else{
            ele = this.getFocusElement(el)
          }

          if(!ele){
            return;
          }
        }else{
          ele = el;
        }
        if(timeout){
          setTimeout(function () {
            ele.focus()
          },500);
        }
        ele.focus();
      },
      openColorPicker(){
        this.showPicker = true;
        document.querySelector('#svpanel').focus();
      }
    },

    mounted() {
      const value = this.value;
      if (value) {
        this.color.fromString(value);
      }
      this.popperElm = this.$refs.dropdown&&this.$refs.dropdown.$el;
    },

    data() {
      const color = new Color({
        enableAlpha: this.showAlpha,
        format: this.colorFormat
      });
      return {
        color,
        showPicker: false,
        showPanelColor: false
      };
    },


    components: {
      PickerDropdown
    }
  };
</script>
