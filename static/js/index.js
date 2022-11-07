function getCookie(name) {
    return document.cookie.match(`[;\s+]?${name}=([^;]*)`)?.pop();
}

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
        file: null,
        defaultConfig: {
            path: '',
            name: '',
            display: ''
        },
        menus: [],
        search: '',
        defaultProps: {
            children: 'children',
            label: 'label',
            isLeaf: 'leaf'
        },
        contextMenu: {
            display: false,
            left: 0,
            top: 0,
            type: 'folder'
        }
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
            this.defaultConfig.path = config.path;
            this.defaultConfig.name = config.name;
            this.defaultConfig.display = config.pathDisplay;
        } catch (ignore) { }
        // 点击事件
        let that = this;
        document.addEventListener('click', function (event) {
            console.log(event.target.classList)
            that.contextMenu = {
                display: false,
                left: 0,
                top: 0
            }
        });
        document.addEventListener('keydown', function (event) {
            if (event.ctrlKey && event.key === 's') {
                // 保存
                if (that.file) {
                    that.saveContent(that.instance.getValue())
                } else {
                    // 询问
                    that.$confirm('未选择文件，是否创建文件', '警告', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning'
                    }).then(() => {
                        that.$prompt(`在文件夹【${that.config.name}】下创建文件`, '请输入文件名称', {
                            confirmButtonText: '确定',
                            cancelButtonText: '取消'
                        }).then(({ value }) => {
                            console.log(that.config.path)
                            $.post('/index.php?explorer/index/mkfile', {
                                path: `${that.config.path}/${value}.md`,
                                CSRF_TOKEN: getCookie('CSRF_TOKEN'),
                                API_ROUTE: 'explorer/index/mkfile'
                            }, function (response) {
                                if (response.code) {
                                    that.$message({
                                        type: 'success',
                                        message: '新建成功'
                                    });
                                    that.file = {
                                        path: `${that.config.path}/${value}.md`,
                                        name: `${value}.md`
                                    }
                                    that.saveContent(that.instance.getValue())
                                } else {
                                    that.$message({
                                        type: 'error',
                                        message: response.info
                                    });
                                }
                            })
                        }).catch(() => {
                        });
                    }).catch(() => {
                        that.$message({
                            type: 'info',
                            message: '取消保存'
                        });
                    });
                }
            }
            event.preventDefault();
            event.stopPropagation();
        })
    },
    mounted() {
        // 挂载时初始化编辑器
        this.instance = new Vditor('editor', {
            theme: this.theme,
            width: '100%',
            height: 'calc(100vh - 31px - 31px)',
            value: '',
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
                    that.ls(this.config.path, that.menus)
                }
            });
        },
        loadNode(node, resolve) {
            if (node.id === 0) {
                if (this.config.path != '') {
                    this.ls(this.config.path, function (menus) {
                        resolve(menus)
                    });
                }
            } else {
            }
            this.ls(node.data.path, function (menus) {
                resolve(menus)
            });
        },
        nodeClick(data) {
            if (data.type === 'file' && data.name.endsWith('md')) {
                // 文件，获取内容
                console.log('打开文件')
                this.file = data;
                this.readFile()
            }
        },
        ls(path, callback) {
            let that = this;
            $.post('/index.php?explorer/list/path', {
                path: path,
                page: 1,
                pageNum: 500,
                CSRF_TOKEN: getCookie('CSRF_TOKEN'),
                API_ROUTE: 'explorer/list/path'
            }, function (response) {
                if (!response.code) {
                    callback([]);
                    return;
                }
                console.log(response.data.current)
                that.config.path = response.data.current.path;
                that.config.name = response.data.current.name
                that.config.display = response.data.current.pathDisplay;
                let menus = [];
                for (let folder of response.data.folderList) {
                    // 文件夹渲染
                    menus.push({
                        label: folder.name,
                        name: folder.name,
                        path: folder.path,
                        display: folder.pathDisplay,
                        type: 'folder',
                        leaf: folder.hasFile === 0 && folder.hasFolder == 0
                    })
                }
                for (let folder of response.data.fileList) {
                    // 文件夹渲染
                    menus.push({
                        label: folder.name,
                        name: folder.name,
                        path: folder.path,
                        display: folder.pathDisplay,
                        type: 'file',
                        leaf: true
                    })
                }
                callback(menus);
            })
        },
        newFile() {
            // 新建文件
            let that = this;

            let path = '';
            let name = '';
            if (this.config.type === 'folder') {
                path = this.config.path
                name = this.config.name
            } else if (this.config.type === 'file') {
                path = this.defaultConfig.path;
                name = this.defaultConfig.name;
            } else {
                path = this.defaultConfig.path;
                name = this.defaultConfig.name;
            }
            console.log(path, name)

            this.$prompt(`在文件夹【${name}】下创建文件`, '请输入文件名称', {
                confirmButtonText: '确定',
                cancelButtonText: '取消'
            }).then(({ value }) => {
                console.log(that.config.path)
                $.post('/index.php?explorer/index/mkfile', {
                    path: `${that.config.path}/${value}.md`,
                    CSRF_TOKEN: getCookie('CSRF_TOKEN'),
                    API_ROUTE: 'explorer/index/mkfile'
                }, function (response) {
                    if (response.code) {
                        that.$message({
                            type: 'success',
                            message: '新建成功'
                        });
                        that.ls(that.defaultConfig.path, function (menus) {
                            that.menus = menus;
                            console.log(that.menus)
                        });
                    } else {
                        that.$message({
                            type: 'error',
                            message: response.info
                        });
                    }
                })
            }).catch(() => {
            });
        },
        newFolder() {
            // 新建文件夹
            let that = this;
            this.$prompt('文件夹名称', '请输入文件夹名称', {
                confirmButtonText: '确定',
                cancelButtonText: '取消'
            }).then(({ value }) => {
                $.post('/index.php?explorer/index/mkdir', {
                    path: `${that.config.path}/${value}`,
                    CSRF_TOKEN: getCookie('CSRF_TOKEN'),
                    API_ROUTE: 'explorer/index/mkdir'
                }, function (response) {
                    if (response.code) {
                        that.$message({
                            type: 'success',
                            message: '新增成功'
                        });
                        that.ls(that.defaultConfig.path, function (menus) {
                            that.menus = menus;
                            console.log(that.menus)
                        });
                    } else {
                        that.$message({
                            type: 'error',
                            message: response.info
                        });
                    }
                })
            }).catch(() => {
            });
        },
        readFile() {
            let that = this;
            $.post('/index.php?explorer/editor/fileGet', {
                path: that.file.path,
                CSRF_TOKEN: getCookie('CSRF_TOKEN'),
                API_ROUTE: 'explorer/editor/fileGet'
            }, function (response) {
                console.log(response)
                if (response.code) {
                    that.instance.setValue(response.data.content)
                }
            })
        },
        nodeContextMenu(event, data) {
            this.config.path = data.path;
            this.config.name = data.name;
            this.config.display = data.display;
            this.config.type = data.type;
            this.contextMenu = {
                display: true,
                left: event.clientX,
                top: event.clientY,
                type: data.type
            }
        },
        menuContextMenu(event) {
            this.config.path = this.defaultConfig.path;
            this.config.name = this.defaultConfig.name;
            this.config.display = this.defaultConfig.display;
            this.config.type = this.defaultConfig.type;
            this.contextMenu = {
                display: true,
                left: event.clientX,
                top: event.clientY,
                type: 'folder'
            }
            event.preventDefault();
            event.stopPropagation();
        },
        saveContent(content) {
            let that = this;
            // 有文件
            $.post('/index.php?explorer/editor/fileSave', {
                path: this.file.path,
                charset: 'utf-8',
                content: content,
                CSRF_TOKEN: getCookie('CSRF_TOKEN'),
                API_ROUTE: 'explorer/editor/fileSave'
            }, function (response) {
                if (response.code) {
                    that.$message({
                        type: 'success',
                        message: '文件保存成功'
                    });
                }
            })
        },
        rename() {
            console.log('重命名', this.config.name);
            this.$prompt('文件夹名称', '请输入新文件夹名称', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                inputValue: this.config.name
            }).then(({ value }) => {
                console.log(that.config.path, value)
                $.post('/index.php?explorer/index/pathRename', {
                    path: that.config.path,
                    newName: value,
                    CSRF_TOKEN: getCookie('CSRF_TOKEN'),
                    API_ROUTE: 'explorer/index/pathRename'
                }, function (response) {
                    console.log(response)
                    if (response.code) {
                        that.$message({
                            type: 'success',
                            message: '修改成功'
                        });
                        that.ls(that.defaultConfig.path, function (menus) {
                            that.menus = menus;
                            console.log(that.menus)
                        });
                    } else {
                        that.$message({
                            type: 'error',
                            message: response.info
                        });
                    }
                })
            }).catch(() => {
            });
        }
    }
});