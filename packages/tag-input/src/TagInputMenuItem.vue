<template>
  <li
    :aria-label="enterText"
    class="el-select-dropdown__item"
    :id="popoverId + '_' + user.index"
    role="option"
  >
    <div class="predict-avatar" v-if="!!user.avatar"></div>
    <div class="predict-name" v-if="user.showName">
      <span
        class="predict_displayname"
        v-html="highlightTxt(user.displayName, undefined)"
      ></span>
      <span
        class="predict_displayname predict_username"
        v-html="highlightTxt(user.userName, undefined)"
      ></span>
    </div>
    <span
      :class="{ predict_email: true, showLeft: !user.showName }"
      v-html="highlightTxt(user.email, undefined)"
    ></span>
  </li>
</template>

<script>
import Locale from '../../../src/mixins/locale';

export default {
  name: "TagInputMenuItem",
  props: {
    user: {
      type: Object,
      default: null,
    },
    heighlight: {
      type: String,
      default: "",
    },
    popoverId: {
      type: String,
      default: "",
    }
  },
  mixins: [Locale],
  data() {
    return {
      enterText: this.t('message.common.enterToAttendee')
        ? this.t('message.common.enterToAttendee', [
          this.user.displayName,
          this.user.email
        ])
        : `Add attendee ${this.user.displayName} email ${this.user.email}`,
    };
  },
  methods: {
    highlightTxt(displayName, userName) {
      let query = this.heighlight;
      let txt;
      if (!displayName && !userName) {
        txt = "";
      } else if (!displayName && userName) {
        txt = userName;
      } else if (displayName && !userName) {
        txt = displayName;
      } else {
        txt = displayName + "(" + userName + ")";
      }
      //let query = this.$refs.attendeeSelector.query;
      txt = txt.split("<").join("&lt");
      txt = txt.split(">").join("&gt");
      var text = txt.replace(query, "<b>" + query + "</b>");
      return text;
    },
  },
};
</script>

<style scoped></style>
