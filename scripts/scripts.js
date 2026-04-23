global.$ = $;

const { remote, ipcRenderer } = require('electron');
const { Menu, BrowserWindow, MenuItem, shell } = remote;
const fs = require("fs");

let isBorderHidden = false;
let isAutoHideEnabled = false;
let isTomatoModeEnabled = false;

let lastMiddleClickTime = 0;
const DOUBLE_CLICK_INTERVAL = 300;

$(document).ready(function () {
    var webview = document.getElementById('browserView');
    var currentWindow = remote.getCurrentWindow();
    
    // Load settings
    loadSettings();
    
    // Close settings panel when clicking outside of it
    $(document).on('click', function(e) {
        var settingsPanel = $('#settingsPanel');
        var settingsButton = $('.settings');
        
        if (!settingsPanel.is(e.target) && 
            settingsPanel.has(e.target).length === 0 && 
            !settingsButton.is(e.target) && 
            settingsButton.has(e.target).length === 0 &&
            settingsPanel.is(':visible')) {
            settingsPanel.hide();
        }
    });
    
    // Double middle click to show/hide window
    $(document).on('mousedown', function(e) {
        if (e.button === 1) { // Middle button
            var now = Date.now();
            if (now - lastMiddleClickTime < DOUBLE_CLICK_INTERVAL) {
                if (currentWindow.isVisible()) {
                    currentWindow.hide();
                } else {
                    currentWindow.show();
                    currentWindow.focus();
                }
                lastMiddleClickTime = 0;
            } else {
                lastMiddleClickTime = now;
            }
        }
    });
    
    webview.addEventListener('dom-ready', function () {
        webview.insertCSS('*::-webkit-scrollbar { width: 0 !important }');
        // Inject scroll listener for novel toolbar interaction
        webview.executeJavaScript(`
            let lastScrollTop = 0;
            function handleScroll() {
                let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                // Send scroll event to parent
                window.postMessage({ 
                    type: 'zenview-scroll', 
                    scrollTop: scrollTop, 
                    direction: scrollTop > lastScrollTop ? 'down' : 'up' 
                }, '*');
                lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
            }
            window.addEventListener('scroll', handleScroll);
            // Also add scroll listener to document
            document.addEventListener('scroll', handleScroll);
            // Add scroll listener to body
            document.body.addEventListener('scroll', handleScroll);
            true;
        `);
    });
    
    // Handle new window requests
    webview.addEventListener('new-window', function(e) {
        e.preventDefault();
        webview.src = e.url;
    });
    
    // Update URL bar when navigating
    webview.addEventListener('did-navigate', function() {
        $('#urlField').val(webview.getURL());
    });
    
    webview.addEventListener('did-navigate-in-page', function() {
        $('#urlField').val(webview.getURL());
    });
    
    // Listen for messages from webview
    window.addEventListener('message', function(event) {
        if (event.data.type === 'zenview-scroll') {
            handleWebviewScroll(event.data);
        }
    });
    
    // Listen for settings from main process
    ipcRenderer.on('restore-border', function() {
        // Ensure border is visible when window is shown
        if (isBorderHidden) {
            toggleBorder();
        }
        // Also ensure tomato mode doesn't hide the border when showing the window
        if (isTomatoModeEnabled) {
            // Only show border if not on a novel page
            const webview = document.getElementById('browserView');
            const currentUrl = webview.getURL();
            const isNovelPage = currentUrl.includes('fanqienovel.com') || currentUrl.includes('qidian.com') || currentUrl.includes('read.tomato');
            if (!isNovelPage) {
                const windowChrome = $('.window-chrome');
                const appControls = $('.app-controls');
                windowChrome.show();
                appControls.show();
                $('#browserView').removeClass('full-size');
            }
        }
    });
    
    // Listen for setting changes
    $('#saveLastPage').change(saveSettings);
    $('#alwaysOnTop').change(function() {
        saveSettings();
        currentWindow.setAlwaysOnTop($(this).is(':checked'));
    });
    $('#autoHide').change(function() {
        isAutoHideEnabled = $(this).is(':checked');
        saveSettings();
    });
    $('#tomatoMode').change(function() {
        isTomatoModeEnabled = $(this).is(':checked');
        saveSettings();
        updateTomatoMode();
    });
    
    // Mouse leave event for auto hide (fixed)
    let mouseLeaveTimer;
    
    // Track mouse position
    let mouseInWindow = true;
    
    // Only trigger auto-hide when mouse leaves the entire window
    $(window).on('mouseleave', function(e) {
        if (isAutoHideEnabled && currentWindow.isVisible()) {
            // Check if the mouse is actually leaving the window
            // and not just moving over the title bar or address bar
            if (e.clientY <= 0 || e.clientX <= 0 || 
                e.clientX >= window.innerWidth || 
                e.clientY >= window.innerHeight) {
                mouseInWindow = false;
                // Add a small delay to prevent accidental triggers
                mouseLeaveTimer = setTimeout(function() {
                    if (!mouseInWindow) {
                        currentWindow.hide();
                    }
                }, 500);
            }
        }
    });
    
    // Cancel auto-hide if mouse returns to window
    $(window).on('mouseenter', function() {
        mouseInWindow = true;
        if (mouseLeaveTimer) {
            clearTimeout(mouseLeaveTimer);
        }
    });
    
    // Page load complete - update URL bar and check tomato mode
    webview.addEventListener('did-finish-load', function() {
        $('#urlField').val(webview.getURL());
        // Check if tomato mode should be applied
        updateTomatoMode();
    });
    
    // Save URL before window closes
    window.addEventListener('beforeunload', function() {
        if ($('#saveLastPage').is(':checked')) {
            localStorage.setItem('zenview-last-url', webview.getURL());
        }
    });
    
    // Load saved URL on start
    if ($('#saveLastPage').is(':checked')) {
        var lastUrl = localStorage.getItem('zenview-last-url');
        if (lastUrl) {
            $('#urlField').val(lastUrl);
            webview.src = lastUrl;
        }
    }

    // Address bar form
    $("#addressBar").on('submit', function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log("Address bar form submitted");
        loadURL();
        return false;
    });

    // Opacity slider
    $("#transparencyRange").on('input change', function(){
        var opacityValue = parseFloat($(this).val());
        console.log('Transparency slider changed to:', opacityValue);
        changeOpacity(opacityValue);
    });
    
    // Initialize opacity on load
    var initialOpacity = parseFloat($("#transparencyRange").val());
    console.log('Initializing opacity to:', initialOpacity);
    changeOpacity(initialOpacity);

    // Select all text when changing URL
    $("input[type=text]").click(function () {
       $(this).select();
    });
});

