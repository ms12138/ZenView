
global.$ = $;

const { remote, ipcRenderer } = require('electron');
const { Menu, BrowserWindow, MenuItem, shell } = remote;
const fs = require("fs");

let isBorderHidden = false;
let isAutoHideEnabled = false;
let isTomatoModeEnabled = false;
let isSettingsPanelOpen = false;
let lastMiddleClickTime = 0;
const DOUBLE_CLICK_INTERVAL = 300;

$(document).ready(function () {
    var webview = document.getElementById('browserView');
    var currentWindow = remote.getCurrentWindow();
    
    // Load settings first
    loadSettings();
    
    // 点击任何地方都关闭设置面板
    $(document).on('click', function(e) {
        console.log('Document clicked, isSettingsPanelOpen:', isSettingsPanelOpen);
        if (isSettingsPanelOpen) {
            $('#settingsPanel').hide();
            isSettingsPanelOpen = false;
            console.log('Settings panel closed');
        }
    });
    
    // 点击设置按钮时阻止事件冒泡
    $('.settings').on('click', function(e) {
        e.stopPropagation();
        console.log('Settings button clicked');
        toggleSettings();
    });
    
    // 点击设置面板内容时阻止事件冒泡
    $('#settingsPanel').on('click', function(e) {
        e.stopPropagation();
        console.log('Settings panel clicked, preventing close');
    });
    
    // 双击鼠标中键隐藏窗口
    $(document).on('mousedown', function(e) {
        if (e.button === 1) { // 中键
            const now = Date.now();
            if (now - lastMiddleClickTime < DOUBLE_CLICK_INTERVAL) {
                console.log('Double middle click detected, hiding window');
                currentWindow.hide();
                lastMiddleClickTime = 0;
            } else {
                lastMiddleClickTime = now;
            }
        }
    });
    
    webview.addEventListener('dom-ready', function () {
        console.log('Webview dom-ready');
        webview.insertCSS('*::-webkit-scrollbar { width: 0 !important }');
        
        // 检查番茄模式
        updateTomatoMode();
    });
    
    // 监听webview所有导航相关事件
    webview.addEventListener('will-navigate', function(e) {
        console.log('Webview will navigate to:', e.url);
    });
    
    webview.addEventListener('did-navigate', function(e) {
        console.log('Webview did navigate to:', e.url);
        $('#urlField').val(e.url);
        updateTomatoMode();
    });
    
    webview.addEventListener('did-navigate-in-page', function(e) {
        console.log('Webview did navigate in page to:', e.url);
        $('#urlField').val(e.url);
    });
    
    webview.addEventListener('new-window', function(e) {
        console.log('Webview new window requested for:', e.url);
        // 在当前webview打开新窗口
        webview.src = e.url;
    });
    
    window.addEventListener('message', function(event) {
        if (event.data.type === 'zenview-scroll') {
            handleWebviewScroll(event.data);
        }
    });
    
    // 接收主进程显示窗口的消息
    ipcRenderer.on('restore-border', function() {
        console.log('Received restore-border message');
        // 强制显示边框和控件
        isBorderHidden = false;
        const webview = $('#browserView');
        const windowChrome = $('.window-chrome');
        const appControls = $('.app-controls');
        
        webview.removeClass('full-size');
        windowChrome.show();
        appControls.show();
        // 重置transform以确保显示
        windowChrome.css('transform', 'translateY(0)');
        appControls.css('transform', 'translateY(0)');
        localStorage.setItem('zenview-border-hidden', 'false');
        
        // 确保番茄模式不会干扰显示
        updateTomatoMode();
    });
    
    // 设置控件事件监听器
    $('#saveLastPage').on('change', function() {
        console.log('saveLastPage changed');
        saveSettings();
    });
    
    $('#alwaysOnTop').on('change', function() {
        console.log('alwaysOnTop changed: ' + $(this).is(':checked'));
        saveSettings();
        currentWindow.setAlwaysOnTop($(this).is(':checked'));
    });
    
    $('#autoHide').on('change', function() {
        console.log('autoHide changed: ' + $(this).is(':checked'));
        isAutoHideEnabled = $(this).is(':checked');
        saveSettings();
    });
    
    $('#tomatoMode').on('change', function() {
        console.log('tomatoMode changed: ' + $(this).is(':checked'));
        isTomatoModeEnabled = $(this).is(':checked');
        saveSettings();
        updateTomatoMode();
    });
    
    // 鼠标移出自动隐藏 - 简化逻辑
    $(window).on('mouseleave', function(e) {
        console.log('Mouse leave window, isAutoHideEnabled:', isAutoHideEnabled);
        if (isAutoHideEnabled && currentWindow.isVisible()) {
            // 直接隐藏，不做太多判定
            console.log('Hiding window due to mouse leave');
            currentWindow.hide();
        }
    });
    
    webview.addEventListener('did-finish-load', function() {
        console.log('Webview did-finish-load:', webview.getURL());
        $('#urlField').val(webview.getURL());
        updateTomatoMode();
    });
    
    window.addEventListener('beforeunload', function() {
        if ($('#saveLastPage').is(':checked')) {
            localStorage.setItem('zenview-last-url', webview.getURL());
        }
    });
    
    if ($('#saveLastPage').is(':checked')) {
        var lastUrl = localStorage.getItem('zenview-last-url');
        if (lastUrl) {
            $('#urlField').val(lastUrl);
            webview.src = lastUrl;
        }
    }

    // 地址栏表单提交处理
    $("#addressBar").on('submit', function(e) {
        e.preventDefault();
        console.log("Address bar form submitted");
        loadURL();
        return false;
    });

    // 透明度滑块 - 简化逻辑
    $("#transparencyRange").on('input', function(){
        var opacityValue = parseFloat($(this).val());
        console.log('Transparency input:', opacityValue);
        changeOpacity(opacityValue);
    });
    
    $("#transparencyRange").on('change', function(){
        var opacityValue = parseFloat($(this).val());
        console.log('Transparency changed:', opacityValue);
        changeOpacity(opacityValue);
    });
    
    // 初始化透明度
    setTimeout(function() {
        changeOpacity(parseFloat($("#transparencyRange").val()));
    }, 100);

    $("input[type=text]").on('click', function () {
       $(this).select();
    });
});

