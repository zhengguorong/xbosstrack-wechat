# xbosstrack 小程序自动埋点
### 使用方法

1、App.js文件引入资源

```
// 引入埋点SDK
import Tracker from './xbosstrack.min.js';
// 引入埋点配置信息，请自行参考tracks目录下埋点配置修改
import trackConfig from './tracks/index';
```

2、初始化

```
new Tracker({ tracks: trackConfig });
```

3、加入你的埋点信息

```
/**
 * path 页面路径
 * elementTracks 页面元素埋点
 * methodTracks 执行函数埋点
 * comMethodTracks: 执行组件内函数埋点
 */
const tracks = {
  path: 'pages/film/index',
  elementTracks: [
    {
      element: '.playing-item',
      dataKeys: ['imgUrls', 'playingFilms[$INDEX].filmId', 'playingFilms[0]'],
    },
    {
      element: '.more',
      dataKeys: ['imgUrls', 'playingFilms', '$DATASET.test'],
    }
  ],
  methodTracks: [
    {
      method: 'getBanner',
      dataKeys: ['imgUrls'],
    },
    {
      method: 'toBannerDetail',
      dataKeys: ['imgUrls'],
    },
  ],
  comMethodTracks: [
    {
      method: '_test1',
      dataKeys: ['name', '$DATASET.test'],
    },
  ],
};
```

4、在wxml最外层插入监听方法

```
<view catchtap='elementTracker'>
	<view></view>
</view>
```

打开控制台，查看是否成功收集

![image](https://user-images.githubusercontent.com/2757932/51715472-d518a200-2073-11e9-874f-9cd1894a779c.png)

element： 触发埋点元素class

method：触发埋点函数

name：收集数据的key值

data：数据对应值



5、如果你要监听组件内元素

在elementTracks里加入

```javascript
{
  element: '.page >>> .sub-component',
    dataKeys: ['name', '$DATASET.test']
}
```

.page表示包裹组件的元素class，或者你可以使用id或者任意选择器

.sub-component 表示监听组件内元素class名

核心还是利用了微信提供的选择器，可以[参考文档](https://developers.weixin.qq.com/miniprogram/dev/api/wxml/SelectorQuery.selectAll.html)



### 特殊前缀

$APP 表示读取App下定义的数据

$DATASET.xxx 表示获取点击元素，定义data-xxx 中的 xxx值

$INDEX 表示获取列表，当前点击元素的索引

**需要获取$INDEX时，需要在wxml中加入data-index={{index}}标记**

```
<view class='playing-item' data-index="{{index}}" wx:for='{{playingFilms}}'></view>
```



### 兼容插件模式

由于SDK会改写Page对象，如果使用了插件，微信会禁止改写，可以通过以下方式改造。

```
// 初始化插件模式
const tracker = new Tracker({ tracks: trackConfig, isUsingPlugin: true });

// 将原来的App包装
tracker.createApp({
    
})

// 将原Page包装
tracker.createPage({
    
})

// 将原Component包装
tracker.createComponent({
    
})
```





### 方案实现说明

[小程序从手动埋点到自动埋点](https://github.com/zhengguorong/articles/issues/34)

[DEMO](https://github.com/zhengguorong/maizuo_wechat)

## License

[996 License](https://github.com/zhengguorong/xbosstrack-wechat/blob/master/LICENSE)

