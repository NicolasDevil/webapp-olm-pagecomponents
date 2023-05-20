<template>
  <div class="MultipleImgUpload">
    <div
      v-for="(path, index) in _value"
      :key="index"
      :style="{
        width: $attrs.width || '80px',
        height: $attrs.height || '80px',
      }"
      class="multiple-imgUpload-show"
    >
      <img v-src="path" />
      <div class="img-model">
        <i
          class="el-icon-delete set-img-delete"
          @click.stop="deleteImg(index)"
        />
      </div>
    </div>
    <div
      :style="{
        width: $attrs.width || '80px',
        height: $attrs.height || '80px',
      }"
      class="multiple-imgUpload-content"
    >
      <input
        type="file"
        ref="detailImgInput"
        v-bind="$attrs"
        accept="image/*"
        multiple
        class="file-input-content"
        @change="upLoad"
      />
      <el-button type="text" icon="el-icon-plus" class="cross-icons" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'MultipleImgUpload',
  model: { prop: 'value', event: 'change' },
  props: {
    value: { required: true },
    action: { type: [Function], default: null }
  },
  data: () => ({ loading: false }),
  computed: {
    _value: {
      get() {
        return this.value || '';
      },
      set(newVal) {
        this.$emit('change', newVal);
      }
    },
    limit() {
      return this.$attrs.limit || -1;
    }
  },
  methods: {
    upLoad(event) {
      const files = Array.from(event.target.files);
      if (this.limit !== -1 && files.length > this.limit) {
        this.$message.error(`最多只能上传${this.limit}张图片`);
        return;
      }
      if (!this.action) return console.warn('FormKit MultipleImgUpload need API fn, like this props: { action: APIFn[Promise] }');
      for (let index = 0; index < files.length; index++) {
        const file = files[index];
        this.loading = true;
        this.action({ type: 'img', file: file })
          .then((res) => {
            const data = res.data || {};
            const { url } = data;
            if (Array.isArray(this._value)) {
              if (url) this._value.push(data.url);
            } else {
              if (url) this._value = [data.url];
            }
            console.log(this._value);
            this.loading = false;
          })
          .catch(() => {
            this.loading = false;
          });
      }
    },
    deleteImg(index) {
      if (Array.isArray(this._value) && index !== undefined) this._value.splice(index, 1);
    }
  }
};
</script>

<style lang="scss" scoped>
.MultipleImgUpload {
  display: flex;
  flex-wrap: wrap;
  column-gap: 15px;
  row-gap: 15px;
  .multiple-imgUpload-show {
    position: relative;
    img {
      width: 100%;
      height: 100%;
    }
    .img-model {
      visibility: hidden;
      position: absolute;
      z-index: 9;
      width: 100%;
      height: 100%;
      background-color: #2d3037;
      opacity: 0.8;
      top: 0;
      right: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      column-gap: 10px;
      .set-img-delete {
        font-size: 20px;
        color: white;
        cursor: pointer;
      }
      .set-img-zoom {
        font-size: 20px;
        color: white;
        cursor: pointer;
      }
    }
    &:hover .img-model {
      visibility: visible;
    }
  }
  .multiple-imgUpload-content {
    display: flex;
    justify-content: center;
    align-items: center;
    user-select: none;
    border-radius: 6px;
    position: relative;
    border: 1px #c0ccda dashed;
    .cross-icons {
      color: #606266;
      font-size: 20px;
    }
  }
  .file-input-content {
    opacity: 0;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 10;
    cursor: pointer;
  }
}
</style>
