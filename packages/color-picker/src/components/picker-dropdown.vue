<template>
  <transition name="el-zoom-in-top" @after-leave="doDestroy">
    <div class="el-color-dropdown" v-show="showPopper" role="dialog" :aria-label="ariaLabel" @keydown="handleKeyDown">
      <div class="el-color-dropdown__header">
        <div class="el-color-dropdown__headertitle">{{title}}</div>
        <button type="button" class="el-color-dropdown__headerbtn" :aria-label="t('el.dialog.close')" ref="close" @click="handleClose" role="button">
          <i class="el-color-dropdown__close icon-exit" tabindex="0" id="close" :aria-label="t('el.dialog.close')" role="button"></i>
        </button>
      </div>
      <div class="el-color-dropdown__main-wrapper">
        <sv-panel
                ref="sl"
                :color="color"
                @change="handleChange"
                tabindex="0"
                role="group"
                :svPanelAriaLabel="svPanelAriaLabel"
                :arrowKeyAriaLabel="arrowKeyAriaLabel"
        ></sv-panel>
        <hue-slider
                ref="hue"
                :color="color"
                vertical
                style="float: right;"
                @change="handleChange"
                tabindex="0"
                role="group"
                :huePanelAriaLabel="huePanelAriaLabel"
                :arrowKeyAriaLabel="arrowKeyAriaLabel">
        </hue-slider>
      </div>
      <!--      <alpha-slider v-if="showAlpha" ref="alpha" :color="color"></alpha-slider>-->
      <div class="el-color-dropdown__btns">
        <div class="el-color-dropdown__color" :style="'background-color:'+ currentValue"></div>
        <div>HEX</div>
        <div class="el-color-dropdown__input">
          <el-input
            :value="currentValue"
            role="textbox"
            @input="debounceHandleInput"
            :max=7
            :min=7
            ref="input"
            :aria-label="ariaLabel"
            :aria-labelledby="ariaLabelledby"
            @keydown.enter.native="handleEnter"
            id="colorInput"
          >
          </el-input>
        </div>
        <!--        <span class="el-color-dropdown__value">{{ currentColor }}</span>-->
        <!--        <a href="JavaScript:" class="el-color-dropdown__link-btn" @click="$emit('clear')">{{ t('el.colorpicker.clear') }}</a>-->
        <!--        <button class="el-color-dropdown__btn" @click="confirmValue">{{ t('el.colorpicker.confirm') }}</button>-->
      </div>
    </div>
  </transition>
</template>

<script>
  import SvPanel from './sv-panel';
  import HueSlider from './hue-slider';
  import AlphaSlider from './alpha-slider';
  import Popper from '../../../../src/utils/vue-popper';
  import Locale from '../../../../src/mixins/locale';
  import debounce from "throttle-debounce/debounce";
  import {getFocusableItems} from "../../../../src/utils/accessibility";

  export default {
    name: 'el-color-picker-dropdown',

    mixins: [Popper, Locale],

    components: {
      SvPanel,
      HueSlider,
      AlphaSlider
    },

    props: {
      color: {
        required: true
      },
      showAlpha: Boolean,
      debounce: {
        type: Number,
        default: 700
      },
      title:{
        type: String,
        default: 'Color'
      },
      ariaLabel: String,
      ariaLabelledby: String,
      svPanelAriaLabel: String,
      huePanelAriaLabel: String,
      arrowKeyAriaLabel: String
    },

    data() {
      return {
        currentValue: "#FFFFFF",
        tempValue:""
      };
    },

    computed: {
      // currentColor() {
      //   const parent = this.$parent;
      //   return !parent.value && !parent.showPanelColor ? '' : parent.color.value;
      // }
    },

    methods: {
      // confirmValue() {
      //   this.$emit('pick');
      // },
      handleColorInput(value) {
        // if (value === '') {
        //   return;
        // }
        // let isFormatColor = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(value);
        // if(isFormatColor){
        //   this.currentValue = value;
        //   this.color.fromString(value);
        //   this.$emit('change', value);
        // }
        this.tempValue=value;
      },
      handleChange(){
        this.currentValue = this.$parent.color.value;
        this.$emit('change', this.currentValue);
      },
      handleClose(){
        this.$emit('closePicker');
      },
      handleEnter(){
        let isFormatColor = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(this.tempValue);
        if(isFormatColor){
          this.currentValue = this.tempValue;
          this.color.fromString(this.tempValue);
          this.$emit('change', this.tempValue);
        }else {
          this.$refs.input.currentValue=this.currentValue;
        }
      },
      handleKeyDown(e) {
        e.stopPropagation();
        if (e.keyCode == 27) {
          this.handleClose();
          return;
        }

        let first = document.querySelector('#svpanel');
        let latest = document.querySelector('#close');
        let hueSlider = document.querySelector('#hueSlider');
        let colorInput = document.querySelector('#colorInput');

        if(e.shiftKey){
          if( e.keyCode == 9 && e.target == first){
            e.preventDefault();
            latest.focus();
          }
        }else{
          if (hueSlider && e.target === hueSlider && e.keyCode == 9){
            e.preventDefault();
            colorInput.focus();
          }
          if (colorInput && e.target === colorInput && e.keyCode == 9){
            e.preventDefault();
            latest.focus();
          }
          if (latest && e.target === latest && e.keyCode == 9) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    },

    mounted() {
      this.$parent.popperElm = this.popperElm = this.$el;
      this.referenceElm = this.$parent.$el;
      this.currentValue = this.$parent.value;
      // this.$refs.input.$refs.input.focus();
      document.querySelector('#svpanel').focus();
    },

    created() {
      this.debounceHandleInput = debounce(this.debounce, value => {
        this.handleColorInput(value);
      });
    },

    watch: {
      showPopper(val) {
        if (val === true) {
          this.$nextTick(() => {
            const { sl, hue, alpha } = this.$refs;
            sl && sl.update();
            hue && hue.update();
            alpha && alpha.update();
          });
        }
      }
    }
  };
</script>
