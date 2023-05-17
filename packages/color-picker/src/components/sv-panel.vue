<template>
  <div class="el-color-svpanel"
       id="svpanel"
       ref="elbox"
       aria-labelledby="sv_panel"
       aria-describedby="svPanelAcc"
      :style="{
        backgroundColor: background
      }"
       v-on:keyup.down.stop.prevent="handleDown"
       v-on:keyup.up.stop.prevent="handleUp"
       v-on:keyup.left.stop.prevent="handleLeft"
       v-on:keyup.right.stop.prevent="handleRight"
  >
    <h2 id="sv_panel" :style="accStyle">{{svPanelAriaLabel}}</h2>
    <div tabindex="0" role="alert" id="svPanelAcc" v-if="showSvPanelAcc">
      <div :style="accStyle">{{arrowACC}}</div>
    </div>
    <div class="el-color-svpanel__white"></div>
    <div class="el-color-svpanel__black"></div>
    <div class="el-color-svpanel__cursor"
      :style="{
        top: cursorTop + 'px',
        left: cursorLeft + 'px'
      }">
      <div></div>
    </div>
  </div>
</template>

<script>
  import draggable from '../draggable';

  export default {
    name: 'el-sl-panel',

    props: {
      color: {
        required: true
      },
      svPanelAriaLabel: String,
      arrowKeyAriaLabel: String
    },

    computed: {
      colorValue() {
        const hue = this.color.get('hue');
        const value = this.color.get('value');
        return { hue, value };
      }
    },

    watch: {
      colorValue() {
        this.update();
      }
    },

    methods: {
      update() {
        const saturation = this.color.get('saturation');
        const value = this.color.get('value');

        const el = this.$el;
        let { width, height } = el.getBoundingClientRect();

        if (!height) height = width * 3 / 4;

        this.cursorLeft = saturation * width / 100;
        this.cursorTop = (100 - value) * height / 100;

        this.background = 'hsl(' + this.color.get('hue') + ', 100%, 50%)';
      },

      handleDrag(event) {
        const el = this.$el;
        const rect = el.getBoundingClientRect();

        let left = event.clientX - rect.left;
        let top = event.clientY - rect.top;
        left = Math.max(0, left);
        left = Math.min(left, rect.width);

        top = Math.max(0, top);
        top = Math.min(top, rect.height);

        this.cursorLeft = left;
        this.cursorTop = top;
        this.color.set({
          saturation: left / rect.width * 100,
          value: 100 - top / rect.height * 100
        });
        this.$emit('change');
      },

      // calculate the top and left,and update the color obj
      handleCalculate(type) {
        setTimeout(()=>{
          document.querySelector('#colorInput').blur();
          document.querySelector('#close').blur();
          document.querySelector('#hueSlider').blur();
          document.querySelector('#svpanel').focus();
        },50);

        const el = this.$el;
        const rect = el.getBoundingClientRect();
        let left;
        let top;
        if(type == "down") {
          left = this.cursorLeft;
          top = this.cursorTop + 5;
        }else if(type == "up") {
          left = this.cursorLeft;
          top = this.cursorTop - 5;
        }else if(type == "left") {
          left = this.cursorLeft - 5;
          top = this.cursorTop;
        }else {
          left = this.cursorLeft + 5;
          top = this.cursorTop;
        }
        left = Math.max(0, left);
        left = Math.min(left, rect.width);

        top = Math.max(0, top);
        top = Math.min(top, rect.height);
        this.cursorLeft = left;
        this.cursorTop = top;
        this.color.set({
          saturation: left / rect.width * 100,
          value: 100 - top / rect.height * 100
        });
        this.$emit('change');
        if(this.arrowKeyAriaLabel){
          this.arrowACC = this.arrowKeyAriaLabel + 'HEX:'+ this.color.value;
          this.showSvPanelAcc = true;
          let that = this;
          setTimeout(()=>{
            that.showSvPanelAcc = false;
          },500);
        }
      },

      handleDown() {
        this.handleCalculate("down");
      },

      handleUp() {
        this.handleCalculate("up");
      },

      handleLeft() {
        this.handleCalculate("left");
      },

      handleRight() {
        this.handleCalculate("right")
      }
    },

    mounted() {
      draggable(this.$el, {
        drag: (event) => {
          this.handleDrag(event);
        },
        end: (event) => {
          this.handleDrag(event);
        }
      });

      this.update();

      this.$refs.elbox.addEventListener('keydown',(e)=>{
        if(e.keyCode !=9){
          e.preventDefault();
        }
      })
    },

    data() {
      return {
        cursorTop: 0,
        cursorLeft: 0,
        background: 'hsl(0, 100%, 50%)',
        showSvPanelAcc: false,
        arrowACC: '',
        accStyle: {
          opacity: 0.01,
          position: 'absolute'
        }
      };
    }
  };
</script>
