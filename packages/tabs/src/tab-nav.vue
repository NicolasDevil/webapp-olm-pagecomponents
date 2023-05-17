<script>
  import TabBar from './tab-bar';
  import { addResizeListener, removeResizeListener } from '../../../src/utils/resize-event';

  function noop() {}

  export default {
    name: 'TabNav',

    components: {
      TabBar
    },

    props: {
      panes: Array,
      currentName: String,
      editable: Boolean,
      onTabClick: {
        type: Function,
        default: noop
      },
      onTabRemove: {
        type: Function,
        default: noop
      },
      type: String
    },

    data() {
      return {
        scrollable: false,
        navStyle: {
          transform: ''
        },
        focusable:true,
        isFocus: false
      };
    },

    methods: {
      scrollPrev() {
        const containerWidth = this.$refs.navScroll.offsetWidth;
        const currentOffset = this.getCurrentScrollOffset();

        if (!currentOffset) return;

        let newOffset = currentOffset > containerWidth
          ? currentOffset - containerWidth
          : 0;

        this.setOffset(newOffset);
      },
      scrollNext() {
        const navWidth = this.$refs.nav.offsetWidth;
        const containerWidth = this.$refs.navScroll.offsetWidth;
        const currentOffset = this.getCurrentScrollOffset();

        if (navWidth - currentOffset <= containerWidth) return;

        let newOffset = navWidth - currentOffset > containerWidth * 2
          ? currentOffset + containerWidth
          : (navWidth - containerWidth);

        this.setOffset(newOffset);
      },
        focusToPanel(panel){
          this.$parent.setCurrentName(panel.name);
          this.$nextTick(()=>{
            const activeTab = this.$el.querySelector('.is-active');
            activeTab.focus();
          })
        },
      handleKeyDown(event) {
          let key = event.keyCode;
          let activeIndex =0 ;
          let maxIndex = this.panes.length -1;
          this.panes.forEach((panel,index)=>{
            if(panel.active){
                 activeIndex = index;
            }
          });
          let nextIndex = activeIndex-1;
          if(key === 37 || key ===38 ){
              event.stopPropagation();
              event.preventDefault();
              if(nextIndex <0){
                  nextIndex = maxIndex;
              }
              this.focusToPanel(this.panes[nextIndex]);
          }
          else if(key ===39 || key === 40){
              event.stopPropagation();
              event.preventDefault();
              nextIndex = activeIndex+1;
              if(nextIndex> maxIndex){
               nextIndex = 0
              }
              this.focusToPanel(this.panes[nextIndex]);
          }
      },
      scrollToActiveTab() {
        if (!this.scrollable) return;
        const nav = this.$refs.nav;
        const activeTab = this.$el.querySelector('.is-active');
        const navScroll = this.$refs.navScroll;
        const activeTabBounding = activeTab.getBoundingClientRect();
        const navScrollBounding = navScroll.getBoundingClientRect();
        const navBounding = nav.getBoundingClientRect();
        const currentOffset = this.getCurrentScrollOffset();
        let newOffset = currentOffset;

        if (activeTabBounding.left < navScrollBounding.left) {
          newOffset = currentOffset - (navScrollBounding.left - activeTabBounding.left);
        }
        if (activeTabBounding.right > navScrollBounding.right) {
          newOffset = currentOffset + activeTabBounding.right - navScrollBounding.right;
        }
        if (navBounding.right < navScrollBounding.right) {
          newOffset = nav.offsetWidth - navScrollBounding.width;
        }
        this.setOffset(Math.max(newOffset, 0));
      },
      getCurrentScrollOffset() {
        const { navStyle } = this;
        return navStyle.transform
          ? Number(navStyle.transform.match(/translateX\(-(\d+(\.\d+)*)px\)/)[1])
          : 0;
      },
      setOffset(value) {
        this.navStyle.transform = `translateX(-${value}px)`;
      },
      update() {
        const navWidth = this.$refs.nav.offsetWidth;
        const containerWidth = this.$refs.navScroll.offsetWidth;
        const currentOffset = this.getCurrentScrollOffset();

        if (containerWidth < navWidth) {
          const currentOffset = this.getCurrentScrollOffset();
          this.scrollable = this.scrollable || {};
          this.scrollable.prev = currentOffset;
          this.scrollable.next = currentOffset + containerWidth < navWidth;
          if (navWidth - currentOffset < containerWidth) {
            this.setOffset(navWidth - containerWidth);
          }
        } else {
          this.scrollable = false;
          if (currentOffset > 0) {
            this.setOffset(0);
          }
        }
      },
      setFocus() {
        console.debug('setfocus')
        if (this.focusable) {
          this.isFocus = true;
        }
      },
      removeFocus() {
        console.debug('unfocus')
        this.isFocus = false;
      },
      visibilityChangeHandler() {
        const visibility = document.visibilityState;
        if (visibility === 'hidden') {
          this.focusable = false;
        } else if (visibility === 'visible') {
          setTimeout(() => {
            this.focusable = true;
          }, 50);
        }
      },
      windowBlurHandler() {
        this.focusable = false;
      },
      windowFocusHandler() {
        setTimeout(() => {
          this.focusable = true;
        }, 50);
      }
    },

    updated() {
      this.update();
    },

    render(h) {
      const {
        type,
        panes,
        editable,
        onTabClick,
        onTabRemove,
        navStyle,
        scrollable,
        scrollNext,
        scrollPrev,
        handleKeyDown,
        setFocus,
        removeFocus,
        isFocus
      } = this;

      const scrollBtn = scrollable
      ? [
        <span class={['el-tabs__nav-prev', scrollable.prev ? '' : 'is-disabled']} on-click={scrollPrev}><i class="el-icon-ng-left"></i></span>,
        <span class={['el-tabs__nav-next', scrollable.next ? '' : 'is-disabled']} on-click={scrollNext}><i class="el-icon-ng-right"></i></span>
      ] : null;

      const tabs = this._l(panes, (pane, index) => {
        let tabName = pane.name || pane.index || index;
        const closable = pane.isClosable || editable;

        pane.index = `${index}`;

        const btnClose = closable
          ? <span class="el-icon-close" on-click={(ev) => { onTabRemove(pane, ev); }}></span>
          : null;

        const tabLabelContent = pane.$slots.label || pane.label;
        return (
          <div
            role="tab"
            tabIndex={pane.active?'0':'-1'}
            on-click={(event) => { event.preventDefault(); }} on-keydown={handleKeyDown}
            class={{
              'el-tabs__item': true,
              'is-active': pane.active,
              'is-disabled': pane.disabled,
              'is-closable': closable,
              'is-focus': isFocus
            }}
            id={`tab-${tabName}`}
            key={`tab-${tabName}`}
            aria-controls={`pane-${tabName}`}
            aria-selected={ pane.active }
            ref="tabs"
            on-focus={ ()=> { setFocus(); }}
            on-blur ={ ()=> { removeFocus(); }}
            refInFor
            on-click={(ev) => { removeFocus();onTabClick(pane, tabName, ev); }}
          >
            {tabLabelContent}
            {btnClose}
          </div>
        );
      });
      return (
        <div class={['el-tabs__nav-wrap', scrollable ? 'is-scrollable' : '']}>
          {scrollBtn}
          <div class={['el-tabs__nav-scroll']} ref="navScroll">
            <div class="el-tabs__nav" role="tablist" aria-orientation="horizontal" ref="nav" style={navStyle} >
              {!type ? <tab-bar tabs={panes}></tab-bar> : null}
              {tabs}
            </div>
          </div>
        </div>
      );
    },

    mounted() {
      addResizeListener(this.$el, this.update);
      document.addEventListener('visibilitychange', this.visibilityChangeHandler);
      window.addEventListener('blur', this.windowBlurHandler);
      window.addEventListener('focus', this.windowFocusHandler);
    },

    beforeDestroy() {
      if (this.$el && this.update) removeResizeListener(this.$el, this.update);
      document.removeEventListener('visibilitychange', this.visibilityChangeHandler);
      window.removeEventListener('blur', this.windowBlurHandler);
      window.removeEventListener('focus', this.windowFocusHandler);
    }
  };
</script>

