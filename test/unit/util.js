/**
 * 回收 vm，一般在每个测试脚本测试完成后执行回收vm。
 * @param  {Object} vm
 */
exports.destroyVM = function (vm) {}

/**
 * 创建一个 Vue 的实例对象
 * @param  {Object|String}  Compo     - 组件配置，可直接传 template
 * @param  {Boolean=false}  mounted   - 是否添加到 DOM 上
 * @return {Object} vm
 */
exports.createVue = function (Compo, mounted = false) {}

/**
 * 创建一个测试组件实例
 * @param  {Object}  Compo          - 组件对象
 * @param  {Object}  propsData      - props 数据
 * @param  {Boolean=false} mounted  - 是否添加到 DOM 上
 * @return {Object} vm
 */
exports.createTest = function (Compo, propsData = {}, mounted = false) {}

/**
 * 触发一个事件
 * 注： 一般在触发事件后使用 vm.$nextTick 方法确定事件触发完成。
 * mouseenter, mouseleave, mouseover, keyup, change, click 等
 * @param  {Element} elm      - 元素
 * @param  {String} name      - 事件名称
 * @param  {*} opts           - 配置项
 */
exports.triggerEvent = function (elm, name, ...opts) {}

/**
 * 触发 “mouseup” 和 “mousedown” 事件，既触发点击事件。
 * @param {Element} elm     - 元素
 * @param {*} opts          - 配置选项
 */
exports.triggerClick = function (elm, ...opts) {}