// Handle webview scroll for novel toolbar interaction
function handleWebviewScroll(data) {
    const toolbar = $('.app-controls');
    const titleBar = $('.window-chrome');
    
    if (data.direction === 'down') {
        // Scroll down - hide toolbar/title bar with transition
        toolbar.css('transform', 'translateY(-100%)');
        titleBar.css('transform', 'translateY(-100%)');
    } else {
        // Scroll up - show toolbar/title bar
        toolbar.css('transform', 'translateY(0)');
        titleBar.css('transform', 'translateY(0)');
    }
}

// Change window opacity
function changeOpacity(opacity) {
    console.log('changeOpacity called with: ' + opacity);
    
    try {
        // 直接使用 remote 模块设置窗口透明度
        const currentWindow = remote.getCurrentWindow();
        if (currentWindow) {
            currentWindow.setOpacity(opacity);
            console.log('Window opacity set to: ' + opacity);
            
            // 同时调整工具栏和边框的透明度，保持它们更不透明
            const toolbarOpacity = Math.max(opacity, 0.95); // 工具栏至少保持 0.95 的透明度
            $('.window-chrome').css('background-color', `rgba(240, 240, 240, ${toolbarOpacity})`);
            $('.app-controls').css('background-color', `rgba(240, 240, 240, ${toolbarOpacity})`);
            console.log('Toolbar opacity set to: ' + toolbarOpacity);
        } else {
            console.error('Current window not found');
        }
    } catch (error) {
        console.error('Error setting opacity:', error);
    }
}

// 移除透明度响应监听，因为现在直接使用 remote 模块设置透明度

// Toggle border/toolbar visibility using eye icon
function enableClickThrough() {
    toggleBorder();
}

