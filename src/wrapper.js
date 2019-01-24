const globalVarApp = App; // 小程序原App对象
const globalVarPage = Page; // 小程序原Page对象

class Wrapper {
  constructor(isUsingPlugin) {
    this.injectPageMethods = [];
    this.injectAppMethods = [];
    this.extraPageMethods = [];
    this.extraAppMethods = [];
    if (!isUsingPlugin) {
      App = (app) => globalVarApp(this._create(app, this.injectAppMethods, this.extraAppMethods));
      Page = (page) => globalVarPage(this._create(page, this.injectPageMethods, this.extraPageMethods));
    }
  }

  /**
   * 对用户定义函数进行包装.
   * @param {Object} target page对象或者app对象
   * @param {String} methodName 需要包装的函数名
   * @param {Array} methods 函数执行前执行任务
   */
  _wrapTargetMethod(target, methodName, methods = []) {
    const methodFunction = target[methodName];
    target[methodName] = function _aa(...args) {
      const result = methodFunction && methodFunction.apply(this, args);
      const methodExcuter = () => {
        methods.forEach((fn) => {
          fn.apply(this, [target, methodName, ...args]);
        });
      };
      try {
        if (Object.prototype.toString.call(result) === '[object Promise]') {
          result.then(() => {
            methodExcuter();
          }).catch(() => {
            methodExcuter();
          });
        } else {
          methodExcuter();
        }
      } catch (e) {
        console.error(methodName, '钩子函数执行出现错误', e);
      }
      return result;
    };
  }

  /**
   * 追加函数到Page/App对象
   * @param {Object} target page对象或者app对象
   * @param {Array} methods 需要追加的函数数组
   */
  _addExtraMethod(target, methods) {
    methods
      .forEach(fn => {
        const methodName = fn.name;
        target[methodName] = fn;
    });
  }

  /**
   * @param {*} target page对象或者app对象
   * @param {*} methods 需要插入执行的函数
   */
  _create(target, injectMethods, extraMethods) {
    Object.keys(target)
      .filter((prop) => typeof target[prop] === 'function')
      .forEach((methodName) => {
        this._wrapTargetMethod(target, methodName, injectMethods);
      });
    this._addExtraMethod(target, extraMethods);
    return target;
  }

  addPageMethodWrapper(fn) {
    this.injectPageMethods.push(fn);
  }

  addAppMethodWrapper(fn) {
    this.injectAppMethods.push(fn);
  }

  addPageMethodExtra(fn) {
    this.extraPageMethods.push(fn);
  }

  addAppMethodExtra(fn) {
    this.extraAppMethods.push(fn);
  }

  createApp(app) {
    globalVarApp(this._create(app, this.injectAppMethods, this.extraAppMethods));
  }

  createPage(page) {
    globalVarPage(this._create(page, this.injectPageMethods, this.extraPageMethods));
  }
}

export default Wrapper;
