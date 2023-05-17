<template>
    <div  :class="[
    'el-tag-input',
    size ? 'el-input--' + size : '',
    {
      'is-disabled': disabled,
    }
  ]"
          role="combobox"
          :aria-expanded="visible"
          :aria-owns="popoverId"
          aria-haspopup="listbox"
          @click="canAdd &&$refs.input.focus()"
          v-clickoutside="handleClose">
          <div class="el-tag-input__tags" :style="{width: defaultWidth +'px'}" ref="tags">
            <div class="el-tag-input__tags__wrap" >
            <slot :items="selected"></slot>
            <div class="el-tag-input__tag_input" v-show="canAdd" :class="{'__input_no_value':computedPlaceholder}">
                <input
                        type="text"
                        class=" __input"
                        :placeholder="computedPlaceholder"
                        :aria-lableby="ariaLabelledby"
                        @focus="onFocus"
                        :disabled="disabled"
                        v-model="query"
                        @keydown="onKeyDown($event)"
                        @keyup="onKeyUp($event)"
                        @keydown.up.prevent.stop="highlight(hoverIndex - 1)"
                        @keydown.down.prevent.stop="highlight(hoverIndex + 1)"
                        @keydown.left="focusPrevTag"
                        @keydown.right="focusNextTag"
                        @paste="onPaste($event)"
                        ref="input"
                        :disable-focus-icon="true"/>
            </div>
            </div>
        </div>

        <transition
                name="el-zoom-in-top"
                @after-leave="doDestroy">
            <div
                    :id="popoverId"
                    ref="popper"
                    class="el-select-dropdown suggestions-dropdown"
                    v-show="visible"
                    v-if="canAdd"
                    :style="{ minWidth: inputWidth + 'px'}">
                <slot name="tagDropListHead"></slot>
                <el-scrollbar  ref="scrollBar" tag="ul"  wrap-class="el-select-dropdown__wrap" view-class="el-select-dropdown__list">
                    <template v-for="item in dropdowItems">
                        <li v-if="!item.childs" role="option" :id="popoverId+'_'+item.index" class="el-select-dropdown__item " :class="{hover:hoverIndex === item.index}" @click="select(item)"><span>{{item.displayName}}</span></li>
                        <div v-else-if="type == 'custom'" class="el-select-group__wrap" :id="'customGroup' + item.displayName">
                          	<li class="el-select-group__title" v-if="!item.hideDisplayName" >{{ item.displayName }}</li>
                          	<li>
                              	<ul class="el-select-group">

                                	<template  v-for="child in item.childs">
                                  		<component   :is="itemComponent"
                                              :user="child" :heighlight="query"
                                              @click.native="select(child)"
                                              @mouseenter.native="hoverIndex = child.index"
                                              :class="{hover:hoverIndex === child.index}" :popoverId="popoverId"></component>
                                	</template>

                              	</ul>
                            </li>
                        </div>
                        <ul v-else class="el-select-group__wrap">
                            <li class="el-select-group__title">{{ item.displayName }}</li>
                            <li>
                                <ul class="el-select-group">

                                    <template  v-for="child in item.childs">
                                        <component   :is="itemComponent"
                                                    :user="child" :heighlight="query"
                                                    @click.native="select(child)"
                                                    @mouseenter.native="hoverIndex = child.index"
                                                    :class="{hover:hoverIndex === child.index}" :popoverId="popoverId"></component>
                                    </template>

                                </ul>
                            </li>
                        </ul>
                    </template>
                    <slot name="tagDropListFooter"></slot>
                </el-scrollbar>
            </div>
        </transition>
    </div>
</template>

