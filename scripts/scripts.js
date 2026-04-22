
// 确保全局$变量
if (typeof $ === 'undefined') {
    console.error('jQuery is not loaded');
}

// 引入必要的模块
const { remote, ipcRenderer } = require('electron');
const { BrowserWindow, shell } = remote;

// 全局变量
let isBorderHidden = false;
let isAutoHideEnabled = false;
let isTomatoModeEnabled = false;
let isSettingsPanelOpen = false;
let lastMiddleClickTime = 0;
const DOUBLE_CLICK_INTERVAL = 300;
let currentWindow = null;
let webview = null;

// DOM加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded - ZenView initializing...');
    
    // 初始化全局变量
    webview = document.getElementById('browserView');
    currentWindow = remote.getCurrentWindow();
    
    if (!webview) {
        console.error('Webview element not found');
    }
    if (!currentWindow) {
        console.error('Current window not found');
    }
    
    console.log('Webview:', webview);
    console.log('Current window:', currentWindow);
    
    // 加载设置
    loadSettings();
    
    // 点击任何地方关闭设置面板
    document.addEventListener('click', function(e) {
        console.log('Document clicked, isSettingsPanelOpen:', isSettingsPanelOpen);
        if (isSettingsPanelOpen) {
            const settingsPanel = document.getElementById('settingsPanel');
            if (settingsPanel) {
                settingsPanel.style.display = 'none';
                isSettingsPanelOpen = false;
                console.log('Settings panel closed');
            }
        }
    });
    
    // 点击设置按钮
    const settingsButton = document.querySelector('.settings');
    if (settingsButton) {
        settingsButton.addEventListener('click', function(e) {
            e.stopPropagation();
            console.log('Settings button clicked');
            toggleSettings();
        });
    } else {
        console.error('Settings button not found');
    }
    
    // 点击设置面板内容阻止冒泡
    const settingsPanel = document.getElementById('settingsPanel');
    if (settingsPanel) {
        settingsPanel.addEventListener('click', function(e) {
            e.stopPropagation();
            console.log('Settings panel clicked, preventing close');
        });
    } else {
        console.error('Settings panel not found');
    }
    
    // 双击鼠标中键显示/隐藏窗口
    document.addEventListener('mousedown', function(e) {
        if (e.button === 1) { // 中键
            const now = Date.now();
            if (now - lastMiddleClickTime < DOUBLE_CLICK_INTERVAL) {
                console.log('Double middle click detected');
                if (currentWindow) {
                    if (currentWindow.isVisible()) {
                        console.log('Hiding window');
                        currentWindow.hide();
                    } else {
                        console.log('Showing window');
                        currentWindow.show();
                        currentWindow.focus();
                    }
                }
                lastMiddleClickTime = 0;
            } else {
                lastMiddleClickTime = now;
            }
        }
    });
    
    // Webview事件
    if (webview) {
        webview.addEventListener('dom-ready', function() {
            console.log('Webview dom-ready');
            webview.insertCSS('*::-webkit-scrollbar { width: 0 !important }');
            updateTomatoMode();
        });
        
        webview.addEventListener('will-navigate', function(e) {
            console.log('Webview will navigate to:', e.url);
        });
        
        webview.addEventListener('did-navigate', function(e) {
            console.log('Webview did navigate to:', e.url);
            const urlField = document.getElementById('urlField');
            if (urlField) {
                urlField.value = e.url;
            }
            updateTomatoMode();
        });
        
        webview.addEventListener('did-navigate-in-page', function(e) {
            console.log('Webview did navigate in page to:', e.url);
            const urlField = document.getElementById('urlField');
            if (urlField) {
                urlField.value = e.url;
            }
        });
        
        webview.addEventListener('new-window', function(e) {
            console.log('Webview new window requested for:', e.url);
            if (webview) {
                webview.src = e.url;
            }
        });
        
        webview.addEventListener('did-finish-load', function() {
            console.log('Webview did-finish-load:', webview.getURL());
            const urlField = document.getElementById('urlField');
            if (urlField) {
                urlField.value = webview.getURL();
            }
            updateTomatoMode();
        });
    }
    
    // 地址栏表单
    const addressBar = document.getElementById('addressBar');
    if (addressBar) {
        addressBar.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Address bar form submitted');
            loadURL();
            return false;
        });
    }
    
    // 透明度滑块
    const transparencyRange = document.getElementById('transparencyRange');
    if (transparencyRange) {
        transparencyRange.addEventListener('input', function() {
            const opacityValue = parseFloat(this.value);
            console.log('Transparency input:', opacityValue);
            changeOpacity(opacityValue);
        });
        
        transparencyRange.addEventListener('change', function() {
            const opacityValue = parseFloat(this.value);
            console.log('Transparency changed:', opacityValue);
            changeOpacity(opacityValue);
        });
        
        // 初始化透明度
        setTimeout(function() {
            const initialOpacity = parseFloat(transparencyRange.value);
            console.log('Initializing transparency to:', initialOpacity);
            changeOpacity(initialOpacity);
        }, 100);
    }
    
    // URL输入框点击选择全部
    const urlField = document.getElementById('urlField');
    if (urlField) {
        urlField.addEventListener('click', function() {
            this.select();
        });
    }
    
    // 设置控件事件
    const saveLastPage = document.getElementById('saveLastPage');
    if (saveLastPage) {
        saveLastPage.addEventListener('change', function() {
            console.log('saveLastPage changed');
            saveSettings();
        });
    }
    
    const alwaysOnTop = document.getElementById('alwaysOnTop');
    if (alwaysOnTop) {
        alwaysOnTop.addEventListener('change', function() {
            console.log('alwaysOnTop changed:', this.checked);
            saveSettings();
            if (currentWindow) {
                currentWindow.setAlwaysOnTop(this.checked);
            }
        });
    }
    
    const autoHide = document.getElementById('autoHide');
    if (autoHide) {
        autoHide.addEventListener('change', function() {
            console.log('autoHide changed:', this.checked);
            isAutoHideEnabled = this.checked;
            saveSettings();
        });
    }
    
    const tomatoMode = document.getElementById('tomatoMode');
    if (tomatoMode) {
        tomatoMode.addEventListener('change', function() {
            console.log('tomatoMode changed:', this.checked);
            isTomatoModeEnabled = this.checked;
            saveSettings();
            updateTomatoMode();
        });
    }
    
    // 鼠标移出自动隐藏
    window.addEventListener('mouseleave', function(e) {
        console.log('Mouse leave window, isAutoHideEnabled:', isAutoHideEnabled);
        if (isAutoHideEnabled && currentWindow && currentWindow.isVisible()) {
            console.log('Hiding window due to mouse leave');
            currentWindow.hide();
        }
    });
    
    // 页面关闭前保存设置
    window.addEventListener('beforeunload', function() {
        const saveLastPage = document.getElementById('saveLastPage');
        if (saveLastPage && saveLastPage.checked && webview) {
            localStorage.setItem('zenview-last-url', webview.getURL());
        }
    });
    
    // 加载上次保存的URL
    const saveLastPage = document.getElementById('saveLastPage');
    if (saveLastPage && saveLastPage.checked) {
        const lastUrl = localStorage.getItem('zenview-last-url');
        if (lastUrl && webview) {
            const urlField = document.getElementById('urlField');
            if (urlField) {
                urlField.value = lastUrl;
            }
            webview.src = lastUrl;
        }
    }
});

