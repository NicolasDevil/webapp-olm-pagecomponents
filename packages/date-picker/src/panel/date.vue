<template>
  <transition name="el-zoom-in-top" @after-leave="$emit('dodestroy')">
    <div
      v-show="visible"
      :style="{
        width: width + 'px',
      }"
      class="el-picker-panel el-date-picker"
      :class="[
        {
          'has-sidebar': $slots.sidebar || shortcuts,
          'has-time': showTime,
        },
        popperClass,
      ]"
    >
      <div ref="container" class="el-picker-panel__body-wrapper">
        <slot name="sidebar" class="el-picker-panel__sidebar"></slot>
        <div class="el-picker-panel__sidebar" v-if="shortcuts">
          <button
            :key="`el-picker-panel__shortcut_${index}`"
            type="button"
            class="el-picker-panel__shortcut"
            v-for="(shortcut, index) in shortcuts"
            @click="handleShortcutClick(shortcut)"
          >
            {{ shortcut.text }}
          </button>
        </div>
        <div class="el-picker-panel__body">
          <div class="el-date-picker__time-header" v-if="showTime">
            <span class="el-date-picker__editor-wrap">
              <el-input
                role="button"
                :placeholder="t('el.datepicker.selectDate')"
                :value="visibleDate"
                size="small"
                @input="(val) => (userInputDate = val)"
                @change="handleVisibleDateChange"
              />
            </span>
            <span class="el-date-picker__editor-wrap">
              <el-input
                ref="input"
                @focus="timePickerVisible = !timePickerVisible"
                :placeholder="t('el.datepicker.selectTime')"
                :value="visibleTime"
                size="small"
                @change.native="visibleTime = $event.target.value"
              />
              <time-picker
                ref="timepicker"
                :date="date"
                :picker-width="pickerWidth"
                @pick="handleTimePick"
                :visible="timePickerVisible"
                @mounted="$refs.timepicker.format = timeFormat"
              >
              </time-picker>
            </span>
          </div>
          <div class="el-date-picker__header" v-show="currentView !== 'time'">
            <button
              type="button"
              @click="prevMonth"
              v-show="currentView === 'date'"
              class="el-picker-panel__icon-btn el-date-picker__prev-btn icon-ng-left"
              :aria-label="pre"
            ></button>
            <h2>
              {{ monthLabel }}
            </h2>
            <span
              id="month"
              role="heading"
              aria-live="assertive"
              aria-atomic="true"
              aria-hidden="true"
              @click="showYearPicker"
              class="el-date-picker__header-label"
              style="display: none"
              >{{ monthLabel }}</span
            >
            <button
              type="button"
              @click="nextMonth"
              v-show="currentView === 'date'"
              class="el-picker-panel__icon-btn el-date-picker__next-btn icon-ng-right"
              :aria-label="next"
            ></button>
          </div>

          <div class="el-picker-panel__content">
            <date-table
              v-show="currentView === 'date'"
              @pick="handleDatePick"
              :year="year"
              :month="month"
              :date="date"
              :week="week"
              :value="date"
              :locale="locale"
              :selection-mode="selectionMode"
              :first-day-of-week="firstDayOfWeek"
              :disabled-date="disabledDate"
              @cellfocus="handleCellFocus"
              @blur="handleBlur"
              :month-labelstr="monthLabel"
            >
            </date-table>
            <year-table
              ref="yearTable"
              :year="year"
              :locale="locale"
              :date="date"
              v-show="currentView === 'year'"
              @pick="handleYearPick"
              :disabled-date="disabledDate"
            >
            </year-table>
            <month-table
              :month="month"
              :locale="locale"
              :date="date"
              v-show="currentView === 'month'"
              @pick="handleMonthPick"
              :disabled-date="disabledDate"
            >
            </month-table>
          </div>
        </div>
      </div>

      <div
        class="el-picker-panel__footer"
        v-show="footerVisible && currentView === 'date'"
      >
        <a
          href="JavaScript:"
          class="el-picker-panel__link-btn"
          @click="changeToNow"
          >{{ t("el.datepicker.now") }}</a
        >
        <button type="button" class="el-picker-panel__btn" @click="confirm">
          {{ t("el.datepicker.confirm") }}
        </button>
      </div>
    </div>
  </transition>
</template>

<script type="text/babel">
import { formatDate, parseDate, getWeekNumber, KEY_CODES } from '../util';
import { modifyTime } from '../util/date-util';
import Locale from '../../../../src/mixins/locale';
import ElInput from '../../../../packages/input';
import TimePicker from './time';
import YearTable from '../basic/year-table';
import MonthTable from '../basic/month-table';
import DateTable from '../basic/date-table';
import { on, off } from '../../../../src/utils/dom';
import { getFocusableItems } from '../../../../src/utils/accessibility';