<script>
  import Clickoutside from '../../../src/utils/clickoutside';
  import Emitter from '../../../src/mixins/emitter';
  import Locale from '../../../src/mixins/locale';
  import TagItem from './TagItem'
  import scrollIntoView from '../../../src/utils/scroll-into-view';
  import { addClass, removeClass, hasClass } from '../../../src/utils/dom';
  if(!NodeList.prototype.forEach){
      NodeList.prototype.forEach = Array.prototype.forEach
  }
  import TagInputMenuItem from './TagInputMenuItem'
  export default {
    name: 'TagInput',
    componentName:'TagInput',
    mixins: [Emitter, Locale],
    directives: { Clickoutside },
    model: {
      prop: 'value',
      event: 'change'
    },
    components:{TagItem, TagInputMenuItem},
    props: {
        itemComponent:{
            type:String | Object,
            default:'TagInputMenuItem'
        },
      name: String,
      value: {
        required: true
      },
        multiple: {
            type: Boolean,
            default: true
        },
      width:String,
      id: String,
      size: String,
      disabled: Boolean,
      placeholder: String,
      debounce: {
        type: Number,
        default: 300
      },
      emailVerifyFn: {
        type: Function,
        default: (email) => {
          let regx = /[_a-zA-Z\d\-\.]+@[_a-zA-Z\d\-]+(\.[_a-zA-Z\d\-]+)+$/;
          return regx.test(email);
        }
      },
      options:{
        type: Array,
        default:()=>{return [] }
      },
      emptyText:'',
      type: String
    },
    watch:{
      options(options){
        if(!options.length){
          this.dropdowItems =[];
          this.visible = false;
          return;
        }
        let count = 0;
        this.map =[];
        for(let i =0; i < options.length ;i++){
          let childs = options[i].childs;
          if(childs){
            for(let j =0 ; j < childs.length ; j ++){
              childs[j].index  = count;
              this.map.push(childs[j]);
              count++;
            }
          }else{
            options[i].index = count;
            this.map.push(options[i]);
            count++;
          }
        }
        this.dropdowItems = options;
        this.visible = this.dropdowItems.length;
        if(this.visible){
          let width =  this.$el.getBoundingClientRect().width;
          this.inputWidth = width;
        }
      }
    },
    data() {
      return {
        dropdowItems: [],
        query:'',
        selected: [],
        defaultWidth:this.width,
        inputWidth: 0,
        cachedPlaceHolder: '',
        ariaLabelledby: '',
        popoverId: 'combox-list-' + Date.now(),
        visible:false,
        inputLength:100,
        timer:-1,
        inputPaddingLeft:12,
        inputPaddingTop:8,
        lastQuery:'',
        hoverIndex:0,
        focusTagIndex:0,
        blurTimer:0,
        map:[]
      };
    },
    computed:{
      canAdd() {
          return this.multiple || (!this.multiple && !this.selected.length)
      },
      showDropdown(){
        return this.visible && this.dropdowItems.length && this.query
      },
      computedPlaceholder(){
        if(this.selected.length){
          return ''
        }
        return this.placeholder
      }
    },
    mounted(){
      this.$nextTick(() => {
        let width = this.$el.getBoundingClientRect().width;
        if (!this.defaultWidth) {
          this.defaultWidth = width;
        }
        this.inputWidth = width;
      });
      this.$on('deleteTag',this.deleteTag);
      this.$watch('value',(val)=>{
          this.selected = val;
      },{
          immediate: true
      })
    },
    methods: {
      doDestroy() {
        // this.$refs.popper && this.$refs.popper.doDestroy();
        // this.dropdownUl = null;
      },
      deleteTag(tag) {
        let index = this.selected.indexOf(tag);
        if (index > -1 && !this.disabled) {
          this.selected.splice(index, 1);
          this.$emit('change', this.selected.concat([]));
        }
        this.$emit('delete', tag);
      },
      handleClose() {
        this.visible = false;
        this.checkAndCommit();
      },
      onKeyUp(e){
        let keyCode = e.keyCode;
        let commitKeyCode = [186, 188]; //, ;
        let isTapEnter = keyCode === 13;
        let isCommit = commitKeyCode.indexOf(e.keyCode)>=0;
        //fix firefox issue
        if (e.key === ';') {
          isCommit = true;
        }
        let isTapSpace = keyCode === 32;
        if([37,39].indexOf(keyCode) < 0){
            this.focusTagIndex = -1;
            this.updateTagStatus();
        }
        if (this.isPaste || isCommit || (!this.visible && isTapEnter)) {
          this.checkAndCommit();
          this.isPaste = false;
          return;
        } else {
          if(this.visible && this.hoverIndex>=0) {
            if(isTapEnter || this.selectBySpace && isTapSpace) {
              let item = this.map[this.hoverIndex];
              let result = Object.assign({ }, item);
              delete result.index;
              this.select(result);
            }
          }
        }
        this.isPaste = false;
        if(this.timer){
          clearTimeout(this.timer);
          this.timer = 0;
        }
        this.timer = setTimeout(()=>{
          this.triggerChange(e)
        }, this.debounce)
      },
      onFocus(){
        this.$emit('focus')
        if(!this.selected.length && this.emptyText) {
          this.visible = true
        }
      },
        focusPrevTag(){
            this.focusTagIndex--;
            if(this.focusTagIndex < 0 ){
                this.focusTagIndex = this.selected.length -1
            }
            this.updateTagStatus()
        },
        focusNextTag(){
            this.focusTagIndex++;
            if(this.focusTagIndex >= this.selected.length){
                this.focusTagIndex = -1;
            }
            this.updateTagStatus()
        },
        updateTagStatus(){
          let tags = this.$refs.tags.querySelectorAll('.el-tag-input__tag');
          tags.forEach((item,index) =>{
              if(index == this.focusTagIndex){
                  addClass(item,'__focus')
              }else{
                  removeClass(item,'__focus')
              }
          })
        },
      onPaste(e){
        this.isPaste = true
      },
      onKeyDown(e){
        let keyCode = e.keyCode;
        let isTapEnter = keyCode === 13;
        let isTab = keyCode ===9;
        if(isTab){
            this.checkAndCommit(e);
            return;
        }
        if(keyCode === 8 ){
          if(!this.query.length){
              let item;
              if(this.focusTagIndex < 0) {
                   item = this.selected[this.selected.length - 1];
              }else{
                  item = this.selected[this.focusTagIndex]
                  this.focusPrevTag()
              }
            this.deleteTag(item);
          }
        }
        if(isTapEnter) {
          // e.stopPropagation();
          e.preventDefault();
        }
      },
      pushToSelected(item){
        let find = this.selected.filter((old)=>{
          if(item.email === old.email){
            return true
          }
          return false;
        });
        if(!find.length){
          this.selected.push(item);
        }
      },
      select(item){
        clearTimeout(this.blurTimer);
        let result = Object.assign({ }, item);
        delete result.index;
        this.pushToSelected(result);
        this.$emit('change', this.selected.concat([]));
        this.reset()
      },
      reset(){
        this.query = '';
        this.$nextTick(()=>{
          this.$emit('input','')
          this.lastQuery = '';
          this.visible = false;
          this.dropdowItems =[];

          this.map = [];
            setTimeout(()=>{
                scrollIntoView(this.$refs.tags,this.$refs.input)
            }, 200)
        })
      },
      triggerChange(e){

        // if(this.lastQuery !== this.query){
          this.$emit('input',this.query);
          // this.lastQuery = this.query;
        // }
      },
      highlight(index) {
        if (!this.visible || this.loading) {
          return;
        }
        if (index < 0) index = 0;
        if (index >= this.map.length) {
          index = this.map.length - 1;
        }
        const suggestion = this.$refs.scrollBar.$el.firstChild;
        const suggestionList = suggestion.querySelectorAll('.el-select-dropdown__item');

        let highlightItem = suggestionList[index];

        scrollIntoView(suggestion,highlightItem)
        this.hoverIndex = index ;
      },
      checkAndCommit(e) {
        if (!this.query) {
          return;
        }
        let items = this.query.split(/;|,/gi);

        if (!items.length) {
          return;
        }
        this.query = '';
        items.forEach((email) => {
          email = email.trim();
          if (this.emailVerifyFn(email)) {
            this.pushToSelected({email:email});
          } else {
            if (email.length)
            {
              this.pushToSelected({error:true,email:email});
            }
          }
        });
        this.$emit('change', this.selected.concat([]));
        this.reset()
      },
      highlightTxt(displayName, userName, query) {
        let txt;
        if (!displayName && !userName) {
          txt = '';
        } else if (!displayName && userName) {
          txt = userName;
        } else if (displayName && !userName) {
          txt = displayName;
        } else {
          txt = displayName + '(' + userName + ')';
        }
        //let query = this.$refs.attendeeSelector.query;
        txt = txt.split('<').join('&lt');
        txt = txt.split('>').join('&gt');
        var text = txt.replace(query, '<b>' + query + '</b>');
        return text;
      }
    }
  };
</script>
