<template>
  <div class="el-collapse-item" :class="{'is-active': isActive}">
    <slot name="srOnly"></slot>
    <a v-if="!editable" href="#" class="el-collapse-item__header" role="button" @click.prevent="handleHeaderClick" :aria-expanded="isActive ? 'true' : 'false'" >
      <i v-if="!iconRight" class="el-collapse-item__header__arrow icon-ng-down"></i>
      <span><slot name="title">{{title}}</slot></span>
      <i v-if="iconRight" class="el-collapse-item__header__arrow icon-ng-down"></i>
    </a>
    <div v-if="editable" tabindex="0" class="el-collapse-item__header" @click.prevent="handleHeaderClick" @keydown.enter.prevent="handleHeaderClick" role="button" :aria-expanded="isActive ? 'true' : 'false'" >
      <i v-if="!iconRight" class="el-collapse-item__header__arrow icon-ng-down"></i>
      <span><slot name="title">{{title}}</slot></span>
      <i v-if="iconRight" class="el-collapse-item__header__arrow icon-ng-down"></i>
    </div>
    <el-collapse-transition>
      <div class="el-collapse-item__wrap" v-show="isActive">
        <div class="el-collapse-item__content">
          <slot></slot>
        </div>
      </div>
    </el-collapse-transition>
  </div>
</template>
<script>
  import ElCollapseTransition from '../../../src/transitions/collapse-transition';
  import Emitter from '../../../src/mixins/emitter';

  export default {
    name: 'ElCollapseItem',

    componentName: 'ElCollapseItem',

    mixins: [Emitter],

    components: { ElCollapseTransition },

    data() {
      return {
        contentWrapStyle: {
          height: 'auto',
          display: 'block'
        },
        contentHeight: 0
      };
    },

    props: {
      title: String,
      name: {
        type: [String, Number],
        default() {
          return this._uid;
        }
      },
      editable: { type: Boolean, required: false, default: false },
      iconRight: { type: Boolean, default: false }
    },

    computed: {
      isActive() {
        return this.$parent.activeNames.indexOf(this.name) > -1;
      }
    },

    watch: {
      'isActive'(value) {
      }
    },

    methods: {
      handleHeaderClick() {
        this.dispatch('ElCollapse', 'item-click', this);
      }
    },

    mounted() {
    }
  };
</script>
