<template>
  <transition name="el-zoom-in-top" @after-leave="$emit('dodestroy')">
    <div
        ref="container"
        v-show="visible"
        :style="{ width: width + 'px' }"
        class="el-picker-panel el-date-range-picker has-range"
        :class="[{
        'has-sidebar': $slots.sidebar || shortcuts,
        'has-time': showTime
      }, popperClass]" @keydown="handleKeyDown">
      <div class="el-picker-panel__body-wrapper">
        <slot name="sidebar" class="el-picker-panel__sidebar"></slot>
        <div class="el-picker-panel__sidebar" v-if="shortcuts" ref="shortcutsDev">
          <div class="el-picker-panel__sideborder">
            <fieldset>
              <legend class="el-picker-panel__data-range">{{ t('el.datepicker.presetDate') }}</legend>
              <button
                type="button"
                class="el-picker-panel__shortcut"
                :class="shortcut.className"
                v-for="(shortcut, index) in shortcuts"
                :key="`el-picker-panel__shortcut_${index}`"
                @click="handleShortcutClick(shortcut)">{{shortcut.text}}
            </button>
            </fieldset>
            <fieldset>
              <legend class="el-picker-panel__custom-range">{{ t('el.datepicker.customRange') }}</legend>
              <div class="el-date-range-picker__time-header">
                <!-- <div>
                  <span class="el-date-range-picker__time-title">{{ t('el.datepicker.from') }}</span>
                  <span class="el-date-range-picker__time-title">{{ t('el.datepicker.to') }}</span>
                </div> -->
                <div>
                    <span class="el-date-range-picker__editors-wrap">
                    <span class="el-date-range-picker__time-picker-wrap">
                        <label for="el-date-range-picker_from"><span class="el-date-range-picker__time-title">{{ t('el.datepicker.from') }}</span></label>
                        <div class="el-form-item">
                            <el-input
                                ref="minInput"
                                id="el-date-range-picker_from"
                                :aria-label="t('el.datepicker.fromStartDate')"
                                :placeholder="t('el.datepicker.startDate')"
                                class="el-date-range-picker__editor"
                                :value="minVisibleDate"
                                @input.native="handleDateInput($event, 'min')"
                                @keydown.native="handleInputKeyDown($event,'min')"
                                @blur="handleInputKeyDown($event,'min')"
                                @change.native="handleDateChange($event, 'min')"
                            />
                          </div>
                    </span>
                    <span class="el-date-range-picker__time-picker-wrap">
                        <label for="el-date-range-picker_to"><span class="el-date-range-picker__time-title">{{ t('el.datepicker.to') }}</span></label>
                        <div class="el-form-item">
                            <el-input
                                id="el-date-range-picker_to"
                                ref="maxInput"
                                :aria-label="t('el.datepicker.toEndDate')"
                                :placeholder="t('el.datepicker.endDate')"
                                class="el-date-range-picker__editor"
                                :value="maxVisibleDate"
                                @input.native="handleDateInput($event, 'max')"
                                @change.native="handleDateChange($event, 'max')"
                                @keydown.native="handleInputKeyDown($event,'max')"
                                @blur="handleInputKeyDown($event,'max')"
                            /></div>
                          </span>
                        <transition name="el-zoom-in-top">
                            <div class="el-form-item__error" role="alert" v-if="errorMessage"><i
                                class="icon-ng-inline-error"></i>
                                <div class="el-form-item__errorinfo" :id="errorInfoId">{{errorMessage}}</div>
                            </div>
                        </transition>
                    </span>
                </div>
              </div>
             </fieldset>
              <div class="el-date-range-picker__time-btn">
                <el-button
                    type="button"
                    class="el-button el-time-panel__btn el-button--default"
                    @click.native="handleCancel()">{{ t('el.datepicker.cancel') }}
                </el-button>
                <el-button
                    ref="okBtn"
                    type="button"
                    class="el-button el-button--primary el-time-panel__btn"
                    @click.native="handleConfirm()"
                    :disabled="btnDisabled">{{ t('el.datepicker.confirm') }}
                </el-button>
              </div>
          </div>
        </div>
        <div class="el-picker-panel__body" @keydown="handleDateTableKeydown" @keyup="handleKeyup">
          <div class="el-picker-panel__content el-date-range-picker__content is-left">
            <div class="el-date-range-picker__header">
              <button
                  type="button"
                  @keydown="prevMonth"
                  @click="prevMonth"
                  class="el-picker-panel__icon-btn icon-arrow-left" :aria-label="t('el.datepicker.previousMonth')">
              </button>
              <div role="heading" aria-level="2" aria-atomic="true" :aria-label="leftAriaLabel">{{ leftLabel }}</div>
            </div>
            <date-table
                ref="minTable"
                selection-mode="range"
                :date="date"
                :today="today"
                :year="leftYear"
                :month="leftMonth"
                :min-date="minDate"
                :max-date="maxDate"
                :range-state="rangeState"
                :disabled-date="disabledDate"
                @changerange="handleChangeRange"
                :first-day-of-week="firstDayOfWeek"
                :month-labelstr="leftLabel"
                @pick="handleRangePick">
            </date-table>
          </div>
          <div class="el-picker-panel__content el-date-range-picker__content is-right">
            <div class="el-date-range-picker__header">
              <div role="heading" aria-level="2" :aria-label="rightAriaLabel">{{ rightLabel }}</div>
               <button
                  type="button"
                  @keydown="nextMonth"
                  @click="nextMonth"
                  class="el-picker-panel__icon-btn icon-arrow-right" :aria-label="t('el.datepicker.nextMonth')">
              </button>
            </div>
            <date-table
                selection-mode="range"
                ref="maxTable"
                :date="rightDate"
                :today="today"
                :year="rightYear"
                :month="rightMonth"
                :min-date="minDate"
                :max-date="maxDate"
                :range-state="rangeState"
                :disabled-date="disabledDate"
                @changerange="handleChangeRange"
                :first-day-of-week="firstDayOfWeek"
                :month-labelstr="rightLabel"
                @pick="handleRangePick">
            </date-table>
          </div>
        </div>
      </div>
      <div class="el-picker-panel__footer" v-if="showTime">
        <a
            class="el-picker-panel__link-btn"
            @click="handleClear">{{ t('el.datepicker.clear') }}</a>
        <button
            type="button"
            class="el-picker-panel__btn"
            @click="handleConfirm()"
            :disabled="btnDisabled">{{ t('el.datepicker.confirm') }}
        </button>
      </div>
    </div>
  </transition>
