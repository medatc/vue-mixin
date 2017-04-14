'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var _Vue = void 0;

function install(Vue) {
  if (install.installed) return;
  install.installed = true;
  _Vue = Vue;
}

var utils = {
  isObject: function isObject(obj) {
    return Object.prototype.toString.call(obj) === '[object Object]';
  },
  isArray: function isArray(arr) {
    return Object.prototype.toString.call(arr) === '[object Array]';
  },
  isHas: function isHas(obj, k) {
    return Object.prototype.hasOwnProperty.call(obj, k);
  },
  createComputed: function createComputed(store) {
    var computed = {};
    Object.keys(store).forEach(function (k) {
      computed[k] = {
        get: function get() {
          return store[k];
        },
        set: function set(v) {
          store[k] = v;
        }
      };
    });
    return computed;
  }
};

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();





var defineProperty = function (obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
};

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};





















var slicedToArray = function () {
  function sliceIterator(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"]) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  return function (arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if (Symbol.iterator in Object(arr)) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError("Invalid attempt to destructure non-iterable instance");
    }
  };
}();

/**
 * vue mixin插件
 * return {Class}
 */

var VueMixin$1 = function () {
  function VueMixin(options) {
    var _this = this;

    classCallCheck(this, VueMixin);

    this.mixins = {};
    this.store = {};
    this.plugins = options.plugins || [];

    // 创建Vue实例
    this.vm = new _Vue({
      data: {
        store: this.store
      }
    });
    // 安装插件
    this.plugins.forEach(function (item) {
      if (process.env.NODE_ENV !== 'production') {
        if (typeof item.name !== 'string' || _this.mixins[item.name]) {
          return new Error({ msg: '[VueMixin] Plug in conflict [' + item.name + ']' });
        }
      }
      _this.mixins[item.name] = Object.assign(item.install(_this));
      if (utils.isObject(item.store)) {
        _this.createStore(item.name, item.store);
      }
    });
  }

  createClass(VueMixin, [{
    key: 'createStore',
    value: function createStore(name, store) {
      // 创建仓库
      _Vue.set(this.store, name, store);
    }
  }, {
    key: 'destroyed',
    value: function destroyed() {
      // 销毁程序，释放内存
      this.plugins.forEach(function (item) {
        // 销毁插件
        if (typeof item.destroyed === 'function') {
          item.destroyed();
        }
      });
      this.vm.destroyed(); // 销毁vm
    }
  }]);
  return VueMixin;
}();

/**
 * 详情，修改，新增可共用的mixin
 * 路由匹配规则：
 * /module
 * /module/create
 * /module/:id/edit
 * /module/:id
 * @param {Object} options 选项
 *  - {String} [key] - 详情的id的key路径
 *  - {Object|Array} [mixins] - 加入你自定义的mixins
 *  - {Function} [fetch] - 请求列表的调用的钩子函数，需要return Promise 类型
 *  - {Function} [model] - 数据的字段集合
 * @return {Object}
 */
function vueMixinFetchDetail(options) {
  if (process.env.NODE_ENV !== 'production') {
    if (typeof options.fetch !== 'function') {
      return new Error({ msg: '[vueMixinFetchDetail] get options typeof function' });
    }
    if (typeof options.model !== 'function') {
      return new Error({ msg: '[vueMixinFetchDetail] get options typeof function' });
    }
  }
  // 处理key值
  if (typeof options.key === 'string') {
    var _options$key$split = options.key.split('.'),
        _options$key$split2 = slicedToArray(_options$key$split, 2),
        detailName = _options$key$split2[0],
        keyName = _options$key$split2[1];

    options.detailName = detailName;
    options.keyName = keyName;
  } else {
    return;
  }
  // 处理mixins
  if (utils.isObject(options.mixins)) {
    options.mixins = [options.mixins];
  } else if (!utils.isArray(options.mixins)) {
    options.mixins = [];
  }
  var name = 'fetchDetail';
  var store = options.model();
  return {
    name: name,
    store: store,
    install: function install(VueMixin) {
      // 安装程序
      var fetchList = VueMixin.store.fetchList;

      if (process.env.NODE_ENV !== 'production') {
        if (!utils.isObject(fetchList)) {
          return new Error({ msg: 'Please install the FetchList plugin' });
        }
      }
      function getListItemIndex(key) {
        // 获取当前页面在列表中的索引，此处可使用算法来优化查找的性能、待续。。。
        var list = fetchList.list,
            length = fetchList.list.length;

        for (var i = 0; i < length; i++) {
          if (String(list[i][options.keyName]) === String(key)) {
            // 路由传来的key可能是字符串，也可能是数字
            return i;
          }
        }
        return -1;
      }

      this.listUnwatch = VueMixin.vm.$watch('store.fetchList.list', function (list) {
        // 监听列表的数据改变
        var index = getListItemIndex(store[options.detailName][options.keyName]);
        if (index < 0) return false;
        var detail = list[index];
        Object.keys(store[options.detailName]).forEach(function (k) {
          if (Object.prototype.hasOwnProperty.call(detail, k)) {
            // 如果存在这个属性，才更新到详情中
            store[options.detailName][k] = detail[k];
          }
        });
      }, { deep: true });
      this.detailUnwatch = VueMixin.vm.$watch('store.' + name + '.' + options.detailName, function (detail) {
        // 监听详情的数据改变
        var index = getListItemIndex(store[options.detailName][options.keyName]);
        if (index < 0) return false;
        Object.keys(fetchList.list[index]).forEach(function (k) {
          fetchList.list[index][k] = detail[k];
        });
      }, { deep: true });
      return {
        mixins: options.mixins,
        props: [options.keyName],
        beforeRouteEnter: function beforeRouteEnter(to, from, next) {
          // 每次路由变化都会调用此钩子函数
          var toKey = String(to.params[options.keyName]);
          var key = String(store[options.detailName][options.keyName]);
          if (toKey !== key) {
            // 判断详情的数据和路由要跳转的页面是否一致
            var index = getListItemIndex(to.params[options.keyName]);
            Object.assign(store[options.detailName], options.model()[options.detailName], fetchList.list[index] || {});
          }
          next();
        },

        computed: _extends({}, utils.createComputed(store), {
          $fetchDetail: function $fetchDetail() {
            var self = this;
            function fetchDetail() {
              if (!self[options.keyName]) return;
              return options.fetch.call(self).then(function (res) {
                Object.assign(store, res);
              });
            }
            return fetchDetail;
          }
        }),
        created: function created() {
          this.$fetchDetail();
        },

        watch: defineProperty({}, options.keyName, function () {
          this.$fetchDetail();
        })
      };
    },
    destroyed: function destroyed() {
      // 销毁插件，释放内存
      this.listUnwatch();
      this.detailUnwatch();
    }
  };
}

