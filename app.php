<?php

/**
 * 小雨笔记
 *
 * @author esion
 * @see 2022-11-06
 */
class RainNotePlugin extends PluginBase {

    function __construct(){
        parent::__construct();
    }

    public function regist(){
        $this->hookRegist(array(
            'user.commonJs.insert' 		=> 'RainNotePlugin.echoJs',
            'explorer.list.itemParse'	=> 'RainNotePlugin.itemParse',
        ));
    }

    public function echoJs(){
        $this->echoFile('static/app/main.js');
    }

    public function index(){
        include($this->pluginPath.'static/index.html');
    }

    public function itemParse($pathInfo){
        print $pathInfo;
        return $pathInfo;
    }

}