<template>
    <div v-if="!onlyIcon">
        <i class="country-icon" :style="'background-position:0px ' + style"></i>
        <span v-if="showName" class="country-name">{{label}}</span>
        <span v-if="showCode" class="country-code">{{code}}</span>
        <slot></slot>
    </div>
    <i class="country-icon" :style="'background-position:0px ' + style" v-else></i>
</template>
<script>
  import Locale from '../../../src/mixins/locale';
  import {countryMap} from './countryData';

  export default {
    mixins: [Locale],
    name: 'ElCountryLabel',
    componentName: 'ElCountryLabel',
    props: {
      countryCode: String,
      showCode: {
        type: Boolean,
        default: false
      },
      onlyIcon: {
        type: Boolean,
        default: false
      },
      showName: {
        type: Boolean,
        default: true
      }
    },
    watch: {
      countryCode: function () {
        this.updateCountryInfo()
      }
    },
    data() {
      return {
        style: '',
        code: '',
        label: ''
      }
    },
    mounted:function () {
      this.updateCountryInfo()
    },
    methods: {
      updateCountryInfo: function () {
        var country = countryMap[this.countryCode];
        if(!country){
          return;
        }
        this.style = country.css;
        this.code = country.code;
        this.label = this.t('el.country.'+country.name);
      }
    }
  }
</script>
