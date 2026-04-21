global.$ = $;

const { remote } = require('electron');
const { Menu, BrowserWindow, MenuItem, shell } = remote;
const fs = require("fs");

$(document).ready(function () {
    var webview = document.getElementById('browserView');
    var currentWindow = remote.getCurrentWindow();
    
    // 加载设置
    loadSettings();
    
    webview.addEventListener('dom-ready', function () {
        webview.insertCSS('*::-webkit-scrollbar { width: 0 !important }');
        // 确保 webview 可以处理事件，特别是滚动
        webview.executeJavaScript(`
            window.addEventListener('scroll', function() {
                // 滚动事件处理
            });
            true;
        `);
    });
    
    // 监听设置项变化
    $('#saveLastPage').change(saveSettings);
    $('#alwaysOnTop').change(function() {
        saveSettings();
        currentWindow.setAlwaysOnTop($(this).is(':checked'));
    });
    
    // 页面加载完成时更新URL栏
    webview.addEventListener('did-finish-load', function() {
        $('#urlField').val(webview.getURL());
    });
    
    // 窗口关闭前保存当前URL
    window.addEventListener('beforeunload', function() {
        if ($('#saveLastPage').is(':checked')) {
            localStorage.setItem('zenview-last-url', webview.getURL());
        }
    });
    
    // 初始化时加载保存的URL
    if ($('#saveLastPage').is(':checked')) {
        var lastUrl = localStorage.getItem('zenview-last-url');
        if (lastUrl) {
            $('#urlField').val(lastUrl);
            webview.src = lastUrl;
        }
    }

    // Address bar form
    $("#addressBar").submit(function(e) {
        e.preventDefault();
        loadURL();
    });

    // Opacity Slider
    $("#transparencyRange").change(function(){
        var opacityValue = $(this).val();
        changeOpacity(opacityValue);
    });

    // Select all text when changing URL
    $("input[type='text']").click(function () {
       $(this).select();
    });
});

// Change window Opacity
function changeOpacity(opacity){
    $("#bgOverlay").css('background-color', 'rgba(0, 0, 30, ' + opacity + ')');
    $(".window-chrome").css('background-color', 'rgba(10, 15, 52, ' + opacity + ')');
    $(".app-controls").css('background-color', 'rgba(10, 15, 52, ' + opacity + ')');
}

// App Controls
function loadURL(){
    var url = $("#urlField").val();

    if(url.indexOf("http") >= 0){
        loadPage(url);
    }else{
        url = "http://" + url;
        loadPage(url);
    }
}

function loadPage(url){
    console.log("Loading " + url);
    if (url.toLowerCase().indexOf("youtube.com/watch") >= 0){
        var youtubeID = url.substring(url.indexOf("v=") + 2);
        youtubeID = youtubeID.split('&')[0];
        var youtubeURL = "https://www.youtube.com/embed/" + youtubeID;

        $("#urlField").val(youtubeURL);
        var webview = document.getElementById('browserView');
        webview.loadURL(youtubeURL);
    }else{
        var webview = document.getElementById('browserView');
        webview.loadURL(url);
    }
}

// Go back
function browserBack(){
    var webview = document.getElementById('browserView');
    webview.back(); // 修正调用错误
}

// 修改 enableClickThrough 函数，去掉窗口穿透逻辑
function enableClickThrough(){
    console.log("Clickthrough related UI adjustment enabled.")
    $("#browserView").addClass("full-size");
    $(".app-controls").slideUp(200, function(){
        $(".window-chrome").slideUp(200);
    });
}

// 修改窗口最小化事件处理逻辑，去掉窗口穿透关闭逻辑
remote.BrowserWindow.getFocusedWindow().on('minimize',function(event){
    $("body").css('opacity', 0.95);
    $("#transparencyRange").val(0.95);

    $("#browserView").removeClass("full-size");
    $(".window-chrome").slideDown(200, function(){
        $(".app-controls").slideDown(200);
    });
    console.log("Clickthrough related UI adjustment disabled");
});

// Window Controls
function openWebsite(){
    shell.openExternal("https://www.goofish.com/personal?spm=a21ybx.item.itemHeader.2.740847edODrgl2&userId=2219527179864");
}
function minimizeWindow(){
    var window = remote.getCurrentWindow();
    window.minimize();
}
var windowIsMaximized = false;
function maximizeWindow(){
    var window = remote.getCurrentWindow();
    const { width, height } = remote.screen.getPrimaryDisplay().workAreaSize;
    if(windowIsMaximized){
        windowIsMaximized = false;
        window.setSize(800, 600);
    }else{
        window.setSize(Math.ceil(width * .95), Math.ceil(height * .95));
        window.setPosition(Math.ceil(width * .025), Math.ceil(height * .025))
        windowIsMaximized = true;
    }
}
function closeWindow(){
    var window = remote.getCurrentWindow();
    window.hide(); // 隐藏而不是关闭窗口
}

// 切换设置面板显示/隐藏
function toggleSettings() {
    $('#settingsPanel').toggle();
}

// 保存设置
function saveSettings() {
    var settings = {
        saveLastPage: $('#saveLastPage').is(':checked'),
        alwaysOnTop: $('#alwaysOnTop').is(':checked')
    };
    localStorage.setItem('zenview-settings', JSON.stringify(settings));
}

// 加载设置
function loadSettings() {
    var savedSettings = localStorage.getItem('zenview-settings');
    if (savedSettings) {
        var settings = JSON.parse(savedSettings);
        $('#saveLastPage').prop('checked', settings.saveLastPage);
        $('#alwaysOnTop').prop('checked', settings.alwaysOnTop);
        var currentWindow = remote.getCurrentWindow();
        currentWindow.setAlwaysOnTop(settings.alwaysOnTop);
    } else {
        // 默认设置
        $('#alwaysOnTop').prop('checked', true);
    }
}