// 处理滚动事件
function handleWebviewScroll(data) {
    const toolbar = document.querySelector('.app-controls');
    const titleBar = document.querySelector('.window-chrome');
    
    if (toolbar && titleBar) {
        if (data.direction === 'down') {
            toolbar.style.transform = 'translateY(-100%)';
            titleBar.style.transform = 'translateY(-100%)';
        } else {
            toolbar.style.transform = 'translateY(0)';
            titleBar.style.transform = 'translateY(0)';
        }
    }
}

// 改变窗口透明度
function changeOpacity(opacity) {
    console.log('changeOpacity called with:', opacity);
    
    try {
        if (currentWindow) {
            console.log('Using currentWindow:', currentWindow);
            currentWindow.setOpacity(opacity);
            console.log('Window opacity set successfully');
        } else {
            console.error('currentWindow is null');
            // 尝试获取当前窗口
            const win = remote.getCurrentWindow();
            if (win) {
                console.log('Using remote.getCurrentWindow():', win);
                win.setOpacity(opacity);
                console.log('Remote window opacity set successfully');
            } else {
                console.error('Could not get current window');
            }
        }
    } catch (error) {
        console.error('Error setting opacity:', error);
        // 尝试备用方法
        try {
            const allWindows = BrowserWindow.getAllWindows();
            if (allWindows.length > 0) {
                const mainWin = allWindows[0];
                console.log('Using first window from getAllWindows:', mainWin);
                mainWin.setOpacity(opacity);
                console.log('Alternative method succeeded');
            }
        } catch (e) {
            console.error('Alternative method failed:', e);
        }
    }
}

