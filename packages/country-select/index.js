import CountrySelect from '../select/src/country';

/* istanbul ignore next */
CountrySelect.install = function(Vue) {
  Vue.component(CountrySelect.name, CountrySelect);
};

export default CountrySelect;
