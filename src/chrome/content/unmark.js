// Setup "neurotechnics.com" Namespace
if (typeof com == 'undefined') { var com = {}; }
com.neurotechnics = com.neurotechnics || {};
com.neurotechnics.unmark = {};

(function (unmark) {

    unmark.version         = "{%PACKAGE_VERSION%}";
    unmark.iVersion        = {%BUILD_NUMBER%};
    unmark.debug           = {%DEBUG_MODE%};
    unmark.preferences     = null;
    unmark.tabContainer    = null;
    unmark.unmarkUrl       = '';
    unmark.maxQsLength     = 2048;
    unmark.toolbarButtonId = 'unmark-toolbar-button';
    unmark.constants       = {
        firstRun            : "firstRun",
        serverUrl           : "url",
        defaultServerUrl    : "https://unmark.it",
        maxQsLength         : "maxqslength",
        defaultMaxQsLength  : 2048
        //,firstRunPref        : "extensions.unmark.firstRun";
    };
    //unmark.consoleService  = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);

    /**
     * The main "Unamrk" intialization function. Called when the browser loads.
     * @return {void}
     */
    unmark.startup = function () {
        unmark.log("startup()");
        unmark.preferences = Components.classes["@mozilla.org/preferences-service;1"]
                                    .getService(Components.interfaces.nsIPrefBranch)
                                    .getBranch("extensions.unmark.");

        unmark.tabContainer = gBrowser.tabContainer;

        //if (!Application.prefs.getValue(firstRunPref, 0) < unmark.iVersion) {
        if (unmark.preferences.getIntPref(unmark.constants.firstRun, 0) < unmark.iVersion) {
            unmark.log("First Run for version "+ unmark.version);
            unmark.installButton('nav-bar', unmark.toolbarButtonId);
            //Application.prefs.setValue(firstRunPref, unmark.iVersion);
            unmark.preferences.setIntPref(unmark.constants.firstRun, unmark.iVersion);
            // all the rest of the first run code goes here.
        }
        unmark.unmarkUrl = unmark.getServerUrl();
        unmark.preferences.addObserver("", this, false);
        unmark.tabContainer.addEventListener("TabSelect", unmark._tabSelect, false);
        gBrowser.addEventListener("load", unmark._loadHandler, true);
    };

    /**
     * The "shutdown" function is called when the browser closes.
     * @return {void}
     */
    unmark.shutdown = function () {
        unmark.log("shutdown()");
        unmark.preferences.removeObserver("", this);
        unmark.tabContainer.removeEventListener("TabSelect", unmark._tabSelect, false);
        gBrowser.removeEventListener("load", unmark._loadHandler, true);
    };

    /**
     * A logging function to send messages to the Firefox console. (Only when unmark.debug == true)
     * @param  {String} message The console log message
     * @return {void}
     */
    unmark.log = function (message) {
        //if (unmark.debug) unmark.consoleService.logStringMessage('Unmark >> '+ message);
        if (unmark.debug) {
            console.log('Unmark >> '+ message);
        }
    };

    /**
     * Called when the user clicks a mouse button on the toolbar button control.
     * @param  {MouseEvent} event The MouseEvent object.
     * @return {void}
     */
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

    /**
     * Executes when the user elects to bookmark the current tab.
     * @return {void}
     */
    unmark.run = function () {
        unmark.log('run()');
        var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator),
            recentWindow = wm.getMostRecentWindow("navigator:browser"),
            doc = gBrowser.contentDocument,
            recentUrl = recentWindow ? recentWindow.content.document.location.href : (doc ? doc.location.href : false),
            title = recentWindow ? recentWindow.content.document.title : (doc ? (doc.title || '') : ''),
            description = unmark._getMeta('description', doc),
            keywords = unmark._getMeta('keywords', doc);

        //unmark.log("Description: "+description);
        //unmark.log("Keywords: "+keywords);

        if (recentUrl) {
            unmark.log('Bookmarking: '+ recentUrl);
            var url = unmark.unmarkUrl + "/mark/add";
                qs = "?url=" + encodeURIComponent(recentUrl);
            qs += "&title="+ encodeURIComponent(title);
            if (description || keywords) {
                qs += "&notes=";
                if (description) {
                    var eDescription = encodeURIComponent(description);
                    if (qs.length + eDescription.length <= unmark.maxQsLength) {
                        qs += eDescription;
                    }
                }
                if (keywords) {
                    var tagString = unmark.parseKeywords(keywords),
                        eTags = encodeURIComponent(tagString);
                    if (qs.length + eTags.length <= unmark.maxQsLength) {
                        qs += eTags;
                    }
                }
            }
            //Notes?? 0x23 = #
            qs += "&v=1&nowindow=yes&noui=1";
            url += qs;
            unmark.log("URL: "+ url);
            //var w = window.open(url+"&noui=1", "Unmark", "location=0,links=0,scrollbars=0,toolbar=0,width=600,height=480");
            var w = window.open(url, "Unmark", "location=0,links=0,scrollbars=0,toolbar=0,width=600,height=480");
        } else {
            unmark.log('An error occured bookmarking this tab');
            alert("Please wait until the current tab has loaded before trying to bookmark it.");
        }
    };

    /**
     * Executes when the user elects to view their bookmark to-do/reading list
     * @return {void}
     */
    unmark.launchSite = function () {
        unmark.log("launchSite()");
        var tBrowser = top.document.getElementById("content");
        var tab = tBrowser.addTab(unmark.unmarkUrl);
        //tBrowser.getBrowserForTab(tab).loadURI(unmark.unmarkUrl);
        // use this line to focus the new tab, otherwise it will open in background
        tBrowser.selectedTab = tab;
    };

    /**
     * Retrieves the "content" value of <meta/> tags with the name specified by "type".
     * @param  {String} type The type of meta tag we are looking for. e.g. description, keywords etc.
     * @param  {Object} doc  The Dom Document object.
     * @return {String/Bool} The "Content" value of the meta tag (if found, "false" if not).
     */
    unmark._getMeta = function(type, doc) {
        if (!type || !doc) return false;

        var meta_elements = doc.getElementsByTagName('meta'),
            sType = type.toLowerCase();

        for (var i = meta_elements.length - 1; i >= 0; i--) {
            var meta = meta_elements[i];
            if (com.neurotechnics.lib.is(meta, 'HTMLMetaElement')) {
                var name = meta.name.toLowerCase();
                if (name == sType) {
                    return meta.content;
                }
            }
        }

        return false;
    };

    /**
     * Executes when the user changes tabs, verifies the URL of the tab is valid, and updates the toolbar button state accordingly.
     * @param  {Event} event The tab-changed event object
     */
    unmark._tabSelect = function (event) {
        // browser is the XUL element of the browser that's just been selected
        var browser = gBrowser.selectedBrowser;
        unmark.log("Tab container changed. New Tab has the following url: "+ browser.contentDocument.location.href);
        var p = browser.contentDocument.location.protocol;
        unmark._setButtonState(p);
    };

    /**
     * Executes when the borwser loads the contents of a tab.
     * @param  {Event} event The window.load event object.
     * @return {void}
     */
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

    /**
     * Enables/disables the toolbar button based on the "protocol" of the currently selected tab
     * @param {String} protocol The "protocol" part of the URL loaded in the currently selected tab (e.g 'http:').
     */
    unmark._setButtonState = function (protocol) {
        var reg = /^(ht|f)tps?:$/i;
        //Valid - http: https: ftp: ftps:
        var valid = reg.test(protocol);
        //Deactivate the button for invalid url's
        var button = document.getElementById(unmark.toolbarButtonId);
        if (button) { button.disabled = !valid; }
    };

    /**
     * Executes when the Options for this extension are changed.
     * @param  {String} subject [description]
     * @param  {String} topic   [description]
     * @param  {String} data    [description]
     * @return {void}
     */
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

    /**
     * Loads the "Server URL" setting from the extension preferences (as defined by the user).
     * @return {String} The URL for the Unmark srever the user has chosen to connect to.
     */
    unmark.getServerUrl = function () {
        //unmark.log("getServerUrl()");
        var url = unmark.preferences.getCharPref(unmark.constants.serverUrl) || unmark.constants.defaultServerUrl;
        if (url[url.length-1] == '\\') {
            url = url.substr(0, url.length-1);
        }
        return url;
    };

    /**
     * Loads the "Maximum Query String Length" setting from the extension preferences (as defined by the user).
     * @return {Integer} The user setting value
     */
    unmark.getMaxQsLength = function () {
        var maxlen = unmark.preferences.getIntPref(unmark.constants.maxQsLength) || unmark.constants.defaultMaxQsLength;
        return maxlen;
    };

    /**
     * Installs the toolbar button with the given ID into the given
     * toolbar, if it is not already present in the document.
     *
     * @param {String} toolbarId The ID of the toolbar to install to.
     * @param {String} id The ID of the button to install.
     * @param {String} afterId The ID of the element to insert after. @optional
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
                //Comonpents.utils.reportError(e);
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

    unmark.parseKeywords = function (keywords) {
        if (keywords.trim() === '') return '';

        var tags = '',
            separator = false,
            hasComma = keywords.contains(','),
            hasSemicolon = keywords.contains(';'),
            hasSpace = keywords.contains(' ');

        // Some sites separate keywords with a semi-colon (or even a space) instead of comma (tisk tisk)
        if (hasComma) {
            separator = ',';
        } else if (hasSemicolon) {
            separator = ';';
        } else if (hasSpace) {
            separator = ' ';
        }

        if (!separator) return '';

        var aKeys = keywords.split(separator);
        unmark.log('Split Tags ('+ (typeof aKeys) +') = '+ aKeys);
        if (!com.neurotechnics.lib.isArray(akeys)) return '';


        //if the last element is blank, pop it off the end of the array.
        aKeys = aKeys.filter(function(o){ return o!== ''; });

        for (var i = aKeys.length - 1; i >= 0; i--) {
            aKeys[i] = aKeys[i].trim().replace(/[ \-]/gi, '-');
        }
        tags = ' #'+ aKeys.join(' #');
        return tags;
    };

})(com.neurotechnics.unmark);

window.addEventListener("load", function (e) { com.neurotechnics.unmark.startup(); }, false);
window.addEventListener("unload", function (e) { com.neurotechnics.unmark.shutdown(); }, false);