// 切换边框
function enableClickThrough() {
    console.log('enableClickThrough called, current isBorderHidden:', isBorderHidden);
    toggleBorder();
}

function toggleBorder() {
    const webview = document.getElementById('browserView');
    const windowChrome = document.querySelector('.window-chrome');
    const appControls = document.querySelector('.app-controls');
    
    if (webview && windowChrome && appControls) {
        isBorderHidden = !isBorderHidden;
        console.log('toggleBorder called, new isBorderHidden:', isBorderHidden);
        
        if (isBorderHidden) {
            webview.classList.add('full-size');
            windowChrome.style.display = 'none';
            appControls.style.display = 'none';
        } else {
            webview.classList.remove('full-size');
            windowChrome.style.display = 'block';
            appControls.style.display = 'block';
            windowChrome.style.transform = 'translateY(0)';
            appControls.style.transform = 'translateY(0)';
        }
        
        localStorage.setItem('zenview-border-hidden', isBorderHidden);
    } else {
        console.error('Elements not found for toggleBorder');
    }
}

// 加载URL
function loadURL() {
    const urlField = document.getElementById('urlField');
    if (!urlField) {
        console.error('URL field not found');
        return;
    }
    
    let url = urlField.value.trim();
    console.log('loadURL called:', url);
    
    if (!url) return;
    
    if (url.indexOf('http://') !== 0 && url.indexOf('https://') !== 0) {
        url = 'https://' + url;
        urlField.value = url;
    }
    
    loadPage(url);
}

// 加载页面
function loadPage(url) {
    console.log('loadPage called:', url);
    const webview = document.getElementById('browserView');
    if (!webview) {
        console.error('Webview not found');
        return;
    }
    
    if (url.toLowerCase().indexOf('youtube.com/watch') >= 0) {
        const youtubeID = url.substring(url.indexOf('v=') + 2).split('&')[0];
        const youtubeURL = 'https://www.youtube.com/embed/' + youtubeID;
        const urlField = document.getElementById('urlField');
        if (urlField) {
            urlField.value = youtubeURL;
        }
        webview.src = youtubeURL;
    } else {
        webview.src = url;
    }
}

// 后退
function browserBack() {
    const webview = document.getElementById('browserView');
    if (webview) {
        webview.goBack();
    }
}

// 切换设置面板
function toggleSettings() {
    const settingsPanel = document.getElementById('settingsPanel');
    if (!settingsPanel) {
        console.error('Settings panel not found');
        return;
    }
    
    console.log('toggleSettings called, current display:', settingsPanel.style.display);
    
    if (settingsPanel.style.display === 'block') {
        settingsPanel.style.display = 'none';
        isSettingsPanelOpen = false;
        console.log('Settings panel hidden');
    } else {
        settingsPanel.style.display = 'block';
        isSettingsPanelOpen = true;
        console.log('Settings panel shown');
    }
}

