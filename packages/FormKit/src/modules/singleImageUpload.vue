<template>
  <div>
    <el-upload
      v-loading="loading"
      :show-file-list="false"
      :http-request="ACTION_REQUEST"
      :style="{ width: $attrs.width || '70px', height: $attrs.height || '70px' }"
      v-bind="binding"
      class="imageUploader">
      <img v-if="_value" :src="_value">
      <i
        v-else
        :style="{
          width: $attrs.width || '70px',
          height: $attrs.height || '70px',
          lineHeight: $attrs.height || '70px'
        }"
        class="el-icon-plus"/>
    </el-upload>
  </div>
</template>

<script>
export default {
  name: 'IntegratedFormImagUploader',
  model: { prop: 'value', event: 'change' },
  props: {
    value: { required: true },
    action: { type: [Function], default: null }
  },
  data: () => ({ loading: false }),
  computed: {
    _value: {
      get() {
        return this.value || null;
      },
      set(newVal) {
        this.$emit('change', newVal);
      }
    },
    binding() {
      const _attrs = this.$attrs;
      const req = {
        beforeUpload: this.beforeUpload,
        onError: this.Error,
        multiple: false
      };
      req.action = 'http';
      if (_attrs.onSuccess) req.onSuccess = _attrs.onSuccess;
      if (_attrs.beforeUpload) req.beforeUpload = _attrs.beforeUpload;
      if (_attrs.multiple) req.multiple = _attrs.multiple;
      return req;
    }
  },
  methods: {
    ACTION_REQUEST(ctx) {
      if (!this.action) return console.warn('FormKit singleImageUpload need API fn, like this props: { action: APIFn[Promise] }');
      this.action({ file: ctx.file, sub_type: 152 }).then(response => {
        this.loading = false;
        if (response.code === 200) {
          if (this.$attrs.handle) {
            this.$attrs.handle(response.data);
          } else {
            this._value = response.data.url;
          }
        } else {
          this.$message.error('上传错误');
        }
      }).catch((e) => this.Error(e));
    },
    Error(e) {
      console.log(e);
      this.loading = false;
    },
    beforeUpload(file) {
      const isJPG = file.type === 'image/jpeg';
      const isPNG = file.type === 'image/png';
      const isLt2M = file.size / 1024 / 1024 < 1;
      if (!isJPG && !isPNG) {
        this.$message.warning('上传图片只能是 JPG/PNG 格式!');
        return false;
      }
      if (!isLt2M) {
        this.$message.warning('上传图片大小不能超过 1MB!');
        return false;
      }
      this.loading = true;
      return (isJPG || isPNG) && isLt2M;
    }
  }
};
</script>

<style scoped lang="scss">
.imageUploader {
  display: inline-block;
  border: 1px dashed #d9d9d9;
  position: relative;
  overflow: hidden;
  img { width: 100%; height: 100% }
  /deep/ .el-upload {
    width: 100%; height: 100%
  }
}
.upload-image {
  width: 100%;
  height: 100%;
}
.image-rules {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
</style>
