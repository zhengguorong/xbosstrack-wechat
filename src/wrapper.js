const globalVarApp = App; // 小程序原App对象
const globalVarPage = Page; // 小程序原Page对象
const injectPageMethods = [];
const injectAppMethods = [];
const extraPageMethods = [];
const extraAppMethods = [];

const _isPromise = (value) => value && Object.prototype.toString.call(value) === '[object Promise]';

/**
 * 对用户定义函数进行包装.
 * @param {Object} target page对象或者app对象
 * @param {String} methodName 需要包装的函数名
 * @param {Array} methods 函数执行前执行任务
 */
const _wrapTargetMethod = (target, methodName, methods = []) => {
  const methodFunction = target[methodName];
  target[methodName] = function _aa(...args) {
    const result = methodFunction && methodFunction.apply(this, args);
    const methodExcuter = () => {
      methods.forEach((fn) => {
        fn.apply(this, [target, methodName, ...args]);
      });
    };
    try {
      if (_isPromise(result)) {
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
};

/**
 * 追加函数到Page/App对象
 * @param {Object} target page对象或者app对象
 * @param {Array} methods 需要追加的函数数组
 */
const _addExtraMethod = (target, methods) => {
  methods
    .forEach(fn => {
      const methodName = fn.name;
      target[methodName] = fn;
  });
};

/**
 * @param {*} target page对象或者app对象
 * @param {*} methods 需要插入执行的函数
 */
const _create = (target, injectMethods, extraMethods) => {
  Object.keys(target)
    .filter((prop) => typeof target[prop] === 'function')
    .forEach((methodName) => {
      _wrapTargetMethod(target, methodName, injectMethods);
    });
  _addExtraMethod(target, extraMethods);
  return target;
};

export const addPageMethodWrapper = (fn) => {
  injectPageMethods.push(fn);
};
export const addAppMethodWrapper = (fn) => {
  injectAppMethods.push(fn);
};

export const addPageMethodExtra = (fn) => {
  extraPageMethods.push(fn);
};
export const addAppMethodExtra = (fn) => {
  extraAppMethods.push(fn);
};

export const createApp = (app) => globalVarApp(_create(app, injectAppMethods, extraAppMethods));
export const createPage = (page) => globalVarPage(_create(page, injectPageMethods, extraPageMethods));
export const init = () => {
  App = (app) => globalVarApp(_create(app, injectAppMethods, extraAppMethods));
  Page = (page) => globalVarPage(_create(page, injectPageMethods, extraPageMethods));
};
