<template>
  <transition name="el-alert-fade">
    <div class="el-alert" :class="[ typeClass,'alert-align-'+align ]" v-show="visible">
      <i class="el-alert__icon" :class="[ iconClass, isBigIcon ]" v-if="showIcon"></i>
      <div class="el-alert__content" :class="['alert-align-'+align]">
        <span class="el-alert__title" :class="[ isBoldTitle ]" :aria-label="title" aria-live="polite" v-if="title">{{ title }}</span>
        <slot>
          <p class="el-alert__description" v-if="description">{{ description }}</p>
        </slot>
        <i tabindex="0" role="button" aria-label="" class="el-alert__closebtn" :class="{ 'is-customed': closeText !== '', 'icon-exit': closeText === '' }" v-show="closable" @keydown.enter="close()" @click="close()">{{closeText}}</i>
      </div>
    </div>
  </transition>
</template>

<script type="text/babel">
  import Locale from '../../../src/mixins/locale';

  const TYPE_CLASSES_MAP = {
    'success': 'icon-ng-mark',
    'warning': 'icon-ng-error-dialog',
    'error': 'icon-ng-error',
    'info': 'icon-info-alt-outline',
    'prompt': 'icon-info-alt-outline'
  };
  export default {
    name: 'ElAlert',

    props: {
      title: {
        type: String,
        default: '',
        required: true
      },
      description: {
        type: String,
        default: ''
      },
      type: {
        type: String,
        default: 'info'
      },
      closable: {
        type: Boolean,
        default: false
      },
      closeText: {
        type: String,
        default: ''
      },
      showIcon: {
        type: Boolean,
        default: false
      },
      align:{
        type: String,
        default: ''
      }
    },
    mixins: [Locale],
    data() {
      return {
        visible: true,
        closeAcc: this.t('message.common.closeMessageAlert') || 'Close the message'
      };
    },

    methods: {
      close() {
        this.visible = false;
        this.$emit('close');
      }
    },

    computed: {
      typeClass() {
        return `el-alert--${ this.type }`;
      },

      iconClass() {
        return TYPE_CLASSES_MAP[this.type] || 'el-icon-information';
      },

      isBigIcon() {
        return this.description ? 'is-big' : '';
      },

      isBoldTitle() {
        return this.description ? 'is-bold' : '';
      }
    }
  };
</script>
