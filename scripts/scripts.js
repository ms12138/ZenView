global.$ = $;

const { remote, ipcRenderer } = require('electron');
const { Menu, BrowserWindow, MenuItem, shell } = remote;
const fs = require("fs");

let isBorderHidden = false;
let isAutoHideEnabled = false;

$(document).ready(function () {
    var webview = document.getElementById('browserView');
    var currentWindow = remote.getCurrentWindow();
    
    // Load settings
    loadSettings();
    
    webview.addEventListener('dom-ready', function () {
        webview.insertCSS('*::-webkit-scrollbar { width: 0 !important }');
        // Inject scroll listener for novel toolbar interaction
        webview.executeJavaScript(`
            let lastScrollTop = 0;
            window.addEventListener('scroll', function() {
                let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                // Send scroll event to parent
                window.postMessage({ 
                    type: 'zenview-scroll', 
                    scrollTop: scrollTop, 
                    direction: scrollTop > lastScrollTop ? 'down' : 'up' 
                }, '*');
                lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
            });
            true;
        `);
    });
    
    // Listen for messages from webview
    window.addEventListener('message', function(event) {
        if (event.data.type === 'zenview-scroll') {
            handleWebviewScroll(event.data);
        }
    });
    
    // Listen for settings from main process
    ipcRenderer.on('restore-border', function() {
        if (isBorderHidden) {
            toggleBorder();
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
    
    // Mouse leave event for auto hide
    $(document).mouseleave(function() {
        if (isAutoHideEnabled && currentWindow.isVisible()) {
            currentWindow.hide();
        }
    });
    
    // Page load complete - update URL bar
    webview.addEventListener('did-finish-load', function() {
        $('#urlField').val(webview.getURL());
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
    $("#addressBar").submit(function(e) {
        e.preventDefault();
        loadURL();
    });

    // Opacity slider
    $("#transparencyRange").change(function(){
        var opacityValue = $(this).val();
        changeOpacity(opacityValue);
    });

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
    $("#bgOverlay").css('background-color', 'rgba(255, 255, 255, ' + opacity + ')');
}

// Toggle border/toolbar visibility using eye icon
function enableClickThrough() {
    toggleBorder();
}

function toggleBorder() {
    const webview = $('#browserView');
    const bgOverlay = $('#bgOverlay');
    const windowChrome = $('.window-chrome');
    const appControls = $('.app-controls');
    
    isBorderHidden = !isBorderHidden;
    
    if (isBorderHidden) {
        // Hide border and controls
        webview.addClass('full-size');
        bgOverlay.hide();
        windowChrome.hide();
        appControls.hide();
    } else {
        // Show border and controls
        webview.removeClass('full-size');
        bgOverlay.show();
        windowChrome.show();
        appControls.show();
    }
    
    // Save state
    localStorage.setItem('zenview-border-hidden', isBorderHidden);
}

// App controls
function loadURL() {
    var url = $("#urlField").val();

    if(url.indexOf("http") >= 0) {
        loadPage(url);
    } else {
        url = "http://" + url;
        loadPage(url);
    }
}

function loadPage(url) {
    console.log("Loading " + url);
    if (url.toLowerCase().indexOf("youtube.com/watch") >= 0) {
        var youtubeID = url.substring(url.indexOf("v=") + 2);
        youtubeID = youtubeID.split('&')[0];
        var youtubeURL = "https://www.youtube.com/embed/" + youtubeID;

        $("#urlField").val(youtubeURL);
        var webview = document.getElementById('browserView');
        webview.loadURL(youtubeURL);
    } else {
        var webview = document.getElementById('browserView');
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
    $('#settingsPanel').toggle();
}

// Load settings from localStorage
function loadSettings() {
    const saveLastPage = localStorage.getItem('zenview-save-last-page') === 'true';
    const alwaysOnTop = localStorage.getItem('zenview-always-on-top') !== 'false'; // default true
    isAutoHideEnabled = localStorage.getItem('zenview-auto-hide') === 'true';
    isBorderHidden = localStorage.getItem('zenview-border-hidden') === 'true';
    
    $('#saveLastPage').prop('checked', saveLastPage);
    $('#alwaysOnTop').prop('checked', alwaysOnTop);
    $('#autoHide').prop('checked', isAutoHideEnabled);
    
    // Apply always on top
    const currentWindow = remote.getCurrentWindow();
    currentWindow.setAlwaysOnTop(alwaysOnTop);
    
    // Apply border state
    if (isBorderHidden) {
        toggleBorder();
    }
}

// Save settings to localStorage
function saveSettings() {
    localStorage.setItem('zenview-save-last-page', $('#saveLastPage').is(':checked'));
    localStorage.setItem('zenview-always-on-top', $('#alwaysOnTop').is(':checked'));
    localStorage.setItem('zenview-auto-hide', $('#autoHide').is(':checked'));
}

// Open website (info button)
function openWebsite() {
    shell.openExternal('https://github.com'); // You can change this to your project URL
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
    currentWindow.minimize();
}
