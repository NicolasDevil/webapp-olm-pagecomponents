<template>
  <div
      class="el-select"
      :class="[labelComponent?'show-ui-label':'',
    width?'el-select__'+width:'']"
      v-clickoutside="handleClose">
    <div
        class="el-select__tags"
        v-if="multiple"
        @click.stop="toggleMenu"
        ref="tags"
        :style="{ 'max-width': inputWidth - 32 + 'px' }">
      <transition-group @after-leave="resetInputHeight">
        <el-tag
            v-for="item in selected"
            :key="getValueKey(item)"
            :closable="!disabled"
            :hit="item.hitState"
            type="primary"
            @close="deleteTag($event, item)"
            close-transition>
          <span class="el-select__tags-text">{{ item.currentLabel }}</span>
        </el-tag>
      </transition-group>
      <input
          type="text"
          class="el-select__input"
          :aria-lableby="ariaLabelledby"
          :class="`is-${ size }`"
          @focus.native="visible = true"
          :disabled="disabled"
          @keyup="managePlaceholder"
          @keydown="resetInputState"
          @keydown.down.prevent="navigateOptions('next')"
          @keydown.up.prevent="navigateOptions('prev')"
          @keydown.enter.prevent="selectOption"
          @keydown.esc="handleEsc"
          @keydown.delete="deletePrevTag"
          v-model="query"
          :debounce="remote ? 300 : 0"
          v-if="filterable"
          :style="{ width: inputLength + 'px', 'max-width': inputWidth - 42 + 'px' }"
          ref="input"
          :disable-focus-icon="true">
    </div>
    <div  class="el-select__ui-label" >
      <component :is="labelComponent" v-if="labelComponent && value" :value="value" :can-focus="false"></component>
    </div>
    <span style="display: none" v-if="ariaLabel" :id="computedId + '_label'">{{ariaLabel}}</span>
    <el-input
        ref="reference"
        v-model="selectedLabel"
        :aria-autocomplete="filterable?'list':''"
        :type="filterable?'text':'button'"
        :placeholder="filterable?(selectedLabel==''?currentPlaceholder:null):null"
        :role="filterable?'combobox':'button'"
        aria-haspopup="listbox"
        :ariaExpanded="visible"
        :name="name"
        :aria-labelledby="ariaLabelledbyAttr"
        :size="size"
        :id="computedId"
        :focusIcon="false"
        :enable-clean="enableClean"
        :disabled="disabled"
        :validate-event="false"
        @click="handleIconClick"
        v-on:change="onInputClean"
        @click.native.stop.prevent="handleOpenMenu"
        @keyup.native="handleKeyUp"
        @keydown.native.down.prevent="navigateOptions('next')"
        @keydown.native.up.prevent="navigateOptions('prev')"
        @keydown.native.enter.prevent="handleEnter"
        @keydown.native.esc.prevent="handleEsc"
        @keydown.native.tab="visible = false; state='confirm'"
        @focus="handleFocus"
        @blur="handleBlur"
        @paste.native="debouncedOnInputChange"
        @mouseenter.native="inputHovering = true"
        @mouseleave.native="inputHovering = false"
        :icon="iconClass"
        :disable-focus-icon="true">
    </el-input>
    <transition
        name="el-zoom-in-top"
        @before-enter="handleMenuEnter"
        @after-leave="doDestroy">
      <el-select-menu
          ref="popper"
          :appendToBody="appendToBody"
          v-show="visible && emptyText !== false">
        <el-scrollbar
            ref="scrollBar"
            :id="popoverId"
            tag="ul"
            role="listbox"
            wrap-class="el-select-dropdown__wrap"
            view-class="el-select-dropdown__list"
            :class="{ 'is-empty': !allowCreate && filteredOptionsCount === 0 }"
             v-show="options.length > 0 && !loading">
          <el-option
              :value="query"
              created
              v-if="showNewOption">
          </el-option>
          <slot></slot>
        </el-scrollbar>
        <p class="el-select-dropdown__empty" v-if="emptyText && (allowCreate && options.length === 0 || !allowCreate)">{{ emptyText }}</p>
      </el-select-menu>
    </transition>
  </div>
