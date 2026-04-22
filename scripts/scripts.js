
global.$ = $;

const { remote, ipcRenderer } = require('electron');
const { Menu, BrowserWindow, MenuItem, shell } = remote;
const fs = require("fs");

let isBorderHidden = false;
let isAutoHideEnabled = false;
let isTomatoModeEnabled = false;
let isSettingsPanelOpen = false;

$(document).ready(function () {
    var webview = document.getElementById('browserView');
    var currentWindow = remote.getCurrentWindow();
    
    // Load settings first
    loadSettings();
    
    // 点击其他地方关闭设置面板
    $(document).click(function(e) {
        if (isSettingsPanelOpen) {
            var settingsPanel = $('#settingsPanel');
            var settingsButton = $('.settings');
            
            // 检查点击是否在设置面板或设置按钮外
            if (!settingsPanel.is(e.target) &amp;&amp; 
                settingsPanel.has(e.target).length === 0 &amp;&amp; 
                !settingsButton.is(e.target) &amp;&amp; 
                settingsButton.has(e.target).length === 0) {
                settingsPanel.hide();
                isSettingsPanelOpen = false;
            }
        }
    });
    
    // 阻止设置面板点击事件冒泡
    $('#settingsPanel').click(function(e) {
        e.stopPropagation();
    });
    
    // 设置按钮点击阻止冒泡
    $('.settings').click(function(e) {
        e.stopPropagation();
    });
    
    webview.addEventListener('dom-ready', function () {
        webview.insertCSS('*::-webkit-scrollbar { width: 0 !important }');
        webview.executeJavaScript(`
            let lastScrollTop = 0;
            function handleScroll() {
                let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                window.postMessage({ 
                    type: 'zenview-scroll', 
                    scrollTop: scrollTop, 
                    direction: scrollTop &gt; lastScrollTop ? 'down' : 'up' 
                }, '*');
                lastScrollTop = scrollTop &lt;= 0 ? 0 : scrollTop;
            }
            window.addEventListener('scroll', handleScroll);
            true;
        `);
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
    $('#saveLastPage').change(function() {
        console.log('saveLastPage changed');
        saveSettings();
    });
    
    $('#alwaysOnTop').change(function() {
        console.log('alwaysOnTop changed: ' + $(this).is(':checked'));
        saveSettings();
        currentWindow.setAlwaysOnTop($(this).is(':checked'));
    });
    
    $('#autoHide').change(function() {
        console.log('autoHide changed: ' + $(this).is(':checked'));
        isAutoHideEnabled = $(this).is(':checked');
        saveSettings();
    });
    
    $('#tomatoMode').change(function() {
        console.log('tomatoMode changed: ' + $(this).is(':checked'));
        isTomatoModeEnabled = $(this).is(':checked');
        saveSettings();
        updateTomatoMode();
    });
    
    // 鼠标移出自动隐藏
    let mouseLeaveTimer;
    let mouseInWindow = true;
    
    $(window).on('mouseleave', function(e) {
        if (isAutoHideEnabled &amp;&amp; currentWindow.isVisible()) {
            if (e.clientY &lt;= 0 || e.clientX &lt;= 0 || 
                e.clientX &gt;= window.innerWidth || 
                e.clientY &gt;= window.innerHeight) {
                mouseInWindow = false;
                mouseLeaveTimer = setTimeout(function() {
                    if (!mouseInWindow) {
                        currentWindow.hide();
                    }
                }, 500);
            }
        }
    });
    
    $(window).on('mouseenter', function() {
        mouseInWindow = true;
        if (mouseLeaveTimer) {
            clearTimeout(mouseLeaveTimer);
        }
    });
    
    webview.addEventListener('did-finish-load', function() {
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
    $("#addressBar").submit(function(e) {
        e.preventDefault();
        console.log("Address bar form submitted");
        loadURL();
        return false;
    });

    // 透明度滑块
    $("#transparencyRange").on('input change', function(){
        var opacityValue = parseFloat($(this).val());
        console.log('Transparency changed: ' + opacityValue);
        changeOpacity(opacityValue);
    });
    
    changeOpacity(parseFloat($("#transparencyRange").val()));

    $("input[type=text]").click(function () {
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
    const currentWindow = remote.getCurrentWindow();
    currentWindow.setOpacity(opacity);
}

function enableClickThrough() {
    console.log('enableClickThrough called, current isBorderHidden: ' + isBorderHidden);
    toggleBorder();
}

function toggleBorder() {
    const webview = $('#browserView');
    const windowChrome = $('.window-chrome');
    const appControls = $('.app-controls');
    
    isBorderHidden = !isBorderHidden;
    console.log('toggleBorder called, new isBorderHidden: ' + isBorderHidden);
    
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
    
    console.log("loadURL called: " + url);

    if (url.indexOf("http://") !== 0 &amp;&amp; url.indexOf("https://") !== 0) {
        url = "https://" + url;
        $("#urlField").val(url);
    }
    
    loadPage(url);
}

function loadPage(url) {
    console.log("loadPage called: " + url);
    var webview = document.getElementById('browserView');
    
    if (url.toLowerCase().indexOf("youtube.com/watch") &gt;= 0) {
        var youtubeID = url.substring(url.indexOf("v=") + 2);
        youtubeID = youtubeID.split('&amp;')[0];
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
    } else {
        settingsPanel.show();
        isSettingsPanelOpen = true;
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
    const windowChrome = $('.window-chrome');
    const appControls = $('.app-controls');
    
    const isNovelPage = currentUrl.includes('fanqienovel.com') || 
                       currentUrl.includes('qidian.com') || 
                       currentUrl.includes('read.tomato');
    
    console.log('updateTomatoMode: isTomatoModeEnabled=' + isTomatoModeEnabled + 
                ', isNovelPage=' + isNovelPage + 
                ', isBorderHidden=' + isBorderHidden);
    
    if (isTomatoModeEnabled &amp;&amp; isNovelPage) {
        windowChrome.hide();
        appControls.hide();
        $('#browserView').addClass('full-size');
    } else {
        if (!isBorderHidden) {
            windowChrome.show();
            appControls.show();
            $('#browserView').removeClass('full-size');
        }
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
    const currentWindow = remote.getCurrentWindow();
    currentWindow.minimize();
}