function handleWebviewScroll(data) {
    const toolbar = $('.app-controls');
    const titleBar = $('.window-chrome');
    
    if (data.direction === 'down') {
        toolbar.css('transform', 'translateY(-100%)');
        titleBar.css('transform', 'translateY(-100%)');
    } else {
        toolbar.css('transform', 'translateY(0)');
        titleBar.css('transform', 'translateY(0)');
    }
}

function changeOpacity(opacity) {
    try {
        const currentWindow = remote.getCurrentWindow();
        currentWindow.setOpacity(opacity);
        console.log('Window opacity set successfully to:', opacity);
    } catch (error) {
        console.error('Error setting opacity:', error);
    }
}

function enableClickThrough() {
    console.log('enableClickThrough called, current isBorderHidden:', isBorderHidden);
    toggleBorder();
}

function toggleBorder() {
    const webview = $('#browserView');
    const windowChrome = $('.window-chrome');
    const appControls = $('.app-controls');
    
    isBorderHidden = !isBorderHidden;
    console.log('toggleBorder called, new isBorderHidden:', isBorderHidden);
    
    if (isBorderHidden) {
        webview.addClass('full-size');
        windowChrome.hide();
        appControls.hide();
    } else {
        webview.removeClass('full-size');
        windowChrome.show();
        appControls.show();
        // 确保transform是0
        windowChrome.css('transform', 'translateY(0)');
        appControls.css('transform', 'translateY(0)');
    }
    
    localStorage.setItem('zenview-border-hidden', isBorderHidden);
}

function loadURL() {
    var url = $("#urlField").val().trim();
    
    if (!url) return;
    
    console.log("loadURL called:", url);

    if (url.indexOf("http://") !== 0 && url.indexOf("https://") !== 0) {
        url = "https://" + url;
        $("#urlField").val(url);
    }
    
    loadPage(url);
}

function loadPage(url) {
    console.log("loadPage called:", url);
    var webview = document.getElementById('browserView');
    
    if (url.toLowerCase().indexOf("youtube.com/watch") >= 0) {
        var youtubeID = url.substring(url.indexOf("v=") + 2);
        youtubeID = youtubeID.split('&')[0];
        var youtubeURL = "https://www.youtube.com/embed/" + youtubeID;

        $("#urlField").val(youtubeURL);
        webview.src = youtubeURL;
    } else {
        webview.src = url;
    }
}

function browserBack() {
    var webview = document.getElementById('browserView');
    webview.goBack();
}

