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
    $("#bgOverlay").css('background-color', 'rgba(255, 255, 255, ' + opacity + ')');
    $("#browserView").css('opacity', 1);
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
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
    $("#bgOverlay").hide();
    $("#browserView").css('opacity', 1);
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 255, 1)');
    $("#browserView").css('background-color', 'rgba(255, 255, 2