// ==UserScript==
// @name          Rebind Google Reader
// @namespace     http://d.hatena.ne.jp/mooz/
// @description   Open feeds in background tab by default.
// @include       http://www.google.tld/reader/view/*
// ==/UserScript==

// Custom area {{ =========================================================== //

// null to ignore, function to execute, string or array of alphabet to emulate.
var keyMap = {
    v: function () { GM_openInTab(getCurrentEntryURL()); },
    w: 'v',
    e: null,
};

// }} ======================================================================= //

// Userscript body {{ ======================================================= //

var pendingNextKey;
var passAllKey;
// quick hack (for arranging the constants like ke.DOM_VK_SHIFT)
const KE = document.createEvent("KeyboardEvent");

var keyCodes = {
    16: 'shift',
    17: 'ctrl',
    18: 'alt',
    65: 'a',
    66: 'b',
    67: 'c',
    68: 'd',
    69: 'e',
    70: 'f',
    71: 'g',
    72: 'h',
    73: 'i',
    74: 'j',
    75: 'k',
    76: 'l',
    77: 'm',
    78: 'n',
    79: 'o',
    80: 'p',
    81: 'q',
    82: 'r',
    83: 's',
    84: 't',
    85: 'u',
    86: 'v',
    87: 'w',
    88: 'x',
    89: 'y',
    90: 'z'
};

function getCurrentEntryURL() {
    return document.getElementById("current-entry").getElementsByTagName("A")[0].href;
}

function createKeyDownEvent(aKey) {
    var downCased = aKey.toLowerCase();
    var shiftKey  = (aKey != downCased);

    var keyCode;
    for (var kc in keyCodes)
    {
        if (keyCodes[kc] == aKey)
        {
            keyCode = kc;
            break;
        }
    }

    if (!keyCode)
        return null;

    var newEvent = document.createEvent('KeyboardEvent');
    newEvent.initKeyEvent('keydown',
                          true, true,
                          null,
                          null, null, shiftKey, false,
                          keyCode, 0);

    return newEvent;
}

function fake(aKeys) {
    if (!(aKeys instanceof Array))
        aKeys = [aKeys];

    passAllKey = true;

    aKeys.forEach(
        function (key) {
            var ev = createKeyDownEvent(key);
            if (ev)
            {
                document.body.dispatchEvent(ev);
            }
        }
    );

    passAllKey = false;
}

function handleKeyUp(aEvent) {
    if (passAllKey && aEvent.keyCode == KE.DOM_VK_SHIFT)
    {
        aEvent.stopPropagation();
        return;
    }

    if (aEvent.keyCode == KE.DOM_VK_SHIFT)
    {
        pendingNextKey = null;
    }
}

function handleKeyDown(aEvent) {
    if (passAllKey)
        return;            

    if (aEvent.keyCode == KE.DOM_VK_SHIFT)
    {
        pendingNextKey = 'shift';
        return;
    }

    var key = keyCodes[aEvent.keyCode];

    if (!key)
        return;

    if (pendingNextKey)
    {
        switch (pendingNextKey)
        {
        case 'shift':
            key = key.toUpperCase();
            break;
        default:
            pendingNextKey = null;
            break;
        }
    }

    if (key in keyMap)
    {
        aEvent.stopPropagation();

        var type = typeof keyMap[key];
        switch (type)
        {
            case 'function':
            keyMap[key]();
            break;
            default:
            if (type == "string" || keyMap[key] instanceof Array)
            {
                fake(keyMap[key]);
            }
            break;
        }
    }
}

document.addEventListener("keydown", handleKeyDown, true);
document.addEventListener("keyup", handleKeyUp, true);

// }} ======================================================================= //