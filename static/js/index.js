function getCookie(name) {
    return document.cookie.match(`[;\s+]?${name}=([^;]*)`)?.pop();
}

// 比如cookie如下： a=b; c=d
// 使用
getCookie('c') // d

const app = new Vue({
    el: '#app',
    data: {
        folder: '',
        title: 'rain 编辑器',
        instance: null,
        theme: 'light',
        config: {
            path: '',
            name: '',
            display: ''
        },
        folderList: [],
        fileList: []
    },
    created() {
        // 初始化时判断当前主题
        let theme = window.parent.document.getElementsByTagName('html')[0].getAttribute('data-theme')
        document.getElementById('app').setAttribute('theme', theme)
        this.theme = theme === 'light' ? 'classic' : 'dark';
        // 获取文件夹信息
        let result = localStorage.getItem('rain-note');
        try {
            let config = JSON.parse(result);
            this.config.path = config.path;
            this.config.name = config.name;
            this.config.display = config.pathDisplay;
        } catch (ignore) { }
        if (this.config.path != '') {
            // 获取文件
            this.ls(this.config.path)
        }
    },
    mounted() {
        // 挂载时初始化编辑器
        this.instance = new Vditor('editor', {
            theme: this.theme,
            width: '100%',
            height: 'calc(100vh - 31px - 31px)',
            value: '请开始你的表演',
            cache: {
                enable: false
            }
        })
    },
    methods: {
        openFolder() {
            let that = this;
            kodApi.fileSelect({
                title: "选择文件夹",
                type: 'folder',
                callback: function (result) {
                    localStorage.setItem('rain-note', JSON.stringify(result));
                    // 赋值
                    this.config.path = config.path;
                    this.config.name = config.name;
                    this.config.display = config.pathDisplay;
                    // 展示文件夹
                    that.ls(this.config.path)
                }
            });
        },
        ls(path) {
            let that = this;
            $.post('/index.php?explorer/list/path', {
                path: path,
                page: 1,
                pageNum: 500,
                CSRF_TOKEN: getCookie('CSRF_TOKEN'),
                API_ROUTE: 'explorer/list/path'
            }, function (response) {
                let folderList = [];
                for(let folder of response.data.folderList) {
                    // 文件夹渲染
                    folderList.push({
                        name: folder.name,
                        path: folder.path
                    })
                }
                that.folderList=  folderList;
            })
        }
    }
});