// 加载设置
function loadSettings() {
    console.log('Loading settings...');
    
    const saveLastPage = document.getElementById('saveLastPage');
    const alwaysOnTop = document.getElementById('alwaysOnTop');
    const autoHide = document.getElementById('autoHide');
    const tomatoMode = document.getElementById('tomatoMode');
    
    const savedSaveLastPage = localStorage.getItem('zenview-save-last-page') === 'true';
    const savedAlwaysOnTop = localStorage.getItem('zenview-always-on-top') !== 'false';
    isAutoHideEnabled = localStorage.getItem('zenview-auto-hide') === 'true';
    isTomatoModeEnabled = localStorage.getItem('zenview-tomato-mode') === 'true';
    isBorderHidden = localStorage.getItem('zenview-border-hidden') === 'true';
    
    if (saveLastPage) saveLastPage.checked = savedSaveLastPage;
    if (alwaysOnTop) alwaysOnTop.checked = savedAlwaysOnTop;
    if (autoHide) autoHide.checked = isAutoHideEnabled;
    if (tomatoMode) tomatoMode.checked = isTomatoModeEnabled;
    
    if (currentWindow) {
        currentWindow.setAlwaysOnTop(savedAlwaysOnTop);
    }
    
    // 应用边框状态
    if (isBorderHidden) {
        const webview = document.getElementById('browserView');
        const windowChrome = document.querySelector('.window-chrome');
        const appControls = document.querySelector('.app-controls');
        if (webview && windowChrome && appControls) {
            webview.classList.add('full-size');
            windowChrome.style.display = 'none';
            appControls.style.display = 'none';
        }
    }
    
    updateTomatoMode();
    console.log('Settings loaded');
}

// 保存设置
function saveSettings() {
    console.log('Saving settings...');
    
    const saveLastPage = document.getElementById('saveLastPage');
    const alwaysOnTop = document.getElementById('alwaysOnTop');
    const autoHide = document.getElementById('autoHide');
    const tomatoMode = document.getElementById('tomatoMode');
    
    if (saveLastPage) localStorage.setItem('zenview-save-last-page', saveLastPage.checked);
    if (alwaysOnTop) localStorage.setItem('zenview-always-on-top', alwaysOnTop.checked);
    if (autoHide) localStorage.setItem('zenview-auto-hide', autoHide.checked);
    if (tomatoMode) localStorage.setItem('zenview-tomato-mode', tomatoMode.checked);
    
    console.log('Settings saved');
}

// 打开网站
function openWebsite() {
    shell.openExternal('https://github.com');
}

// 更新番茄模式
function updateTomatoMode() {
    const webview = document.getElementById('browserView');
    if (!webview) {
        console.error('Webview not found for updateTomatoMode');
        return;
    }
    
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
        webview.insertCSS(`
            .reader-toolbar, .reader-toolbar-item, .fade-toolbar-exit-done,
            .muye-reader-nav, .top-nav-enter-done, .muye-reader-nav-inner, .muye-reader-nav-title,
            .reader-toolbar-swiper-item, .font-slider-popover, .use-reader-theme, .slogin-user-avatar {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
                position: absolute !important;
                top: -9999px !important;
                left: -9999px !important;
            }
            body {
                margin: 0 !important;
                padding: 0 !important;
            }
            .reader-content, .chapter-content, .content {
                margin: 0 !important;
                padding: 15px !important;
                max-width: 100% !important;
            }
        `);
        console.log('Tomato mode CSS injected');
    }
}

// 窗口控制
function closeWindow() {
    if (currentWindow) {
        currentWindow.close();
    }
}

function maximizeWindow() {
    if (currentWindow) {
        if (currentWindow.isMaximized()) {
            currentWindow.unmaximize();
        } else {
            currentWindow.maximize();
        }
    }
}

function minimizeWindow() {
    console.log('Minimize button clicked, hiding window instead');
    if (currentWindow) {
        currentWindow.hide();
    }
}

