import Wrapper from './wrapper';
import { getBoundingClientRect, isClickTrackArea, getActivePage } from './helper';
import report from './report';

class Tracker extends Wrapper {
  constructor({ tracks, isUsingPlugin }) {
    super(isUsingPlugin);
    // 埋点配置信息
    this.tracks = tracks;
    // 自动给每个page增加elementTracker方法，用作元素埋点
    this.addPageMethodExtra(this.elementTracker());
    // 自动给page下预先定义的方法进行监听，用作方法执行埋点
    this.addPageMethodWrapper(this.methodTracker());
    // 自动给page component下预先定义的方法进行监听，用作方法执行埋点
    this.addComponentMethodWrapper(this.comMethodTracker());
  }

  elementTracker() {
    // elementTracker变量名尽量不要修改，因为他和wxml下的名字是相对应的
    const elementTracker = (e) => {
      const tracks = this.findActivePageTracks('element');
      const { data } = getActivePage();
      tracks.forEach((track) => {
          getBoundingClientRect(track.element).then((res) => {
              res.boundingClientRect.forEach((item) => {
                const isHit = isClickTrackArea(e, item, res.scrollOffset);
                track.dataset = item.dataset;
                isHit && report(track, data);
              });
          });
      });
    };
    return elementTracker;
  }

  methodTracker() {
    return (page, component, methodName, args = {}) => {
      const tracks = this.findActivePageTracks('method');
      const { data } = getActivePage();
      const { dataset } = args.currentTarget || {};
      tracks.forEach((track) => {
        if (track.method === methodName) {
          track.dataset = dataset;
          report(track, data);
        }
      });
    };
  }

  comMethodTracker() {
    return (page, component, methodName, args = {}) => {
      const tracks = this.findActivePageTracks('comMethod');
      const data = component.data;
      const { dataset } = args.currentTarget || {};
      tracks.forEach((track) => {
        if (track.method === methodName) {
          track.dataset = dataset;
          report(track, data);
        }
      });
    };
  }

  /**
   * 获取当前页面的埋点配置
   * @param {String} type 返回的埋点配置，options: method/element/comMethod
   * @returns {Object}
   */
  findActivePageTracks(type) {
    try {
      const { route } = getActivePage();
      const pageTrackConfig = this.tracks.find(item => item.path === route) || {};
      let tracks = {};
      if (type === 'method') {
        tracks = pageTrackConfig.methodTracks || [];
      } else if (type === 'element') {
        tracks = pageTrackConfig.elementTracks || [];
      }else if (type === 'comMethod') {
        tracks = pageTrackConfig.comMethodTracks || [];
      }
      return tracks;
    } catch (e) {
      return {};
    }
  }
}

export default Tracker;
