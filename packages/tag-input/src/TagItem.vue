<template>
    <div class="el-tag-input__tag"
         :class="{__error:type=='danger',__warn:type =='warning', __group:isGroup}">
        <span v-if="isGroup" class="tag-icon icon-ng-add-item" @click="$emit('clickIcon',item,$event)"></span>
        <span  class="el-tag-input__tags-text" @click="$emit('click',item, $event)">{{ displayTagName() }}</span>
        <span class="tag-icon icon-exit" @click="deleteTag($event)"></span>
    </div>
</template>

<script>
  import Emitter from '../../../src/mixins/emitter';

  export default {
    name: 'TagItem',
    mixins: [Emitter],

    props:{
      item:Object,
      tooltip:String,
      type: String,
      isGroup:Boolean,
      tagName: String
    },
    data(){
      return {
        showPopup:false
      }
    },
    methods:{
      displayTagName(){
        let displayName = this.tagName ? this.item[`${this.tagName}`] : this.item.email;
        return displayName && displayName != '' ? displayName : this.item.email
      },
      deleteTag(event){
        event.stopPropagation();
        this.dispatch('TagInput', 'deleteTag', this.item);
        this.$emit('delete',this.item)
      }
    }
  };
</script>
