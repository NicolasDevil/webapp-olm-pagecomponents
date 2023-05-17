<template>
  <table 
    role="grid" 
    :aria-label="currentLabel"
    @focus="isFocus = true"
    @blur="isFocus = false"
    class="el-date-table"
    @click="handleClick"
    @keydown="handleKeydown"
    @mousemove="handleMouseMove"
    :class="{ 'is-week-mode': selectionMode === 'week' ,'focused': isFocus}"
  >
  <caption class="sr-only a11y">{{monthLabelstr}}</caption>
  <thead>
    <tr>
      <th scope="col" v-if="showWeekNumber">{{ t('el.datepicker.week') }}</th>
      <th scope="col" v-for="(week, key) in WEEKS" :aria-label="WEEKSFull[key]" :key="key">{{ t('el.datepicker.weeks.' + week) }}</th>
    </tr>
  </thead>
  <tbody :tabindex="isRange? 0: -1">
    <tr class="el-date-table__row"
        v-for="(row, key) in rows"
        :class="{ current: isWeekActive(row[1]) }"
        :key="key"        
      >
      <template  v-for="(cell, key) in row">
      <td v-if="cell.type == 'today'"        
        :id="getCellId(cell)"
        :class="getCellClasses(cell)"
        :key="key"
        :data-date="cell.text"
        :data-month="cell.monthLabelStr"
        :data-year="cell.yearLabel"
      >
          
        <div 
          :aria-label="cell.label"
          :aria-disabled="cell.disabled"
          :ref="cell.ref"
          aria-current="date"
          class="datepicker-day-btn"
          role="button"
          :aria-selected="getCellClasses(cell).indexOf('current')>-1"  
          :tabindex="cell.tabindex"
          :autofocus="cell.disabled? false: 'autofocus'"
        >
          <span :aria-label="getCellClasses(cell).indexOf('current')>-1 && !isSafari() && 'selected'">
            {{ cell.text }}
          </span>
        </div>
      </td>
      <td v-else
        :class="getCellClasses(cell)"
        :id="getCellId(cell)"
        :key="key"
        :data-date="cell.text"
        :data-month="cell.monthLabelStr"
        :data-year="cell.yearLabel"
      >
        <div 
          :aria-label="cell.label"
          :aria-disabled="cell.disabled"
          :aria-selected="getCellClasses(cell).indexOf('current')>-1"
          :ref="cell.ref"
          role="button"
          class="datepicker-day-btn"
          :tabindex="cell.tabindex"
          :autofocus="cell.tabindex === 0 ? 'autofocus': false"
        >
         
          <span :aria-label="getCellClasses(cell).indexOf('current')>-1 && !isSafari() && 'selected'">
            {{ cell.text }}
          </span>
        </div>
      </td>
      </template>
    </tr>
    </tbody>
  </table>
