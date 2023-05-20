<template>
  <div :class="[{ 'form-label-auto': labelWidth === 0 }]" class="FormKit">
    <el-form
      :ref="UNIQUE_KEY"
      :model="FormData"
      :key="UNIQUE_KEY"
      v-bind="_FORM_ATTRS"
      :label-position="labelPosition"
    >
      <el-row
        v-bind="row"
        :style="{ 'row-gap': `${rowGap}px` }"
        class="form-kit-row"
      >
        <el-col
          v-for="conf in config.filter((ele) => confController(ele))"
          :key="conf.key"
          :span="conf.span || COL_SPAN"
        >
          <el-form-item
            :label="conf.label"
            :label-width="labelWidth + 'px'"
            :prop="conf.key"
            :rules="conf.rules"
          >
            <component
              v-if="conf.type"
              :is="verificationLoad(conf.type)"
              :ref="`formKit-component-${conf.key}`"
              :key="conf.key"
              v-model="FormData[conf.key]"
              :options="conf.options || DataMaps[conf.key]"
              v-bind="verificationProps(conf)"
              class="formKit-list-item"
              @change="changeMaker($event, conf)"
            />
            <slot
              :name="conf.key"
              :row="conf"
              :value="FormData[conf.key]"
              :size="size"
            />
            <p v-if="conf.hint" class="item-hint" v-html="conf.hint" />
          </el-form-item>
        </el-col>
        <slot name="FormKitAppend" />
      </el-row>
    </el-form>
    <slot :config="config" name="FormKitContent" />
  </div>
</template>

<script>
import _ from "lodash";
import recipient, { componentsList } from "./asyncLoadModules";

