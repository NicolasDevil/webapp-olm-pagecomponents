<script>
  import Clickoutside from '../../../src/utils/clickoutside';
  import Emitter from '../../../src/mixins/emitter';
  import Migrating from '../../../src/mixins/migrating';
  import ElButton from '../../../packages/button';
  import ElButtonGroup from '../../../packages/button-group';
  import { generateId } from '../../../src/utils/util';

  export default {
    name: 'ElDropdown',

    componentName: 'ElDropdown',

    mixins: [Emitter, Migrating],

    directives: { Clickoutside },

    components: {
      ElButton,
      ElButtonGroup
    },

    provide() {
      return {
        dropdown: this
      };
    },

    props: {
      id: {
        type:String,
        default: ''
      },
      buttonId: {
        type:String
      },
      arrowId: {
        type:String
      },
      disabled:Boolean,
      trigger: {
        type: String,
        default: 'hover'
      },
      type: String,
      size: {
        type: String,
        default: ''
      },
      splitButton: Boolean,
      hideOnClick: {
        type: Boolean,
        default: true
      },
      triggerAriaLabel: {
        type: String
      },
      placement: {
        type: String,
        default: 'bottom-end'
      },
      visibleArrow: {
        default: true
      },
      showTimeout: {
        type: Number,
        default: 250
      },
      hideTimeout: {
        type: Number,
        default: 200
      },
      ariaLabel: {
        type: String
      },
      tabindex: {
        type: Number,
        default: 0
      },
      freezeMenu: {
        type: Boolean,
        default: false
      },
      defaultOption: { }
    },

    data() {
      let id = this.id;
      return {
        timeout: null,
        visible: false,
        triggerElm: null,
        menuItems: null,
        menuItemsArray: null,
        dropdownElm: null,
        focusing: false,
        listId: this.id ? `${this.id}-menu` :  `dropdown-menu-${generateId()}`
      };
    },

    computed: {
      dropdownSize() {
        return this.size || (this.$ELEMENT || {}).size;
      }
    },

    mounted() {
      this.$on('menu-item-click', this.handleMenuItemClick);
    },

    watch: {
      visible(val) {
        this.broadcast('ElDropdownMenu', 'visible', val);
        this.$emit('visible-change', val);
      },
      focusing(val) {
        const selfDefine = this.$el.querySelector('.el-dropdown-selfdefine');
        if (selfDefine) { // 自定义
          if (val) {
            selfDefine.className += ' focusing';
          } else {
            selfDefine.className = selfDefine.className.replace('focusing', '');
          }
        }
      }
    },

    methods: {
      getMigratingConfig() {
        return {
          props: {
            'menu-align': 'menu-align is renamed to placement.'
          }
        };
      },
      show() {
        const _this = this;
        if (this.triggerElm.disabled) return;
        this.triggerElm.setAttribute('aria-expanded', true);
        clearTimeout(this.timeout);

        this.timeout = setTimeout(() => {
          this.visible = true;
          setTimeout(()=>{
            let nextIndex = 0;
            this.resetTabindex(this.menuItems[nextIndex]);
            if (_this.defaultOption) {
              let defaultItem;
              if (this.menuItems[0].getAttribute('data-id')) {
                defaultItem = _this.menuItemsArray.filter((item)=>{
                  return item.getAttribute('data-id') === `${_this.defaultOption}`;
                })[0];
              } else if (!isNaN(Number(_this.defaultOption))) {
                defaultItem = this.menuItems[_this.defaultOption];
              }
              defaultItem && defaultItem.focus();
            } else {
              this.menuItems[nextIndex].focus();
            }
          }, 200);
        }, this.trigger === 'click' ? 0 : this.showTimeout);
      },
      hide() {
        if (this.freezeMenu) {
          return;
        }
        if (this.triggerElm.disabled) return;
        this.triggerElm.setAttribute('aria-expanded', 'false');
        this.triggerElm.removeAttribute('aria-activedescendant');
        this.removeTabindex();
        if (this.tabindex >= 0) {
          this.resetTabindex(this.triggerElm);
        }
        clearTimeout(this.timeout);
        this.timeout = setTimeout(() => {
          this.visible = false;
        }, this.trigger === 'click' ? 0 : this.hideTimeout);
      },
      handleClick(ev, force) {
        if (this.triggerElm.disabled) return;
        if (!force && ev.keyCode) {
          return;
        }
        if (this.visible) {
          this.hide(ev);
        } else {
          this.show(ev);
        }
      },
      focusMenuItem(i) {
        this.removeTabindex();
        let el = this.menuItems[0];
        this.resetTabindex(el);
        el.focus();
        this.triggerElm.setAttribute('aria-activedescendant', el.id)
      },
      handleTriggerKeyDown(ev) {
        const keyCode = ev.keyCode;
        if ([38, 40].indexOf(keyCode) > -1) { // up/down
          this.removeTabindex();
          let el = this.menuItems[0]
          this.resetTabindex(this.menuItems[0]);
          this.menuItems[0].focus();
          this.triggerElm.setAttribute('aria-activedescendant', this.menuItems[0].id)

          ev.preventDefault();
          ev.stopPropagation();
        } else if ([13, 32].indexOf(keyCode) > -1) { // space enter选中
          ev.preventDefault();
          this.handleClick(ev, true);
        } else if ([9, 27].indexOf(keyCode) > -1) { // tab || esc
          this.hide();
        }
      },
      handleItemKeyDown(ev) {
        const keyCode = ev.keyCode;
        const target = ev.target;
        const currentIndex = this.menuItemsArray.indexOf(target);
        const max = this.menuItemsArray.length - 1;
        let nextIndex;
        if ([38, 40].indexOf(keyCode) > -1) { // up/down
          if (keyCode === 38) { // up
            nextIndex = currentIndex === 0 ? max : currentIndex - 1;
          } else { // down
            nextIndex = currentIndex === max ? 0 : currentIndex + 1 ;
          }
          this.removeTabindex();
          this.resetTabindex(this.menuItems[nextIndex]);
          this.menuItems[nextIndex].focus();
          this.triggerElm.setAttribute('aria-activedescendant', this.menuItems[nextIndex].id);

          ev.preventDefault();
          ev.stopPropagation();
        } else if ([13, 32].indexOf(keyCode) > -1) { // enter选中
          this.triggerElmFocus();
          target.click();
          if (this.hideOnClick) { // click关闭
            this.visible = false;
          }
        } else if ([9, 27].indexOf(keyCode) > -1) { // tab // esc
          ev.preventDefault();
          ev.stopPropagation();
          this.hide();
          this.triggerElmFocus();
        }
      },
      resetTabindex(ele) { // 下次tab时组件聚焦元素
        this.removeTabindex();
        ele&&ele.setAttribute('tabindex', '0'); // 下次期望的聚焦元素
      },
      removeTabindex() {
        this.triggerElm.setAttribute('tabindex', '-1');
        this.menuItemsArray.forEach((item) => {
          item.setAttribute('tabindex', '-1');
        });
      },
      initAria() {
        let dropMenuId = this.id || this.listId;

        this.dropdownElm.setAttribute('id', dropMenuId);
        this.triggerElm.setAttribute('aria-haspopup', 'listbox');
        this.triggerElm.setAttribute('aria-expanded', 'false');
        this.triggerElm.setAttribute('aria-controls', dropMenuId);
        this.triggerElm.setAttribute('role', 'button');

        if (!this.splitButton) {
          this.$el.setAttribute('id', dropMenuId + '-trigger');
          this.triggerElm.setAttribute('tabindex', this.tabindex);
          this.triggerElm.setAttribute('class', (this.triggerElm.getAttribute('class') || '') + ' el-dropdown-selfdefine'); // 控制
        } else {
          this.arrowId ? this.triggerElm.setAttribute('id', this.arrowId) : this.triggerElm.setAttribute('id', dropMenuId + '-trigger');
          this.buttonId ? this.$refs.action.$el.setAttribute('id', this.buttonId) : this.$refs.action.$el.setAttribute('id', dropMenuId + '-action');
        }
      },
      initEvent() {
        let { trigger, show, hide, handleClick,handlePointerEvent, splitButton, handleTriggerKeyDown, handleItemKeyDown } = this;
        this.triggerElm = splitButton
          ? this.$refs.trigger.$el
          : this.$slots.default[0].elm;

        let dropdownElm = this.dropdownElm;

        this.triggerElm.addEventListener('keydown', handleTriggerKeyDown); // triggerElm keydown
        dropdownElm.addEventListener('keydown', handleItemKeyDown, true); // item keydown
        // 控制自定义元素的样式
        if (!splitButton) {
          this.triggerElm.addEventListener('focus', () => {
            this.focusing = true;
          });
          this.triggerElm.addEventListener('blur', () => {
            this.focusing = false;
          });
          this.triggerElm.addEventListener('click', () => {
            this.focusing = false;
          });
        }
        if (trigger === 'hover') {
          this.triggerElm.addEventListener('mouseenter', show);
          this.triggerElm.addEventListener('mouseleave', hide);
          dropdownElm.addEventListener('mouseenter', show);
          dropdownElm.addEventListener('mouseleave', hide);
          this.triggerElm.addEventListener('click', handleClick);
        } else if (trigger === 'click') {
          this.triggerElm.addEventListener('click', handleClick);
        }
      },
      handleMenuItemClick(command, instance) {
        if (this.hideOnClick) {
          this.visible = false;
        }
        this.$emit('command', command, instance);
      },
      triggerElmFocus() {
        this.triggerElm.focus && this.triggerElm.focus();
      },
      initDomOperation() {
        this.dropdownElm = this.popperElm;
        this.menuItems = this.dropdownElm.querySelectorAll("[tabindex='-1']");
        this.menuItemsArray = [].slice.call(this.menuItems);

        this.initEvent();
        this.initAria();
      }
    },

    render(h) {
      let { hide, splitButton, type, dropdownSize, ariaLabel, visible, disabled, triggerAriaLabel } = this;

      const handleMainButtonClick = (event) => {
        this.$emit('click', event);
        hide();
      };

      let triggerElm = !splitButton
        ? this.$slots.default
        : (<el-button-group>
          <el-button ref="action" type={type} size={dropdownSize} disabled={disabled} nativeOn-click={handleMainButtonClick} aria-label={ariaLabel}>
            {this.$slots.default}
          </el-button>
          <el-button ref="trigger"  aria-label={triggerAriaLabel} type={type} disabled={disabled} size={dropdownSize} class="el-dropdown__caret-button">
            <i class="el-dropdown__icon icon-ng-down"></i>
          </el-button>
        </el-button-group>);
      if (splitButton) {
        return (<div class="el-dropdown" v-clickoutside={hide}>
          {triggerElm}
        {this.$slots.dropdown}
      </div>);
      }
      return (
        <div class="el-dropdown" v-clickoutside={hide} aria-label={ariaLabel}>
          {triggerElm}
          {this.$slots.dropdown}
        </div>
      );
    }
  };
</script>
