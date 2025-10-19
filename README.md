# Oshioki Button

游戏 「魔法少女的魔女审判」 中处刑按钮效果的网页复刻。

可以进行二次开发以联动~~外部设备~~处刑。

[`index.html`](index.html#oshiokiCallback)

```javascript
function oshiokiCallback() {
    /* 在这里联动惩罚小玩具狠狠的处刑群友 */

    const BASE_URL = 'https://example.com/api/v1/oshioki_callback';
    fetch(BASE_URL, { method: 'POST' })
    .then(response => {
        if (!response.ok) {
            throw new Error(`网络响应异常: ${response.status}`);
        }
    })
    .catch(error => {
        console.error('请求失败:', error);
    });
}
```

## 相关

[Steam 上的 魔法少女的魔女审判](https://store.steampowered.com/app/3101040/)

使用了 [ltyec/OshiokiSwift: 为iOS系统设计的处刑app](https://github.com/ltyec/OshiokiSwift) 中的图片与音效素材。