export default {
  name: "FormKit",
  model: { prop: "value", event: "change" },
  props: {
    value: { required: true, type: Object },
    config: { type: Array, default: () => [] },
    disabled: { type: Boolean, default: false },
    labelPosition: { type: String, default: "top" }, // 表单项对齐规则
    rowGap: { type: Number, default: 0 }, // 表单项纵向间距
    labelWidth: { type: [Number, String], default: 120 }, // 表单项标题宽度(仅在labelPosition为left、right时生效)
    columns: { type: Number, default: 1 }, // 每行显示多少列
    size: { type: String, default: "small" }, // 表单项尺寸
    row: { type: Object, default: () => ({ gutter: 30, type: "flex" }) }, // 表单row项设置
  },
  data: () => ({
    UNIQUE_KEY: Number(new Date()),
    DataMaps: {},
    Stack: [],
    Notes: {},
  }),
  computed: {
    _FORM_ATTRS() {
      const attrs = {};
      if (this.size !== "small") attrs.size = this.size;
      if (this.columns !== 1) attrs.inline = true;
      if (this.disabled) attrs.disabled = this.disabled;
      return attrs;
    },
    FormData: {
      get() {
        if (this.value && Object.keys(this.value).length === 0)
          this.UNIQUE_KEY = Number(new Date());
        return this.value || {};
      },
      set(newVal) {
        this.$emit("change", newVal);
      },
    },
    COL_SPAN() {
      return 24 / this.columns;
    },
  },
  created() { this.Initialization(); },
  methods: {
    Initialization() {
      const config = this.config;
      const THIS = this;
      return new class {
        constructor() {
          this.pending = {};
          const setConf = new Set(config);
          if (setConf.size > 0) this.init(setConf);
        }
        init(conf, FUNC = ["common"]) {
          try {
            for (const iterator of conf) {
              FUNC.map((name) =>
                this[name] ? this[name](iterator) : _.noop()
              );
            }
            THIS.Notes.__PENDING = this.pending;
            THIS.executeStack();
          } catch (error) {
            console.log(`[_initComponent method]: ${error}`);
          }
        }
        common(
          config,
          __opt = ["select", "radio", "cascader", "address", "checkbox"]
        ) {
          const { type } = config;
          if (_.includes(__opt, type)) this.handleDataMaps(config);
        }
        handleDataMaps(config = {}) {
          if (config.type === "address") return THIS.Stack.push(config);
          if (_.isArray(config.options)) return;
          if (_.isObject(config.request)) THIS.Stack.push(config);
        }
      }();
    },
    confController(config) {
      if (_.isEmpty(config.visible)) {
        return config;
      } else {
        if (_.isObject(config.visible) || _.isArray(config.visible)) {
          this.fixedPointClearValidate(config);
          if (config.visible.constructor === Object) {
            const { value, key } = config.visible;
            if (this.FormData[key] === value) return config;
          }
          if (_.isArray(config.visible)) {
            const ARR = config.visible;
            const isCheck = ARR.some((it) => {
              return this.FormData[it.key] === it.value;
            });
            if (isCheck) return config;
          }
        } else {
          console.warn(
            "visible field has been set, but it is not an array or object!"
          );
          return config;
        }
      }
    },
    fixedPointClearValidate(config = {}) {
      if (
        Object.hasOwnProperty.call(config, "key" && "rules") &&
        this.$refs[this.UNIQUE_KEY]
      ) {
        this.$refs[this.UNIQUE_KEY].clearValidate([config.key]);
      }
    },
    verificationLoad(type) {
      const alias = { address: "el-cascader" };
      if (_.includes(recipient, type)) {
        return componentsList[type] || `el-${type}`;
      } else {
        if (alias[type]) return alias[type];
        return `el-${type}`;
      }
    },
    clearValidate() {
      this.$refs[this.UNIQUE_KEY].clearValidate();
    },
    verificationProps(rows = {}) {
      const { type, props = {} } = rows;
      const notEmpty = Object.keys(props).length > 0;
      if (type === "address") {
        const _props = _.assign(
          { value: "code", label: "name", children: "children" },
          props.props
        );
        if (props && notEmpty) return { ...props, ...{ props: _props } };
        return { props: _props };
      } else {
        return props;
      }
    },
    changeMaker(event, config) {
      this.$emit("update", { event, config });
      this.fixedPointClearValidate(config);
    },
    async executeStack() {
      if (_.isEmpty(this.Stack)) return;
      try {
        const runner = this.Stack[Symbol.iterator]();
        console.group(`FormKit remote item output`);
        for (const iterator of runner) {
          const { request, key, handle, type } = iterator;
          if (type === "address") {
            this.$set(this.DataMaps, key, await this.getDistricts());
          } else {
            const TYPE = Object.prototype.toString.call(request);
            const req =
              TYPE === "[object Function]" ? await request() : await request;
            console.log(JSON.parse(JSON.stringify({ [key]: req })));
            if (_.isFunction(handle)) {
              this.$set(this.DataMaps, key, handle(req));
            } else {
              const { data = [], code } = req;
              if (code === 200) {
                this.$set(this.DataMaps, key, data);
              } else {
                console.log(
                  `[${key} executeStack request fail]: code(${code}) is abnormal!`
                );
              }
            }
          }
        }
        console.groupEnd();
      } catch (e) {
        console.log(`[executeStack method]: ${e}`);
        console.groupEnd();
      }
    },
    verify(openTips = false) {
      return new Promise((resolve, reject) => {
        try {
          this.$refs[this.UNIQUE_KEY].validate((valid) => {
            if (valid) {
              resolve(this.FormData);
            } else {
              throw "您需要将标星号的栏目填写完整后重新尝试";
            }
          });
        } catch (e) {
          if (openTips) this.$message.error(e);
          reject(e);
        }
      });
    },
    async getDistricts() {
      const _OPT = async () => {
        try {
          const districts = await import(`./assets/districts.js`);
          return districts.default || [];
        } catch (e) {
          console.log(`FormKit can not load address districts: ${e}`);
          return [];
        }
      };
      return await _OPT();
    },
    childrenVNode(obj, targetName) {
      console.log(obj.$vnode);
      if (obj.$vnode.tag.includes(targetName)) {
        return obj;
      } else {
        return this.childrenVNode(obj.$children, targetName);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.FormKit {
  .form-kit-row {
    flex-wrap: wrap;
  }
  .item-hint {
    margin: 0;
    color: #888888;
    font-weight: 300;
    font-size: 12px;
    line-height: 24px;
  }
  .formKit-list-item {
    display: inline-block;
  }
  /deep/ .el-input-number {
    width: auto;
  }
  /deep/ .el-form-item {
    margin: 0;
    width: 100%;
  }
  /deep/ .el-form--label-top .el-form-item__label {
    padding: 0;
  }
  /deep/ .el-form-item__error {
    position: relative;
  }
}
.form-label-auto /deep/ .el-form-item__label {
  width: auto !important;
}
</style>
