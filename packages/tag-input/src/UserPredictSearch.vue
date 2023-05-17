<template>
    <tag-input v-model="selected" width="100%"
               :multiple="false"
               :itemComponent="itemComponent"
               :options="queryResult" placeholder="Enter names or email addresses" id="userInputCop"
               @input="onInput" @change="onChange" @focus="onFocus" @deleteTag="onDeleteTag">
        <template v-for="item in selected">
            <template v-if="item.isGroup">
                <el-popover
                        placement="top"
                        width="300"
                        v-model="showGroupMember">
                        <div>
                            <ul class="el-select-dropdown__list">
                                <li v-for="user in groupUsers" class="el-select-dropdown__item">
                                    <component  :is="itemComponent"
                                                :user="user"
                                                ></component>
                                </li>
                            </ul>
                        </div>
                    <tag-item slot="reference" :item="item" :type="item.type" :is-group="true"
                              @clickIcon="onClickTagIcon"
                              @click="onClickTag"></tag-item>
                </el-popover>

            </template>
            <template v-else-if="item.type ==='warning'">
                <el-popover placement="top" width="300" :key="i">
                    <div>abc</div>
                    <tag-item slot="reference" :item="item" type="warning"/>
                </el-popover>
            </template>
            <template v-else>
                <tag-item :item="item" :type="item.type" :is-group="item.isGroup"
                          @clickIcon="onClickTagIcon"
                          @click="onClickTag"></tag-item>
            </template>
        </template>

    </tag-input>
</template>

<script>
    import TagInputMenuItem from './TagInputMenuItem'
  //todo: handle empty and email verify
  function getSuggest(query) {
    let users = {
      'recent': [],
      'directory': []
    };
   return  Promise.resolve({
      recent: users.recent.filter((user) => {
        return user.displayName.indexOf(query) >= 0;
      }),
      directory: users.directory.filter((user) => {
        return user.displayName.indexOf(query) >= 0;
      })
    });
  }
const GROUP_KEY = 'All meeting invitees';
  export default {
    name: 'UserPredictSearch',
      components:{TagInputMenuItem},
    model: {
      prop: 'value',
      event: 'change'
    },
    props: {
      name: String,
      value: {
        required: true
      },
      id: String,
      disabled: Boolean,
      placeholder: String,
      //if has set groupUsers we need show "All invite users item"
      groupUsers:{
        type: Array,
        default:()=>{return []}
      }
    },
    computed: {
      isSelectedGroup(){
        return this.selected.find((user)=>{return user.email === GROUP_KEY})?true:false;
      }
    },
    data() {
      return {
        query:'',
        //query result from server
        queryResult: [],
        //display tags in component
        tags:[],
        // selected user in taginput
        selected: [/*{
            isGroup:true,
            displayName:'All meeting invitees',
            email:GROUP_KEY
        },{
            email:'ab@test.com',
            type:'warning'
        },{
            email:'ab@test.com',
            type:'danger'
        }*/],
        isGroupExpand:false,
        showGroupMember:false,
          itemComponent:'TagInputMenuItem'
      };
    },
    watch: {
      selected(newVal){
        this.tags = this.getTags(newVal)
        this.$emit('change',this.getValue())
      }
    },
    methods: {
       onInput(query) {
        this.query = query;
        if(!query){
          this.queryResult =[];
          return;
        }
        getSuggest(query).then((queryResult) => {
          if(this.query) {
            this.queryResult = this.transformOptions(queryResult);
          }
        });

      },
      getOptions() {
        if (this.query && this.queryResult.length) {
          return this.queryResult
        }else if (!this.query && !this.tags.length) {
          return this.getGroupMenu()
        }
        return [];
      },
      getValue(){
        let emails = this.tags.filter((user)=>{return !user.email === GROUP_KEY});
        if(this.isSelectedGroup && !this.isGroupExpand){
          emails = emails.concat(this.groupUsers);
        }
        return emails.map((user) => {
          return user.email;
        });
      },
      onFocus(){
        this.queryResult =  this.getOptions();
      },
      getTags(){
        let tags = this.selected.filter((user)=>{
          if(this.isGroupExpand){
            if(user.isGroup){
              return false
            }
          }
          return true;
        });
        if(this.isGroupExpand){
          tags = tags.concat(this.groupUsers);
        }
        return tags;
      },
      onClickTag(tag, e) {
        if(tag.isGroup){
          e.stopPropagation();
          this.showGroupMember = !this.showGroupMember
        }
      },
      transformOptions(result) {
        let {recent, directory} = result;
        let users = [];
        if(recent && recent.length){
          users.push({displayName: 'Recent', childs: recent});
        }
        if(directory && directory.length){
          users.push({displayName:'directory',childs:directory});
        }
        return users;
      },
      getGroupMenu(){
        return [{
          displayName:'add all meeting attendees',
          isGroup:true,
          email:GROUP_KEY
        }]
      },
      onDeleteTag(tag){
        let index = this.tags.indexOf(tag);
        if (index > -1 && !this.disabled) {
          this.tags.splice(index, 1);
          this.$emit('change', this.tags.concat([]));
          if(!this.tags.length){
            this.isGroupExpand = false;
          }
        }
      },
      onChange(){

      },
      onClickTagIcon(tag,e){
        if (tag.isGroup) {
          e.stopPropagation();
          //click group tag need add all invites to tags
          if (!this.isGroupExpand) {
            this.$confirm('If you expand the list, Webex will replace the list with it\'s member?', 'Expand', {
              confirmButtonText: 'OK',
              cancelButtonText: 'Cancel'
            }).then(() => {
              this.isGroupExpand = true;
              if (this.groupUsers.length) {
                let emails = this.selected.filter((user) => {
                  return user.email !== GROUP_KEY
                }).map((user) => {
                  return user.email.trim();
                });
                let users = this.groupUsers.filter((item) => {
                  return emails.indexOf(item.email.trim()) < 0
                });
                this.selected = emails.concat(users);
              }
            })

          }
        }
      }
    }
  };
</script>

<style scoped>

</style>
