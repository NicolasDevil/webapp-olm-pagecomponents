<template>
  <div class="el-color-hue-slider"
       :class="{ 'is-vertical': vertical }"
       v-on:keyup.up.stop.prevent="handleUp"
       v-on:keyup.down.stop.prevent="handleDown"
       ref="elbox"
       id="hueSlider"
       aria-labelledby="hue_slider"
       aria-describedby="hueSliderAcc">
    <h2 id="hue_slider" :style="accStyle">{{huePanelAriaLabel}}</h2>
    <div tabindex="0" role="alert" id="hueSliderAcc" v-if="showHueSliderAcc">
      <div :style="accStyle">{{arrowACC}}</div>
    </div>
    <div class="el-color-hue-slider__bar" @click="handleClick" ref="bar"></div>
    <div class="el-color-hue-slider__thumb"
         :style="{
           left: thumbLeft + 'px',
           top: thumbTop + 'px'
         }"
         ref="thumb">
    </div>
  </div>
</template>

<script>
  import draggable from '../draggable';

  export default {
    name: 'el-color-hue-slider',

    props: {
      color: {
        required: true
      },
      huePanelAriaLabel: String,
      arrowKeyAriaLabel: String,

      vertical: Boolean
    },

    data() {
      return {
        thumbLeft: 0,
        thumbTop: 0,
        showHueSliderAcc: false,
        accStyle: {
          opacity: 0.01,
          position: 'absolute'
        }
      };
    },

    computed: {
      hueValue() {
        const hue = this.color.get('hue');
        return hue;
      }
    },

    watch: {
      hueValue() {
        this.update();
      }
    },

    methods: {
      handleClick(event) {
        const thumb = this.$refs.thumb;
        const target = event.target;

        if (target !== thumb) {
          this.handleDrag(event);
        }
      },

      handleDrag(event) {
        const rect = this.$el.getBoundingClientRect();
        const { thumb } = this.$refs;
        let hue;

        if (!this.vertical) {
          let left = event.clientX - rect.left;
          left = Math.min(left, rect.width - thumb.offsetWidth / 2);
          left = Math.max(thumb.offsetWidth / 2, left);

          hue = Math.round((left - thumb.offsetWidth / 2) / (rect.width - thumb.offsetWidth) * 360);
        } else {
          let top = event.clientY - rect.top;
          top = Math.min(top, rect.height - thumb.offsetHeight / 2);
          top = Math.max(thumb.offsetHeight / 2, top);

          hue = Math.round((top - thumb.offsetHeight / 2) / (rect.height - thumb.offsetHeight) * 360);
        }

        this.color.set('hue', hue);
        this.$emit('change');
      },

      getThumbLeft() {
        if (this.vertical) return 0;
        const el = this.$el;
        const hue = this.color.get('hue');

        if (!el) return 0;
        const thumb = this.$refs.thumb;
        return Math.round(hue * (el.offsetWidth - thumb.offsetWidth / 2) / 360);
      },

      getThumbTop() {
        if (!this.vertical) return 0;
        const el = this.$el;
        const hue = this.color.get('hue');

        if (!el) return 0;
        const thumb = this.$refs.thumb;
        return Math.round(hue * (el.offsetHeight - thumb.offsetHeight / 2) / 360);
      },

      update() {
        this.thumbLeft = this.getThumbLeft();
        this.thumbTop = this.getThumbTop();
      },

      handleCalculate(type,event) {
        setTimeout(()=>{
          document.querySelector('#colorInput').blur();
          document.querySelector('#close').blur();
          document.querySelector('#svpanel').blur();
          document.querySelector('#hueSlider').focus();
        },50);
        const rect = this.$el.getBoundingClientRect();
        const { thumb } = this.$refs;
        let hue;
        let top;
        if(type == "up") {
          top = this.thumbTop - 4;
          top = top > 0 ? top : 0;
        }else {
          top = this.thumbTop + 8;
        }
        top = Math.min(top, rect.height - thumb.offsetHeight / 2);
        top = Math.max(thumb.offsetHeight / 2, top);
        hue = Math.round((top - thumb.offsetHeight / 2) / (rect.height - thumb.offsetHeight) * 360);
        this.color.set('hue', hue);
        this.$emit('change');
        if(this.arrowKeyAriaLabel){
          this.arrowACC = this.arrowKeyAriaLabel + 'HEX:'+ this.color.value;
          this.showHueSliderAcc = true;
          let that = this;
          setTimeout(()=>{
            that.showHueSliderAcc = false;
          },500);
        }
      },

      handleUp(e) {
        this.handleCalculate("up",e)
      },

      handleDown(e) {
        this.handleCalculate("down",e);
      }
    },

    mounted() {
      const { bar, thumb } = this.$refs;

      const dragConfig = {
        drag: (event) => {
          this.handleDrag(event);
        },
        end: (event) => {
          this.handleDrag(event);
        }
      };

      draggable(bar, dragConfig);
      draggable(thumb, dragConfig);
      this.update();

      this.$refs.elbox.addEventListener('keydown',(e)=>{
        if(e.keyCode !=9){
          e.preventDefault();
        }

      })
    }
  };
</script>