</template>

<script type="text/babel">
  import {nextMonth, prevMonth, toDate, formatDate, parseDate} from '../util';
  import Locale from '../../../../src/mixins/locale';
  import TimePicker from './time';
  import DateTable from '../basic/date-table';
  import ElInput from '../../../../packages/input';
  import { KEY_CODES } from '../util';
  import { getFocusableItems } from '../../../../src/utils/accessibility';
  import { on, off } from '../../../../src/utils/dom';

  function isFunction(obj) {
    return typeof (obj) === 'function';
  }

  function removeClass(el, cls, table) {
    let names = el.className.split(' ');
    names = names.filter((name) => {
      if (name === cls) {
        return false;
      }
      return true;
    });
    el.className = names.join(' ');
    el.setAttribute('aria-selected', false);
  }

  function addClass(el, cls, table) {
    el.className = el.className + ' ' + cls;
    el.setAttribute('aria-selected', true);
    table.setAttribute('aria-activedescendant', el.id);
  }
  const monthLabel = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  export default {
    mixins: [Locale],

    computed: {
      btnDisabled() {
        return !(this.minDate && this.maxDate && !this.selecting && !this.errorMessage && this.validateValue());
      },

      leftLabel() {
        if (isFunction(this.formatMonthLabel)) {
          return this.formatMonthLabel(this.date);
        }
        return this.date.getFullYear() + ' ' + this.t('el.datepicker.year') + ' ' + this.t(`el.datepicker.month${this.date.getMonth() + 1}`);
      },
      leftAriaLabel() {
        return monthLabel[this.date.getMonth()] + ' ' + this.date.getFullYear() ;
      },
      rightAriaLabel() {
        return monthLabel[this.rightDate.getMonth()] + ' ' + this.rightDate.getFullYear();
      },
      rightLabel() {
        if (isFunction(this.formatMonthLabel)) {
          return this.formatMonthLabel(this.rightDate);
        }
        return this.rightDate.getFullYear() + ' ' + this.t('el.datepicker.year') + ' ' + this.t(`el.datepicker.month${this.rightDate.getMonth() + 1}`);
      },

      leftYear() {
        return this.date.getFullYear();
      },

      leftMonth() {
        return this.date.getMonth();
      },

      rightYear() {
        return this.rightDate.getFullYear();
      },

      rightMonth() {
        return this.rightDate.getMonth();
      },

      minVisibleDate() {
        return this.minDate ? formatDate(this.minDate, this.format) : '';
      },

      maxVisibleDate() {
        return (this.maxDate || this.minDate) ? formatDate(this.maxDate || this.minDate, this.format) : '';
      },

      minVisibleTime() {
        return this.minDate ? formatDate(this.minDate, 'HH:mm:ss') : '';
      },

      maxVisibleTime() {
        return (this.maxDate || this.minDate) ? formatDate(this.maxDate || this.minDate, 'HH:mm:ss') : '';
      },

      rightDate() {
        const newDate = new Date(this.date);
        const month = newDate.getMonth();
        newDate.setDate(1);

        if (month === 11) {
          newDate.setFullYear(newDate.getFullYear() + 1);
          newDate.setMonth(0);
        } else {
          newDate.setMonth(month + 1);
        }
        return newDate;
      }
    },
    mounted() {
      this.$nextTick(() => {
        this.handleAccessbility();
        // if (this.shortcuts) {
        //   let devRef = this.$refs.shortcutsDev;
        //   if (devRef) {
        //     let first = this.$refs.shortcutsDev.querySelector('button');
        //     first.focus();
        //     first.addEventListener('keydown', (e) => {
        //       if (e.shiftKey && e.keyCode === KEY_CODES.TAB) {
        //         e.preventDefault();
        //         e.stopPropagation();
        //         this.handleCancel();
        //       }
        //     });
        //   }
        // }
      });
    },
    unmount() {
      this.handleAccessbility(true);
    },
    data() {
      return {
        popperClass: '',
        minPickerWidth: 0,
        maxPickerWidth: 0,
        date: new Date(),
        minDate: '',
        maxDate: '',
        rangeState: {
          endDate: null,
          selecting: false,
          row: null,
          column: null
        },
        showTime: false,
        shortcuts: '',
        value: '',
        visible: '',
        disabledDate: '',
        firstDayOfWeek: 7,
        minTimePickerVisible: false,
        maxTimePickerVisible: false,
        width: 0,
        format: 'yyyy/MM/dd',
        today: '',
        formatMonthLabel: null,
        _selected: null,
        id: Date.now(),
        errorMessage: '',
        errorInfoId: '',
        formatErrorMessage: this.t('message.mymeetings.dateFormatError') || 'Enter a date in the format {format}.',
        startLessEndMessage: this.t('message.mymeetings.dateTimeError') || 'Start time must be less than end time.',
        disabledRangeErrorMessage: this.t('message.mymeetings.dateTimeDisabledError') || 'Try entering a different date.'
      };
    },

    watch: {
      showTime(val) {
        if (!val) return;
        this.$nextTick(_ => {
          const minInputElm = this.$refs.minInput && this.$refs.minInput.$el;
          const maxInputElm = this.$refs.minInput && this.$refs.maxInput.$el;
          if (minInputElm) {
            this.minPickerWidth = minInputElm.getBoundingClientRect().width + 10;
          }
          if (maxInputElm) {
            this.maxPickerWidth = maxInputElm.getBoundingClientRect().width + 10;
          }
        });
      },

      minDate() {
        this.$nextTick(() => {
          if (this.maxDate && this.maxDate < this.minDate) {
            const format = 'HH:mm:ss';

            this.$refs.maxTimePicker.selectableRange = [
              [
                parseDate(formatDate(this.minDate, format), format),
                parseDate('23:59:59', format)
              ]
            ];
          }
        });
      },

      minTimePickerVisible(val) {
        if (val) this.$nextTick(() => this.$refs.minTimePicker.ajustScrollTop());
      },

      maxTimePickerVisible(val) {
        if (val) this.$nextTick(() => this.$refs.maxTimePicker.ajustScrollTop());
      },

      value(newVal) {
        if (!newVal) {
          this.minDate = null;
          this.maxDate = null;
        } else if (Array.isArray(newVal)) {
          this.minDate = newVal[0] ? toDate(newVal[0]) : null;
          this.maxDate = newVal[1] ? toDate(newVal[1]) : null;
          if (this.minDate) this.date = new Date(this.minDate);
          this.handleConfirm(true);
        }
      },
      visible(val) {
        this.$nextTick(() => {
          if (val && this.$refs.shortcutsDev) {
            let first = this.$refs.shortcutsDev.querySelector('button');
            setTimeout(()=>{
              first.focus();
            }, 100);
          }
        });
        if (!val) {
          this.$emit('blur');
        }
      }
    },
    methods: {
      setFocus() {
        // let items = getFocusableItems(this.)
      },
      validateValue() {
        if (this.$refs.minInput && !this.checkFormat(this.$refs.minInput.$el.querySelector('input').value)) {
          return false;
        }
        if (this.$refs.maxInput && !this.checkFormat(this.$refs.maxInput.$el.querySelector('input').value)) {
          return false;
        }
        return true;
      },
      focus(e) {
        if (this.$refs.shortcutsDev) {
          this.$refs.shortcutsDev.querySelector('button').focus();
        }
        if (e) {
          e.stopPropagation();
          e.preventDefault();
        }
      },
      handleClear() {
        this.minDate = null;
        this.maxDate = null;
        this.handleConfirm(false);
      },
      handleBlur(e) {
        if (this.btnDisabled) {
          this.$emit('blur');
        }
      },
      handleCancel() {
        this.minDate = '';
        this.maxDate = '';
        this.value = '';
        this.$emit('blur');
      },
      setErrorMessage(event, msg, type) {
        this.errorMessage = msg;
        this.errorInfoId = this.id + '_' + type;
        let describedby = this.errorInfoId;
        if (!msg) {
          describedby = '';

        }
        if (!event) {
          return;
        }

        let input = event.target;
        if (input) {
          if (describedby) {
            input.setAttribute('aria-describedby', describedby);
            // event.stopPropagation();
            // event.preventDefault();
          } else {
            input.removeAttribute('aria-describedby');
          }
        }
      },
      checkFormat(value) {
        const parsedValue = parseDate(value, this.format);
        if (formatDate(parsedValue, this.format) !== value) {
          return false;
        }
        return true;
      },

      checkInputError(minImputEl) {
        let result = false;
        let className = 'el-form-item';
        if (!this.checkFormat(minImputEl && minImputEl.querySelector('input').value)) {
          className += ' is-error ';
          result = true;
        }
        minImputEl.parentNode.className = className;
        console.debug(minImputEl, className);
        return result;
      },
      checkInputValue(type, event){
        const input = this.$refs[type + 'Input'].$el.querySelector('input');
        const value = input.value;
        const hasError = input.parentElement.parentElement.classList.contains('is-error');
        let isBlur = event && (event.keyCode === 9 || event.type === 'blur');
        const showError = isBlur || hasError
        const parsedValue = parseDate(value, this.format);
        if(!parsedValue || formatDate(parsedValue, this.format) !== value) {
          isBlur && this.setInputError(input,type, this.formatErrorMessage.replace('{format}', this.format));
          return false
        }

        if (typeof this.disabledDate === 'function' && this.disabledDate(parsedValue)){
          isBlur && this.setInputError(input, type, this.disabledRangeErrorMessage);
          return false
        }

        let start;
        let end;
        if (type === 'min') {
          start = parsedValue;
          end = parseDate(this.$refs.maxInput.value, this.format);
        } else {
          end = parsedValue;
          start = parseDate(this.$refs.minInput.value, this.format);
        }
        if (start && end && start.getTime() > end.getTime()) {
          isBlur && this.setInputError(input,type, this.startLessEndMessage);
          return;
        }
        if (type === 'min') {
          this.minDate = parsedValue;
        } else {
          this.maxDate = parsedValue;
        }

        this.setInputError(input, type, '');
        return true;
      },
      setRange(start, end) {
        this.minDate = start;
        this.maxDate = end;
        this.$nextTick(() => {
          if (this.checkInputValue('min', {type: 'blur'}) && this.checkInputValue('max', {type: 'blur'})) {
            this.$emit('pick', [start, end]);
          }
        });
      },
      setInputError(input, type, msg) {
        let describedby = this.id + '_' + type;
        this.errorMessage = msg;
        this.errorInfoId = describedby;
        if (!msg) {
          describedby = '';
          input.parentElement.parentElement.classList.remove('is-error');
        } else {
          input.parentElement.parentElement.classList.add('is-error');
        }

        if (describedby) {
          input.setAttribute('aria-describedby', describedby);
        } else {
          input.removeAttribute('aria-describedby');
        }

      },
      handleDateChange(event, type) {
        const value = event.target.value;
        if(typeof this.disabledDate === 'function'){
            return this.checkInputValue(type,event)
        }
        if (!this.checkFormat(value)) {
          return;
        }
        const parsedValue = parseDate(value, this.format);
        if (parsedValue) {
          const target = new Date(type === 'min' ? this.minDate : this.maxDate);
          if (target) {
            target.setFullYear(parsedValue.getFullYear());
            target.setMonth(parsedValue.getMonth(), parsedValue.getDate());
          }
          if (type === 'min') {
            this.minDate = new Date(target.getTime());
            if (target > this.maxDate) {
              this.maxDate = new Date(target.getTime());
            }
          } else {
            if (target > this.minDate) {
              this.maxDate = new Date(target.getTime());
              if (this.minDate && this.minDate > this.maxDate) {
                this.minDate = null;
              }
            }
          }
        }
      },
      handleInputKeyDown(event, type) {
        if(typeof this.disabledDate === 'function'){
            return this.checkInputValue(type,event)
        }
        const value = event.target.value;
        const parsedValue = parseDate(value, this.format);
        let needCheckDate = event.keyCode === 9 || event.type === 'blur';
        if (!needCheckDate) {
          this.setErrorMessage(event, '');
          return;
        }
        let maxError = this.checkInputError(this.$refs.maxInput.$el);
        let minError = this.checkInputError(this.$refs.minInput.$el);
        if (minError || maxError) {
          this.setErrorMessage(event, this.formatErrorMessage.replace('{format}', this.format), type);
          return;
        }

        if (parsedValue) {

          if (typeof this.disabledDate === 'function' &&
            this.disabledDate(new Date(parsedValue))) {
            this.setErrorMessage(event, '', type);
            return;
          }

          let start;
          let end;
          if (type === 'min') {
            start = parsedValue;
            end = parseDate(this.$refs.maxInput.value, this.format);
          } else {
            end = parsedValue;
            start = parseDate(this.$refs.minInput.value, this.format);
          }
          if (start && end && start.getTime() > end.getTime()) {
            let message = this.startLessEndMessage;
            this.setErrorMessage(event, message);
            return;
          }
          this.setErrorMessage(event, '');
        } else {
          if (needCheckDate) {
            this.setErrorMessage(event, this.formatErrorMessage.replace('{format}', this.format), type);
            return;
          }
        }
      },
      handleDateInput(event, type) {
        const value = event.target.value;
        if(typeof this.disabledDate === 'function'){
            return this.checkInputValue(type,event)
        }

        const parsedValue = parseDate(value, 'yyyy-MM-dd');
        if (!this.checkFormat(value)) {
          return;
        }
        if (parsedValue) {
          const target = new Date(type === 'min' ? this.minDate : this.maxDate);
          if (target) {
            target.setFullYear(parsedValue.getFullYear());
            target.setMonth(parsedValue.getMonth(), parsedValue.getDate());
          }
        }
      },
      handleKeyDown(event) {
        const keyCode = event.keyCode;
        if (keyCode === KEY_CODES.ESC) {
          this.visible = false;
          event.stopPropagation();
          this.$emit('blur');
          return;
        }
      },
      handleKeyup(event) {
        if (event.keyCode === KEY_CODES.TAB) {
          this.selecting = false;
        }
      },
      handleDateTableKeydown(event) {
        const keyCode = event.keyCode;
        const list = [KEY_CODES.UP, KEY_CODES.DOWN, KEY_CODES.LEFT, KEY_CODES.RIGHT];
        let target;
        let newDate;
        let table;
        if (list.indexOf(keyCode) !== -1) {
          event.stopPropagation();
          event.preventDefault();
          newDate = this.getNewDate(keyCode, this._selected && this._selected.date);
          if (event.target.tagName === 'TBODY') {
            if (event.target === this.$refs.minTable.$el.querySelector('tbody')) {
              newDate.setMonth(this.leftMonth);
              newDate.setDate(1);
              table = this.$refs.minTable;
            } else if (event.target === this.$refs.maxTable.$el.querySelector('tbody')) {
              newDate.setMonth(this.rightMonth);
              newDate.setDate(1);
              table = this.$refs.maxTable;
            }
            target = table.getCellElByDate(newDate);
          } else {
            if (this.$refs.maxTable.$el.contains(event.target)) {
              table = this.$refs.maxTable;
              if (newDate.getMonth() < this.rightDate.getMonth()) {
                table = this.$refs.minTable;
                if (newDate.getFullYear() > this.rightDate.getFullYear()) {
                  table = this.$refs.maxTable;
                  this.date = nextMonth(this.date);
                }
              } else if (newDate.getMonth() > this.rightDate.getMonth()) {
                this.date = nextMonth(this.date);
              }
            } else {
              table = this.$refs.minTable;
              if (newDate.getMonth() > this.date.getMonth()) {
                table = this.$refs.maxTable;
                if (newDate.getFullYear() < this.date.getFullYear()) {
                  this.date = prevMonth(this.date);
                  table = this.$refs.minTable;
                }
              } else if (newDate.getMonth() < this.date.getMonth()) {
                this.date = prevMonth(this.date);
              }
            }
            target = table.getCellElByDate(newDate);
          }
          if (!target) {
            return;
          }
          if (this._selected && this._selected.target) {
            removeClass(this._selected.target, 'hover', table.$el);
          }
          this._selected = {
            date: newDate,
            table: table,
            target: target
          };
          addClass(target, 'hover', table.$el);
          target.querySelector('[role="button"]').focus();
        }

        let evName = 'handleMouseMove';
        if (keyCode === 13 || keyCode === 32) {
          evName = 'handleClick';
          event.stopPropagation();
          event.preventDefault();
        }

        if (this._selected) {
          let fn = this._selected.table[evName];
          let target = this._selected.target;
          fn({
            target: target
          });
          if (evName === 'handleClick') {
            removeClass(this._selected.target, 'hover');
            this.$nextTick(() => {
              if (!this.btnDisabled) {
                this.$refs.okBtn.$el.focus();
                this._selected = null;
              }
            });

          }
        }
      },

      getNewDate(keyCode, oldDate) {
        const mapping = {
          'day': {
            [KEY_CODES.UP]: -7, [KEY_CODES.DOWN]: 7, [KEY_CODES.LEFT]: -1, [KEY_CODES.RIGHT]: 1, offset: (date, step) => date.setDate(date.getDate() + step)
          }
        };

        const year = 3.1536e10;
        let now = (oldDate || this.maxDate || this.minDate || this.date).getTime();
        const selectDate = now;
        const newDate = new Date(selectDate);
        while (Math.abs(now - newDate.getTime()) <= year) {
          const map = mapping['day'];
          map.offset(newDate, map[keyCode]);
          if (typeof this.disabledDate === 'function' && this.disabledDate(newDate)) {
            continue;
          }
          return newDate;
        }
      },
      handleChangeRange(val) {

        this.minDate = val.minDate;
        this.maxDate = val.maxDate;
        this.rangeState = val.rangeState;
      },

      handleTimeChange(event, type) {
        const value = event.target.value;
        const parsedValue = parseDate(value, 'HH:mm:ss');
        if (parsedValue) {
          const target = new Date(type === 'min' ? this.minDate : this.maxDate);
          if (target) {
            target.setHours(parsedValue.getHours());
            target.setMinutes(parsedValue.getMinutes());
            target.setSeconds(parsedValue.getSeconds());
          }
          if (type === 'min') {
            if (target < this.maxDate) {
              this.minDate = new Date(target.getTime());
            }
          } else {
            if (target > this.minDate) {
              this.maxDate = new Date(target.getTime());
            }
          }
          this.$refs[type + 'TimePicker'].value = target;
          this[type + 'TimePickerVisible'] = false;
        }
      },
      handleRangePick(val, close = true) {
        if (this.maxDate === val.maxDate && this.minDate === val.minDate) {
          return;
        }
        this.errorMessage = '';
        if (this.$refs && this.$refs.minInput) {
          this.checkInputError(this.$refs.maxInput.$el);
          this.checkInputError(this.$refs.minInput.$el);
          this.setErrorMessage(null, '');
          this.onPick && this.onPick(val);
          this.maxDate = val.maxDate;
          this.minDate = val.minDate;
          if (!close || this.showTime || this.shortcuts) return;
          this.handleConfirm();
        }
      },

      changeToToday() {
        this.date = new Date(this.today);
      },

      handleShortcutClick(shortcut) {
        if (shortcut.onClick) {
          shortcut.onClick(this);
        }
      },

      resetView() {
        this.minTimePickerVisible = false;
        this.maxTimePickerVisible = false;
        this.errorMessage = '';
        if (this.$refs.maxInput) {
          this.$refs.maxInput.$el.parentNode.className = 'el-form-item';
        }
        if (this.$refs.maxInput) {
          this.$refs.minInput.$el.parentNode.className = 'el-form-item';
        }
      },

      setTime(date, value) {
        let oldDate = new Date(date.getTime());
        let hour = value.getHours();
        let minute = value.getMinutes();
        let second = value.getSeconds();
        oldDate.setHours(hour);
        oldDate.setMinutes(minute);
        oldDate.setSeconds(second);
        return new Date(oldDate.getTime());
      },

      handleMinTimePick(value, visible, first) {
        this.minDate = this.minDate || new Date();
        if (value) {
          this.minDate = this.setTime(this.minDate, value);
        }

        if (!first) {
          this.minTimePickerVisible = visible;
        }
      },

      handleMaxTimePick(value, visible, first) {
        if (!this.maxDate) {
          const now = new Date();
          if (now >= this.minDate) {
            this.maxDate = new Date();
          }
        }
        if (this.maxDate && value) {
          this.maxDate = this.setTime(this.maxDate, value);
        }

        if (!first) {
          this.maxTimePickerVisible = visible;
        }
      },

      prevMonth(event) {
        if (event.keyCode) {
          if (event.keyCode === KEY_CODES.SPACE || event.keyCode === KEY_CODES.ENTER) {
            event.stopPropagation();
            event.preventDefault();
            this.date = prevMonth(this.date);
          }
        } else {
          this.date = prevMonth(this.date);
        }
      },

      nextMonth(event) {
        if (event.keyCode) {
          if (event.keyCode === KEY_CODES.SPACE || event.keyCode === KEY_CODES.ENTER) {
            event.stopPropagation();
            event.preventDefault();
            this.date = nextMonth(this.date);
          }
        } else {
          this.date = nextMonth(this.date);
        }
      },

      nextYear() {
        const date = this.date;
        date.setFullYear(date.getFullYear() + 1);
        this.resetDate();
      },

      prevYear() {
        const date = this.date;
        date.setFullYear(date.getFullYear() - 1);
        this.resetDate();
      },

      handleConfirm(visible = false) {
        this.$emit('pick', [this.minDate, this.maxDate], visible);
      },

      resetDate() {
        this.date = new Date(this.date);
        this.minDate = '';
        this.maxDate = '';
        this.value = null;
      },
       /**
     * add focus cycle
     */
      handleAccessbility(isOff) {
        const $container = this.$refs.container;
        let items = getFocusableItems($container);
        const that = this;
        this._handleTriggerKeyDown = (e) =>{
          items = getFocusableItems($container);
          let first = items[0];
          let latest = items[items.length - 1];
          if (e.shiftKey) {
            if (e.keyCode === KEY_CODES.TAB) {
              e.preventDefault();
              if (e.target === first) {
                latest.focus();
              } else {
                let idx = items.indexOf(e.target);
                if (items[idx - 1]) {
                  items[idx - 1].focus();
                } else {
                  if (this.$refs.maxTable.$el.contains(e.target)) {
                    idx = items.indexOf(this.$refs.maxTable.$el.querySelector('tbody'));
                    items[idx - 1].focus();
                  } else if (this.$refs.minTable.$el.contains(e.target)) {
                    idx = items.indexOf(this.$refs.minTable.$el.querySelector('tbody'));
                    items[idx - 1].focus();
                  } else {
                    items[0].focus();
                  }
                }
              }
            }
          } else {
            if (latest && (e.target === latest || latest.contains(e.target)) && e.keyCode === KEY_CODES.TAB) {
              e.preventDefault();
              first.focus();
            }
          }
        };
        this._handleTabOut = (e)=> {
          items = getFocusableItems($container);
          if (e.keyCode === KEY_CODES.TAB && e.target === items[items.length - 1]) {
            e.preventDefault();
            that.$el.focus();
          } else if (e.keyCode === KEY_CODES.ESC) {
            this.handleCancel();
          }
        };
        if (isOff) {
          off($container, 'keydown', this._handleTabOut);
          off($container, 'keydown', this._handleTriggerKeyDown);
          return;
        }
        on($container, 'keydown', this._handleTabOut);
        on($container, 'keydown', this._handleTriggerKeyDown);
      }
    },
    components: {TimePicker, DateTable, ElInput}
  };
</script>
