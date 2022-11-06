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


    // 在右键新建中增加新建类型
    Events.bind('rightMenu.newFileAdd',function(menuList){
        menuList.push({type:'md',name:'{{package.name}}',createOpen:1,appName:'{{package.id}}'});
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

    Events.bind('aceEditor.fileOpenModeInit',function(modeList){
        let xml = 'md'
        modeList.xml = modeList.xml ? modeList.xml + ','+xml:xml;
        modeList.json = modeList.json ? modeList.json + ',pos':'pos';
    });

    // 增加样式
    $.addStyle("\
	.x-item-icon.x-pos{background-image:url('{{staticPath}}image/file_icon/icon_app/on.png');}\
	.x-item-icon.x-xmind{background-image:url('{{pluginHost}}static/image/xmind.png');}\
	.x-item-icon.x-graphml{background-image:url('{{pluginHost}}static/image/graphml.png');}\
	.x-item-icon.x-drawio{background-image:url('{{pluginHost}}static/image/icon.png');}\
	");
});
