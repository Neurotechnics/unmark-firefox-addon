# Unmark firefox extension

The Unmark extension for firefox, adds a button to your firefox toolbar allowing you to quickly add a bookmark for the page you're viewing to your Unmark Reading-List.
The addon can be downloaded rom the AMO (addons.mozilla.org) website here: [https://addons.mozilla.org/en-US/firefox/addon/unmark/](https://addons.mozilla.org/en-US/firefox/addon/unmark/)

![The Firefox Toolbar Button](http://www.neurotechnics.com/blog/content/images/2014/Mar/unmark_toolbar_button.png)

By default, the extension will connect to the official Unmark hosted service at [https://unmark.it](https://unmark.it) (which hosts both free and premium accounts).

You can configure the Unmark extension to connect to your own locally hosted Unmark server by editing the server connection URL in the options.

*Configuring the Extension Server Url*:

![Configuring the server url](http://www.neurotechnics.com/blog/content/images/2014/May/screenshot_settings-0-1-5.png)

You can download your own copy of Unmark from GitHub: [https://github.com/plainmade/unmark](https://github.com/plainmade/unmark)
or, sign up for a free or premium account at [https://unmark.it](https://unmark.it)

---

## Version History

### 0.1.6 - July 7, 2014
* Added new languages:
    * German (Deutsch / de)
    * French (Français / fr)
    * Russian (Русский / ru)

### 0.1.5 - May 29, 2014
* Added restrictions to "QueryString" length for IIS hosted installations.
* Updated page *description* and *keyword* parsing.
* Updated shortcut keys:
    * [Ctrl]+[Alt]+[B] - **B**ookmark the current page;
    * [Ctrl]+[Alt]+[U] - View your **U**nmark reading list;
* Updated icons.

### 0.1.4 - April 29, 2014
* Automatically add "notes" based on the pages description and keyword meta-tags.

### 0.1.3 - March 28, 2014
*(Combines all features of 0.1.1 and 0.1.2)*

* Added Toolbar menu;
* Added menu icons;
* Fixed localization references;
* Updated url validation for unloaded tabs;
* Disable unmark toolbar button when the active browser tab does not contain a valid web-page;
* Updated preferences window layout;

### 0.1 - March 19, 2014

* Initial Release;