kodReady.push(function(){

    // 可道云加载前
    Events.bind('explorer.kodApp.before',function(appList){
        appList.push({
            name:'{{package.id}}',
            title:'{{package.name}}',
            ext:"{{config.fileExt}}",
            sort:"{{config.fileSort}}",
            icon:'{{pluginHost}}static/image/icon.png',
            callback:function(){
                core.openFile('{{pluginApi}}',"{{config.openWith}}",_.toArray(arguments));
            }
        });
        kodApp.appSupportSet('aceEditor','md');
    });

    // 轻应用加载
    Events.bind('explorer.lightApp.load',function(listData){
        listData['{{package.id}}'] = {
            name:"{{package.name}}",
            desc:"{{package.description}}",
            category:"{{package.category}}",
            appUrl:'{{pluginApi}}',
            openWith:"{{config.openWith}}",
            icon:'{{pluginHost}}static/image/icon.png'
        }
    });


    // 增加路由
    Router.mapIframe({page:'{{package.id}}',title:'{{package.name}}',url:'{{pluginApi}}',ignoreLogin:1});

    // 添加到左侧菜单栏
    Events.bind('main.menu.loadBefore',function(listData){
        listData['{{package.id}}'] = {
            name:"{{package.menu}}",
            url:'{{pluginApi}}',
            target:'{{config.openWith}}',
            subMenu:'{{config.menuSubMenu}}',
            menuAdd:'{{config.menuAdd}}',
            icon:'{{pluginHost}}static/image/icon.png'
            // icon:'ri-organization-chart bg-yellow-6'
        }
    });

});