/**
 * vue列表使用的mixin
 * @param {Object} options
 *  - {String} [pagekey] - 分页的唯一标识
 *  - {String} [queryKey] - 地址栏参数的key
 *  - {Object|Array} [mixins] - 加入你自定义的mixins
 *  - {Function} [model] - 列表的字段模型
 *  - {Function} [fetch] - 请求列表的调用的钩子函数，需要return Promise 类型
 * @return {Object}
 */
function vueMixinFetchList(options) {
  // 必传选项验证
  if (process.env.NODE_ENV !== 'production') {
    if (typeof options.pagekey !== 'string') {
      return new Error({ msg: '[vueMixinFetchList] get options typeof string' });
    }
    if (typeof options.queryKey !== 'string') {
      return new Error({ msg: '[vueMixinFetchList] get options typeof string' });
    }
    if (typeof options.fetch !== 'function') {
      return new Error({ msg: '[vueMixinFetchList] get options typeof function' });
    }
    if (typeof options.model !== 'function') {
      return new Error({ msg: '[vueMixinFetchList] get options typeof function' });
    }
  }
  // 处理mixins
  if (utils.isObject(options.mixins)) {
    options.mixins = [options.mixins];
  } else if (!utils.isArray(options.mixins)) {
    options.mixins = [];
  }
  var name = 'fetchList';
  var store = options.model();

  return {
    name: name,
    store: store,
    install: function install(VueMixin) {
      // 安装程序
      var dataSearch = '';
      return {
        beforeRouteEnter: function beforeRouteEnter(to, from, next) {
          // 如果不是在当前模块内跳转，并且列表关联的key和现在的key不一致，则清除数据)
          if (getSearch(to.query) !== dataSearch) {
            listInit();
          }
          next();
        },

        computed: _extends({}, utils.createComputed(store), {
          $fetchList: function $fetchList() {
            var self = this;
            /**
             * 获取列表的数据
             */
            function fetchList() {
              var search = getSearch(self.$route.query);
              return options.fetch.call(self).then(function (res) {
                if (search !== getSearch(self.$route.query)) return false; // 数据请求回来，页面已经发生改变了
                Object.assign(store, res);
                dataSearch = search;
              });
            }
            fetchList.init = function init() {
              listInit.apply(self, arguments);
            };
            /**
             * 查询页面的数据
             */
            fetchList.search = function search() {
              var query = {};
              /* eslint-disable no-undef */

              for (var _len = arguments.length, arg = Array(_len), _key = 0; _key < _len; _key++) {
                arg[_key] = arguments[_key];
              }

              if (event === arg[0]) {
                // 事件触发传进来的参数不要
                arg[0] = {};
              }
              if (utils.isObject(arg[0])) {
                query = arg[0];
              } else if (typeof arg[0] === 'string') {
                query[arg[0]] = arg[1];
              }
              query = Object.assign({}, self.$route.query, defineProperty({}, options.pagekey, 1), self[options.queryKey], query);
              self.$router.push(_extends({}, this.$route, {
                query: query
              }));
            };
            /**
             * 将地址栏的参数同步到组件中
             */
            fetchList.syncQuery = function syncQuery() {
              var query = self[options.queryKey];
              if (utils.isObject(query)) {
                // 将地址栏的参数，还原到对应的字段中去
                Object.keys(query).forEach(function (k) {
                  if (Object.prototype.hasOwnProperty.call(self.$route.query, k)) {
                    query[k] = self.$route.query[k];
                  }
                });
              }
            };
            return fetchList;
          }
        }),
        created: function created() {
          this.$fetchList.syncQuery();
          this.$fetchList();
        },

        watch: {
          '$route.query': function $routeQuery(val, oldVal) {
            this.$fetchList.syncQuery();
            if (getSearch(val) === getSearch(oldVal)) return false; // 对象被改变了，但是url并没有改变
            this.$fetchList();
          }
        }
      };
    },
    destroyed: function destroyed(VueMixin) {// 卸载程序
    }
  };

  function getSearch(query) {
    // 获取地址栏?后面的参数
    var arr = [];
    Object.keys(query).forEach(function (k) {
      return arr.push(k + '=' + query[k]);
    });
    return arr.join('&');
  }
  function listInit() {
    // 初始化状态
    var model = options.model();
    Object.assign(store, model);
  }
}