function toggleBorder() {
    const webview = $('#browserView');
    const windowChrome = $('.window-chrome');
    const appControls = $('.app-controls');
    
    isBorderHidden = !isBorderHidden;
    
    if (isBorderHidden) {
        // Hide border and controls
        webview.addClass('full-size');
        windowChrome.hide();
        appControls.hide();
    } else {
        // Show border and controls
        webview.removeClass('full-size');
        windowChrome.show();
        appControls.show();
    }
    
    // Save state
    localStorage.setItem('zenview-border-hidden', isBorderHidden);
}

// App controls
function loadURL() {
    var url = $("#urlField").val().trim();
    
    // Don't do anything if URL is empty
    if (!url) return;
    
    console.log("Attempting to load: " + url);

    // Add http:// if no protocol is specified
    if (url.indexOf("http://") !== 0 && url.indexOf("https://") !== 0) {
        url = "https://" + url;
        $("#urlField").val(url); // Update the field to show the full URL
    }
    
    loadPage(url);
}

function loadPage(url) {
    console.log("Loading page: " + url);
    var webview = document.getElementById('browserView');
    
    if (url.toLowerCase().indexOf("youtube.com/watch") >= 0) {
        var youtubeID = url.substring(url.indexOf("v=") + 2);
        youtubeID = youtubeID.split('&')[0];
        var youtubeURL = "https://www.youtube.com/embed/" + youtubeID;

        $("#urlField").val(youtubeURL);
        webview.loadURL(youtubeURL);
    } else {
        webview.loadURL(url);
    }
}

// Go back
function browserBack() {
    var webview = document.getElementById('browserView');
    webview.goBack();
}

// Toggle settings panel
function toggleSettings() {
    var settingsPanel = $('#settingsPanel');
    if (settingsPanel.is(':visible')) {
        settingsPanel.hide();
    } else {
        settingsPanel.show();
    }
}

// Load settings from localStorage
function loadSettings() {
    const saveLastPage = localStorage.getItem('zenview-save-last-page') === 'true';
    const alwaysOnTop = localStorage.getItem('zenview-always-on-top') !== 'false'; // default true
    isAutoHideEnabled = localStorage.getItem('zenview-auto-hide') === 'true';
    isTomatoModeEnabled = localStorage.getItem('zenview-tomato-mode') === 'true';
    isBorderHidden = localStorage.getItem('zenview-border-hidden') === 'true';
    
    $('#saveLastPage').prop('checked', saveLastPage);
    $('#alwaysOnTop').prop('checked', alwaysOnTop);
    $('#autoHide').prop('checked', isAutoHideEnabled);
    $('#tomatoMode').prop('checked', isTomatoModeEnabled);
    
    // Apply always on top
    const currentWindow = remote.getCurrentWindow();
    currentWindow.setAlwaysOnTop(alwaysOnTop);
    
    // Apply border state
    if (isBorderHidden) {
        toggleBorder();
    }
    
    // Apply tomato mode
    updateTomatoMode();
}

// Save settings to localStorage
function saveSettings() {
    localStorage.setItem('zenview-save-last-page', $('#saveLastPage').is(':checked'));
    localStorage.setItem('zenview-always-on-top', $('#alwaysOnTop').is(':checked'));
    localStorage.setItem('zenview-auto-hide', $('#autoHide').is(':checked'));
    localStorage.setItem('zenview-tomato-mode', $('#tomatoMode').is(':checked'));
}

// Open website (info button)
function openWebsite() {
    shell.openExternal('https://github.com'); // You can change this to your project URL
}

// Update tomato reading mode
function updateTomatoMode() {
    const webview = document.getElementById('browserView');
    const currentUrl = webview.getURL();
    const windowChrome = $('.window-chrome');
    const appControls = $('.app-controls');
    
    // Check if current URL is a tomato novel reading page
    const isNovelPage = currentUrl.includes('fanqienovel.com') || currentUrl.includes('qidian.com') || currentUrl.includes('read.tomato');
    
    if (isTomatoModeEnabled && isNovelPage) {
        // Hide toolbar and title bar for novel reading
        windowChrome.hide();
        appControls.hide();
        $('#browserView').addClass('full-size');
    } else {
        // Show toolbar and title bar if not in tomato mode or not on novel page
        if (!isBorderHidden) {
            windowChrome.show();
            appControls.show();
            $('#browserView').removeClass('full-size');
        }
    }
}

// Window controls
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
    currentWindow.hide();
}
