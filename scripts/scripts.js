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
    console.log('ZenView 初始化...');
    
    // 初始化全局变量
    webview = document.getElementById('browserView');
    currentWindow = remote.getCurrentWindow();
    
    if (!webview) {
        console.error('Webview 元素未找到');
    }
    if (!currentWindow) {
        console.error('当前窗口未找到');
    }
    
    console.log('Webview:', webview);
    console.log('当前窗口:', currentWindow);
    
    // 加载设置
    loadSettings();
    
    // 点击任何地方关闭设置面板
    document.addEventListener('click', function(e) {
        console.log('文档被点击，设置面板是否打开:', isSettingsPanelOpen);
        if (isSettingsPanelOpen) {
            const settingsPanel = document.getElementById('settingsPanel');
            if (settingsPanel) {
                settingsPanel.style.display = 'none';
                isSettingsPanelOpen = false;
                console.log('设置面板已关闭');
            }
        }
    });
    
    // 点击设置按钮
    const settingsButton = document.querySelector('.settings');
    if (settingsButton) {
        settingsButton.addEventListener('click', function(e) {
            e.stopPropagation();
            console.log('设置按钮被点击');
            toggleSettings();
        });
    } else {
        console.error('设置按钮未找到');
    }
    
    // 点击设置面板内容阻止冒泡
    const settingsPanel = document.getElementById('settingsPanel');
    if (settingsPanel) {
        settingsPanel.addEventListener('click', function(e) {
            e.stopPropagation();
            console.log('设置面板被点击，阻止关闭');
        });
    } else {
        console.error('设置面板未找到');
    }
    
    // 双击鼠标中键显示/隐藏窗口
    document.addEventListener('mousedown', function(e) {
        if (e.button === 1) { // 中键
            const now = Date.now();
            if (now - lastMiddleClickTime < DOUBLE_CLICK_INTERVAL) {
                console.log('检测到双击中键');
                if (currentWindow) {
                    if (currentWindow.isVisible()) {
                        console.log('隐藏窗口');
                        currentWindow.hide();
                    } else {
                        console.log('显示窗口');
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
            console.log('Webview 将要导航到:', e.url);
        });
        
        webview.addEventListener('did-navigate', function(e) {
            console.log('Webview 已导航到:', e.url);
            const urlField = document.getElementById('urlField');
            if (urlField) {
                urlField.value = e.url;
            }
            updateTomatoMode();
        });
        
        webview.addEventListener('did-navigate-in-page', function(e) {
            console.log('Webview 页面内导航到:', e.url);
            const urlField = document.getElementById('urlField');
            if (urlField) {
                urlField.value = e.url;
            }
        });
        
        webview.addEventListener('new-window', function(e) {
            e.preventDefault();
            console.log('Webview 请求打开新窗口:', e.url);
            if (webview) {
                webview.src = e.url;
            }
        });
        
        webview.addEventListener('did-finish-load', function() {
            console.log('Webview 加载完成:', webview.getURL());
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
            console.log('地址栏表单已提交');
            loadURL();
            return false;
        });
    }
    
    // 透明度滑块
    const transparencyRange = document.getElementById('transparencyRange');
    if (transparencyRange) {
        transparencyRange.addEventListener('input', function() {
            const opacityValue = parseFloat(this.value);
            console.log('透明度输入:', opacityValue);
            changeOpacity(opacityValue);
        });
        
        transparencyRange.addEventListener('change', function() {
            const opacityValue = parseFloat(this.value);
            console.log('透明度已更改:', opacityValue);
            changeOpacity(opacityValue);
        });
        
        // 初始化透明度
        setTimeout(function() {
            const initialOpacity = parseFloat(transparencyRange.value);
            console.log('初始化透明度为:', initialOpacity);
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
            console.log('saveLastPage 已更改');
            saveSettings();
        });
    }
    
    const alwaysOnTop = document.getElementById('alwaysOnTop');
    if (alwaysOnTop) {
        alwaysOnTop.addEventListener('change', function() {
            console.log('alwaysOnTop 已更改:', this.checked);
            saveSettings();
            if (currentWindow) {
                currentWindow.setAlwaysOnTop(this.checked);
            }
        });
    }
    
    const autoHide = document.getElementById('autoHide');
    if (autoHide) {
        autoHide.addEventListener('change', function() {
            console.log('autoHide 已更改:', this.checked);
            isAutoHideEnabled = this.checked;
            saveSettings();
        });
    }
    
    const tomatoMode = document.getElementById('tomatoMode');
    if (tomatoMode) {
        tomatoMode.addEventListener('change', function() {
            console.log('tomatoMode 已更改:', this.checked);
            isTomatoModeEnabled = this.checked;
            saveSettings();
            updateTomatoMode();
        });
    }
    
    // 鼠标移出自动隐藏
    window.addEventListener('mouseleave', function(e) {
        console.log('鼠标移出窗口，isAutoHideEnabled:', isAutoHideEnabled);
        if (isAutoHideEnabled && currentWindow && currentWindow.isVisible()) {
            console.log('由于鼠标移出隐藏窗口');
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
    console.log('changeOpacity 被调用，参数:', opacity);
    
    try {
        if (currentWindow) {
            console.log('使用 currentWindow:', currentWindow);
            currentWindow.setOpacity(opacity);
            console.log('窗口透明度设置成功');
        } else {
            console.error('currentWindow 为 null');
            // 尝试获取当前窗口
            const win = remote.getCurrentWindow();
            if (win) {
                console.log('使用 remote.getCurrentWindow():', win);
                win.setOpacity(opacity);
                console.log('远程窗口透明度设置成功');
            } else {
                console.error('无法获取当前窗口');
            }
        }
    } catch (error) {
        console.error('设置透明度时出错:', error);
        // 尝试备用方法
        try {
            const allWindows = BrowserWindow.getAllWindows();
            if (allWindows.length > 0) {
                const mainWin = allWindows[0];
                console.log('使用 getAllWindows 中的第一个窗口:', mainWin);
                mainWin.setOpacity(opacity);
                console.log('备用方法成功');
            }
        } catch (e) {
            console.error('备用方法失败:', e);
        }
    }
}

// 切换边框
function enableClickThrough() {
    console.log('enableClickThrough 被调用，当前 isBorderHidden:', isBorderHidden);
    toggleBorder();
}

function toggleBorder() {
    const webview = document.getElementById('browserView');
    const windowChrome = document.querySelector('.window-chrome');
    const appControls = document.querySelector('.app-controls');
    
    if (webview && windowChrome && appControls) {
        isBorderHidden = !isBorderHidden;
        console.log('toggleBorder 被调用，新的 isBorderHidden:', isBorderHidden);
        
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
        console.error('toggleBorder 未找到所需元素');
    }
}

// 加载URL
function loadURL() {
    const urlField = document.getElementById('urlField');
    if (!urlField) {
        console.error('URL 字段未找到');
        return;
    }
    
    let url = urlField.value.trim();
    console.log('loadURL 被调用:', url);
    
    if (!url) return;
    
    if (url.indexOf('http://') !== 0 && url.indexOf('https://') !== 0) {
        url = 'https://' + url;
        urlField.value = url;
    }
    
    loadPage(url);
}

// 加载页面
function loadPage(url) {
    console.log('loadPage 被调用:', url);
    const webview = document.getElementById('browserView');
    if (!webview) {
        console.error('Webview 未找到');
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
        console.error('设置面板未找到');
        return;
    }
    
    console.log('toggleSettings 被调用，当前 display:', settingsPanel.style.display);
    
    if (settingsPanel.style.display === 'block') {
        settingsPanel.style.display = 'none';
        isSettingsPanelOpen = false;
        console.log('设置面板已隐藏');
    } else {
        settingsPanel.style.display = 'block';
        isSettingsPanelOpen = true;
        console.log('设置面板已显示');
    }
}

// 加载设置
function loadSettings() {
    console.log('加载设置...');
    
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
    console.log('设置加载完成');
}

// 保存设置
function saveSettings() {
    console.log('保存设置...');
    
    const saveLastPage = document.getElementById('saveLastPage');
    const alwaysOnTop = document.getElementById('alwaysOnTop');
    const autoHide = document.getElementById('autoHide');
    const tomatoMode = document.getElementById('tomatoMode');
    
    if (saveLastPage) localStorage.setItem('zenview-save-last-page', saveLastPage.checked);
    if (alwaysOnTop) localStorage.setItem('zenview-always-on-top', alwaysOnTop.checked);
    if (autoHide) localStorage.setItem('zenview-auto-hide', autoHide.checked);
    if (tomatoMode) localStorage.setItem('zenview-tomato-mode', tomatoMode.checked);
    
    console.log('设置保存完成');
}

// 打开网站
function openWebsite() {
    shell.openExternal('https://github.com');
}

// 更新番茄模式
function updateTomatoMode() {
    const webview = document.getElementById('browserView');
    if (!webview) {
        console.error('updateTomatoMode 未找到 Webview');
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
        console.log('番茄模式 CSS 已注入');
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
    console.log('最小化按钮被点击，改为隐藏窗口');
    if (currentWindow) {
        currentWindow.hide();
    }
}
