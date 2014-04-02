/* Setup "neurotechnics.com" Namespace */
if (!com) { var com = {}; }
if (!com.neurotechnics) { com.neurotechnics = {}; }
com.neurotechnics.unmark = {};

(function (unmark) {

    unmark.version         = "0.1.4";
    unmark.iVersion        = 2014032801;
    unmark.debug           = true;
    unmark.preferences     = null;
    unmark.tabContainer    = null;
    unmark.unmarkUrl       = '';
    unmark.toolbarButtonId = 'unmark-toolbar-button';
    unmark.constants       = {
        firstRun            : "firstRun",
        serverUrl           : "url",
        defaultServerUrl    : "https://unmark.it"
    };
    //unmark.consoleService  = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);

    unmark.startup = function () {
        unmark.log("startup()");
        unmark.preferences = Components.classes["@mozilla.org/preferences-service;1"]
                                    .getService(Components.interfaces.nsIPrefBranch)
                                    .getBranch("extensions.unmark.");

        unmark.tabContainer = gBrowser.tabContainer;

        //var firstRunPref = "extensions.unmark.firstRun";
        //if (!Application.prefs.getValue(firstRunPref, 0) < unmark.iVersion) {
        if (unmark.preferences.getIntPref(unmark.constants.firstRun, 0) < unmark.iVersion) {
            unmark.log("First Run for version "+ unmark.version);
            unmark.installButton('nav-bar', unmark.toolbarButtonId);
            //Application.prefs.setValue(firstRunPref, unmark.iVersion);
            unmark.preferences.setIntPref(unmark.constants.firstRun, unmark.iVersion);
            // all the rest of the first run code goes here.
        }
        /*
        if (unmark.preferences.getBoolPref("firstRun")) {
            unmark.installButton('nav-bar', unmark.toolbarButtonId);
            unmark.preferences.setBoolPref("firstRun", true);
        }
        */
        unmark.unmarkUrl = unmark.getServerUrl();
        unmark.preferences.addObserver("", this, false);
        unmark.tabContainer.addEventListener("TabSelect", unmark._tabSelect, false);
        gBrowser.addEventListener("load", unmark._loadHandler, true);
    };

    unmark.shutdown = function () {
        unmark.log("shutdown()");
        unmark.preferences.removeObserver("", this);
        // When no longer needed
        unmark.tabContainer.removeEventListener("TabSelect", unmark._tabSelect, false);
        gBrowser.removeEventListener("load", unmark._loadHandler, true);
    };

    unmark.log = function (message) {
        //if (unmark.debug) unmark.consoleService.logStringMessage('Unmark >> '+ message);
        if (unmark.debug) {
            console.log('Unmark >> '+ message);
        }
    };

    unmark.onclick = function (event) {
        unmark.log('onClick(): Button = ' + event.button);
        switch(event.button) {
            case 0:
                // Left click
                unmark.run();
                break;
            case 1:
                // Middle click
                unmark.launchSite();
                break;
            case 2:
                // Right click
                break;
        }
    };

    unmark.run = function () {
        unmark.log('run()');
        var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator),
            recentWindow = wm.getMostRecentWindow("navigator:browser"),
            doc = gBrowser.contentDocument,
            recentUrl = recentWindow ? recentWindow.content.document.location.href : (doc ? doc.location.href : false),
            title = recentWindow ? recentWindow.content.document.title : (doc ? (doc.title || '') : '');

        if (recentUrl) {
            unmark.log('Bookmarking: '+ recentUrl);
            var url = unmark.unmarkUrl + "/mark/add?url=" + encodeURIComponent(recentUrl);
            url += "&title="+ encodeURIComponent(title);
            url += "&v=1&nowindow=yes";
            var w = window.open(url+"&noui=1", "Unmark", "location=0,links=0,scrollbars=0,toolbar=0,width=600,height=480");
        } else {
            unmark.log('An error occured bookmarking this tab');
            alert("Please wait until the current tab has loaded before trying to bookmark it.");
        }
    };

    unmark.launchSite = function () {
        unmark.log("launchSite()");
        var tBrowser = top.document.getElementById("content");
        var tab = tBrowser.addTab(unmark.unmarkUrl);
        //tBrowser.getBrowserForTab(tab).loadURI(unmark.unmarkUrl);
        // use this line to focus the new tab, otherwise it will open in background
        tBrowser.selectedTab = tab;
    };

    unmark._tabSelect = function (event) {
        // browser is the XUL element of the browser that's just been selected
        var browser = gBrowser.selectedBrowser;
        unmark.log("Tab container changed. New Tab has the following url: "+ browser.contentDocument.location.href);
        var p = browser.contentDocument.location.protocol;
        unmark._setButtonState(p);
    };

    unmark._loadHandler = function (event) {
        // this is the content document of the loaded page.
        var doc = event.originalTarget;
        if (doc instanceof HTMLDocument) {
            // is this an inner frame?
            if (doc.defaultView.frameElement) {
                // Frame within a tab was loaded.
                // Find the root document:
                while (doc.defaultView.frameElement) {
                    doc = doc.defaultView.frameElement.ownerDocument;
                }
            }
            var p = doc.location.protocol;
            unmark._setButtonState(p);
        }
    };

    unmark._setButtonState = function (protocol) {
        var reg = /^(http[s]?|ftp):$/i;
        var valid = reg.test(protocol);
        //Deactivate the button for invalid url's
        var button = document.getElementById(unmark.toolbarButtonId);
        if (button) { button.disabled = !valid; }
    };


    unmark.observe = function (subject, topic, data) {
        unmark.log("observe(Subject: "+ subject +"; Topic: "+ topic +"; Data: "+ data +")");

        if (topic != "nsPref:changed") {
            return;
        }

        switch(data)
        {
            case 'url':
                unmark.unmarkUrl = unmark.getServerUrl();
                break;

            default:
                break;
        }
    };

    unmark.getServerUrl = function () {
        //unmark.log("getServerUrl()");
        var url = unmark.preferences.getCharPref(unmark.constants.serverUrl) || unmark.constants.defaultServerUrl;
        if (url[url.length-1] == '\\') {
            url = url.substr(0, url.length-1);
        }
        return url;
    };

    /**
     * Installs the toolbar button with the given ID into the given
     * toolbar, if it is not already present in the document.
     *
     * @param {string} toolbarId The ID of the toolbar to install to.
     * @param {string} id The ID of the button to install.
     * @param {string} afterId The ID of the element to insert after. @optional
     */
    unmark.installButton = function (toolbarId, id, afterId) {
        //unmark.log("installButton("+ toolbarId +", "+ id +", "+ afterId +")");
        var toolbar = document.getElementById(toolbarId);
        var button = document.getElementById(id);
        if (toolbar && !button) {
            var newCurrentSet = toolbar.currentSet.split(",").concat([id]).join(",");
            toolbar.currentSet = newCurrentSet; // for immediate display
            toolbar.setAttribute("currentset", newCurrentSet); // for persisting
            document.persist(toolbar.id, "currentset");
            try {
                BrowserToolboxCustomizeDone(true);
            } catch (e) {
                Comonpents.utils.reportError(e);
            }
        }

        /*
        var toolbar = document.getElementById(toolbarId);
        var button = document.getElementById(id);
        if (toolbar && !button) {
            // If no afterId is given, then append the item to the toolbar
            var before = toolbar.lastChild; //null;
            if (afterId) {
                var elem = document.getElementById(afterId);
                if (elem && elem.parentNode == toolbar)
                    before = elem.nextElementSibling;
            }

            toolbar.insertItem(id, before);
            toolbar.setAttribute("currentset", toolbar.currentSet);
            document.persist(toolbar.id, "currentset");

            //if (toolbarId == "addon-bar") toolbar.collapsed = false;
        }
        */
    };

})(com.neurotechnics.unmark);

window.addEventListener("load", function (e) { com.neurotechnics.unmark.startup(); }, false);
window.addEventListener("unload", function (e) { com.neurotechnics.unmark.shutdown(); }, false);
