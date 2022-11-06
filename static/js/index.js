const app = new Vue({
    el: '#app',
    data: {
        title: 'rain 编辑器'
    }
});

// 初始化时判断当前主题
let theme = window.parent.document.getElementsByTagName('html')[0]
.getAttribute('data-theme')
document.getElementById('app').setAttribute('theme', theme)