</template>

<script type="text/babel">
  import Emitter from '../../../src/mixins/emitter';
  import Locale from '../../../src/mixins/locale';
  import ElInput from '../../../packages/input';
  import ElSelectMenu from './select-dropdown.vue';
  import ElOption from './option.vue';
  import ElTag from '../../../packages/tag';
  import ElScrollbar from '../../../packages/scrollbar';
  import debounce from 'throttle-debounce/debounce';
  import Clickoutside from '../../../src/utils/clickoutside';
  import { addClass, removeClass, hasClass } from '../../../src/utils/dom';
  import { addResizeListener, removeResizeListener } from '../../../src/utils/resize-event';
  import { t } from '../../../src/locale';
  import scrollIntoView from '../../../src/utils/scroll-into-view';
  import { getValueByPath } from '../../../src/utils/util';
  import ElCountrySelectLabel from './countrySelectLabel.vue';

  const sizeMap = {
    'large': 42,
    'small': 30,
    'mini': 22
  };
export const KEY_CODES = Object.freeze({
    'BACKSPACE': 8,
    'TAB': 9,
    'ENTER': 13,
    'SHIFT': 16,
    'ESC': 27,
    'SPACE': 32,
    'PAGEUP': 33,
    'PAGEDOWN': 34,
    'END': 35,
    'HOME': 36,
    'LEFT': 37,
    'UP': 38,
    'RIGHT': 39,
    'DOWN': 40,
    'DELETE': 46
});

  function setCaretPosition(textDom, pos) {
    if (textDom.setSelectionRange) {
      // IE Support
      textDom.focus();
      textDom.setSelectionRange(pos, pos);
    } else if (textDom.createTextRange) {
      // Firefox support
      var range = textDom.createTextRange();
      range.collapse(true);
      range.moveEnd('character', pos);
      range.moveStart('character', pos);
      range.select();
    }
  }
  export default {
    mixins: [Emitter, Locale],

    name: 'ElSelect',

    componentName: 'ElSelect',

    computed: {
      computedId() {
        return this.id || this.autoId;
      },
      iconClass() {
        let criteria = this.clearable &&
          !this.disabled &&
          this.inputHovering &&
          !this.multiple &&
          this.value !== undefined &&
          this.value !== '';
        return criteria ? 'circle-close is-show-close' : (this.remote && this.filterable ? '' : ' icon-arrow');
      },

      debounce() {
        return this.remote ? 300 : 0;
      },

      emptyText() {
        if (this.loading) {
          return this.loadingText || this.t('el.select.loading');
        } else {
          if ((this.remote && this.query === '' && this.options.length === 0) || (this.options.length === 0 && this.hideNoData)) return false;
          if (this.filterable && this.options.length > 0 && this.filteredOptionsCount === 0) {
            if (this.hideNoData) {
              return false;
            }
            return this.noMatchText || this.t('el.select.noMatch');
          }
          if (this.options.length === 0) {
            return this.noDataText || this.t('el.select.noData');
          }
        }
        return null;
      },

      showNewOption() {
        let hasExistingOption = this.options.filter(option => !option.created)
          .some(option => option.currentLabel === this.query);
        return this.filterable && this.allowCreate && this.query !== '' && !hasExistingOption;
      }
    },

    components: {
      ElInput,
      ElSelectMenu,
      ElOption,
      ElTag,
      ElScrollbar,
      ElCountrySelectLabel
    },

    directives: { Clickoutside },

    props: {
      name: String,
      value: {
        required: true
      },
      size: String,
      id: String,
      disabled: Boolean,
      clearable: Boolean,
      filterable: Boolean,
      allowCreate: Boolean,
      loading: Boolean,
      popperClass: String,
      remote: Boolean,
      loadingText: String,
      noMatchText: String,
      noDataText: String,
      remoteMethod: Function,
      filterMethod: Function,
      multiple: Boolean,
      multipleLimit: {
        type: Number,
        default: 0
      },
      ariaLabel: String,
      placeholder: {
        type: String,
        default() {
          return t('el.select.placeholder');
        }
      },
      defaultFirstOption: Boolean,
      valueKey: {
        type: String,
        default: 'value'
      },
      labelComponent: {
        type: String
      },
      ariaLabelledby: {
        type: String
      },
      width: {
        type: String,
        default: 'middle'
      },
      disableSpaceSelect: {
        type: Boolean,
        default: false
      },
      hideNoData: Boolean,
      enableClean: Boolean,
      appendToBody: {
        type: Boolean,
        default: true
      }
    },

    data() {
      return {
        ariaLabelledbyAttr: null,
        autoId: 'select_' + (Math.random()).toFixed(3),
        options: [],
        cachedOptions: [],
        createdLabel: null,
        createdSelected: false,
        selected: this.multiple ? [] : {},
        isSelect: true,
        inputLength: 20,
        inputWidth: 0,
        cachedPlaceHolder: null,
        optionsCount: 0,
        filteredOptionsCount: 0,
        dropdownUl: null,
        visible: false,
        selectedLabel: '',
        hoverIndex: -1,
        query: '',
        bottomOverflow: 0,
        topOverflow: 0,
        optionsAllDisabled: false,
        inputHovering: false,
        currentPlaceholder: null,
        hoverByKeyEvent: false,
        popoverId: 'combox-list-' + Date.now(),
        state: ''
      };
    },

    watch: {
      disabled() {
        this.$nextTick(() => {
          this.resetInputHeight();
        });
      },

      placeholder(val) {
        this.cachedPlaceHolder = this.currentPlaceholder = val;
      },
      value(val) {
        if (this.multiple) {
          this.resetInputHeight();
          if (val.length > 0 || (this.$refs.input && this.query !== '')) {
            this.currentPlaceholder = null;
          } else {
            this.currentPlaceholder = this.cachedPlaceHolder;
          }
        }
        this.setSelected();
        if (this.filterable && !this.multiple) {
          this.inputLength = 20;
        }
        this.$emit('change', val);
        this.dispatch('ElFormItem', 'el.form.change', val);
      },

      query(val) {
        if (val === null || val === undefined) return;
        this.$nextTick(() => {
          if (this.visible) this.broadcast('ElSelectDropdown', 'updatePopper');
        });
        if (this.state === 'edting') {
          this.hoverIndex = -1;
        }
        if (this.multiple && this.filterable) {
          this.inputLength = this.$refs.input.value.length * 15 + 20;
          this.managePlaceholder();
          this.resetInputHeight();
        }
        if (this.remote && typeof this.remoteMethod === 'function') {
          this.hoverIndex = -1;
          this.remoteMethod(val);
          this.broadcast('ElOption', 'resetIndex');
        } else if (typeof this.filterMethod === 'function') {
          this.filterMethod(val);
          this.broadcast('ElOptionGroup', 'queryChange');
        } else if (this.state !== 'selecting') {
          this.filteredOptionsCount = this.optionsCount;
          this.broadcast('ElOption', 'queryChange', val);
          this.broadcast('ElOptionGroup', 'queryChange');
        }
        if (this.defaultFirstOption && (this.filterable || this.remote) && this.filteredOptionsCount) {
          this.checkDefaultFirstOption();
        }
      },

      visible(val) {
        let needClear = !(this.filterable && this.remote);
        if (!val) {
          this.handleIconHide();
          this.broadcast('ElSelectDropdown', 'destroyPopper');
          if (this.$refs.input) {
            this.$refs.input.blur();
          }

          if (needClear) {
            this.query = '';
            if (!this.filterable) {
              this.selectedLabel = this.cachedPlaceHolder;
            } else {
              this.selectedLabel = '';
            }

          }
          this.inputLength = 20;
          this.resetHoverIndex();
          this.$nextTick(() => {
            if (this.$refs.input &&
              this.$refs.input.value === '' &&
              this.selected.length === 0) {
              this.currentPlaceholder = this.cachedPlaceHolder;
            }

          });
          if (!this.multiple) {
            if (this.selected && needClear) {
              if (this.filterable && this.allowCreate &&
                this.createdSelected && this.createdOption) {
                this.selectedLabel = this.createdLabel;
              } else {
                this.selectedLabel = this.selected.currentLabel;
              }

              if (this.filterable) {
                this.query = this.selectedLabel;
              } else {
                this.selectedLabel = this.selectedLabel || this.cachedPlaceHolder;
              }
            }
          }
          this.$refs.reference.$refs.input.removeAttribute('aria-activedescendant');

        } else {
          this.handleIconShow();
          this.broadcast('ElSelectDropdown', 'updatePopper');
          if (this.filterable) {
            this.query = this.selectedLabel;
            if (this.multiple) {
              this.$refs.input.focus();
            } else {
              if (!this.remote && this.state !== 'selecting') {
                this.broadcast('ElOption', 'queryChange', '');
                this.broadcast('ElOptionGroup', 'queryChange');
              }
              this.focus();
            }
          }
          this.$nextTick(()=>{
            this.$refs.scrollBar.update();
            let active = this.options.find(item => item.itemSelected);
            let id = active && active.sid || this.options[0].sid;
            setTimeout(()=>{
              this.$refs.reference.$refs.input.setAttribute('aria-activedescendant', id);             // active.$el.setAttribute('aria-sel              e')
            }, 200);
          });
        }
        this.$emit('visible-c hang e', val);
      },

      options(val) {
        if (this.$isServer) return;
        this.optionsAllDisabled = val.length === val.filter(item => item.disabled === true).length;
        if (this.multiple) {
          this.resetInputHeight();
        }
        let inputs = this.$el.querySelectorAll('input');
        if ([].indexOf.call(inputs, document.activeElement) === -1) {
          this.setSelected();
        }
        if (this.defaultFirstOption && (this.filterable || this.remote) && this.filteredOptionsCount) {
          this.checkDefaultFirstOption();
        }
      }
    },

    methods: {
      handleEsc(e) {
        if (this.visible) {
          e.stopPropagation();
          e.preventDefault();
        }
        this.visible = false;
        this.state = 'confirm';
      },
      ariaInit() {
        this.$refs.reference.$refs.input.setAttribute('aria-controls', this.popoverId);
        this.$refs.reference.$refs.input.setAttribute('aria-owns', this.popoverId);
        if (this.ariaLabel) {
          this.ariaLabelledbyAttr = this.computedId + '_label ' + this.computedId;
        } else if (this.ariaLabelledby) {
          this.ariaLabelledbyAttr = this.ariaLabelledby + ' ' + this.computedId;
        }
        if (this.id) {
          let label = document.body.querySelector('label[for="' + this.id + '"]');
          if (label) {
            let labelId = label.getAttribute('id');
            if (!labelId) {
              labelId = this.computedId + '_label';
              label.setAttribute('id', labelId);
            }
            this.ariaLabelledbyAttr = labelId + ' ' + this.computedId;
          } else {
            console.log('not find label for');
          }
        }
      },
      handleIconHide() {
        let icon = this.$el.querySelector('.el-input__icon');
        if (icon) {
          removeClass(icon, 'is-reverse');
        }
      },
      handleIconShow() {
        let icon = this.$el.querySelector('.el-input__icon');
        if (icon && !hasClass(icon, 'el-icon-circle-close')) {
          addClass(icon, 'is-reverse');
        }
      },
      handleKeyUp(e) {
        const key = e.keyCode;
        switch (key) {
          case KEY_CODES.UP:
          case KEY_CODES.DOWN:
            break;
          case KEY_CODES.HOME:
            return this.navigateOptions('first');
          case KEY_CODES.END:
            return this.navigateOptions('last');
          case KEY_CODES.ESC:
            e.stopPropagation();
            e.preventDefault();
            this.state = 'confirm';
            if (this.filterable) {
              this.$emit('clear');
            }
            break;
          case KEY_CODES.ENTER:
            break;
          case KEY_CODES.BACKSPACE:
          case KEY_CODES.DELETE:
            if (this.filterable) {
              e.preventDefault();
            }
            break;
          case KEY_CODES.SPACE:
            if (!this.disableSpaceSelect) {
              if (this.visible) {
                this.selectOption();
                this.state = 'confirm';
              } else if (!this.filterable) {
                this.handleEnter();
                this.state = 'confirm';
              }
              e.stopPropagation();
              e.preventDefault();
            }
            break;
          case KEY_CODES.SHIFT:
            break;
          default:
            this.state = 'editing';
            this.debouncedOnInputChange(e);
            break;
        }
      },
      scrollToOption(option) {
        const target = Array.isArray(option) && option[0] ? option[0].$el : option.$el;
        if (this.$refs.popper && target) {
          const menu = this.$refs.popper.$el.querySelector('.el-select-dropdown__wrap');
          scrollIntoView(menu, target);
        }
      },

      handleMenuEnter() {
        this.$nextTick(() => this.scrollToOption(this.selected));
      },

      getOption(value) {
        let option;
        const isObject = Object.prototype.toString.call(value).toLowerCase() === '[object object]';
        for (let i = this.cachedOptions.length - 1; i >= 0; i--) {
          const cachedOption = this.cachedOptions[i];
          const isEqual = isObject
            ? getValueByPath(cachedOption.value, this.valueKey) === getValueByPath(value, this.valueKey)
            : cachedOption.value === value;
          if (isEqual) {
            option = cachedOption;
            break;
          }
        }
        if (option) return option;
        const label = !isObject
          ? value : '';
        let newOption = {
          value: value,
          currentLabel: label
        };
        if (this.multiple) {
          newOption.hitState = false;
        }
        return newOption;
      },

      setSelected() {
        if (!this.multiple) {
          let option = this.getOption(this.value);
          if (option.created) {
            this.createdLabel = option.currentLabel;
            this.createdSelected = true;
          } else {
            this.createdSelected = false;
          }
          this.selectedLabel = option.currentLabel;
          this.selected = option;
          if (this.filterable) this.query = this.selectedLabel;
          return;
        }
        let result = [];
        if (Array.isArray(this.value)) {
          this.value.forEach(value => {
            result.push(this.getOption(value));
          });
        }
        this.selected = result;
        this.$nextTick(() => {
          this.resetInputHeight();
        });
      },
      onInputClean(val) {
        if (!val && this.enableClean) {
          this.visible = false;
          if (this.filterable) {
            this.query = val;
          }
        }
      },
      focus() {
        if (!this.isFocus) {
          let dom = this.$refs.reference.$refs.input;
          if (dom) {
            dom.focus();
          }
        }
      },
      handleBlur(event) {
        this.isFocus = false;
        if (this.filterable) {
          this.$emit('clear');
        }
      },
      handleFocus() {
        this.isFocus = true;
      },
      handleEnter() {
        if (!this.visible) {
          this.visible = true;
          this.navigateOptions(this.value ? '' : 'next');
        } else {
          this.selectOption();
          this.state = 'confirm';
        }
      },
      handleOpenMenu() {
        if (!this.iconClick) {
          this.toggleMenu();
        }
      },
      handleIconClick(event) {
        this.iconClick = true;
        if (this.iconClass.indexOf('circle-close') > -1) {
          this.deleteSelected(event);
        } else {
          this.toggleMenu();
        }
        setTimeout(()=>{
          this.iconClick = false;
        }, 300);
      },

      handleMouseDown(event) {
        if (event.target.tagName !== 'INPUT') return;
        if (this.visible) {
          this.handleClose();
        } else {
          if (!this.disabled) {
            this.visible = true;
          }
        }
      },

      doDestroy() {
        this.$refs.popper && this.$refs.popper.doDestroy();
        this.dropdownUl = null;
      },

      handleClose() {
        this.visible = false;
      },

      toggleLastOptionHitState(hit) {
        if (!Array.isArray(this.selected)) return;
        const option = this.selected[this.selected.length - 1];
        if (!option) return;

        if (hit === true || hit === false) {
          option.hitState = hit;
          return hit;
        }

        option.hitState = !option.hitState;
        return option.hitState;
      },

      deletePrevTag(e) {
        if (e.target.value.length <= 0 && !this.toggleLastOptionHitState()) {
          const value = this.value.slice();
          value.pop();
          this.$emit('input', value);
        }
      },

      managePlaceholder() {
        if (this.currentPlaceholder !== '') {
          this.currentPlaceholder = this.$refs.input.value ? null : this.cachedPlaceHolder;
        }
      },

      resetInputState(e) {
        if (e.keyCode !== KEY_CODES.BACKSPACE) this.toggleLastOptionHitState(false);
        this.inputLength = this.$refs.input.value.length * 15 + 20;
        this.resetInputHeight();
      },

      resetInputHeight() {
        this.$nextTick(() => {
          if (!this.$refs.reference) return;
          let inputChildNodes = this.$refs.reference.$el.childNodes;
          let input = [].filter.call(inputChildNodes, item => item.tagName === 'INPUT')[0];
          const tags = this.$refs.tags;
          input.style.height = this.selected.length === 0
            ? (sizeMap[this.size] || 36) + 'px'
            : Math.max(tags ? (tags.clientHeight + 6) : 0, sizeMap[this.size] || 36) + 'px';
          if (this.visible && this.emptyText !== false) {
            this.broadcast('ElSelectDropdown', 'updatePopper');
          }
        });
      },

      resetHoverIndex() {
        setTimeout(() => {
          if (!this.multiple) {
            this.hoverIndex = this.options.indexOf(this.selected);
          } else {
            if (this.selected.length > 0) {
              this.hoverIndex = Math.min.apply(null, this.selected.map(item => this.options.indexOf(item)));
            } else {
              this.hoverIndex = -1;
            }
          }
          // this.setAriaActived('')
        }, 300);
      },
      setAriaActived(val) {
        if (this.$refs) {
          try {
            if (val) {
              this.$refs.reference.$refs.input.setAttribute('aria-activedescendant', val);
            } else {
              this.$refs.reference.$refs.input.removeAttribute('aria-activedescendant');
            }
          } catch (e) {
          }
        }
        if (!val) {
          this.options.forEach((item, index) =>{
            item.tabIndex = -1;
          });
        }
      },
      handleOptionSelect(option, fromKeyEvent) {
        if (this.multiple) {
          const value = this.value.slice();
          const optionIndex = this.getValueIndex(value, option.value);
          if (optionIndex > -1) {
            value.splice(optionIndex, 1);
          } else if (this.multipleLimit <= 0 || value.length < this.multipleLimit) {
            value.push(option.value);
          }
          this.$emit('input', value);
          if (option.created) {
            this.query = '';
            this.inputLength = 20;
          }
          if (this.filterable) this.$refs.input.focus();
        } else {
          const ariaKey = 'aria-selected';
          this.options.forEach((item, index) =>{

            if (index === this.hoverIndex) {
              item.$el.setAttribute(ariaKey, 'true');
            } else {
              if (item.$el.hasAttribute(ariaKey)) {
                item.$el.removeAttribute(ariaKey);
              }
            }
          });
          this.$emit('input', option.value);
          this.visible = false;
        }
        if (!fromKeyEvent) {
          setTimeout(()=>{
            this.focus();
          }, 300);
        }

        this.$nextTick(() => {
          this.scrollToOption(option);
        });
      },

      getValueIndex(arr = [], value) {
        const isObject = Object.prototype.toString.call(value).toLowerCase() === '[object object]';
        if (!isObject) {
          return arr.indexOf(value);
        } else {
          const valueKey = this.valueKey;
          let index = -1;
          arr.some((item, i) => {
            if (getValueByPath(item, valueKey) === getValueByPath(value, valueKey)) {
              index = i;
              return true;
            }
            return false;
          });
          return index;
        }
      },
      toggleMenu() {
        if (this.filterable && this.query === '' && this.visible) {
          return;
        }
        if (!this.disabled) {
          this.visible = !this.visible;
        }
        if (this.visible) {
          this.$refs.reference.$refs.input.focus();
        }
      },
      navigateOptions(direction) {
        this.hoverByKeyEvent = true;
        if (!this.visible) {
          this.visible = true;
          return;
        }
        if (this.options.length === 0 || this.filteredOptionsCount === 0) return;
        this.optionsAllDisabled = this.options.length === this.options.filter(item => item.disabled === true).length;
        if (!this.optionsAllDisabled) {
          if (direction === 'next') {
            this.hoverIndex++;
            if (this.hoverIndex === this.options.length) {
              this.hoverIndex = 0;
            }
          } else if (direction === 'prev') {
            this.hoverIndex--;
            if (this.hoverIndex < 0) {
              this.hoverIndex = this.options.length - 1;
            }
          } else if (direction === 'first') {
            this.hoverIndex = 0;
            direction = 'next';
          } else if (direction === 'last') {
            this.hoverIndex = this.options.length - 1;
            direction = 'prev';
          }
          if (this.hoverIndex < 0) {
            if (!this.value) {
              return;
            }
            this.options.forEach((item, index) =>{
              if (item.value === this.value) {
                this.hoverIndex = index;
              }
            });
          }

          if (this.options[this.hoverIndex].disabled === true ||
            this.options[this.hoverIndex].groupDisabled === true ||
            !this.options[this.hoverIndex].visible) {
            this.navigateOptions(direction);
          }
          let item = this.options[this.hoverIndex];

          this.setAriaActived(item && item.$el.id || item.sid || '');
        }
        this.$nextTick(() => {
          this.scrollToOption(this.options[this.hoverIndex]);
          if (this.filterable) {
            let val = this.query;
            if (this.options[this.hoverIndex]) {
              const option = this.options[this.hoverIndex];
              if (this.multiple) {
                const value = this.value.slice();
                const optionIndex = this.getValueIndex(value, option.value);
                if (optionIndex > -1) {
                  value.splice(optionIndex, 1);
                } else if (this.multipleLimit <= 0 || value.length < this.multipleLimit) {
                  value.push(option.value);
                }
                this.$emit('input', value);
                if (option.created) {
                  this.query = '';
                  this.inputLength = 20;
                }
                if (this.filterable) this.$refs.input.focus();
              } else {
                const ariaKey = 'aria-selected';
                this.options.forEach((item, index) =>{
                  if (index === this.hoverIndex) {
                    item.$el.setAttribute(ariaKey, 'true');
                  } else {
                    if (item.$el.hasAttribute(ariaKey)) {
                      item.$el.removeAttribute(ariaKey);
                    }
                  }
                });
                this.$emit('input', option.value);
                this.state = 'selecting';
              }
              val = this.value;
            } else {
              this.$emit('enter', val);
            }
          }
        });
      },

      selectOption() {
        let val = this.query;
        if (this.options[this.hoverIndex]) {
          this.handleOptionSelect(this.options[this.hoverIndex], true);
          val = this.value;
        } else {
          this.$emit('enter', val);
        }
      },

      deleteSelected(event) {
        event.stopPropagation();
        this.$emit('input', '');
        this.visible = false;
        this.$emit('clear');
      },

      deleteTag(event, tag) {
        let index = this.selected.indexOf(tag);
        if (index > -1 && !this.disabled) {
          const value = this.value.slice();
          value.splice(index, 1);
          this.$emit('input', value);
          this.$emit('remove-tag', tag);
        }
        event.stopPropagation();
      },

      onInputChange() {
        if (this.filterable) {
          this.query = this.selectedLabel;
          this.visible = true;
        }
      },

      onOptionDestroy(option) {
        this.optionsCount--;
        this.filteredOptionsCount--;
        let index = this.options.indexOf(option);
        if (index > -1) {
          this.options.splice(index, 1);
        }
        this.broadcast('ElOption', 'resetIndex');
      },

      resetInputWidth() {
        this.inputWidth = this.$refs.reference.$el.getBoundingClientRect().width;
      },

      handleResize() {
        this.resetInputWidth();
        if (this.multiple) this.resetInputHeight();
      },

      checkDefaultFirstOption() {
        if (this.state === 'selecting') {
          return;
        }
        this.hoverIndex = -1;
        for (let i = 0; i !== this.options.length; ++i) {
          const option = this.options[i];
          if (this.query) {
            // pick first options that passes the filter
            if (!option.disabled && !option.groupDisabled && option.visible) {
              this.hoverIndex = i;
              break;
            }
          } else {
            // pick currently selected option
            if (option.itemSelected) {
              this.hoverIndex = i;
              break;
            }
          }
        }
      },

      getValueKey(item) {
        if (Object.prototype.toString.call(item.value).toLowerCase() !== '[object object]') {
          return item.value;
        } else {
          return getValueByPath(item.value, this.valueKey);
        }
      },
      isValidKey(keyCode) {
        return (
          (keyCode > 47 && keyCode < 58) || // number keys
          keyCode === KEY_CODES.SPACE || // space
          (keyCode > 64 && keyCode < 91) || // letter keys
          (keyCode > 95 && keyCode < 112) || // numpad keys
          (keyCode > 185 && keyCode < 193) || // ;=,-./`
          (keyCode > 218 && keyCode < 223)
        ); // [\]'
      }
    },

    created() {
      this.cachedPlaceHolder = this.currentPlaceholder = this.placeholder;
      if (this.multiple && !Array.isArray(this.value)) {
        this.$emit('input', []);
      }
      if (!this.multiple && Array.isArray(this.value)) {
        this.$emit('input', '');
      }

      this.debouncedOnInputChange = debounce(this.debounce, (e) => {
        if (e.keyCode !== KEY_CODES.ENTER && e.keyCode !== KEY_CODES.TAB && e.keyCode !== KEY_CODES.ESC) {
          this.onInputChange();
        }
      });

      this.$on('handleOptionClick', this.handleOptionSelect);
      this.$on('onOptionDestroy', this.onOptionDestroy);
      this.$on('setSelected', this.setSelected);
    },
    mounted() {
      if (this.multiple && Array.isArray(this.value) && this.value.length > 0) {
        this.currentPlaceholder = '';
      }
      addResizeListener(this.$el, this.handleResize);
      if (this.remote && this.multiple) {
        this.resetInputHeight();
      }
      this.$nextTick(() => {
        if (this.$refs.reference && this.$refs.reference.$el) {
          this.inputWidth = this.$refs.reference.$el.getBoundingClientRect().width;
          this.ariaInit();
        }
        if (!this.multiple) {
          let currentLabel = this.selected && this.selected.currentLabel;
          if (this.selected && currentLabel !== '' && currentLabel !== undefined && currentLabel !== null) {
            this.selectedLabel = this.selected.currentLabel;
          } else {
            if (!this.filterable) {
              this.selectedLabel = this.cachedPlaceHolder;
            }
          }
          if (this.filterable && !this.options.length) {
            this.selectedLabel = this.cachedPlaceHolder;
          }
        }
      });

      this.setSelected();

    },
    updatePopper() {
      this.broadcast('ElSelectDropdown', 'updatePopper');
    },
    beforeDestroy() {
      if (this.$el && this.handleResize) removeResizeListener(this.$el, this.handleResize);
    }
  };

</script>
