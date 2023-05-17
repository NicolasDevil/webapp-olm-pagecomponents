<template>
  <li
    class="el-dropdown-menu__item"
    role="option"
    :id="id"
    :class="{
      'is-disabled': disabled,
      'el-dropdown-menu__item--divided': divided
    }"
    @click="handleClick"
    @keydown.stop.enter="handleClick"
    :aria-disabled="disabled"
    :tabindex="disabled ? null : -1"
  >
    <i :class="icon" v-if="icon"></i>
    <slot></slot>
  </li>
</template>
<script>
  import Emitter from '../../../src/mixins/emitter';

  export default {
    name: 'ElDropdownItem',

    mixins: [Emitter],

    props: {
      command: {},
      disabled: Boolean,
      divided: Boolean,
      icon: String
    },
    data(){
      let id ='DI'+ (Date.now()).toString().substr(5) + (Math.random()*10).toFixed(3);
      return {
        id:id
      }
    },

    methods: {
      handleClick(e) {
        setTimeout(()=>{
          this.dispatch('ElDropdown', 'menu-item-click', [this.command, this]);
        }, 150);
        e.stopPropagation();
        e.preventDefault();
      }
    }
  };
</script>