/**
 * 缓存列表的数据
 * @param {Array} options
 * - {Array} [base] - 依赖其他的请求
 * - {Boolean} [update] - 是否更新数据
 * - {Function} [fetch] - 请求数据
 */
function vueMixinStore(options) {
  var name = 'store';
  var store = {}; // 仓库，所有的数据存储在这里
  var task = {}; // 所有的任务
  /**
   * 一项默认的配置
   */
  var defaults = {
    base: [], // 这一项，基于谁
    update: true, // 是否更新数据
    fetch: function fetch() {
      return Promise.resolve({});
    } // 处理请求的钩子函数可以依赖其他请求
  };
  Object.keys(options).forEach(function (k) {
    var unknown = options[k];
    if (utils.isObject(unknown)) {
      task[k] = Object.assign({}, defaults, unknown);
    } else if (typeof unknown === 'function') {
      task[k] = Object.assign({}, defaults, { fetch: unknown });
    }
  });
  return {
    name: name,
    store: store,
    install: function install(VueMixin) {
      return {
        created: function created() {
          var _this = this;

          var fetchTask = {}; // 仓库的请求任务

          Object.keys(task).forEach(function (k) {
            if (!utils.isHas(_this.$data, k)) return false; // 组件没有使用这个仓库的数据
            if (utils.isHas(store, k)) {
              // 仓库已经存在数据
              _this.$data[k] = store[k]; // 从仓库中还原数据
            } else {
              _Vue.set(store, k, _this.$data[k]); // 在仓库中创建默认的数据
            }
            var item = task[k];
            var data = store[k];
            if (!item.update && data._ok_) return false; // 数据无需更新
            if (item.base.length === 0) {
              fetchTask[k] = item;
            } else {
              // 将依赖的任务添加进来
              addBaseTask(item.base);
            }
          });

          vueMixinStoreFetch.call(this, fetchTask);
          function addBaseTask(base) {
            base.forEach(function (k) {
              fetchTask[k] = task[k];
            });
          }
          function vueMixinStoreFetch(fetchTask) {
            var _this2 = this;

            var fetch = [];
            var queue = Object.keys(fetchTask);
            var storeUpdate = function storeUpdate(k, data) {
              Object.defineProperty(data, '_ok_', { // 此数据是否是已经加载过了
                value: true,
                enumerable: false, // 不可枚举
                configurable: false, // 属性不可删除
                writable: true // 值允许可写
              });
              _this2.$data[k] = store[k] = data;
            };

            queue.forEach(function (k) {
              var item = fetchTask[k];
              var promise = item.fetch.call(_this2).then(function (res) {
                storeUpdate(k, res);
                return res;
              });
              fetch.push(promise);
            });
            return Promise.all(fetch).then(function (arg) {
              Object.keys(task).forEach(function (k) {
                var list = [];
                var item = task[k];
                if (!item.base.length) return false; // 没有依赖任务
                for (var i = 0; i < item.base.length; i++) {
                  var index = queue.indexOf(item.base[i]);
                  if (index > -1) {
                    list.push(arg[index]);
                  } else {
                    break;
                  }
                }
                if (list.length === item.base.length) {
                  // 执行依赖的任务
                  storeUpdate(k, item.fetch.apply(_this2, list));
                }
              });
            });
          }
        },

        computed: {
          $vueMixinStore: function $vueMixinStore() {
            return store;
          }
        }
      };
    }
  };
}

VueMixin$1.install = install;

exports['default'] = VueMixin$1;
exports.vueMixinFetchDetail = vueMixinFetchDetail;
exports.vueMixinFetchList = vueMixinFetchList;
exports.vueMixinStore = vueMixinStore;
//# sourceMappingURL=vue-mixin.js.map