function addClass(el, cls, table) {
  el.className = el.className + ' ' + cls;
  el.setAttribute('aria-selected', true);
  table.setAttribute('aria-activedescendant', el.id);
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
//  import TimeTable from '../basic/time-table';
function isFunction(obj) {
  return typeof obj === 'function';
}
export default {
  mixins: [Locale],
  props: {
    locale: String
  },
  watch: {
    showTime(val) {
      /* istanbul ignore if */
      if (!val) return;
      this.$nextTick((_) => {
        const inputElm = this.$refs.input.$el;
        if (inputElm) {
          this.pickerWidth = inputElm.getBoundingClientRect().width + 10;
        }
      });
    },

    value(newVal) {
      if (!newVal) return;
      newVal = new Date(newVal);
      if (!isNaN(newVal)) {
        if (
          typeof this.disabledDate === 'function' &&
          this.disabledDate(new Date(newVal))
        ) {
          return;
        }
        this.date = newVal;
        this.year = newVal.getFullYear();
        this.month = newVal.getMonth();
        this.$emit('pick', newVal, false);
        this.setFocusDay(newVal);
      }
    },

    timePickerVisible(val) {
      if (val) this.$nextTick(() => this.$refs.timepicker.ajustScrollTop());
    },

    selectionMode(newVal) {
      if (newVal === 'month') {
        /* istanbul ignore next */
        if (this.currentView !== 'year' || this.currentView !== 'month') {
          this.currentView = 'month';
        }
      } else if (newVal === 'week') {
        this.week = getWeekNumber(this.date);
      }
    },

    date(newVal) {
      if (newVal) {
        this.year = newVal.getFullYear();
        this.month = newVal.getMonth();
      }
      if (this.selectionMode === 'week') {
        this.week = getWeekNumber(newVal);
      } else {
        this.$nextTick(()=>{
          if (!this.date) {
            newVal && this.setFocusDay(newVal);
          } else if (
            document.activeElement &&
            document.activeElement.classList.contains('.datepicker-day-btn')
          ) {
            newVal && this.setFocusDay(newVal);
          }
        });
      }
    },
    visible(val) {
      const _this = this;
      this.$nextTick(() => {
        if (val) {
          if (this.focusDay.domNode) {
            this.focusDay.domNode.focus();
          } else {
            setTimeout(()=>{
              let btn = _this.$el.querySelector('.available.current>.datepicker-day-btn');
              btn && btn.focus();
            }, 100);
          }
        }
      });
      if (!val) {
        this.$emit('blur');
      }
    },
    disabledDate(fn) {
      if (typeof fn === 'function') {
        this.$nextTick(()=>{
          this.date = this.getFirstFocusDay();
        });
      }
    },
    locale(val) {
      this.locale = val;
    }
  },

  methods: {
    handleClear() {
      this.date = this.$options.defaultValue
        ? new Date(this.$options.defaultValue)
        : new Date();
      this.$emit('pick');
    },

    resetDate() {
      this.date = new Date(this.date);
      this.setFocusDay(this.date);
    },

    showMonthPicker() {
      this.currentView = 'month';
    },

    showYearPicker() {
      this.currentView = 'year';
    },
    prevMonth() {
      this.month--;
      if (this.month < 0) {
        this.month = 11;
        this.year--;
      }
      this.date.setMonth(this.month);
      this.date.setFullYear(this.year);
    },

    nextMonth() {
      this.month++;
      if (this.month > 11) {
        this.month = 0;
        this.year++;
      }
      this.date.setMonth(this.month);
      this.date.setFullYear(this.year);
    },

    nextYear() {
      if (this.currentView === 'year') {
        this.$refs.yearTable.nextTenYear();
      } else {
        this.year++;
        this.date.setFullYear(this.year);
        this.resetDate();
      }
    },

    prevYear() {
      if (this.currentView === 'year') {
        this.$refs.yearTable.prevTenYear();
      } else {
        this.year--;
        this.date.setFullYear(this.year);
        this.resetDate();
      }
    },

    handleShortcutClick(shortcut) {
      if (shortcut.onClick) {
        shortcut.onClick(this);
      }
    },
    focus() {
      this.$el.focus();
    },
    handleTimePick(picker, visible, first) {
      if (picker) {
        let oldDate = new Date(this.date.getTime());
        let hour = picker.getHours();
        let minute = picker.getMinutes();
        let second = picker.getSeconds();
        oldDate.setHours(hour);
        oldDate.setMinutes(minute);
        oldDate.setSeconds(second);
        this.date = new Date(oldDate.getTime());
      }

      if (!first) {
        this.timePickerVisible = visible;
      }
    },

    handleMonthPick(month) {
      this.month = month;
      const selectionMode = this.selectionMode;
      if (selectionMode !== 'month') {
        this.date.setMonth(month);
        this.currentView = 'date';
        this.resetDate();
      } else {
        this.date.setMonth(month);
        this.year && this.date.setFullYear(this.year);
        this.resetDate();
        const value = new Date(this.date.getFullYear(), month, 1);
        this.$emit('pick', value);
      }
    },

    handleVisibleDateChange(value) {
      const date = parseDate(value, this.dateFormat);
      if (date) {
        if (
          typeof this.disabledDate === 'function' &&
          this.disabledDate(date)
        ) {
          return;
        }
        this.date = modifyTime(
          date,
          this.date.getHours(),
          this.date.getMinutes(),
          this.date.getSeconds()
        );
        this.userInputDate = null;
        this.resetView();
        this.emit(this.date, true);
      }
    },

    handleDatePick(value, isClick) {
      const pickDate = new Date(value);
      if (!this.date) this.date = pickDate;
      if (this.selectionMode === 'day') {
        if (!this.showTime) {
          this.$emit('pick', pickDate, false, isClick);
        }
        this.date.setFullYear(pickDate.getFullYear());
        this.date.setMonth(pickDate.getMonth(), pickDate.getDate());
        this.setFocusDay(pickDate);
      } else if (this.selectionMode === 'week') {
        this.week = pickDate.week;
        this.$emit('pick', pickDate);
      }
    },

    handleCellFocus(target) {
      let table;
      if (this._selected && this._selected.target) {
        removeClass(this._selected.target, 'hover', this._selected.table);
      }
      const dateStr = target.getAttribute('data-date');
      const curDate = new Date(+dateStr);
      if (curDate.getMonth() === this.leftMonth) {
        table = this.$refs.minTable;
      } else {
        table = this.$refs.maxTable;
      }
      this._selected = {
        date: new Date(+dateStr),
        table: table,
        target
      };
      addClass(target, 'hover', target.parentNode.offsetParent);
    },
    handleYearPick(year, close = true) {
      this.year = year;
      if (!close) return;

      this.date.setFullYear(year);
      if (this.selectionMode === 'year') {
        this.$emit('pick', new Date(year));
      } else {
        this.currentView = 'month';
      }

      this.resetDate();
    },

    changeToNow() {
      this.date.setTime(+new Date());
      this.$emit('pick', new Date(this.date.getTime()));
      this.setFocusDay(new Date(this.date.getTime()));
      this.resetDate();
    },

    confirm() {
      this.$emit('pick', this.date);
    },

    resetView() {
      if (this.selectionMode === 'month') {
        this.currentView = 'month';
      } else if (this.selectionMode === 'year') {
        this.currentView = 'year';
      } else {
        this.currentView = 'date';
      }

      if (this.selectionMode !== 'week') {
        this.year = this.date.getFullYear();
        this.month = this.date.getMonth();
      }
    },
    getFirstFocusDay() {
      let date;
      if (this.$options.defaultValue) {
        return new Date(this.$options.defaultValue);
      } else {
        date = new Date();
        if (typeof this.disabledDate === 'function') {
          // loop find the first avaliable date after today
          while (this.disabledDate(date)) {
            date.setDate(date.getDate() + 1);
          }
        }
        return date;
      }
    },
    setFocusDay(date) {
      const dateStr = date.getDate();
      let domItem = this.$refs.container.querySelector(`[data-date="${dateStr}"][data-month="${date.getMonth()}"]>.datepicker-day-btn`);
      if (this.focusDay.domNode) {
        this.focusDay.domNode && this.focusDay.domNode.setAttribute('tabindex', -1);
      }
      this.focusDay.day = date;
      this.focusDay.domNode = domItem;
      this.$nextTick(()=>{
        domItem = this.$refs.container.querySelector(`[data-date="${dateStr}"][data-month="${date.getMonth()}"]>.datepicker-day-btn`);
        if (domItem) {
          this.focusDay.domNode = domItem;
          setTimeout(()=>{
            domItem = this.$refs.container.querySelector(`[data-date="${dateStr}"][data-month="${date.getMonth()}"]>.datepicker-day-btn`);
            domItem && domItem.focus();
            domItem.setAttribute('tabindex', 0);
          }, 10);
        } else {
          setTimeout(()=>{
            domItem = this.$refs.container.querySelector(`[data-date="${dateStr}"][data-month="${date.getMonth()}"]>.datepicker-day-btn`);
            this.focusDay.domNode = domItem;
            domItem && domItem.focus();
            domItem.setAttribute('tabindex', 0);
          }, 10);
        }
      });
    },
    /**
     * add focus cycle
     */
    handleAccessbility(isOff) {
      const $container = this.$refs.container;
      let items = getFocusableItems($container);
      this._handleTriggerKeyDown = (e) =>{
        items = getFocusableItems($container);
        if (e.shiftKey) {
          e.preventDefault();
          if (e.keyCode === KEY_CODES.TAB) {
            if (e.target === items[0]) {
              items[items.length - 1].focus();
            } else {
              let idx = items.indexOf(e.target);
              items[idx - 1].focus();
            }
          }
          return;
        }
        if (e.keyCode === KEY_CODES.TAB && e.target === items[items.length - 1]) {
          e.preventDefault();
          items[0].focus();
        } else if (e.keyCode === KEY_CODES.ENTER) {
          if (e.target.classList.contains('datepicker-day-btn')) {
            this.$emit('pick', this.date);
            if (!this.isInline) {
              this.$emit('blur');
            }
          }
        } else if (e.keyCode === KEY_CODES.ESC) {
          this.$emit('blur');
        }
      };
      if (isOff) {
        off($container, 'keydown', this._handleTriggerKeyDown);
        return;
      }
      on($container, 'keydown', this._handleTriggerKeyDown);
    },
    handleBlur() {
      this.$emit('blur');
    }
  },
  components: {
    TimePicker,
    YearTable,
    MonthTable,
    DateTable,
    ElInput
  },
  mounted() {
    if (this.date && !this.year) {
      this.year = this.date.getFullYear();
      this.month = this.date.getMonth();
    }
    if (!this.$options.isInline) {
      this.handleAccessbility();
    }
  },
  unmounted() {
    if (!this.$options.isInline) {
      this.handleAccessbility(true);
    }
  },

  data() {
    return {
      popperClass: '',
      pickerWidth: 0,
      date: this.getFirstFocusDay(),
      value: '',
      showTime: false,
      selectionMode: 'day',
      shortcuts: '',
      visible: false,
      currentView: 'date',
      disabledDate: '',
      firstDayOfWeek: 7,
      year: null,
      month: null,
      week: null,
      showWeekNumber: false,
      timePickerVisible: false,
      width: 0,
      format: '',
      formatMonthLabel: null,
      hideOnLeave: true,
      pre: this.t('message.mymeetings.preMonth') || 'Previous month',
      next: this.t('message.mymeetings.next3Months') || 'Next month',
      focusDay: {}
    };
  },

  computed: {
    monthLabel() {
      if (isFunction(this.formatMonthLabel)) {
        return this.formatMonthLabel(
          new Date(this.year, parseInt(this.month, 10), 1)
        );
      }
    },
    footerVisible() {
      return this.showTime;
    },

    visibleTime: {
      get() {
        return formatDate(this.date, this.timeFormat);
      },

      set(val) {
        if (val) {
          const date = parseDate(val, this.timeFormat);
          if (date) {
            date.setFullYear(this.date.getFullYear());
            date.setMonth(this.date.getMonth());
            date.setDate(this.date.getDate());
            this.date = date;
            this.$refs.timepicker.value = date;
            this.timePickerVisible = false;
          }
        }
      }
    },

    visibleDate: {
      get() {
        return formatDate(this.date);
      },

      set(val) {
        const date = parseDate(val, 'yyyy-MM-dd');
        if (!date) {
          return;
        }
        if (
          typeof this.disabledDate === 'function' &&
          this.disabledDate(date)
        ) {
          return;
        }
        date.setHours(this.date.getHours());
        date.setMinutes(this.date.getMinutes());
        date.setSeconds(this.date.getSeconds());
        this.date = date;
        this.resetView();
      }
    },

    yearLabel() {
      const year = this.year;
      if (!year) return '';
      const yearTranslation = this.t('el.datepicker.year');
      if (this.currentView === 'year') {
        const startYear = Math.floor(year / 10) * 10;
        if (yearTranslation) {
          return (
            startYear +
            '' +
            yearTranslation +
            '-' +
            (startYear + 9) +
            '' +
            yearTranslation
          );
        }
        return startYear + '-' + (startYear + 9);
      }
      return this.year + '' + yearTranslation;
    },

    timeFormat() {
      if (this.format && this.format.indexOf('ss') === -1) {
        return 'HH:mm';
      } else {
        return 'HH:mm:ss';
      }
    }
  }
};
</script>