</template>
<script>
  import { getFirstDayOfMonth, getDayCountOfMonth, getWeekNumber, getStartDateOfMonth, prevDate, nextDate, isDate, clearTime as _clearTime} from '../util/date-util';
  import Locale from '../../../../src/mixins/locale';
  import { KEY_CODES } from '../util';
  import { arrayFindIndex, arrayFind, coerceTruthyValueToArray } from '../../../../src/utils/util';
  import { DAY_DURATION } from '../util';
  const WEEKS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const WEEKSFull = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const getDateTimestamp = function(time) {
    if (typeof time === 'number' || typeof time === 'string') {
      return _clearTime(new Date(time)).getTime();
    } else if (time instanceof Date) {
      return _clearTime(time).getTime();
    } else {
      return NaN;
    }
  };
  
  // remove the first element that satisfies `pred` from arr
  // return a new array if modification occurs
  // return the original array otherwise
  const removeFromArray = function(arr, pred) {
    const idx = typeof pred === 'function' ? arrayFindIndex(arr, pred) : arr.indexOf(pred);
    return idx >= 0 ? [...arr.slice(0, idx), ...arr.slice(idx + 1)] : arr;
  };
  const monthLabel = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const localeOption = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

  export default {
    mixins: [Locale],
    props: {
      firstDayOfWeek: {
        default: 7,
        type: Number,
        validator: val => val >= 1 && val <= 7
      },
      year: '',
      month: '',
      value: {},

      defaultValue: {
        validator(val) {
          // either: null, valid Date object, Array of valid Date objects
          return val === null || isDate(val) || (Array.isArray(val) && val.every(isDate));
        }
      },

      date: {},

      selectionMode: {
        default: 'day'
      },

      showWeekNumber: {
        type: Boolean,
        default: false
      },

      disabledDate: {},

      cellClassName: {},

      minDate: {},

      maxDate: {},

      rangeState: {
        default() {
          return {
            endDate: null,
            selecting: false
          };
        }
      },
      ariaLable: String,

      monthLabelstr: String,
      locale: String
    },
    computed: {
      offsetDay() {
        const week = this.firstDayOfWeek;
        // 周日为界限，左右偏移的天数，3217654 例如周一就是 -1，目的是调整前两行日期的位置
        return week > 3 ? 7 - week : -week;
      },
      WEEKS() {
        const week = this.firstDayOfWeek;
        return WEEKS.concat(WEEKS).slice(week, week + 7);
      },

      startDate() {
        return getStartDateOfMonth(this.year, this.month);
      },

      rows() {
        // TODO: refactory rows / getCellClasses
        const date = new Date(this.year, this.month, 1);
        let day = getFirstDayOfMonth(date); // day of first day
        const dateCountOfMonth = getDayCountOfMonth(date.getFullYear(), date.getMonth());
        const dateCountOfLastMonth = getDayCountOfMonth(date.getFullYear(), (date.getMonth() === 0 ? 11 : date.getMonth() - 1));

        day = (day === 0 ? 7 : day);

        const offset = this.offsetDay;
        const rows = this.tableRows;
        let count = 1;

        const startDate = this.startDate;
        const disabledDate = this.disabledDate;
        const cellClassName = this.cellClassName;
        const selectedDate = this.selectionMode === 'dates' ? coerceTruthyValueToArray(this.value) : [];
        const now = getDateTimestamp(new Date());

        for (let i = 0; i < 6; i++) {
          const row = rows[i];

          if (this.showWeekNumber) {
            if (!row[0]) {
              row[0] = { type: 'week', text: getWeekNumber(nextDate(startDate, i * 7 + 1)) };
            }
          }

          for (let j = 0; j < 7; j++) {
            let cell = row[this.showWeekNumber ? j + 1 : j];
            if (!cell) {
              cell = { row: i, column: j, type: 'normal', inRange: false, start: false, end: false };
            }

            cell.type = 'normal';
            cell.tabindex = -1;
            const index = i * 7 + j;
            const time = nextDate(startDate, index - offset).getTime();
            cell.inRange = time >= getDateTimestamp(this.minDate) && time <= getDateTimestamp(this.maxDate);
            cell.start = this.minDate && time === getDateTimestamp(this.minDate);
            cell.end = this.maxDate && time === getDateTimestamp(this.maxDate);
            const obj = new Date(time);
            const isToday = time === now;
            if (isToday) {
              cell.type = 'today';
              if (!this.date && this.selectionMode !== 'range') {
                cell.tabindex = 0;
              }
            }
            if (i >= 0 && i <= 1) {
              const numberOfDaysFromPreviousMonth = day + offset < 0 ? 7 + day + offset : day + offset;

              if (j + i * 7 >= numberOfDaysFromPreviousMonth) {
                if (j + i * 7 === numberOfDaysFromPreviousMonth) {
                  cell.firstDayMonth = true;
                }
                cell.text = count++;
              } else {
                cell.text = dateCountOfLastMonth - (numberOfDaysFromPreviousMonth - j % 7) + 1 + i * 7;
                cell.type = 'prev-month';
              }
            } else {
              if (count <= dateCountOfMonth) {
                cell.text = count++;
              } else {
                cell.text = count++ - dateCountOfMonth;
                cell.type = 'next-month';
              }
            }
            cell.label = obj.toLocaleDateString(this.locale, localeOption);
            cell.monthLabel = monthLabel[obj.getMonth()];
            cell.yearLabel = obj.getFullYear();
            cell.weekLabel = WEEKSFull[j];
            let cellDate = new Date(time);
            cell.dateLabel = cellDate.getDate();
            cell.monthLabelStr = obj.getMonth();
            cell.dateObj = cellDate;
            cell.disabled = typeof disabledDate === 'function' && disabledDate(cellDate);
            if (!cell.disabled) {
              cell.selected = arrayFind(selectedDate, date => date.getTime() === cellDate.getTime());
              if (cell.selected) {
                this.currentLabel = cell.label;
              }
            } else {
              cell.tabindex = -1;
            }
            cell.customClass = typeof cellClassName === 'function' && cellClassName(cellDate);
            if (this.date) {
              let focusDay = this.date;
              if ((focusDay.getDate() === cell.dateObj.getDate()) &&
                  (focusDay.getMonth() === cell.dateObj.getMonth()) &&
                  (focusDay.getFullYear() === cell.dateObj.getFullYear()) && this.selectionMode !== 'range') {
                cell.tabindex = 0;
              }
            }
            this.$set(row, this.showWeekNumber ? j + 1 : j, cell);
          }

          if (this.selectionMode === 'week') {
            const start = this.showWeekNumber ? 1 : 0;
            const end = this.showWeekNumber ? 7 : 6;
            const isWeekActive = this.isWeekActive(row[start + 1]);

            row[start].inRange = isWeekActive;
            row[start].start = isWeekActive;
            row[end].inRange = isWeekActive;
            row[end].end = isWeekActive;
          }
        }

        return rows;
      }
    },

    watch: {
      'rangeState.endDate'(newVal) {
        this.markRange(this.minDate, newVal);
      },

      minDate(newVal, oldVal) {
        if (getDateTimestamp(newVal) !== getDateTimestamp(oldVal)) {
          this.markRange(this.minDate, this.maxDate);
        }
      },

      maxDate(newVal, oldVal) {
        if (getDateTimestamp(newVal) !== getDateTimestamp(oldVal)) {
          this.markRange(this.minDate, this.maxDate);
        }
      },
      date(val) {
        if (this.selectionMode !== 'range') {
          this.markSelected(val);
        }
      }
    },
    data() {
      const getId = () => {
        return (Math.random() * 100).toFixed(0);
      };
      return {
        tableRows: [ [], [], [], [], [], [] ],
        lastRow: null,
        lastColumn: null,
        WEEKSFull: WEEKSFull,
        id: getId() + '_' + getId(),
        isFocus: false,
        currentLabel: this.$props.ariaLable || this.t('el.datepicker.year'),
        isRange: this.selectionMode === 'range'
      };
    },

    methods: {
      getCellId(cell) {
        return this.id + '_' + cell.row + '_' + cell.text;
      },
      cellMatchesDate(cell, date) {
        const value = new Date(date);
        return this.year === value.getFullYear() &&
                this.month === value.getMonth() &&
                Number(cell.text) === value.getDate();
      },

      getCellClasses(cell) {
        const selectionMode = this.selectionMode;
        const defaultValue = this.defaultValue ? Array.isArray(this.defaultValue) ? this.defaultValue : [this.defaultValue] : [];

        let classes = [];
        if ((cell.type === 'normal' || cell.type === 'today') && !cell.disabled) {
          classes.push('available');
          if (cell.type === 'today') {
            classes.push('today');
          }
        } else {
          classes.push(cell.type);
        }

        if (cell.type === 'normal' && defaultValue.some(date => this.cellMatchesDate(cell, date))) {
          classes.push('default');
        }

        if (selectionMode === 'day' && (cell.type === 'normal' || cell.type === 'today') && this.cellMatchesDate(cell, this.value)) {
          classes.push('current');
          this.$el && this.$el.setAttribute('aria-activedescendant', this.getCellId(cell));
        }

        if (cell.inRange && ((cell.type === 'normal' || cell.type === 'today') || this.selectionMode === 'week')) {
          classes.push('in-range');

          if (cell.start) {
            classes.push('start-date');
          }

          if (cell.end) {
            classes.push('end-date');
          }
        }

        if (cell.disabled) {
          classes.push('disabled');
        }

        if (cell.selected) {
          classes.push('selected');

        }

        if (cell.customClass) {
          classes.push(cell.customClass);
        }

        return classes.join(' ');
      },

      getDateOfCell(row, column) {
        const offsetFromStart = row * 7 + (column - (this.showWeekNumber ? 1 : 0)) - this.offsetDay;
        return nextDate(this.startDate, offsetFromStart);
      },

      isWeekActive(cell) {
        if (this.selectionMode !== 'week') return false;
        const newDate = new Date(this.year, this.month, 1);
        const year = newDate.getFullYear();
        const month = newDate.getMonth();

        if (cell.type === 'prev-month') {
          newDate.setMonth(month === 0 ? 11 : month - 1);
          newDate.setFullYear(month === 0 ? year - 1 : year);
        }

        if (cell.type === 'next-month') {
          newDate.setMonth(month === 11 ? 0 : month + 1);
          newDate.setFullYear(month === 11 ? year + 1 : year);
        }

        newDate.setDate(parseInt(cell.text, 10));

        if (isDate(this.value)) {
          const dayOffset = (this.value.getDay() - this.firstDayOfWeek + 7) % 7 - 1;
          const weekDate = prevDate(this.value, dayOffset);
          return weekDate.getTime() === newDate.getTime();
        }
        return false;
      },
      markSelected(date) {
        let selectedDate = 0;
        if (date) {
          selectedDate = getDateTimestamp(date);
        }
        const rows = this.rows;
        for (let i = 0, k = rows.length; i < k; i++) {
          const row = rows[i];
          for (let j = 0, l = row.length; j < l; j++) {
            if (this.showWeekNumber && j === 0) continue;

            const cell = row[j];
            if (!selectedDate) {
              cell.selected = false;
            } else if (selectedDate === new Date(cell.label).getTime()) {
              //  } else if (+selectedDate === +cell.dateLabel) {
              cell.selected = true;
              if (this.selectionMode !== 'range') {
                this.currentLabel = cell.label;
              }
            } else {
              cell.selected = false;
            }
          }
        }
      },
      markRange(minDate, maxDate) {
        minDate = getDateTimestamp(minDate);
        maxDate = getDateTimestamp(maxDate) || minDate;
        [minDate, maxDate] = [Math.min(minDate, maxDate), Math.max(minDate, maxDate)];

        const startDate = this.startDate;
        const rows = this.rows;
        for (let i = 0, k = rows.length; i < k; i++) {
          const row = rows[i];
          for (let j = 0, l = row.length; j < l; j++) {
            if (this.showWeekNumber && j === 0) continue;

            const cell = row[j];
            const index = i * 7 + j + (this.showWeekNumber ? -1 : 0);
            const time = nextDate(startDate, index - this.offsetDay).getTime();

            cell.inRange = minDate && time >= minDate && time <= maxDate;
            cell.start = minDate && time === minDate;
            cell.end = maxDate && time === maxDate;
          }
        }
      },
      handleMouseMove(event) {
        if (!this.rangeState.selecting) return;

        let target = event.target;
        if (target.tagName === 'SPAN') {
          target = target.parentNode.parentNode;
        }
        if (target.tagName === 'DIV') {
          target = target.parentNode;
        }
        if (target.tagName !== 'TD') return;

        const row = target.parentNode.rowIndex - 1;
        const column = target.cellIndex;

        // can not select disabled date
        if (this.rows[row][column].disabled) return;

        // only update rangeState when mouse moves to a new cell
        // this avoids frequent Date object creation and improves performance
        if (row !== this.lastRow || column !== this.lastColumn) {
          this.lastRow = row;
          this.lastColumn = column;
          this.$emit('changerange', {
            minDate: this.minDate,
            maxDate: this.maxDate,
            rangeState: {
              selecting: true,
              endDate: this.getDateOfCell(row, column)
            }
          });
        }
      },
      getCellElByDate(date) {
        const startDate = this.startDate;
        const rows = this.rows;
        const index = (date - startDate) / DAY_DURATION;
        let cel = Math.floor(index / 7);
        const row = rows[cel];
        if (index >= 0 && row) {
          let day = row[Math.floor(index % 7)];
          return this.$el.rows[day.row + 1].cells[day.column];
        }
      },

      handleClick(event) {
        let target = event.target;
        if (target.tagName === 'SPAN') {
          target = target.parentNode.parentNode;
        }
        if (target.tagName === 'DIV') {
          target = target.parentNode;
        }

        if (target.tagName !== 'TD') return;
        const row = target.parentNode.rowIndex - 1;
        const column = this.selectionMode === 'week' ? 1 : target.cellIndex;
        const cell = this.rows[row][column];

        if (cell.disabled || cell.type === 'week') return;

        const newDate = this.getDateOfCell(row, column);

        if (this.selectionMode === 'range') {
          if (!this.rangeState.selecting) {
            this.$emit('pick', {minDate: newDate, maxDate: null});
            this.rangeState.selecting = true;
          } else {
            if (newDate >= this.minDate) {
              this.$emit('pick', {minDate: this.minDate, maxDate: newDate});
            } else {
              this.$emit('pick', {minDate: newDate, maxDate: this.minDate});
            }
            this.rangeState.selecting = false;
          }
        } else if (this.selectionMode === 'day') {
          this.$emit('pick', newDate, true);
        } else if (this.selectionMode === 'week') {
          const weekNumber = getWeekNumber(newDate);
          const value = newDate.getFullYear() + 'w' + weekNumber;
          this.$emit('pick', {
            year: newDate.getFullYear(),
            week: weekNumber,
            value: value,
            date: newDate
          });
        } else if (this.selectionMode === 'dates') {
          const value = this.value || [];
          const newValue = cell.selected
                  ? removeFromArray(value, date => date.getTime() === newDate.getTime())
                  : [...value, newDate];
          this.$emit('pick', newValue);
        }
      },

      handleKeydown(event) {
        const keyCode = event.keyCode;
        if (keyCode === KEY_CODES.ESC || keyCode === KEY_CODES.TAB) {
          return;
        }
        const list = [KEY_CODES.UP, KEY_CODES.DOWN, KEY_CODES.LEFT, KEY_CODES.RIGHT];
        if (this.selectionMode !== 'range') {
          if (list.indexOf(keyCode) !== -1) {
            event.preventDefault();
            event.stopPropagation();
            this.handleKeyControl(keyCode);
          }
          if (keyCode === KEY_CODES.ENTER) {
            this.$emit('pick', this.date, true);
          }
        }
      },

      handleKeyControl(keyCode) {
        const mapping = {
          year: {
            [KEY_CODES.UP]: -4,
            [KEY_CODES.DOWN]: 4,
            [KEY_CODES.LEFT]: -1,
            [KEY_CODES.RIGHT]: 1,
            offset: (date, step) => date.setFullYear(date.getFullYear() + step)
          },
          month: {
            [KEY_CODES.UP]: -4,
            [KEY_CODES.DOWN]: 4,
            [KEY_CODES.LEFT]: -1,
            [KEY_CODES.RIGHT]: 1,
            offset: (date, step) => date.setMonth(date.getMonth() + step)
          },
          week: {
            [KEY_CODES.UP]: -1,
            [KEY_CODES.DOWN]: 1,
            [KEY_CODES.LEFT]: -1,
            [KEY_CODES.RIGHT]: 1,
            offset: (date, step) => date.setDate(date.getDate() + step * 7)
          },
          day: {
            [KEY_CODES.UP]: -7,
            [KEY_CODES.DOWN]: 7,
            [KEY_CODES.LEFT]: -1,
            [KEY_CODES.RIGHT]: 1,
            offset: (date, step) => {
              date.setDate(date.getDate() + step);
            }
          }
        };
        const mode = this.selectionMode;
        const year = 3.1536e10;
        const now = this.date.getTime();
        let newDate = new Date(this.date.getTime());
        if (mode !== 'range') {
          while (Math.abs(now - newDate.getTime()) <= year) {
            let map = mapping[mode];
            map.offset(newDate, map[keyCode]);
            if (
              typeof this.disabledDate === 'function' &&
              this.disabledDate(newDate)
            ) {
              continue;
            }
            if (mode !== 'range') {
              this.$emit('pick', newDate, false);
            }
            break;
          }
        }
      }
    }
  };
</script>