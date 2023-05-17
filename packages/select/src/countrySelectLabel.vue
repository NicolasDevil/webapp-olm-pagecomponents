<template>
    <el-country-label :show-code="true" :country-code="value"></el-country-label>
</template>
<script>
  import CountryLabel from './countryLabel.vue'
  export default {
    components: {CountryLabel},
    name: 'ElCountrySelectLabel',

    componentName: 'ElCountrySelectLabel',
    props: {
      value: String
    }
  }
</script>