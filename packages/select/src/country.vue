<template>
    <el-select v-model="currentValue" :ui-label="true" :disabled="disabled"  placeholder="Select" label-component="el-country-select-label">
        <el-option
                v-for="country in countrys"
                :key="country.scode"
                :value="country.scode"
        >
            <div>
                <i class="country-icon" :style="'background-position:0px ' + country.css"></i>
                <span  class="country-name">{{country.displayName}}</span>
                <span  class="country-code">{{country.code}}</span>
            </div>
        </el-option>
    </el-select>
</template>

<script>
import {countrys, countryMap} from './countryData';
import Emitter from '../../../src/mixins/emitter';
import Locale from '../../../src/mixins/locale';
import CountryLabel from './countryLabel.vue'
  export default {
    components: {CountryLabel},
    mixins: [Emitter, Locale, CountryLabel],

    name: 'ElCountrySelect',

    componentName: 'ElCountrySelect',
    props: {
      value: String,
      disabled: {
        type: Boolean,
        default: false
      }
    },

    mounted(){
        let list = []
      setTimeout(()=>{
        countrys.forEach((scode) =>{
          let country = countryMap[scode];
          country.displayName = this.getLangKey(country)
          list.push(country)
        })
        this.countrys = list.sort((a,b) => {
          if (a.displayName > b.displayName){
            return 1
          }else {
            return -1
          }
        });
      },1000)

    },
    data() {
      return {
        countrys: [],
        currentValue: this.value
      }
    },
    methods:{
      getLangKey (item) {
        return this.t(`el.country.${item.name}`)
      }
    },
    watch: {
      value (val) {
        if(this.currentValue != val)
        {
          this.currentValue = val;
        }
      },
      currentValue () {
        this.$emit('input', this.currentValue);
      }
    }
  }
</script>