function toggleSettings() {
    var settingsPanel = $('#settingsPanel');
    if (settingsPanel.is(':visible')) {
        settingsPanel.hide();
        isSettingsPanelOpen = false;
        console.log('Settings panel hidden');
    } else {
        settingsPanel.show();
        isSettingsPanelOpen = true;
        console.log('Settings panel shown');
    }
}

function loadSettings() {
    const saveLastPage = localStorage.getItem('zenview-save-last-page') === 'true';
    const alwaysOnTop = localStorage.getItem('zenview-always-on-top') !== 'false';
    isAutoHideEnabled = localStorage.getItem('zenview-auto-hide') === 'true';
    isTomatoModeEnabled = localStorage.getItem('zenview-tomato-mode') === 'true';
    isBorderHidden = localStorage.getItem('zenview-border-hidden') === 'true';
    
    $('#saveLastPage').prop('checked', saveLastPage);
    $('#alwaysOnTop').prop('checked', alwaysOnTop);
    $('#autoHide').prop('checked', isAutoHideEnabled);
    $('#tomatoMode').prop('checked', isTomatoModeEnabled);
    
    const currentWindow = remote.getCurrentWindow();
    currentWindow.setAlwaysOnTop(alwaysOnTop);
    
    // 应用边框状态
    if (isBorderHidden) {
        const webview = $('#browserView');
        const windowChrome = $('.window-chrome');
        const appControls = $('.app-controls');
        webview.addClass('full-size');
        windowChrome.hide();
        appControls.hide();
    }
    
    updateTomatoMode();
}

function saveSettings() {
    localStorage.setItem('zenview-save-last-page', $('#saveLastPage').is(':checked'));
    localStorage.setItem('zenview-always-on-top', $('#alwaysOnTop').is(':checked'));
    localStorage.setItem('zenview-auto-hide', $('#autoHide').is(':checked'));
    localStorage.setItem('zenview-tomato-mode', $('#tomatoMode').is(':checked'));
    console.log('Settings saved');
}

function openWebsite() {
    shell.openExternal('https://github.com');
}

function updateTomatoMode() {
    const webview = document.getElementById('browserView');
    let currentUrl = '';
    try {
        currentUrl = webview.getURL();
    } catch(e) {
        currentUrl = '';
    }
    
    const isNovelPage = currentUrl.includes('fanqienovel.com') || 
                       currentUrl.includes('qidian.com') || 
                       currentUrl.includes('read.tomato');
    
    console.log('updateTomatoMode: isTomatoModeEnabled=' + isTomatoModeEnabled + 
                ', isNovelPage=' + isNovelPage + 
                ', isBorderHidden=' + isBorderHidden);
    
    if (isTomatoModeEnabled && isNovelPage) {
        // 注入CSS来隐藏网页中的工具箱和标题栏元素
        webview.insertCSS(`
            /* 隐藏工具箱元素 */
            .reader-toolbar,
            .reader-toolbar-item,
            .fade-toolbar-exit-done,
            
            /* 隐藏标题栏元素 */
            .muye-reader-nav,
            .top-nav-enter-done,
            .muye-reader-nav-inner,
            .muye-reader-nav-title,
            
            /* 隐藏其他可能的工具栏 */
            .reader-toolbar-swiper-item,
            .font-slider-popover,
            .use-reader-theme,
            .slogin-user-avatar {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
                position: absolute !important;
                top: -9999px !important;
                left: -9999px !important;
            }
            
            /* 确保内容区域充满屏幕 */
            body {
                margin: 0 !important;
                padding: 0 !important;
            }
            
            /* 可能的内容区域 */
            .reader-content,
            .chapter-content,
            .content {
                margin: 0 !important;
                padding: 15px !important;
                max-width: 100% !important;
            }
        `);
        console.log('Tomato mode CSS injected');
    } else {
        console.log('Tomato mode disabled or not on novel page');
    }
}

function closeWindow() {
    const currentWindow = remote.getCurrentWindow();
    currentWindow.close();
}

function maximizeWindow() {
    const currentWindow = remote.getCurrentWindow();
    if (currentWindow.isMaximized()) {
        currentWindow.unmaximize();
    } else {
        currentWindow.maximize();
    }
}

function minimizeWindow() {
    console.log('Minimize button clicked, hiding window instead');
    const currentWindow = remote.getCurrentWindow();
    currentWindow.hide();
}

