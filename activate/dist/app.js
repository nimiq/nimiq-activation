var app = (function () {
'use strict';

class XElement {
    /**
     * Creates an instance of XElement.
     * @param {XElement | Element | null} parent
     * @memberof XElement
     */
    constructor(parent) {
        this.__bindDOM(parent);
        this.__createChildren();
        this.$el.xDebug = this; // This DOM-Element gets a reference to this XElement (nice for debugging)
        if (this.onCreate) this.onCreate();
    }

    /**
     *
     *
     * @param {XElement | Element | null} parent
     * @memberof XElement
     */
    __bindDOM(parent) {
        if (parent instanceof XElement) this.$el = parent.$(this.__tagName + ':not([x-initialized])'); // query in parent for tag name
        else if (parent instanceof Element) this.$el = parent; // The parent is this DOM-Element
        else this.$el = document.querySelector(this.__tagName); // query in document for tag name
        this.$el.setAttribute('x-initialized', true);
        this.__fromHtml();
        this.__bindStyles(this.styles);
    }

    /**
     *
     *
     * @returns
     * @memberof XElement
     */
    __createChildren() { // Create all children recursively
        if (!this.children) return;
        this.children().forEach(child => this.__createChild(child));
    }

    /**
     *
     *
     * @param {XElement | XElement[]} child
     * @returns {void}
     * @memberof XElement
     */
    __createChild(child) { // bind all this.$myChildElement = new MyChildElement(this);
        if (child instanceof Array) return this.__createArrayOfChild(child[0]);
        this[child.__toChildName()] = new child(this);
    }

    /**
     *
     *
     * @param {XElement} child
     * @memberof XElement
     */
    __createArrayOfChild(child) {
        const name = child.__toChildName() + 's';
        const tagName = XElement.__toTagName(child.name);
        const foundChildren = this.$$(tagName + ':not([x-initialized])');
        this[name] = [];
        foundChildren.forEach(c => this[name].push(new child(c)));
    }
    /**
     *
     *
     * @static
     * @param {string} str
     * @returns {string}
     * @memberof XElement
     */
    static camelize(str) {
        return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match) => {
            if (+match === 0) return '';// or if (/\s+/.test(match)) for white spaces
            return match.toUpperCase();
        });
    }

    /**
     *
     *
     * @static
     * @returns {string}
     * @memberof XElement
     */
    static __toChildName() {
        let name = this.name;
        if (name.match(/^X[A-Z][a-z]*/)) name = name.substring(1); // replace XAnyConstructorName -> AnyConstructorName
        return '$' + name[0].toLowerCase() + name.substring(1); // AnyConstructorName -> $anyConstructorName
    }

    /**
     *
     *
     * @returns
     * @memberof XElement
     */
    __fromHtml() {
        if (!this.html) return;
        const html = this.html().trim();
        const currentContent = this.$el.innerHTML.trim();
        this.$el.innerHTML = html;
        if (currentContent === '') return;
        const $content = this.$('[content]');
        if (!$content) return;
        $content.innerHTML = currentContent;
        $content.removeAttribute('content');
    }

    /**
     *
     *
     * @readonly
     * @memberof XElement
     */
    get __tagName() { // The tagName of this DOM-Element
        return XElement.__toTagName(this.constructor.name);
    }

    /**
     *
     *
     * @static
     * @param {string} name
     * @returns
     * @memberof XElement
     */
    static __toTagName(name) {
        return name.split(/(?=[A-Z])/).join('-').toLowerCase(); // AnyConstructorName -> any-constructor-name
    }

    /**
     *
     *
     * @static
     * @returns
     * @memberof XElement
     */
    static createElement() {
        const name = this.__toTagName(this.name);
        const element = document.createElement(name);
        return new this(element);
    }

    /**
     * Find the first match of a selector within this element.
     *
     * @param {string} selector
     * @returns {Element}
     * @memberof XElement
     */
    $(selector) { return this.$el.querySelector(selector) } // Query inside of this DOM-Element

    /**
     * Finds all matches of a selector within this element.
     *
     * @param {string} selector
     * @returns {NodeList}
     * @memberof XElement
     */
    $$(selector) { return this.$el.querySelectorAll(selector) } // QueryAll inside of this DOM-Element

    /**
     *
     *
     * @memberof XElement
     */
    clear() { while (this.$el.firstChild) this.$el.removeChild(this.$el.firstChild); } // Clear all DOM-Element children

    /**
     *
     *
     * @param {string} type
     * @param {function} callback
     * @memberof XElement
     */
    addEventListener(type, callback) { this.$el.addEventListener(type, callback, false); }
    /**
     *
     *
     * @param {string} eventType
     * @param {any} [detail=null]
     * @param {boolean} [bubbles=true]
     * @memberof XElement
     */
    fire(eventType, detail = null, bubbles = true) { // Fire DOM-Event
        const params = { detail: detail, bubbles: bubbles };
        this.$el.dispatchEvent(new CustomEvent(eventType, params));
    }
    /**
     *
     *
     * @param {string} type
     * @param {function} callback
     * @param {Element | window} $el
     * @memberof XElement
     */
    listenOnce(type, callback, $el) {
        const listener = e => {
            $el.removeEventListener(type, listener);
            callback(e);
        };
        $el.addEventListener(type, listener, false);
    }

    /**
     *
     *
     * @param {string} styleClass
     * @memberof XElement
     */
    addStyle(styleClass) { this.$el.classList.add(styleClass); }
    /**
     *
     *
     * @param {string} styleClass
     * @memberof XElement
     */
    removeStyle(styleClass) { this.$el.classList.remove(styleClass); }
    /**
     *
     *
     * @param {() => string[]} styles
     * @returns
     * @memberof XElement
     */
    __bindStyles(styles) {
        if (super.styles) super.__bindStyles(super.styles); // Bind styles of all parent types recursively
        if (!styles) return;
        styles().forEach(style => this.addStyle(style));
    }

    /**
     *
     *
     * @param {string} className
     * @param {Element | string} $el
     * @param {() => void} afterStartCallback
     * @param {() => void} beforeEndCallback
     * @returns
     * @memberof XElement
     */
    animate(className, $el, afterStartCallback, beforeEndCallback) {
        return new Promise(resolve => {
            $el = $el || this.$el;
            // 'animiationend' is a native DOM event that fires upon CSS animation completion
            this.listenOnce('animationend', e => {
                if (e.target !== $el) return;
                if (beforeEndCallback) beforeEndCallback();
                this.stopAnimate(className, $el);
                resolve();
            }, $el);
            $el.classList.add(className);
            if (afterStartCallback) afterStartCallback();
        })
    }
    /**
     *
     *
     * @param {string} className
     * @param {Element | string} $el
     * @memberof XElement
     */
    stopAnimate(className, $el) {
        $el = $el || this.$el;
        $el.classList.remove(className);
    }

    types() {
        /** @type{() => (typeof XElement)[]} */
        this.children = null;
        /** @type {string} */
        this.name = null;
        /** @types {() => string[]} */
        this.styles = null;
    }
}

class XState {
    constructor(path) {
        /** @type {string} */
        this._id = path[0];
        /** @type {string} */
        this._toString = path.join('/');
        /** @type {string} */
        const child = path.slice(1);
        if (child.length && child[0]) this._child = new XState(child);
        /** @type {boolean} */
        this._isLeaf = !this._child;
        /** @type {string[]} */
        this._path = path;
    }

    /** @returns {boolean} */
    get isLeaf() { return this._isLeaf; }

    /** @returns {string} */
    get leafId() { return this._path[this._path.length]; }

    /** @returns {string} */
    get id() { return this._id; }

    /** @returns {boolean} */
    get isRoot() { return this.id === '' }

    /** @returns {XState} */
    get child() { return this._child; }

    /** @returns {string[]} */
    get path() { return JSON.parse(JSON.stringify(this._path)) }

    /** @return {boolean} */
    isEqual(otherState) {
        return otherState && this.toString() === otherState.toString();
    }

    /** @return {boolean} */
    isRootEqual(otherState) {
        return otherState && this.id && this.id === otherState.id;
    }

    /** @return {string} */
    toString() {
        return this._toString;
    }

    /** @return {string[]} */
    intersection(otherState) {
        const intersection = [];
        let state1 = this;
        let state2 = otherState;
        while (state1 && state2 && state1.id === state2.id) {
            intersection.push(state1.id);
            state1 = state1.child;
            state2 = state2.child;
        }
        return intersection;
    }

    /** @return {string[]} */
    difference(otherState) {
        if (!otherState) return this.path;
        const difference = [];
        let state1 = this;
        let state2 = otherState;
        while (state1) {
            if (!state2 || state1.id !== state2.id) difference.push(state1.id);
            state1 = state1.child;
            if (state2) state2 = state2.child;
        }
        return difference;
    }

    /** @param {string} fragment
     *  @returns {XState}
     */
    static fromLocation(fragment) {
        fragment = fragment || this._currFragment();
        fragment = fragment[0] === '#' ? fragment.slice(1) : fragment;
        return this.fromString(fragment);
    }

    /** @param {string} string
     * @returns {XState}
     */
    static fromString(string) {
        const path = string.split('/');
        return new XState(path);
    }

    /** @param {string[]} route
     *  @returns string */
    static locationFromRoute(route) {
        if (!route) return '';
        if (route[0] === '/') return this._locationFromAbsoluteRoute(route);
        if (route.indexOf('./') === 0) return this._locationFromSubroute(route);
        return this._locationFromRelativeRoute(route);
    }

    /** @param {string[]} route
     *  @returns string */
    static _locationFromRelativeRoute(route) {
        const fragment = this._currFragment();
        const path = fragment.split('/').filter(e => e);
        path.pop();
        path.push(route);
        return '#' + path.join('/');
    }

    /** @param {string[]} route
     *  @returns string */
    static _locationFromSubroute(route) {
        route = route.slice(2);
        let fragment = this._currFragment();
        let lastChar = fragment[fragment.length - 1];
        if (!!fragment && lastChar !== '/') fragment += '/';
        return '#' + fragment + route;
    }

    /** @param {string[]} route
     *  @returns string */
    static _locationFromAbsoluteRoute(route) {
        return '#' + route.slice(1);
    }

    /** @returns string */
    static _currFragment() {
        let fragment = decodeURIComponent(location.hash.slice(1));
        fragment = fragment.replace('#/', '#');
        return fragment;
    }
}

class XScreen extends XElement {

    types() {
        /** @type {Map<string,XScreen>} */
        this._childScreens = new Map();
    }

    constructor(parent) {
        super(parent);
        if (!parent) this._registerRootElement();
        this._bindListeners();
    }

    _registerRootElement() {
        XScreen._registerGlobalStateListener(this._onRootStateChange.bind(this));
        setTimeout(e => this._show(), 100);
    }

    /**
     *
     * @param {XState} nextState
     * @param {XState} prevState
     * @param {boolean} isNavigateBack
     * @returns {Promise<void>}
     * @private
     */
    async _onRootStateChange(nextState, prevState, isNavigateBack) {
        nextState = this._sanitizeState(nextState);
        const intersection = nextState.intersection(prevState); // calc intersection common parent path
        const nextStateDiff = nextState.difference(prevState);
        const prevStateDiff = prevState && prevState.difference(nextState);
        let parent = this;
        intersection.forEach(childId => parent = parent._getChildScreen(childId)); // decent common path
        let exitParent = prevStateDiff && parent._getChildScreen(prevStateDiff[0]);
        if (exitParent) exitParent._exitScreens(prevStateDiff, nextState, prevState, isNavigateBack);
        parent._entryScreens(nextStateDiff, nextState, prevState, isNavigateBack);
        if (parent._onStateChange) parent._onStateChange(nextState);
    }

    _exitScreens(prevStateDiff, nextState, prevState, isNavigateBack) {
        if (prevStateDiff && prevStateDiff.length > 1) {
            const childScreen = this._getChildScreen(prevStateDiff[1]);
            prevStateDiff = prevStateDiff.slice(1);
            childScreen._exitScreens(prevStateDiff, nextState, prevState, isNavigateBack);
        }
        this.__onExit(nextState, prevState, isNavigateBack);
    }

    _entryScreens(nextStateDiff, nextState, prevState, isNavigateBack) {
        this.__onEntry(nextState, prevState, isNavigateBack);
        if (!nextStateDiff || !nextStateDiff.length) return;
        const childScreen = this._getChildScreen(nextStateDiff[0]);
        if (!childScreen) return;
        const nextChildStateDiff = nextStateDiff.slice(1);
        childScreen._entryScreens(nextChildStateDiff, nextState, prevState, isNavigateBack);
    }

    _sanitizeState(nextState) {
        let parent = this;
        while (nextState && !nextState.isRoot) {
            const id = nextState.id;
            parent = parent._getChildScreen(id);
            nextState = nextState.child;
        }
        let child = parent;
        while (child && child._getDefaultScreen()) {
            child = child._getDefaultScreen();
        }
        const cleanState = XState.fromLocation(child._location);
        history.replaceState(history.state, history.state, child._location);
        XScreen.currState = cleanState;
        return cleanState;
    }

    _getDefaultScreen() {
        if (!this._childScreens) return;
        return this._childScreens.values().next().value;
    }

    async __onEntry(nextState, prevState, isNavigateBack) {
        if (this.isVisible) return;
        if (this._onBeforeEntry) this._onBeforeEntry(nextState, prevState, isNavigateBack);
        await this._animateEntry(isNavigateBack);
        if (this._onEntry) await this._onEntry(nextState, prevState, isNavigateBack);
        this._resolveGoTo();
    }

    _animateEntry(isNavigateBack) {
        const afterStartCallback = () => { this._show(); };
        if (!isNavigateBack)
            return this.animate('x-entry-animation', null, afterStartCallback);
        else
            return this.animate('x-exit-animation-reverse', null, afterStartCallback);
    }

    async __onExit(nextState, prevState, isNavigateBack) {
        if (!this.isVisible) return;
        document.activeElement.blur();
        if (this._onBeforeExit) this._onBeforeExit(nextState, prevState, isNavigateBack);
        await this._animateExit(isNavigateBack);
        if (this._onExit) await this._onExit(nextState, prevState, isNavigateBack);
    }

    _animateExit(isNavigateBack) {
        const beforeEndCallback = () => { this._hide(); };
        if (!isNavigateBack)
            return this.animate('x-exit-animation', null, null, beforeEndCallback);
        else
            return this.animate('x-entry-animation-reverse', null, null, beforeEndCallback);
    }

    _show() {
        this.$el.style.display = 'flex';
        this.$el.offsetWidth; // Bugfix for FF: trigger layout and repaint
        this._isVisible = true;
    }

    _hide() {
        this.$el.style.display = 'none';
        this._isVisible = false;
    }

    get isVisible() { return this._isVisible; }

    get route() {
        return this._route || this.$el.getAttribute('route') || this.__tagName.replace('screen-', '');
    }

    get _location() {
        if (!this._parent) return;
        if (!this._parent._location) return '#' + this.route;
        return this._parent._location + '/' + this.route;
    }

    goTo(route) {
        return new Promise(resolve => {
            XScreen._goToResolve = resolve;
            document.location = XState.locationFromRoute(route);
        })
    }

    back() {
        return new Promise(resolve => {
            XScreen._goToResolve = resolve;
            history.back();
        });
    }

    _bindListeners() {
        if (!this.listeners) return;
        const listeners = this.listeners();
        for (const key in listeners) {
            this.addEventListener(key, e => this[listeners[key]](e.detail !== undefined ? e.detail : e));
        }
    }

    _getChildScreen(id) {
        if (!this._childScreens) return;
        return this._childScreens.get(id);
    }

    __createChild(child) {
        super.__createChild(child);
        if (child instanceof Array) {
            const name = child[0].__toChildName() + 's';
            if (this[name][0] instanceof XScreen) this.__createChildScreens(child[0]);
        } else {
            const childScreen = this[child.__toChildName()];
            if (childScreen instanceof XScreen) this.__createChildScreen(childScreen);
        }
    }

    __createChildScreen(child) {
        if (!this._childScreens) this._childScreens = new Map();
        this._childScreens.set(child.route, child);
        child._parent = this;
    }

    __createChildScreens(child) {
        const name = child.__toChildName() + 's';

        this[name].forEach(c => this.__createChildScreen(c));
    }

    __bindStyles(styles) {
        super.__bindStyles(styles);
        if (!this.styles) this.addStyle('x-screen');
    }

    _resolveGoTo() {
        if (!XScreen._goToResolve) return;
        XScreen._goToResolve();
        XScreen._goToResolve = null;
    }

    /** @param {function} callback */
    static _registerGlobalStateListener(callback) {
        if (this._stateListener) return; // We register only the first screen calling. All other screens get notified by their parent
        this._stateListener = window.addEventListener('popstate', e => this._onHistoryChange(callback));
        setTimeout(e => this._onHistoryChange(callback), 0); // Trigger FF layout
    }

    /** @param {function} callback */
    static _onHistoryChange(callback) {
        const nextState = XState.fromLocation();
        if (nextState.isEqual(this.currState)) return;
        const isNavigateBack = (nextState.isEqual(this.prevState));
        this.prevState = this.currState;
        this.currState = nextState;
        callback(nextState, this.prevState, isNavigateBack);
    }

    static launch() { window.addEventListener('load', () => new this()); }
}

// Todo: Fix kind of animations when using back and forward buttons in whatever order

class XScreenFit extends XScreen {
    styles() { return ['x-screen-fit'] }
}

class XAppScreen extends XScreenFit {
	get __tagName() { return 'body' }

	_animateEntry() {} // Overwritten from XScreenFit
}

class ScreenWarning extends XScreenFit {
    html() {
        return `
			<x-warning x-grow>
				<i icon-warning></i>
				<h2>Important Notice</h2>
				<div content>Warning!</div>
			</x-warning>
			<button>I Understand</button>
		`;
    }

    onCreate() {
        this.$('button').addEventListener('click', e => this.fire('x-warning-complete'));
    }
}

class ScreenWelcome extends XScreen {
    html() {
        return `
            <x-slides>
                <screen-welcome-intro></screen-welcome-intro>
                <screen-warning>
                    <ul>
                        <li>You can not transfer your activated NIM until mainnet launch.</li>
                        <li>You can not change your Nimiq Account once you have activated it.</li>
                        <li>Complete all of the following steps to securely use and backup your Nimiq Account.</li>
                    <ul>
                </screen-warning>
            <x-slides>
        `
    }
    children() { return [ScreenWelcomeIntro, ScreenWarning] }
    listeners() {
        return {
            'x-warning-complete': '_onWarningComplete'
        }
    }

    _onWarningComplete() {
        document.location.href = '#identicons';
    }
}

class ScreenWelcomeIntro extends XScreen {

    html() {
        return `
            <nimiq-logo large>Nimiq Activation Tool</nimiq-logo>
            <h1>Welcome to the Nimiq Wallet Creation</h1>
            <h2>Create a wallet to activate your NIM from NET</h2>
            <ol>
                <li>Create your Nimiq Genesis Account</li>
                <li>Activate your Nimiq (NIM) from NET</li>
            </ol>
            <x-grow></x-grow>
            <a href="#welcome/warning" button>Let's go!</a>`
    }
}

class Robohash {

    /* Public API */

    static svg(text) {
        const hash = this._hash(text);
        return this._svgTemplate(this.colors[hash[0]], this.bgColors[hash[1]], hash[2], hash[3], hash[4], hash[5], hash[6]);
    }

    static render(text, $element) {
        $element.innerHTML = this.svg(text);
    }

    static toDataUrl(text) {
        return `data:image/svg+xml;base64,${btoa(this.svg(text))}`;
    }


    /* Private API */
    static _svgTemplate(color, backgroundColor, bodyNr, faceNr, eyesNr, mouthNr, accessoryNr) {
        return this._$svg(this._$robohash(color, backgroundColor, bodyNr, faceNr, eyesNr, mouthNr, accessoryNr));
    }

    static _clippedsvgTemplate(color, backgroundColor, bodyNr, faceNr, eyesNr, mouthNr, accessoryNr) {
        return this._$svg(this._$robohash(color, backgroundColor, bodyNr, faceNr, eyesNr, mouthNr, accessoryNr));
    }

    static _$robohash(color, backgroundColor, bodyNr, faceNr, eyesNr, mouthNr, accessoryNr) {
        return `
            <g style="color:${color}">
                <rect fill="${backgroundColor}" x="0" y="0" width="320" height="320"></rect>
                ${this._$use('body',bodyNr)}
                ${this._$use('face',faceNr)}
                ${this._$use('eyes',eyesNr)}
                ${this._$use('mouth',mouthNr)}
                ${this._$use('accessory',accessoryNr)}
            </g>`
    }

    static _$svg(content) {
        return `
            <svg viewBox="0 0 320 320" width="320" height="320" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/2000/xlink" >
                ${content}
            </svg>`
    }

    static _$use(part, index) {
        return `<use width="320" height="300" transform="translate(0,20)" xlink:href="${location.origin}/libraries/robohash/dist/robohash.min.svg#${part}-${this._assetIndex(index)}" />`;
    }

    static get colors() {
        return [
            '#ff9800', // orange-500
            '#E53935', // red-600
            '#FDD835', // yellow-600
            '#3f51b5', // indigo-500
            '#03a9f4', // light-blue-500
            '#9c27b0', // purple-500
            '#009688', // teal-500
            '#EC407A', // pink-400
            '#8bc34a', // light-green-500
            '#795548' // brown-500
        ]
    }

    static get bgColors() {
        return [
            /* Red  */
            '#FF8A80', // red-a100
            '#F48FB1', // pink-200
            '#ea80fc', // purple-a100

            /* Blue */
            '#8c9eff', // indigo-a100
            '#80d8ff', // light-blue-a100
            '#CFD8DC', // blue-grey-100

            /* Green */
            '#1DE9B6', // teal-a400
            '#00C853', // green-a-700

            /* Orange */
            '#FF9E80', // deep-orange-a100
            '#FFE57F' // amber-a100
        ]
    }

    static _assetIndex(index) { index = Number(index) + 1; return index < 10 ? '0' + index : index }

    static _hash(text) {
        return ('' + text
                .split('')
                .map(c => Number(c.charCodeAt(0)) + 3)
                .reduce((a, e) => a * (1 - a) * this.__chaosHash(e), 0.5))
            .split('')
            .reduce((a, e) => e + a, '')
            .substr(4, 10);
    }

    static __chaosHash(number) {
        const k = 3.569956786876;
        let a_n = 1 / number;
        for (let i = 0; i < 100; i++) {
            a_n = (1 - a_n) * a_n * k;
        }
        return a_n;
    }
}

class Identicon extends Robohash {
    
    static _svgTemplate(color, backgroundColor, bodyNr, faceNr, eyesNr, mouthNr, accessoryNr) {
        return this._$svg(this._$clipPath(this._$robohash(color, backgroundColor, bodyNr, faceNr, eyesNr, mouthNr, accessoryNr)));
    }

    static _$clipPath(content) {
        return `
            <defs>
                <clipPath id="hexagon-clip" transform="translate(0,32)">
                    <path d="M251.6 17.34l63.53 110.03c5.72 9.9 5.72 22.1 0 32L251.6 269.4c-5.7 9.9-16.27 16-27.7 16H96.83c-11.43 0-22-6.1-27.7-16L5.6 159.37c-5.7-9.9-5.7-22.1 0-32L69.14 17.34c5.72-9.9 16.28-16 27.7-16H223.9c11.43 0 22 6.1 27.7 16z"/>
                </clipPath>
                <filter id="f1" >
                  <feGaussianBlur in="SourceAlpha" stdDeviation="5" result="blurOut" />
                  <feOffset in="blurOut" dx="1" dy="3" result="offsetBlur" />
                  <feFlood flood-color="#333" flood-opacity="0.71" result="offsetColor"/>
                  <feComposite in="offsetColor" in2="offsetBlur" operator="in" result="offsetBlur"/>
                  <feBlend in="SourceGraphic" in2="offsetBlur" mode="normal" />
                </filter>
            </defs>
            <path fill="white" d="M251.6 17.34l63.53 110.03c5.72 9.9 5.72 22.1 0 32L251.6 269.4c-5.7 9.9-16.27 16-27.7 16H96.83c-11.43 0-22-6.1-27.7-16L5.6 159.37c-5.7-9.9-5.7-22.1 0-32L69.14 17.34c5.72-9.9 16.28-16 27.7-16H223.9c11.43 0 22 6.1 27.7 16z"/>
            <g transform="scale(0.9) translate(16,-16)"  filter="url(#f1)">
                <g clip-path="url(#hexagon-clip)">${content}</g>
            </g>
            `
    }
}

class XIdenticon extends XElement {
    set address(address) {
        Identicon.render(address, this.$el);
    }
}

class NanoApi {

    static get API_URL() { return 'https://cdn.nimiq-network.com/branches/master/nimiq.js' }
    static get satoshis() { return 100000000 }

    static getApi() {
        this._api = this._api || new NanoApi();
        return this._api;
    }

    constructor() {
        this._apiInitialized = new Promise(async resolve => {
            await NanoApi._importApi();
            this.$ = {};
            Nimiq.init(async $ => {
                await this._onApiReady();
                resolve();
            }, e => this.onDifferentTabError(e));
        });
    }

    async _onApiReady() {
        await Nimiq.Crypto.prepareSyncCryptoWorker();
        this.$.walletStore = await new Nimiq.WalletStore();
        this.$.wallet = this.$.wallet || await this.$.walletStore.getDefault();
        this.onAddressChanged(this.address);
        this.onInitialized();
    }

    async connect() {
        await this._apiInitialized;
        this.$.consensus = await Nimiq.Consensus.nano();
        this.$.consensus.on('established', e => this._onConsensusEstablished());
        this.$.consensus.network.connect();
        this.$.consensus.blockchain.on('head-changed', e => this._headChanged());
        this.$.consensus.mempool.on('transaction-added', tx => this._transactionAdded(tx));
    }

    async _headChanged() {
        await this._apiInitialized;
        if (!this.$.consensus.established) return;
        const balance = await this._getBalance();
        if (this._balance === balance) return;
        this._balance = balance;
        this.onBalanceChanged(this.balance);
    }

    async _getAccount() {
        await this._apiInitialized;
        const account = await this.$.consensus.getAccount(this.$.wallet.address);
        return account || { balance: 0, nonce: 0 }
    }

    async _getBalance() {
        await this._apiInitialized;
        const account = await this._getAccount();
        return account.balance;
    }

    _onConsensusEstablished() {
        this._headChanged();
        this.onConsensusEstablished();
    }

    _transactionAdded(tx) {
        if (!tx.recipient.equals(this.$.wallet.address)) return;
        const sender = tx.senderPubKey.toAddress();
        this.onTransactionReceived(sender.toUserFriendlyAddress(), tx.value / NanoApi.satoshis, tx.fee);
    }

    /*
        Public API
    */
    async sendTransaction(recipient, value, fees = 0) {
        await this._apiInitialized;
        const recipientAddr = Nimiq.Address.fromUserFriendlyAddress(recipient);
        value = Math.round(Number(value) * NanoApi.satoshis);
        fees = Math.round(Number(fees) * NanoApi.satoshis);
        const tx = this.$.wallet.createTransaction(recipientAddr, value, fees, this.$.consensus.blockchain.height);
        return this.$.consensus.relayTransaction(tx);
    }

    async getAddress() {
        await this._apiInitialized;
        return this.address;
    }

    async getBalance() {
        await this._apiInitialized;
        return this.balance;
    }

    get address() {
        return this.$.wallet.address.toUserFriendlyAddress();
    }

    get balance() {
        return (this._balance / NanoApi.satoshis) || 0;
    }

    /**
     *
     *
     *
     * @return {Object} An object containing `privateKey` in native format and `address` in user-friendly format.
     */
    async generateKeyPair() {
        await this._apiInitialized;
        const keys = Nimiq.KeyPair.generate();
        const privKey = keys.privateKey;
        const address = keys.publicKey.toAddress();
        return {
            privateKey: privKey,
            address: address.toUserFriendlyAddress()
        }
    }

    async importKey(privateKey, persist = true) {
        await this._apiInitialized;
        const keyPair = Nimiq.KeyPair.fromPrivateKey(privateKey);
        this.$.wallet = new Nimiq.Wallet(keyPair);
        if (persist) await this.$.walletStore.put(this.$.wallet);
        return this.address;
    }

    async exportKey() {
        await this._apiInitialized;
        return this.$.wallet.keyPair.privateKey.toHex();
    }

    async lockWallet(pin) {
        await this._apiInitialized;
        return this.$.wallet.lock(pin);
    }

    async unlockWallet(pin) {
        await this._apiInitialized;
        return this.$.wallet.unlock(pin);
    }

    async importEncrypted(encryptedKey, password) {
        await this._apiInitialized;
        encryptedKey = Nimiq.BufferUtils.fromBase64(encryptedKey);
        this.$.wallet = await Nimiq.Wallet.loadEncrypted(encryptedKey, password);
        // this.$.walletStore = this.$.walletStore || await new Nimiq.WalletStore();
        // this.$.walletStore.put(this.$.wallet);
    }

    async exportEncrypted(password) {
        await this._apiInitialized;
        const exportedWallet = await this.$.wallet.exportEncrypted(password);
        return Nimiq.BufferUtils.toBase64(exportedWallet);
    }

    /** @param {string | Nimiq.Address} address
     * @return {Promise<string>} */
    async nim2ethAddress(address) {
        await this._apiInitialized;
        const addressObj = (typeof address  === 'string') ? await this.getUnfriendlyAddress(address) : address;
        const hash = await Nimiq.Hash.sha256(addressObj.serialize());
        return '0x' + Nimiq.BufferUtils.toHex(hash.subarray(0, 20));
    }

    /** @param {string} friendlyAddress */
    async getUnfriendlyAddress(friendlyAddress) {
        await this._apiInitialized;
        return Nimiq.Address.fromUserFriendlyAddress(friendlyAddress);
    }

    onInitialized() {
        console.log('Nimiq API ready to use');
        this.fire('nimiq-api-ready');
    }

    onAddressChanged(address) {
        console.log('address changed');
        this.fire('nimiq-account', address);
    }

    onConsensusEstablished() {
        console.log('consensus established');
        this.fire('nimiq-consensus-established', this.address);
    }

    onBalanceChanged(balance) {
        console.log('new balance:', balance);
        this.fire('nimiq-balance', balance);
    }

    onTransactionReceived(sender, value, fee) {
        console.log('received:', value, 'from:', sender, 'txfee:', fee);
        this.fire('nimiq-transaction', { sender: sender, value: value, fee: fee });
    }

    onDifferentTabError() {
        console.log('Nimiq API is already running in a different tab');
        this.fire('nimiq-different-tab-error');
    }

    static formatValue(number, decimals = 3) {
        number = Number(number);
        decimals = Math.pow(10, decimals);
        return Math.round(number * decimals) / decimals;
    }

    static formatValueInDollar(number) {
        number = Number(number);
        return this.formatValue(number * 17.1, 2);
    }

    static validateAddress(address) {
        try {
            this.isUserFriendlyAddress(address);
            return true;
        } catch (e) {
            return false;
        }
    }

    // Copied from: https://github.com/nimiq-network/core/blob/master/src/main/generic/consensus/base/account/Address.js

    static isUserFriendlyAddress(str) {
        str = str.replace(/ /g, '');
        if (str.substr(0, 2).toUpperCase() !== 'NQ') {
            throw new Error('Addresses start with NQ', 201);
        }
        if (str.length !== 36) {
            throw new Error('Addresses are 36 chars (ignoring spaces)', 202);
        }
        if (this._ibanCheck(str.substr(4) + str.substr(0, 4)) !== 1) {
            throw new Error('Address Checksum invalid', 203);
        }
    }

    static _ibanCheck(str) {
        const num = str.split('').map((c) => {
            const code = c.toUpperCase().charCodeAt(0);
            return code >= 48 && code <= 57 ? c : (code - 55).toString();
        }).join('');
        let tmp = '';

        for (let i = 0; i < Math.ceil(num.length / 6); i++) {
            tmp = (parseInt(tmp + num.substr(i * 6, 6)) % 97).toString();
        }

        return parseInt(tmp);
    }

    static _importApi() {
        return new Promise((resolve, reject) => {
            let script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = NanoApi.API_URL;
            script.addEventListener('load', () => resolve(script), false);
            script.addEventListener('error', () => reject(script), false);
            document.body.appendChild(script);
        });
    }

    setXElement(xElement) {
       this._xElement = xElement;
       this.fire = this._xElement.fire.bind(xElement);
    }

    // Copied from x-element.
    fire(eventType, detail = null, bubbles = true) { // Fire DOM-Event
        const params = { detail: detail, bubbles: bubbles };
        document.body.dispatchEvent(new CustomEvent(eventType, params));
    }
}

class ScreenIdenticons extends XScreen {

    html() {
        return `
            <h1>Choose Your Avatar</h1>
            <h2>Your Avatar will be unique to this Account. You can not change it later.</h2>
            <x-container>
                <div class="center" id="loading">
                    <x-loading-animation></x-loading-animation>
                    <h2>Mixing colors</h2>
                </div>
            </x-container>
            <a secondary>Generate More</a>
            <x-backdrop class="center">
                <x-address></x-address>
                <a button>Confirm</a>
                <a secondary>Back</a>
            </x-backdrop>
            `
    }

    onCreate() {
        this.$container = this.$('x-container');
        this.$loading = this.$('#loading');
        this.$address = this.$('x-address');
        this.$('[secondary]').addEventListener('click', e => this._generateIdenticons());
        this.$('[button]').addEventListener('click', e => this._onConfirm(e));
        this.$('x-backdrop').addEventListener('click', e => this._clearSelection());
    }

    _onEntry() {
        if (this._generated) return;
        return this._generateIdenticons();
    }

    _onExit(){
        this._clearIdenticons();
    }

    async _generateIdenticons() {
        const api = NanoApi.getApi();
        this._clearIdenticons();
        this._generated = true;
        const promises = [];
        for (var i = 0; i < 7; i++) { promises.push(api.generateKeyPair()); }
        const keyPairs = await Promise.all(promises);
        keyPairs.forEach(keyPair => this._generateIdenticon(keyPair));
        setTimeout(e => this.$el.setAttribute('active', true), 100);
        if(!this.$loading) return;
        this.$container.removeChild(this.$loading);
        this.$loading = null;
    }

    _generateIdenticon(keyPair) {
        const identicon = XIdenticon.createElement();
        this.$container.appendChild(identicon.$el);
        identicon.address = keyPair.address;
        identicon.addEventListener('click', e => this._onIdenticonSelected(keyPair, identicon));
    }

    _onIdenticonSelected(keyPair, identicon) {
        this.$('x-identicon.returning') && this.$('x-identicon.returning').classList.remove('returning');
        this._selectedKeyPair = keyPair;
        this._selectedIdenticon = identicon;
        this.$el.setAttribute('selected', true);
        identicon.$el.setAttribute('selected', true);
        this.$address.textContent = keyPair.address;
    }

    _clearSelection() {
        this._selectedKeyPair = null;
        if (!this._selectedIdenticon) return;
        this._selectedIdenticon.$el.classList.add('returning');
        this.$el.removeAttribute('selected');
        this._selectedIdenticon.$el.removeAttribute('selected');
    }

    _clearIdenticons() {
        this._generated = false;
        this._clearSelection();
        while(this.$container.querySelector('x-identicon')) {
            this.$container.removeChild(this.$container.querySelector('x-identicon'));
        }
        this.$el.removeAttribute('active');
    }

    _onConfirm(e) {
        this.fire('x-keypair', this._selectedKeyPair);
        e.stopPropagation();
    }
}

// Todo: refactor api such that addresses can be generated before full api is loaded
// Todo: [low priority] remove hack for overlay and find a general solution

class XSlideIndicator extends XElement {
    /** @param {number} nrOfSlides */
    init(nrOfSlides) {
        for (let i = 0; i < nrOfSlides; i++) {
            this.$el.appendChild(document.createElement('x-dot'));
        }
        this.isInitialized = true;
    }

    /** @param {number} state */
    show(state) {
        this.$el.style.display = 'flex';

        const dots = Array.from(this.$$('x-dot'));

        const onDots = dots.filter((x,i) => i <= state);

        const offDots = dots.filter((x,i) => i > state);

        onDots.forEach(x => x.setAttribute('on', ''));
        offDots.forEach(x => x.removeAttribute('on'));
    }

    hide() {
        this.$el.style.display = 'none';
    }
}

class XSlidesScreen extends XScreen {

    onCreate() {
        this.$slideIndicator = XSlideIndicator.createElement();
        this.$('x-slides').insertAdjacentElement('afterend', this.$slideIndicator.$el);
        this.$slideIndicator.init(this._filteredChildScreens.length);
        this.$slideIndicator.show(0);
    }

    /** @param {XState} nextState */
    async _onStateChange(nextState) {
        if (this._childScreenFilter.includes(nextState.leafId)) {
            this.$slideIndicator.hide();
        }
        else {
            this.$slideIndicator.show(this._getSlideIndex(nextState.leafId));
        }
    }

    /** ChildScreens with those ids will not count for indicator
     * @returns {string[]}
     */
    get _childScreenFilter() {
        return ['success', 'error', 'loading'].concat(this.__childScreenFilter);
    }

    /** Overwrite for additionally filtered childScreens
     * @returns {string[]}
     */
    get __childScreenFilter() {
        return [];
    }

    /** @returns {XScreen[]} */
    get _filteredChildScreens() {
        return Array.from(this._childScreens.entries())
            .filter(x => !this._childScreenFilter.includes(x[0]));
    }

    /** @param {string} childId
     *  @returns {number}
     */
    _getSlideIndex(childId) {
        return this._filteredChildScreens.findIndex(x => x[0] === childId);

    }
}

class XSuccessMark extends XElement {
    html() {
        const uniqueId = 'circleFill' + Math.round(Math.random() * 1000000).toString();
        return `
            <svg class="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 168 168">
                <radialGradient id="${uniqueId}" gradientUnits="userSpaceOnUse" gradientTransform="translate(-4, -4)">
                    <stop offset="1" stop-color="transparent">
                        <animate dur="0.4s" attributeName="offset" begin="indefinite" fill="freeze" from="1" to="0"
                        values="1;0"
                        keyTimes="0;1"
                        keySplines=".42 0 .58 1"
                        calcMode="spline" />
                    </stop>
                    <stop offset="1" stop-color="#64FFDA">
                        <animate dur="0.4s" attributeName="offset" begin="indefinite" fill="freeze" from="1" to="0"
                        values="1;0"
                        keyTimes="0;1"
                        keySplines=".42 0 .58 1"
                        calcMode="spline" />
                    </stop>
                </radialGradient>
                <path class="checkmark__circle" d="M88.1247411,2.6381084 L142.907644,34.2670322 C147.858061,37.125157 150.907644,42.4071893 150.907644,48.1234387 L150.907644,111.381286 C150.907644,117.097536 147.858061,122.379568 142.907644,125.237693 L88.1247411,156.866617 C83.1743239,159.724741 77.0751584,159.724741 72.1247411,156.866617 L17.3418381,125.237693 C12.3914209,122.379568 9.34183808,117.097536 9.34183808,111.381286 L9.34183808,48.1234387 C9.34183808,42.4071893 12.3914209,37.125157 17.3418381,34.2670322 L72.1247411,2.6381084 C77.0751584,-0.220016318 83.1743239,-0.220016318 88.1247411,2.6381084 Z" fill="url(#${uniqueId})" transform="translate(84.124741, 79.752363) rotate(30.000000) translate(-80.124741, -79.752363)"></path>
                <path class="checkmark__check" fill="none" d="M42.3 81.6l21.3 21.6 50.1-50.4" transform="translate(4, 4)" />
            </svg>`;
    }

    onCreate() {
        this.$$animate = this.$$('animate');
    }

    animate() {
        this.$el.classList.add('animate-success-mark');
        setTimeout(() => this.$$animate.forEach(el => el.beginElement()), 400);
        return new Promise(resolve => setTimeout(resolve, 1500))
    }
}

class ScreenSuccess extends XScreenFit {
    html() {
        return `
            <x-success-mark></x-success-mark>
            <h2 content></h2>
        `
    }

    children() { return [XSuccessMark] }

    _onEntry() {
        return this.$successMark.animate();
    }

    onCreate() {
        this.$h2 = this.$('h2');
    }

    show(message) {
        this.$h2.textContent = message;
    }
}

class ScreenLoading extends XScreenFit {
    html() {
        return `
            <x-loading-animation></x-loading-animation>
            <h2 content></h2>
        `
    }
}

class ScreenNoPasswordWarning extends XScreen {
    html() {
        return `
          <span icon-warning></span>
          <h2>WARNING:</h2>
          <h2>NOT FOR REAL USE</h2>
          <h2 secondary>This account is totally unsafe. Don't put any money here or you will loose it!</h2>
          <button>I understand</button>
          <a secondary>Take me back</button>
        `
    }

    onCreate() {
        this.$button = this.$('button');
        this.$a = this.$('a');
        this.$button.addEventListener('click', e => this._onConfirm());
        this.$a.addEventListener('click', e => this.goTo('create-password'));
    }

    _onConfirm() {
        const password = '';
        this.fire('x-encrypt-backup', password);
        this.goTo('loading');
    }
}

class XInput extends XElement {
    styles() { return ['x-input'] }

    onCreate() {
        this.$input = this.$('input');
        this.$input.addEventListener('input', e => this.__onInput(e)); // Note: this doens't work with checkbox or radio button
        this.$input.addEventListener('keypress', e => this.__onKeypress(e));
        this.$input.addEventListener('input', e => this.__onValueChanged(e));
        this.$input.addEventListener('keyup', e => this.__onValueChanged(e));
        this.$form = this.$('form');
        if (this.$form) this.$form.addEventListener('submit', e => this._onSubmit(e));
    }

    get value() {
        return this.$input.value;
    }

    set value(value) {
        const oldValue = this.$input.value;
        this.$input.value = value;
        if (value !== oldValue) this.__onValueChanged();
    }

    _onSubmit(e) {
        e.preventDefault();
        e.stopPropagation();
        this._submit();
    }

    __onValueChanged(e) {
        if (this._autosubmit) this._submit();
        this._onValueChanged(e);
        this._notifyValidity();
    }

    __onInput(e) {}

    __onKeyup(e) {}

    __onKeypress(e) {}

    _onValueChanged() {}

    _submit() {
        if (!this._validate(this.value)) return;
        this.$input.blur();
        requestAnimationFrame(_ => this.fire(this.__tagName, this.value)); // Hack to hide keyboard on iOS even after paste 
    }

    focus() {
        requestAnimationFrame(_ => this.$input.focus()); 
    }

    async _onInvalid() {
        await this.animate('shake');
        this.value = '';
    }

    _validate() { return this.$input.checkValidity(); }

    get _autosubmit() { return false; }

    _notifyValidity() {
        const isValid = this._validate(this.value);
        this.fire(this.__tagName + '-valid', isValid);
    }
}

// Note: If you override a setter you need to override the getter, too.
// See: https://stackoverflow.com/questions/28950760/override-a-setter-and-the-getter-must-also-be-overridden

class XPasswordInput extends XInput {
    html() {
        return `
            <form action="/">
                <input type="password" placeholder="Enter Password" required minlength="10">
            </form>
        `;
    }

    _onValueChanged() {
      this.fire(this.__tagName + '-change', this.value);
    }
}

class XPasswordIndicator extends XElement {
    html() {
        return `
            <div class="label">Strength:</div>
            <meter max="100" low="10" optimum="100"></meter>
        `;
    }

    setStrength(strength) { // 0 for none, 1 for bad, 2 for ok, 3 for good
      this.$('meter').setAttribute('value', this._getMeterValue(strength));
    }

    _getMeterValue(strength) {
      switch(strength) {
        case 0:
          return 0;
        case 1:
          return 10;
        case 2:
          return 70;
        case 3:
          return 100;
      }
    }
}

class XPasswordSetter extends XElement {
    html() {
        return `
            <x-password-input></x-password-input>
            <x-password-indicator></x-password-indicator>
        `;
    }

    // styles() { return ['center'] }

    types() {
        /** @type {XPasswordInput} */
        this.$passwordInput = null;
        /*** @type {XPasswordIndicator} */
        this.$passwordIndicator = null;
    }

    children() {
      return [XPasswordInput, XPasswordIndicator];
    }

    onCreate() {
      this.addEventListener('x-password-input-change', e => this._onPasswordUpdate(e.detail));
    }

    focus() {
      this.$passwordInput.focus();
    }

    get value() {
      return this.$passwordInput.value;
    }

    /** @param {string} value */
    set value(value) {
      this.$passwordInput.value = value;
    }

    _onPasswordUpdate(value) {
      const strength = this._getPasswordStrength(value);
      this.$passwordIndicator.setStrength(strength);
      this.fire(this.__tagName + '-valid', strength === 3);
    }

    /** @param {string} password
     * @return {number} */
    _getPasswordStrength(password) {
      if (password.length === 0) return 0;
      if (password.length < 5) return 1;
      if (password.length < 10) return 2;
      return 3;
    }
}

// Todo: Can we hack that the "save this password" dialog occurs before navigating to a different page?

class ScreenCreatePassword extends XScreenFit {
    html() {
        return `
          <h2 secondary>Create a password to encrypt your account access information. Make sure you memorize it well because there is no way to recover it.</h2>
          <x-password-setter></x-password-setter>
          <x-grow></x-grow>
          <button disabled="1">Next</button>
          <a secondary>Continue without password</button>
      `
    }

    types() {
        /** @type {XPasswordSetter} */
        this.$passwordSetter = null;
    }

    children() { return [XPasswordSetter] }

    onCreate() {
        this.$nextButton = this.$('button');
        this.$noPasswordLink = this.$('a');
        this.$nextButton.addEventListener('click', e => this._onPasswordInput());
        this.$noPasswordLink.addEventListener('click', e => this.goTo('no-password'));
        this.addEventListener('x-password-input', e => this._onPasswordInput());
        this.addEventListener('x-password-setter-valid', e => this._validityChanged(e.detail));
    }

    _onBeforeEntry() {
        this.$passwordSetter.value = '';
    }

    _onEntry() {
        this.$passwordSetter.focus();
    }

    _onPasswordInput() {
        const password = this.$passwordSetter.value;
        this.fire('x-encrypt-backup', password);
        this.goTo('loading');
    }

    _validityChanged(valid) {
        if (valid) {
            this.$nextButton.removeAttribute('disabled');
        } else {
            this.$nextButton.setAttribute('disabled', true);
        }
    }
}

// Todo: Password confirm, make visible hover eye

class IdenticonImg extends Identicon {

    static async image(text) {
        this.$lib = await this._includeLib();
        const svg = this.svg(text);
        const dataUrl = `data:image/svg+xml;base64,${btoa(svg)}`;
        return this._loadImage(dataUrl);
    }

    static _loadImage(dataUrl) {
        return new Promise((resolve, err) => {
            const img = document.createElement('img');
            img.addEventListener('load', e => resolve(img), { once: true });
            img.src = dataUrl;
        });
    }

    static async _includeLib() {
        const lib = await this._fetchLib();
        const $lib = document.createElement('x-lib');
        $lib.innerHTML = lib;
        return $lib;
    }

    static _fetchLib() {
        return fetch('/libraries/robohash/dist/robohash.min.svg').then(response => response.text());
    }

    static _$use(part, index) {
        const selector = '#'+part + '-' + this._assetIndex(index);
        const $part = this.$lib.querySelector(selector);
        return `<g transform="translate(0,20)">${$part.innerHTML}</g>`;
    }

}

/* jquery-qrcode v0.14.0 - https://larsjung.de/jquery-qrcode/ */
var qrCodeGenerator=null;
var QrEncoder=function(){};QrEncoder.render=function(A,C){C.appendChild(qrCodeGenerator(A));};
(function(A){function C(u,k,n,f){var g={},b=A(n,k);b.addData(u);b.make();f=f||0;var a=b.getModuleCount(),h=b.getModuleCount()+2*f;g.text=u;g.level=k;g.version=n;g.moduleCount=h;g.isDark=function(h,d){h-=f;d-=f;return 0>h||h>=a||0>d||d>=a?!1:b.isDark(h,d)};return g}function D(u,k,n,f,g,b,a,h,z,d){function c(h,a,d,c,l,e,f){h?(u.lineTo(a+e,d+f), u.arcTo(a,d,c,l,b)):u.lineTo(a,d);}a?u.moveTo(k+b,n):u.moveTo(k,n);c(h,f,n,f,g,-b,0);c(z,f,g,k,g,0,-b);c(d,k,g,k,n,b,0);c(a,k,n,f,n,0,b);}function B(u,k,n,f,g,
b,a,h,z,d){function c(a,h,d,c){u.moveTo(a+d,h);u.lineTo(a,h);u.lineTo(a,h+c);u.arcTo(a,h,a+d,h,b);}a&&c(k,n,b,b);h&&c(f,n,-b,b);z&&c(f,g,-b,-b);d&&c(k,g,b,-b);}var v={minVersion:1,maxVersion:40,ecLevel:"L",left:0,top:0,size:200,fill:"#000",background:null,text:"no text",radius:.5,quiet:0};qrCodeGenerator=function(u){var k={};Object.assign(k,v,u);u=document.createElement("canvas");u.width=k.size;u.height=k.size;b:{var n=k.text,f=k.ecLevel,g=k.minVersion,b=k.maxVersion,a=k.quiet;g=Math.max(1,g||1);for(b=
Math.min(40,b||40);g<=b;g+=1)try{var h=C(n,f,g,a);break b}catch(r){}h=void 0;}if(h){n=u.getContext("2d");k.background&&(n.fillStyle=k.background, n.fillRect(k.left,k.top,k.size,k.size));f=h.moduleCount;b=k.size/f;n.beginPath();for(a=0;a<f;a+=1)for(g=0;g<f;g+=1){var z=n,d=k.left+g*b,c=k.top+a*b,t=a,x=g,m=h.isDark,w=d+b,l=c+b,e=t-1,p=t+1,G=x-1,E=x+1,H=Math.floor(Math.max(.5,k.radius)*b),q=m(t,x),I=m(e,G),y=m(e,x);e=m(e,E);var F=m(t,E);E=m(p,E);x=m(p,x);p=m(p,G);t=m(t,G);q?D(z,d,c,w,l,H,!y&&!t,!y&&!F,
!x&&!F,!x&&!t):B(z,d,c,w,l,H,y&&t&&I,y&&F&&e,x&&F&&E,x&&t&&p);}n.fillStyle=k.fill;n.fill();k=u;}else k=null;return k};})(function(){return function(){function A(f,g){if("undefined"==typeof f.length)throw Error(f.length+"/"+g);var b=function(){for(var a=0;a<f.length&&0==f[a];)a+=1;for(var b=Array(f.length-a+g),d=0;d<f.length-a;d+=1)b[d]=f[d+a];return b}(),a={getAt:function(a){return b[a]},getLength:function(){return b.length},multiply:function(h){for(var b=Array(a.getLength()+h.getLength()-1),d=0;d<a.getLength();d+=
1)for(var c=0;c<h.getLength();c+=1)b[d+c]^=v.gexp(v.glog(a.getAt(d))+v.glog(h.getAt(c)));return A(b,0)},mod:function(h){if(0>a.getLength()-h.getLength())return a;for(var b=v.glog(a.getAt(0))-v.glog(h.getAt(0)),d=Array(a.getLength()),c=0;c<a.getLength();c+=1)d[c]=a.getAt(c);for(c=0;c<h.getLength();c+=1)d[c]^=v.gexp(v.glog(h.getAt(c))+b);return A(d,0).mod(h)}};return a}var C=function(f,g){var b=D[g],a=null,h=0,z=null,d=[],c={},t=function(c,g){for(var l=h=4*f+17,e=Array(l),p=0;p<l;p+=1){e[p]=Array(l);
for(var m=0;m<l;m+=1)e[p][m]=null;}a=e;x(0,0);x(h-7,0);x(0,h-7);l=B.getPatternPosition(f);for(e=0;e<l.length;e+=1)for(p=0;p<l.length;p+=1){m=l[e];var t=l[p];if(null==a[m][t])for(var n=-2;2>=n;n+=1)for(var q=-2;2>=q;q+=1)a[m+n][t+q]=-2==n||2==n||-2==q||2==q||0==n&&0==q;}for(l=8;l<h-8;l+=1)null==a[l][6]&&(a[l][6]=0==l%2);for(l=8;l<h-8;l+=1)null==a[6][l]&&(a[6][l]=0==l%2);l=B.getBCHTypeInfo(b<<3|g);for(e=0;15>e;e+=1)p=!c&&1==(l>>e&1), a[6>e?e:8>e?e+1:h-15+e][8]=p, a[8][8>e?h-e-1:9>e?15-e:14-e]=p;a[h-8][8]=
!c;if(7<=f){l=B.getBCHTypeNumber(f);for(e=0;18>e;e+=1)p=!c&&1==(l>>e&1), a[Math.floor(e/3)][e%3+h-8-3]=p;for(e=0;18>e;e+=1)p=!c&&1==(l>>e&1), a[e%3+h-8-3][Math.floor(e/3)]=p;}if(null==z){l=u.getRSBlocks(f,b);e=k();for(p=0;p<d.length;p+=1)m=d[p], e.put(m.getMode(),4), e.put(m.getLength(),B.getLengthInBits(m.getMode(),f)), m.write(e);for(p=m=0;p<l.length;p+=1)m+=l[p].dataCount;if(e.getLengthInBits()>8*m)throw Error("code length overflow. ("+e.getLengthInBits()+">"+8*m+")");for(e.getLengthInBits()+4<=8*m&&
e.put(0,4);0!=e.getLengthInBits()%8;)e.putBit(!1);for(;!(e.getLengthInBits()>=8*m);){e.put(236,8);if(e.getLengthInBits()>=8*m)break;e.put(17,8);}var w=0;m=p=0;t=Array(l.length);n=Array(l.length);for(q=0;q<l.length;q+=1){var y=l[q].dataCount,v=l[q].totalCount-y;p=Math.max(p,y);m=Math.max(m,v);t[q]=Array(y);for(var r=0;r<t[q].length;r+=1)t[q][r]=255&e.getBuffer()[r+w];w+=y;r=B.getErrorCorrectPolynomial(v);y=A(t[q],r.getLength()-1).mod(r);n[q]=Array(r.getLength()-1);for(r=0;r<n[q].length;r+=1)v=r+y.getLength()-
n[q].length, n[q][r]=0<=v?y.getAt(v):0;}for(r=e=0;r<l.length;r+=1)e+=l[r].totalCount;e=Array(e);for(r=w=0;r<p;r+=1)for(q=0;q<l.length;q+=1)r<t[q].length&&(e[w]=t[q][r], w+=1);for(r=0;r<m;r+=1)for(q=0;q<l.length;q+=1)r<n[q].length&&(e[w]=n[q][r], w+=1);z=e;}l=z;e=-1;p=h-1;m=7;t=0;n=B.getMaskFunction(g);for(q=h-1;0<q;q-=2)for(6==q&&--q;;){for(r=0;2>r;r+=1)null==a[p][q-r]&&(w=!1, t<l.length&&(w=1==(l[t]>>>m&1)), n(p,q-r)&&(w=!w), a[p][q-r]=w, --m, -1==m&&(t+=1,m=7));p+=e;if(0>p||h<=p){p-=e;e=-e;break}}},x=function(b,
d){for(var c=-1;7>=c;c+=1)if(!(-1>=b+c||h<=b+c))for(var e=-1;7>=e;e+=1)-1>=d+e||h<=d+e||(a[b+c][d+e]=0<=c&&6>=c&&(0==e||6==e)||0<=e&&6>=e&&(0==c||6==c)||2<=c&&4>=c&&2<=e&&4>=e?!0:!1);};c.addData=function(a){a=n(a);d.push(a);z=null;};c.isDark=function(c,b){if(0>c||h<=c||0>b||h<=b)throw Error(c+","+b);return a[c][b]};c.getModuleCount=function(){return h};c.make=function(){for(var a=0,h=0,b=0;8>b;b+=1){t(!0,b);var d=B.getLostPoint(c);if(0==b||a>d)a=d, h=b;}t(!1,h);};return c};C.stringToBytes=function(f){for(var g=
[],b=0;b<f.length;b++){var a=f.charCodeAt(b);128>a?g.push(a):2048>a?g.push(192|a>>6,128|a&63):55296>a||57344<=a?g.push(224|a>>12,128|a>>6&63,128|a&63):(b++, a=65536+((a&1023)<<10|f.charCodeAt(b)&1023), g.push(240|a>>18,128|a>>12&63,128|a>>6&63,128|a&63));}return g};var D={L:1,M:0,Q:3,H:2},B=function(){var f=[[],[6,18],[6,22],[6,26],[6,30],[6,34],[6,22,38],[6,24,42],[6,26,46],[6,28,50],[6,30,54],[6,32,58],[6,34,62],[6,26,46,66],[6,26,48,70],[6,26,50,74],[6,30,54,78],[6,30,56,82],[6,30,58,86],[6,34,62,
90],[6,28,50,72,94],[6,26,50,74,98],[6,30,54,78,102],[6,28,54,80,106],[6,32,58,84,110],[6,30,58,86,114],[6,34,62,90,118],[6,26,50,74,98,122],[6,30,54,78,102,126],[6,26,52,78,104,130],[6,30,56,82,108,134],[6,34,60,86,112,138],[6,30,58,86,114,142],[6,34,62,90,118,146],[6,30,54,78,102,126,150],[6,24,50,76,102,128,154],[6,28,54,80,106,132,158],[6,32,58,84,110,136,162],[6,26,54,82,110,138,166],[6,30,58,86,114,142,170]],g={},b=function(a){for(var h=0;0!=a;)h+=1, a>>>=1;return h};g.getBCHTypeInfo=function(a){for(var h=
a<<10;0<=b(h)-b(1335);)h^=1335<<b(h)-b(1335);return(a<<10|h)^21522};g.getBCHTypeNumber=function(a){for(var h=a<<12;0<=b(h)-b(7973);)h^=7973<<b(h)-b(7973);return a<<12|h};g.getPatternPosition=function(a){return f[a-1]};g.getMaskFunction=function(a){switch(a){case 0:return function(a,b){return 0==(a+b)%2};case 1:return function(a,b){return 0==a%2};case 2:return function(a,b){return 0==b%3};case 3:return function(a,b){return 0==(a+b)%3};case 4:return function(a,b){return 0==(Math.floor(a/2)+Math.floor(b/
3))%2};case 5:return function(a,b){return 0==a*b%2+a*b%3};case 6:return function(a,b){return 0==(a*b%2+a*b%3)%2};case 7:return function(a,b){return 0==(a*b%3+(a+b)%2)%2};default:throw Error("bad maskPattern:"+a);}};g.getErrorCorrectPolynomial=function(a){for(var b=A([1],0),f=0;f<a;f+=1)b=b.multiply(A([1,v.gexp(f)],0));return b};g.getLengthInBits=function(a,b){if(4!=a||1>b||40<b)throw Error("mode: "+a+"; type: "+b);return 10>b?8:16};g.getLostPoint=function(a){for(var b=a.getModuleCount(),f=0,d=0;d<
b;d+=1)for(var c=0;c<b;c+=1){for(var g=0,n=a.isDark(d,c),m=-1;1>=m;m+=1)if(!(0>d+m||b<=d+m))for(var k=-1;1>=k;k+=1)0>c+k||b<=c+k||(0!=m||0!=k)&&n==a.isDark(d+m,c+k)&&(g+=1);5<g&&(f+=3+g-5);}for(d=0;d<b-1;d+=1)for(c=0;c<b-1;c+=1)if(g=0, a.isDark(d,c)&&(g+=1), a.isDark(d+1,c)&&(g+=1), a.isDark(d,c+1)&&(g+=1), a.isDark(d+1,c+1)&&(g+=1), 0==g||4==g)f+=3;for(d=0;d<b;d+=1)for(c=0;c<b-6;c+=1)a.isDark(d,c)&&!a.isDark(d,c+1)&&a.isDark(d,c+2)&&a.isDark(d,c+3)&&a.isDark(d,c+4)&&!a.isDark(d,c+5)&&a.isDark(d,c+6)&&
(f+=40);for(c=0;c<b;c+=1)for(d=0;d<b-6;d+=1)a.isDark(d,c)&&!a.isDark(d+1,c)&&a.isDark(d+2,c)&&a.isDark(d+3,c)&&a.isDark(d+4,c)&&!a.isDark(d+5,c)&&a.isDark(d+6,c)&&(f+=40);for(c=g=0;c<b;c+=1)for(d=0;d<b;d+=1)a.isDark(d,c)&&(g+=1);return f+Math.abs(100*g/b/b-50)/5*10};return g}(),v=function(){for(var f=Array(256),g=Array(256),b=0;8>b;b+=1)f[b]=1<<b;for(b=8;256>b;b+=1)f[b]=f[b-4]^f[b-5]^f[b-6]^f[b-8];for(b=0;255>b;b+=1)g[f[b]]=b;return{glog:function(a){if(1>a)throw Error("glog("+a+")");return g[a]},
gexp:function(a){for(;0>a;)a+=255;for(;256<=a;)a-=255;return f[a]}}}(),u=function(){var f=[[1,26,19],[1,26,16],[1,26,13],[1,26,9],[1,44,34],[1,44,28],[1,44,22],[1,44,16],[1,70,55],[1,70,44],[2,35,17],[2,35,13],[1,100,80],[2,50,32],[2,50,24],[4,25,9],[1,134,108],[2,67,43],[2,33,15,2,34,16],[2,33,11,2,34,12],[2,86,68],[4,43,27],[4,43,19],[4,43,15],[2,98,78],[4,49,31],[2,32,14,4,33,15],[4,39,13,1,40,14],[2,121,97],[2,60,38,2,61,39],[4,40,18,2,41,19],[4,40,14,2,41,15],[2,146,116],[3,58,36,2,59,37],[4,
36,16,4,37,17],[4,36,12,4,37,13],[2,86,68,2,87,69],[4,69,43,1,70,44],[6,43,19,2,44,20],[6,43,15,2,44,16],[4,101,81],[1,80,50,4,81,51],[4,50,22,4,51,23],[3,36,12,8,37,13],[2,116,92,2,117,93],[6,58,36,2,59,37],[4,46,20,6,47,21],[7,42,14,4,43,15],[4,133,107],[8,59,37,1,60,38],[8,44,20,4,45,21],[12,33,11,4,34,12],[3,145,115,1,146,116],[4,64,40,5,65,41],[11,36,16,5,37,17],[11,36,12,5,37,13],[5,109,87,1,110,88],[5,65,41,5,66,42],[5,54,24,7,55,25],[11,36,12,7,37,13],[5,122,98,1,123,99],[7,73,45,3,74,46],
[15,43,19,2,44,20],[3,45,15,13,46,16],[1,135,107,5,136,108],[10,74,46,1,75,47],[1,50,22,15,51,23],[2,42,14,17,43,15],[5,150,120,1,151,121],[9,69,43,4,70,44],[17,50,22,1,51,23],[2,42,14,19,43,15],[3,141,113,4,142,114],[3,70,44,11,71,45],[17,47,21,4,48,22],[9,39,13,16,40,14],[3,135,107,5,136,108],[3,67,41,13,68,42],[15,54,24,5,55,25],[15,43,15,10,44,16],[4,144,116,4,145,117],[17,68,42],[17,50,22,6,51,23],[19,46,16,6,47,17],[2,139,111,7,140,112],[17,74,46],[7,54,24,16,55,25],[34,37,13],[4,151,121,5,
152,122],[4,75,47,14,76,48],[11,54,24,14,55,25],[16,45,15,14,46,16],[6,147,117,4,148,118],[6,73,45,14,74,46],[11,54,24,16,55,25],[30,46,16,2,47,17],[8,132,106,4,133,107],[8,75,47,13,76,48],[7,54,24,22,55,25],[22,45,15,13,46,16],[10,142,114,2,143,115],[19,74,46,4,75,47],[28,50,22,6,51,23],[33,46,16,4,47,17],[8,152,122,4,153,123],[22,73,45,3,74,46],[8,53,23,26,54,24],[12,45,15,28,46,16],[3,147,117,10,148,118],[3,73,45,23,74,46],[4,54,24,31,55,25],[11,45,15,31,46,16],[7,146,116,7,147,117],[21,73,45,
7,74,46],[1,53,23,37,54,24],[19,45,15,26,46,16],[5,145,115,10,146,116],[19,75,47,10,76,48],[15,54,24,25,55,25],[23,45,15,25,46,16],[13,145,115,3,146,116],[2,74,46,29,75,47],[42,54,24,1,55,25],[23,45,15,28,46,16],[17,145,115],[10,74,46,23,75,47],[10,54,24,35,55,25],[19,45,15,35,46,16],[17,145,115,1,146,116],[14,74,46,21,75,47],[29,54,24,19,55,25],[11,45,15,46,46,16],[13,145,115,6,146,116],[14,74,46,23,75,47],[44,54,24,7,55,25],[59,46,16,1,47,17],[12,151,121,7,152,122],[12,75,47,26,76,48],[39,54,24,
14,55,25],[22,45,15,41,46,16],[6,151,121,14,152,122],[6,75,47,34,76,48],[46,54,24,10,55,25],[2,45,15,64,46,16],[17,152,122,4,153,123],[29,74,46,14,75,47],[49,54,24,10,55,25],[24,45,15,46,46,16],[4,152,122,18,153,123],[13,74,46,32,75,47],[48,54,24,14,55,25],[42,45,15,32,46,16],[20,147,117,4,148,118],[40,75,47,7,76,48],[43,54,24,22,55,25],[10,45,15,67,46,16],[19,148,118,6,149,119],[18,75,47,31,76,48],[34,54,24,34,55,25],[20,45,15,61,46,16]],g=function(a,b){var d={};d.totalCount=a;d.dataCount=b;return d},
b={},a=function(a,b){switch(b){case D.L:return f[4*(a-1)];case D.M:return f[4*(a-1)+1];case D.Q:return f[4*(a-1)+2];case D.H:return f[4*(a-1)+3]}};b.getRSBlocks=function(b,f){var d=a(b,f);if("undefined"==typeof d)throw Error("bad rs block @ typeNumber:"+b+"/errorCorrectLevel:"+f);for(var c=d.length/3,h=[],k=0;k<c;k+=1)for(var m=d[3*k],n=d[3*k+1],l=d[3*k+2],e=0;e<m;e+=1)h.push(g(n,l));return h};return b}(),k=function(){var f=[],g=0,b={getBuffer:function(){return f},getAt:function(a){return 1==(f[Math.floor(a/
8)]>>>7-a%8&1)},put:function(a,f){for(var g=0;g<f;g+=1)b.putBit(1==(a>>>f-g-1&1));},getLengthInBits:function(){return g},putBit:function(a){var b=Math.floor(g/8);f.length<=b&&f.push(0);a&&(f[b]|=128>>>g%8);g+=1;}};return b},n=function(f){var g=C.stringToBytes(f);return{getMode:function(){return 4},getLength:function(b){return g.length},write:function(b){for(var a=0;a<g.length;a+=1)b.put(g[a],8);}}};return C}()}());

class WalletBackup {

    static get PHI() { return 1.618 }
    static get WIDTH() { return 300 * this.PHI }
    static get HEIGHT() { return this.WIDTH * this.PHI }
    static get IDENTICON_SIZE() { return this.WIDTH / this.PHI }
    static get QR_SIZE() { return this.WIDTH * (1 - 1 / this.PHI) }
    static get PADDING() { return 8 }

    constructor(address, privateKey) {
        this._width = WalletBackup.WIDTH;
        this._height = WalletBackup.HEIGHT;
        const $canvas = document.createElement('canvas');
        $canvas.width = this._width;
        $canvas.height = this._height;
        this.$canvas = $canvas;
        this._address = address;
        this._ctx = $canvas.getContext('2d');
        this._drawPromise = this._draw(address, privateKey);
    }

    static calculateQrPosition(walletBackupWidth = WalletBackup.WIDTH, walletBackupHeight = WalletBackup.HEIGHT) {
        const size = WalletBackup.QR_SIZE;
        const x = (walletBackupWidth - size) / 2;
        const y = (walletBackupHeight + walletBackupHeight / WalletBackup.PHI) / 2 - size / 2;
        const padding = WalletBackup.PADDING * 1.5;
        return { x, y, size, padding };
    }

    filename() {
        return this._address.replace(/ /g, '-') + '.png';
    }

    async toDataUrl() {
        await this._drawPromise;
        return this.$canvas.toDataURL().replace('#', '%23');
    }

    async toObjectUrl() {
        await this._drawPromise;
        return this._toObjectUrl();
    }

    _toObjectUrl() {
        return new Promise(resolve => {
            this.$canvas.toBlob(blob => {
                const url = URL.createObjectURL(blob);
                resolve(url);
            });
        })
    }

    _draw(address, privateKey) {
        this._drawBackgroundGradient();
        this._drawPrivateKey(privateKey);

        this._setFont();
        this._drawAddress(address);
        this._drawHeader();

        return this._drawIdenticon(address);
    }

    async _drawIdenticon(address) {
        const $img = await IdenticonImg.image(address);
        const size = WalletBackup.IDENTICON_SIZE;
        const pad = (this._width - size) / 2;
        const x = pad;
        const y = this._height - this._width - size / 2;
        this._ctx.drawImage($img, x, y, size, size);
    }

    _setFont() {
        const ctx = this._ctx;
        ctx.fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", Helvetica, Arial, sans-serif';
        ctx.textAlign = 'center';
    }

    _drawHeader() {
        const ctx = this._ctx;
        const x = this._width / 2;
        const y = WalletBackup.PADDING * 6;
        ctx.font = '500 20px ' + ctx.fontFamily;
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.fillText('WALLET BACKUP', x, y);
    }

    _drawAddress(address) {
        const ctx = this._ctx;
        const x = this._width / 2;
        const y = this._width;
        ctx.font = '500 15px ' + ctx.fontFamily;
        ctx.fillStyle = 'white';
        ctx.fillText(address, x, y);
    }

    _drawPrivateKey(privateKey) {
        const $el = document.createElement('div');
        QrEncoder.render({
            text: privateKey,
            radius: 0.8,
            ecLevel: 'Q',
            fill: '#2e0038',
            background: 'transparent',
            size: Math.min(240, (window.innerWidth - 64))
        }, $el);

        const $canvas = $el.querySelector('canvas');
        const qrPosition = WalletBackup.calculateQrPosition(this._width, this._height);

        this._ctx.fillStyle = 'white';
        this._ctx.strokeStyle = 'white';
        this._roundRect(qrPosition.x, qrPosition.y, qrPosition.size, qrPosition.size, 16, true);

        const padding = qrPosition.padding;
        this._ctx.drawImage($canvas, qrPosition.x + padding, qrPosition.y + padding, qrPosition.size - 2 * padding,
            qrPosition.size - 2 * padding);
    }

    _drawBackgroundGradient() {
        this._ctx.fillStyle = 'white';
        this._ctx.fillRect(0, 0, this._width, this._height);
        const gradient = this._ctx.createLinearGradient(0, 0, 0, this._height);
        gradient.addColorStop(0, '#536DFE');
        gradient.addColorStop(1, '#a553fe');
        this._ctx.fillStyle = gradient;
        this._ctx.strokeStyle = 'transparent';
        this._roundRect(0, 0, this._width, this._height, 16, true);
    }

    _roundRect(x, y, width, height, radius, fill, stroke) {
        const ctx = this._ctx;
        if (typeof stroke === 'undefined') {
            stroke = true;
        }
        if (typeof radius === 'undefined') {
            radius = 5;
        }
        if (typeof radius === 'number') {
            radius = { tl: radius, tr: radius, br: radius, bl: radius };
        } else {
            var defaultRadius = { tl: 0, tr: 0, br: 0, bl: 0 };
            for (var side in defaultRadius) {
                radius[side] = radius[side] || defaultRadius[side];
            }
        }
        ctx.beginPath();
        ctx.moveTo(x + radius.tl, y);
        ctx.lineTo(x + width - radius.tr, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
        ctx.lineTo(x + width, y + height - radius.br);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
        ctx.lineTo(x + radius.bl, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
        ctx.lineTo(x, y + radius.tl);
        ctx.quadraticCurveTo(x, y, x + radius.tl, y);
        ctx.closePath();
        if (fill) {
            ctx.fill();
        }
        if (stroke) {
            ctx.stroke();
        }
    }
}

// Todo: [high priority] Encrypted Private Key should have a version and a clear documentation

class XToast extends XElement {

    constructor() {
        super(document.createElement('proxy'));  // create a proxy in parent XElement. The actual toast is a XToastContainer attached to the document's body.
    }

    show(message) {
        XToast.show(message);
    }
    
    static _initContainer(){
        const parent = document.body;
        const $container = XToastContainer.createElement();
        parent.appendChild($container.$el);
        XToast.$toastContainer = $container;
    }

    static show(message){
        if(!XToast.$toastContainer) this._initContainer();
        this.$toastContainer.show(message);
    }
}

class XToastContainer extends XElement {
    html() { return `<x-toast></x-toast>` }

    show(message) {
        const $toast = this.$('x-toast');
        $toast.textContent = message;
        this.animate('x-toast-show');
    }
}

// Inspired by: https://material.io/guidelines/components/snackbars-toasts.html#snackbars-toasts-specs

class XDownloadableImage extends XElement {
    static get LONG_TOUCH_DURATION() {
        return 800;
    }

    static get DOWNLOAD_DURATION() {
        return 1500;
    }

    html() {
        return `
            <a>
                <img draggable="false">
                <p>&nbsp;</p>
                <button>Download</button>
            </a>
            <svg long-touch-indicator xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
                <defs>
                    <clipPath id="hexClip">
                        <path clip-rule="evenodd" d="M16 4.29h32l16 27.71l-16 27.71h-32l-16 -27.71zM20.62 12.29h22.76l11.38 19.71l-11.38 19.71h-22.76l-11.38 -19.71z"/>
                    </clipPath>
                </defs>
                <path fill-rule="evenodd" d="M16 4.29h32l16 27.71l-16 27.71h-32l-16 -27.71zM20.62 12.29h22.76l11.38 19.71l-11.38 19.71h-22.76l-11.38 -19.71z" fill="#FFFFFF" opacity="0.2"/>
                <g clip-path="url(#hexClip)">
                    <circle id="circle" cx="32" cy="32" r="16" fill="none" stroke-width="32" stroke-dasharray="100.53 100.53" transform="rotate(-120 32 32)"/>
                </g>
            </svg>
            <p></p>`;
    }

    onCreate() {
        this._src = null;
        this._filename = 'image';
        this._longTouchStart = 0;
        this._longTouchTimeout = null;
        this._indicatorHideTimeout = null;
        this._blurTimeout = null;
        this.$a = this.$('a');
        this.$img = this.$('img');
        this.$p = this.$('p');
        this.$longTouchIndicator = this.$('[long-touch-indicator]');
        this._onWindowBlur = this._onWindowBlur.bind(this);
        this.addEventListener('mousedown', e => this._onMouseDown(e)); // also gets triggered after touchstart
        this.addEventListener('touchstart', e => this._onTouchStart());
        this.addEventListener('touchend', e => this._onTouchEnd());
    }

    children() {
        return [XToast];
    }

    set src(src) {
        this._src = src;
        this.$img.src = src;
        this._setupDownload();
    }

    /** @param {string} filename */
    set filename(filename) {
        this._filename = filename;
        this._setupDownload();
    }

    _setupDownload() {
        if (this._supportsNativeDownload())
            this._setupNativeDownload();
        else
            this._setupFallbackDownload();
    }

    _setupNativeDownload() {
        this.$a.href = this._src;
        this.$a.download = this._filename;
        if (!this.$longTouchIndicator) return;
        this.$el.removeChild(this.$longTouchIndicator);
        this.$longTouchIndicator = null;
    }

    _setupFallbackDownload() {
        // Hack to make image downloadable on iOS via long tap.
        this.$a.href = 'javascript:void(0);';
    }

    _supportsNativeDownload() { // Detect if browser supports native `download` attribute
        return typeof this.$a.download !== 'undefined';
    }

    _onMouseDown(e) {
        if(e.button === 0) { // primary button
            if (!this._supportsNativeDownload()) return;
            this._onDownloadStart();
        }
        else if(e.button === 2) { // secondary button
            window.addEventListener('blur', this._onWindowBlur);
        }
    }

    _onTouchStart() {
        if (this._supportsNativeDownload()) return;
        // if no native download is supported, show a hint to download by long tap
        this._showLongTouchIndicator();
        this._longTouchStart = Date.now();
        clearTimeout(this._longTouchTimeout);
        this._longTouchTimeout = setTimeout(() => this._onLongTouch(), XDownloadableImage.LONG_TOUCH_DURATION);
    }

    _onTouchEnd() {
        if (this._supportsNativeDownload()) return;
        this._hideLongTouchIndicator();
        clearTimeout(this._longTouchTimeout);
        if (Date.now() - this._longTouchStart > XDownloadableImage.LONG_TOUCH_DURATION) return;
        this._onLongTouchCancel();
    }

    _onLongTouch() {
        this._hideLongTouchIndicator();
        setTimeout(e => XToast.show('Click on "Save Image"'), 1200);
        this._onDownloadStart();
    }

    _onLongTouchCancel() {
        XToast.show('Touch and hold to download.');
    }

    _onDownloadStart() {
        // some browsers open a download dialog and blur the window focus, which we use as a hint for a download
        window.addEventListener('blur', this._onWindowBlur);
        // otherwise consider the download as successful after some time
        this._blurTimeout = setTimeout(() => this._onDownloadEnd(), XDownloadableImage.DOWNLOAD_DURATION);
    }

    _onDownloadEnd() {
        this.fire('x-image-download');
        window.removeEventListener('blur', this._onWindowBlur);
        clearTimeout(this._blurTimeout);
    }

    _onWindowBlur() {
        // wait for the window to refocus when the browser download dialog closes
        this.listenOnce('focus', e => this._onDownloadEnd(), window);
        clearTimeout(this._blurTimeout);
    }

    _showLongTouchIndicator() {
        this.$longTouchIndicator.style.display = 'block';
        this.stopAnimate('animate', this.$longTouchIndicator);
        this.animate('animate', this.$longTouchIndicator);
    }

    _hideLongTouchIndicator() {
        this.$longTouchIndicator.style.display = 'none';
    }

}

'use strict';class QrScanner{constructor(video,onDecode,canvasSize=QrScanner.DEFAULT_CANVAS_SIZE){this.$video=video;this.$canvas=document.createElement("canvas");this._onDecode=onDecode;this._active=false;this.$canvas.width=canvasSize;this.$canvas.height=canvasSize;this._sourceRect={x:0,y:0,width:canvasSize,height:canvasSize};this.$video.addEventListener("canplay",()=>this._updateSourceRect());this.$video.addEventListener("play",()=>{this._updateSourceRect();this._scanFrame();},false);
this._qrWorker=new Worker(QrScanner.WORKER_PATH);}_updateSourceRect(){const smallestDimension=Math.min(this.$video.videoWidth,this.$video.videoHeight);const sourceRectSize=Math.round(2/3*smallestDimension);this._sourceRect.width=this._sourceRect.height=sourceRectSize;this._sourceRect.x=(this.$video.videoWidth-sourceRectSize)/2;this._sourceRect.y=(this.$video.videoHeight-sourceRectSize)/2;}_scanFrame(){if(this.$video.paused||this.$video.ended)return false;requestAnimationFrame(()=>{QrScanner.scanImage(this.$video,
this._sourceRect,this._qrWorker,this.$canvas,true).then(this._onDecode,(error)=>{if(error!=="QR code not found.")console.error(error);}).then(()=>this._scanFrame());});}_getCameraStream(facingMode,exact=false){const constraintsToTry=[{width:{min:1024}},{width:{min:768}},{}];if(facingMode){if(exact)facingMode={exact:facingMode};constraintsToTry.forEach((constraint)=>constraint.facingMode=facingMode);}return this._getMatchingCameraStream(constraintsToTry)}_getMatchingCameraStream(constraintsToTry){if(constraintsToTry.length===
0)return Promise.reject("Camera not found.");return navigator.mediaDevices.getUserMedia({video:constraintsToTry.shift()}).catch(()=>this._getMatchingCameraStream(constraintsToTry))}start(){if(this._active)return Promise.resolve();this._active=true;clearTimeout(this._offTimeout);let facingMode="environment";return this._getCameraStream("environment",true).catch(()=>{facingMode="user";return this._getCameraStream()}).then((stream)=>{this.$video.srcObject=stream;this._setVideoMirror(facingMode);}).catch((e)=>
{this._active=false;throw e;})}stop(){if(!this._active)return;this._active=false;this.$video.pause();this._offTimeout=setTimeout(()=>{this.$video.srcObject.getTracks()[0].stop();this.$video.srcObject=null;},3E3);}_setVideoMirror(facingMode){const scaleFactor=facingMode==="user"?-1:1;this.$video.style.transform="scaleX("+scaleFactor+")";}setGrayscaleWeights(red,green,blue){this._qrWorker.postMessage({type:"grayscaleWeights",data:{red,green,blue}});}static scanImage(imageOrFileOrUrl,sourceRect=null,worker=
null,canvas=null,fixedCanvasSize=false,alsoTryWithoutSourceRect=false){const promise=new Promise((resolve,reject)=>{worker=worker||new Worker(QrScanner.WORKER_PATH);let timeout,onMessage,onError;onMessage=(event)=>{if(event.data.type!=="qrResult")return;worker.removeEventListener("message",onMessage);worker.removeEventListener("error",onError);clearTimeout(timeout);if(event.data.data!==null)resolve(event.data.data);else reject("QR code not found.");};onError=()=>{worker.removeEventListener("message",
onMessage);worker.removeEventListener("error",onError);clearTimeout(timeout);reject("Worker error.");};worker.addEventListener("message",onMessage);worker.addEventListener("error",onError);timeout=setTimeout(onError,3E3);QrScanner._loadImage(imageOrFileOrUrl).then((image)=>{const imageData=QrScanner._getImageData(image,sourceRect,canvas,fixedCanvasSize);worker.postMessage({type:"decode",data:imageData},[imageData.data.buffer]);}).catch(reject);});if(sourceRect&&alsoTryWithoutSourceRect)return promise.catch(()=>
QrScanner.scanImage(imageOrFileOrUrl,null,worker,canvas,fixedCanvasSize));else return promise}static _getImageData(image,sourceRect=null,canvas=null,fixedCanvasSize=false){canvas=canvas||document.createElement("canvas");const sourceRectX=sourceRect&&sourceRect.x?sourceRect.x:0;const sourceRectY=sourceRect&&sourceRect.y?sourceRect.y:0;const sourceRectWidth=sourceRect&&sourceRect.width?sourceRect.width:image.width||image.videoWidth;const sourceRectHeight=sourceRect&&sourceRect.height?sourceRect.height:
image.height||image.videoHeight;if(!fixedCanvasSize&&(canvas.width!==sourceRectWidth||canvas.height!==sourceRectHeight)){canvas.width=sourceRectWidth;canvas.height=sourceRectHeight;}const context=canvas.getContext("2d",{alpha:false});context.imageSmoothingEnabled=false;context.drawImage(image,sourceRectX,sourceRectY,sourceRectWidth,sourceRectHeight,0,0,canvas.width,canvas.height);return context.getImageData(0,0,canvas.width,canvas.height)}static _loadImage(imageOrFileOrUrl){if(imageOrFileOrUrl instanceof
HTMLCanvasElement||imageOrFileOrUrl instanceof HTMLVideoElement||window.ImageBitmap&&imageOrFileOrUrl instanceof window.ImageBitmap||window.OffscreenCanvas&&imageOrFileOrUrl instanceof window.OffscreenCanvas)return Promise.resolve(imageOrFileOrUrl);else if(imageOrFileOrUrl instanceof Image)return QrScanner._awaitImageLoad(imageOrFileOrUrl).then(()=>imageOrFileOrUrl);else if(imageOrFileOrUrl instanceof File||imageOrFileOrUrl instanceof URL||typeof imageOrFileOrUrl==="string"){const image=new Image;
if(imageOrFileOrUrl instanceof File)image.src=URL.createObjectURL(imageOrFileOrUrl);else image.src=imageOrFileOrUrl;return QrScanner._awaitImageLoad(image).then(()=>{if(imageOrFileOrUrl instanceof File)URL.revokeObjectURL(image.src);return image})}else return Promise.reject("Unsupported image type.")}static _awaitImageLoad(image){return new Promise((resolve,reject)=>{if(image.complete&&image.naturalWidth!==0)resolve();else{let onLoad,onError;onLoad=()=>{image.removeEventListener("load",onLoad);image.removeEventListener("error",
onError);resolve();};onError=()=>{image.removeEventListener("load",onLoad);image.removeEventListener("error",onError);reject("Image load error");};image.addEventListener("load",onLoad);image.addEventListener("error",onError);}})}}QrScanner.DEFAULT_CANVAS_SIZE=400;QrScanner.WORKER_PATH="/libraries/qr-scanner/qr-scanner-worker.min.js";

class XWalletBackup extends XElement {

    html() {
        return `<x-downloadable-image></x-downloadable-image>`
    }

    types() {
        /** @type {XDownloadableImage} */
        this.$downloadableImage = null;
    }

    children() {
        return [XDownloadableImage];
    }

    onCreate() {
        this.addEventListener('x-image-download', e => this._onImageDownload(e));
    }

    setKeyPair(keyPair) {
        this._keyPair = keyPair;
    }

    async createBackup(password) {
        const qrPosition = WalletBackup.calculateQrPosition();
        qrPosition.x += qrPosition.padding / 2; /* add half padding to cut away the rounded corners */
        qrPosition.y += qrPosition.padding / 2;
        qrPosition.width = qrPosition.size - qrPosition.padding;
        qrPosition.height = qrPosition.size - qrPosition.padding;

        let backup = null;
        let scanResult = null;
        let encryptedKey;
        do {
            console.log('attempt');
            encryptedKey = await this._importAndEncrypt(password);
            backup = new WalletBackup(this._keyPair.address, encryptedKey);
            try {
                scanResult = await QrScanner.scanImage(backup.$canvas, qrPosition, null, null, false, true);
            } catch(e) { }
        } while (scanResult !== encryptedKey);

        const filename = backup.filename();
        this.$downloadableImage.src = await backup.toDataUrl();
        this.$downloadableImage.filename = filename;
    }

    async _importAndEncrypt(password) {
        const api = NanoApi.getApi();
        await api.importKey(this._keyPair.privateKey, false);
        const encryptedKey = await api.exportEncrypted(password);
        return encryptedKey;
    }

    _onImageDownload(e) {
        e.stopPropagation();
        this.fire('x-wallet-download-complete');
    }

    _onBeforeEntry() {
        if (!this._keyPair) {
            throw Error('Not initialized');
        }
    }

    _onExit() {
        // Clear private information
        this._keyPair.privateKey = null;
        this._keyPair = null;
    }
}

class ScreenDownloadRecovery extends XScreenFit {
    html() {
        return `
          <h2 secondary>Download your Recovery File to later recover your account</h2>
          <x-wallet-backup></x-wallet-backup>
          <x-grow></x-grow>
      `
    }

    get route() { return 'download' }

    types() {
        /** @type {XWalletBackup} */
        this.$walletBackup = null;
    }

    children() { return [XWalletBackup] }
}

class XWalletBackupImport extends XElement {
    html() {
        return `
            <x-wallet-backup-import-icon></x-wallet-backup-import-icon>
            <p>&nbsp;</p>
            <p>&nbsp;</p>
            <button>Upload</button>
            <x-wallet-backup-backdrop>Drop wallet file to import</x-wallet-backup-backdrop>
            <input type="file" accept="image/*">`
    }

    children() { return [XToast] }

    onCreate() {
        this.$fileInput = this.$('input');
        this.$importIcon = this.$('x-wallet-backup-import-icon');
        this._bindHandlers();
    }

    _bindHandlers() {
        const dropZone = document.body;
        dropZone.addEventListener('drop', e => this._onFileDrop(e), false);
        dropZone.addEventListener('dragover', e => this._onDragOver(e), false);

        dropZone.addEventListener('dragexit', e => this._onDragEnd(e), false);
        dropZone.addEventListener('dragend', e => this._onDragEnd(e), false);

        this.addEventListener('click', e => this._openFileInput());
        this.$fileInput.addEventListener('change', e => this._onFileSelected(e));
    }

    _openFileInput() {
        this.$fileInput.click();
    }

    _onFileSelected(e) {
        this._onFileDrop(e);
        this.$fileInput.value = null;
    }

    async _onFileDrop(event) {
        this._stopPropagation(event);
        this._onDragEnd();
        // Get files
        const files = event.dataTransfer ? event.dataTransfer.files : event.target.files;
        const file = files[0];

        let qrPosition = WalletBackup.calculateQrPosition();
        // add half padding to cut away the rounded corners
        qrPosition.x += qrPosition.padding / 2;
        qrPosition.y += qrPosition.padding / 2;
        qrPosition.width = qrPosition.size - qrPosition.padding;
        qrPosition.height = qrPosition.size - qrPosition.padding;

        try {
            const decoded = await QrScanner.scanImage(file, qrPosition, null, null, false, true);
            this.fire('x-backup-import', decoded);
        } catch (e) {
            this._onQrError();
        }
    }

    _onDragOver(event) {
        this._stopPropagation(event);
        event.dataTransfer.dropEffect = 'copy';
        this.$el.setAttribute('active', 1);
    }

    _stopPropagation(event) {
        event.stopPropagation();
        event.preventDefault();
    }

    _onDragEnd() {
        this.$el.removeAttribute('active');
    }

    _onQrError() {
        this.animate('shake', this.$importIcon);
        this.$toast.show('Couldn\'t read Backup File');
    }
}

// Todo: debug backdrop
// Todo: style backdrop
// Todo: remove handlers on hide

class ScreenBackupFileImportIntro extends XScreenFit {
    html() {
        return `
            <h2 secondary>Select your backup file or drag it onto the page</h2>
            <x-wallet-backup-import></x-wallet-backup-import>
        `
    }

    get route() { return 'intro' }

    children() { return [XWalletBackupImport] }
}

class ScreenBackupFileImportPassword extends XScreenFit {
    html() {
        return `
            <h2 secondary>Enter the password to unlock this backup</h2>
            <x-password-input></x-password-input>
            <p id="screen-backup-file-import-password-error" class="hidden">
                That password was incorrect.<br>Try again or <a href="javascript:void(0)">set a new password</a>.
            </p>
            <x-grow></x-grow>
            <button disabled="yes">Unlock</button>
        `
    }

    get route() { return 'password' }

    children() { return [XPasswordInput] }

    onCreate() {
        this.addEventListener('x-password-input-valid', e => this._validityChanged(e.detail));
        this.$hint = this.$('#screen-backup-file-import-password-error');
        this.$a = this.$('a');
        this.$a.addEventListener('click', e => this._onRetryClicked());
        this.$button = this.$('button');
        this.$button.addEventListener('click', e => this._onPasswordInput(e));
    }

    _onEntry() {
        this.$passwordInput.focus();
    }

    _validityChanged(valid) {
        if (valid)
            this.$button.removeAttribute('disabled');
        else
            this.$button.setAttribute('disabled', true);
    }

    _onRetryClicked(e) {
        this.fire('x-password-input-retry');
        this.$hint.classList.add('hidden');
        location.href = "#backup-file";
    }

    _onPasswordInput(e) {
        this.fire('x-password-input', this.$passwordInput.value);
        this.$passwordInput.value = '';
        this.$hint.classList.add('hidden');
    }

    onPasswordIncorrect() {
        this.$hint.classList.remove('hidden');
    }
}

class ScreenBackupFileImport extends XScreen {
    html() {
        return `
        <h2>Import Backup File</h2>
        <x-slides>
            <screen-backup-file-import-intro></screen-backup-file-import-intro>
            <screen-backup-file-import-password></screen-backup-file-import-password>
            <screen-loading>Unlocking the Backup</screen-loading>
            <screen-success>Import successfull</screen-success>
        </x-slides>
        `;
    }

    children() { return [ScreenBackupFileImportIntro, ScreenBackupFileImportPassword, ScreenLoading, ScreenSuccess] }

    onCreate() {
        this.addEventListener('x-success', e => _onSuccess(e));
        this.addEventListener('x-backup-import', e => this._onWalletImport(e));
        this.addEventListener('x-password-input', e => this._onPasswordInput(e));
    }

    _onWalletImport(e) {
        e.stopPropagation();
        this._encryptedKey = e.detail;
        this.goTo('password');
    }

    _onPasswordInput(e) {
        const password = e.detail;
        const result = { password: password, encryptedKey: this._encryptedKey };
        this.fire('x-decrypt-backup', result);
        this.goTo('loading');
    }

    async onPasswordCorrect() {
        return await this.goTo('success');
    }

    async onPasswordIncorrect() {
        await this.back();
        this.$screenBackupFileImportPassword.onPasswordIncorrect();
        this.$screenBackupFileImportPassword.$passwordInput._onInvalid();
    }
}

// Todo: warn user upfront that importing a different account deletes the current account
// Todo: [low priority] support multiple accounts at once

class ScreenBackupFile extends XSlidesScreen {
    html() {
        return `
            <h1>Backup your Account Access</h1>
            <x-slides>
                <screen-create-password></screen-create-password>
                <screen-loading>Encrypting Backup</screen-loading>
                <screen-download-recovery></screen-download-recovery>
                <screen-backup-file-import></screen-backup-file-import>
                <screen-success>Backup Complete</screen-success>
            </x-slides>
            <a secondary class="hidden" href="#backup-file" id="x-screen-backup-file-a">I'm lost and want to try again</a>
            <screen-no-password-warning route="no-password"></screen-no-password-warning>
            `
    }

    children() {
        return [
            ScreenCreatePassword,
            ScreenLoading,
            ScreenDownloadRecovery,
            ScreenBackupFileImport,
            ScreenSuccess,
            ScreenNoPasswordWarning
        ]
    }

    /** Do not use those for slide indicator */
    get __childScreenFilter() { return ['no-password']; }

    listeners() {
        return {
            'x-wallet-download-complete': '_onWalletDownloadComplete',
            'x-encrypt-backup': '_onSetPassword',
            'x-decrypt-backup': '_onDecryptBackup',
            'x-password-input-retry': '_onRetryClicked'
        }
    }

    /** @param {Nimiq.KeyPair} */
    setKeyPair(keyPair) {
        this._keyPair = keyPair;
        this.$screenDownloadRecovery.$walletBackup.setKeyPair(keyPair);
    }

    async _onSetPassword(password) {
        await this.$screenDownloadRecovery.$walletBackup.createBackup(password);
        this.goTo('download');
    }

    async _onWalletDownloadComplete() {
        location.href = "#backup-file/backup-file-import";
        const $a = this.$('#x-screen-backup-file-a');
        $a.classList.remove('hidden');
        $a.addEventListener('click', () => $a.classList.add('hidden'));
    }

    async _onDecryptBackup(backup) {
        console.log(backup);
        const password = backup.password;
        const encryptedKey = backup.encryptedKey;
        try {
            await NanoApi.getApi().importEncrypted(encryptedKey, password);
            await this.goTo('success');
            this.fire('x-backup-file-complete');
        } catch (e) {
            console.error(e);
            this.$screenBackupFileImport.onPasswordIncorrect();
        }
    }

    _onRetryClicked() {
        const $a = this.$('#x-screen-backup-file-a');
        $a.classList.add('hidden');
    }

    types() {
        /** @type {ScreenCreatePassword} */
        this.$screenCreatePassword = null;
        /** @type {ScreenLoading} */
        this.$screenLoading = null;
        /** @type {ScreenDownloadRecovery} */
        this.$screenDownloadRecovery = null;
        /** @type {ScreenSuccess} */
        this.$screenSuccess = null;
        /** @type {ScreenNoPasswordWarning} */
        this.$screenNoPasswordWarning = null;
        /** @type {ScreenBackupFileImport} */
        this.$screenBackupFileImport = null;
    }
}

class XPrivacyAgent extends XElement {
    html() {
        return `
			<x-privacy-agent-container>
					<svg width="162" height="144" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
				  <defs>
				    <path d="M108 27.54l53.28 30.76a16 16 0 0 1 8 13.86v61.53a16 16 0 0 1-8 13.85L108 178.3a16 16 0 0 1-16 0l-53.28-30.76a16 16 0 0 1-8-13.85V72.16a16 16 0 0 1 8-13.86L92 27.54a16 16 0 0 1 16 0z" id="a"/>
				  </defs>
				  <g transform="translate(-19 -31)" fill="none" fill-rule="evenodd">
				    <mask id="b" fill="#fff">
				      <use xlink:href="#a"/>
				    </mask>
				    <use stroke="#000" stroke-width="5" transform="rotate(30 100 102.92)" xlink:href="#a"/>
				    <path d="M86.38 50c-3.45 0-6.33 2.07-8.52 4.82-2.2 2.77-3.9 6.35-5.35 10.26-2.7 7.3-4.34 15.57-5.34 21.62-5.07.98-9.64 2.12-12.86 3.58-1.8.82-3.3 1.7-4.45 2.82a5.94 5.94 0 0 0-2.05 4.23 5.7 5.7 0 0 0 1.6 3.78 12.95 12.95 0 0 0 3.51 2.6c2.84 1.5 6.64 2.74 11.28 3.8.08 0 .17.02.24.04a6.03 6.03 0 0 0-.75 2.86c0 1.46.45 2.71.8 3.93l.48 1.62c.11.44.14.86.14.53 0 3.07 2.59 5.46 5.64 5.57.07 1.63.3 3.21.62 4.75-3.87.7-7.41 2.74-10.23 4.69a45.92 45.92 0 0 0-5.87 4.82l-1.48 1.49 6.8 7.74a54.56 54.56 0 0 0-12.36 10.93C44.1 161.44 41 166.71 41 171.71V192h118v-20.29c0-5.04-3.01-10.41-7.06-15.45a53.15 53.15 0 0 0-12.2-11.1l6.47-7.35-1.48-1.49s-2.4-2.42-5.87-4.82c-2.82-1.95-6.36-3.98-10.23-4.69.33-1.54.55-3.13.62-4.75 3.05-.1 5.64-2.5 5.64-5.57 0 .33.03-.1.14-.53l.47-1.62c.36-1.22.8-2.47.8-3.93 0-1.04-.28-2-.74-2.86l.24-.05c4.64-1.05 8.44-2.29 11.28-3.8 1.4-.75 2.6-1.58 3.52-2.59a5.7 5.7 0 0 0 1.6-3.78c0-1.67-.9-3.13-2.06-4.23-1.16-1.11-2.65-2-4.45-2.82-3.22-1.46-7.79-2.6-12.86-3.58-1-6.05-2.64-14.32-5.34-21.62-1.45-3.9-3.16-7.49-5.35-10.26-2.19-2.75-5.07-4.82-8.52-4.82-3.91 0-6.72 1.37-8.79 2.55-2.06 1.17-3.31 1.96-4.83 1.96s-2.77-.79-4.83-1.96A17.01 17.01 0 0 0 86.38 50zm0 4.5c2.9 0 4.63.89 6.54 1.97 1.9 1.08 4.06 2.55 7.08 2.55 3.02 0 5.18-1.47 7.08-2.55 1.9-1.08 3.64-1.96 6.54-1.96 1.65 0 3.26.96 4.96 3.1 1.7 2.16 3.3 5.39 4.65 9.03 2.7 7.3 4.44 16.25 5.38 22.19.16.95.9 1.7 1.85 1.86 5.69 1.02 10.32 2.32 13.34 3.7 1.5.68 2.6 1.4 3.2 1.96.61.57.65.86.65.98 0 .1-.01.31-.42.77a9.13 9.13 0 0 1-2.3 1.63c-2.23 1.19-5.74 2.38-10.14 3.38-1.66.37-3.5.71-5.4 1.03-.2.03-.4.04-.5.09a184.71 184.71 0 0 1-28.89 2.12c-10.83 0-20.82-.81-28.9-2.12-.1-.05-.3-.06-.5-.1-1.9-.3-3.73-.65-5.4-1.02-4.39-1-7.9-2.2-10.12-3.38a9.13 9.13 0 0 1-2.3-1.63c-.42-.46-.43-.66-.43-.77 0-.12.04-.41.64-.98.6-.57 1.7-1.28 3.21-1.97 3.02-1.37 7.65-2.67 13.34-3.69.26-.04.5-.14.74-.27l1.25.1 1.35-1.5-.4-1.98-.6-.53-.09-.05c1-5.8 2.6-13.4 4.98-19.82 1.34-3.64 2.95-6.87 4.65-9.02 1.7-2.15 3.3-3.11 4.96-3.11zm38.63 34.44l-.78.13-.22.08-1.42 1.45.33 1.99 1.8.94.8-.13.21-.08 1.41-1.45-.33-2-1.8-.93zm-45.4 1.02l-2.01.33-.92 1.8.9 1.82.71.36.21.06 2-.34.93-1.8-.9-1.8-.7-.37-.22-.06zm36.74 1.35l-.81.03-.22.04-1.6 1.23.04 2.03 1.65 1.18.8-.03.22-.04 1.6-1.23-.03-2.02-1.65-1.19zm-28.02.67l-1.93.63-.65 1.9 1.16 1.67.75.26.22.02 1.94-.62.65-1.91-1.15-1.67-.76-.25-.23-.03zm18.3.59h-.21l-1.77 1.03-.23 2 1.47 1.39.81.09.22-.02 1.76-1 .23-2.01-1.47-1.4-.8-.08zm-9.32.2l-1.84.87-.4 1.98 1.36 1.5.78.15.23.01 1.83-.86.4-1.98-1.35-1.5-.8-.17h-.21zM70 108.66l.1.06c.39.19.93.49 1.52.82l3.4 2v-2.2c1.59.21 3.2.4 4.87.57a5.4 5.4 0 0 0-.32 1.84c0 4.48 4.06 8.11 9.07 8.11 5.02 0 9.08-3.63 9.08-8.1 0-.35-.07-.64-.11-.94.8.01 1.57.03 2.38.03.8 0 1.59-.02 2.38-.03-.04.3-.11.6-.11.93 0 4.48 4.06 8.11 9.08 8.11 5.01 0 9.07-3.63 9.07-8.1 0-.72-.13-1.3-.32-1.85 1.67-.17 3.28-.36 4.86-.57v2.2l3.41-2c.59-.33 1.13-.63 1.51-.82l.1-.06c1.04.1 1.79.83 1.79 1.74 0 .17-.27 1.49-.61 2.67-.18.58-.36 1.17-.5 1.7-.16.54-.3.92-.3 1.71 0 .6-.5 1.13-1.29 1.13h-4.1v3.08a24.81 24.81 0 0 1-20.56 24.39l-.65.1-.49.45a4.8 4.8 0 0 1-6.54 0l-.49-.45-.65-.1a24.81 24.81 0 0 1-20.55-24.39v-3.08h-4.11c-.78 0-1.28-.53-1.28-1.13 0-.79-.15-1.17-.3-1.7l-.5-1.71a20.4 20.4 0 0 1-.62-2.67c0-.9.75-1.63 1.78-1.74zm2.66 22.5a29.25 29.25 0 0 0 11.47 14.05c.13 9.44 3.56 20.04 6.95 28.46a143.28 143.28 0 0 0 6.37 13.81h-9.79l-23.02-18.35 11.1-13.24-15.63-17.74c.83-.77 1.47-1.48 3.62-2.97 2.66-1.84 6-3.56 8.93-4.02zm54.66 0c2.93.46 6.27 2.18 8.93 4.02 2.15 1.5 2.79 2.2 3.62 2.97l-15.63 17.74 11.1 13.24-23.02 18.35h-9.79c.72-1.35 3.35-6.33 6.37-13.81 3.4-8.42 6.82-19.01 6.95-28.45a29.23 29.23 0 0 0 11.47-14.06zm-38.54 16.48c1.73.7 3.52 1.28 5.4 1.66a9.35 9.35 0 0 0 5.81 2.12 9.4 9.4 0 0 0 5.78-2.11c1.89-.37 3.7-.95 5.43-1.66-.63 7.85-3.54 16.98-6.5 24.34-2.36 5.85-3.52 7.82-4.71 10.13-1.19-2.3-2.35-4.28-4.7-10.13-2.97-7.36-5.88-16.49-6.51-24.35zm47.93.93a49.02 49.02 0 0 1 11.67 10.5c3.7 4.6 6.07 9.57 6.07 12.63v15.78h-34.89l22.23-17.71-11.6-13.8 6.52-7.4zm-73.09.41l6.16 6.98-11.6 13.8 22.24 17.72h-34.9V171.7c0-2.93 2.41-7.82 6.2-12.35a50.38 50.38 0 0 1 11.9-10.37z" fill="#000" fill-rule="nonzero" mask="url(#b)"/>
				  </g>
				</svg>
				<h1>Are you being watched?</h1>
				<p>Now is the perfect time to assess your surroundings. Nearby windows? Hidden cameras? Shoulder spies?</p><p><strong>Anyone with the following information can steal all your funds!</strong></p>
			</x-privacy-agent-container>
			<x-grow></x-grow>
			<button>I am safe</button>
		`
    }
    onCreate() {
        this.$('button').addEventListener('click', e => this.fire('x-surrounding-checked'));
    }
}

class ScreenPrivacy extends XScreenFit {
    html() {
        return `
            <h2 secondary>First make sure your enviroment is safe.</h2>
            <x-privacy-agent></x-privacy-agent>
            <x-grow></x-grow>
            `;
    }

    children() { return [XPrivacyAgent] }
}

class MnemonicPhrase{static _hexToArray(e){return e=e.trim(), Uint8Array.from(e.match(/.{2}/g)||[],e=>parseInt(e,16))}static _arrayToHex(e){let r="";for(let a=0;a<e.length;a++){const t=e[a];r+=MnemonicPhrase.HEX_ALPHABET[t>>>4], r+=MnemonicPhrase.HEX_ALPHABET[15&t];}return r}static _crc8(e){for(var r=[],a=0;a<256;++a){for(var t=a,o=0;o<8;++o)t=0!=(128&t)?(t<<1^151)%256:(t<<1)%256;r[a]=t;}var i=0;for(a=0;a<e.length;a++)i=r[(i^e[a])%256];return i}static _lpad(e,r,a){for(;e.length<a;)e=r+e;return e}static _binaryToBytes(e){return parseInt(e,2)}static _bytesToBinary(e){return e.reduce((e,r)=>e+MnemonicPhrase._lpad(r.toString(2),"0",8),"")}static _deriveChecksumBits(e){var r=MnemonicPhrase._crc8(e);return MnemonicPhrase._bytesToBinary([r])}static keyToMnemonic(e,r){if("string"==typeof e&&(e=MnemonicPhrase._hexToArray(e)), e instanceof ArrayBuffer&&(e=new Uint8Array(e)), r=r||MnemonicPhrase.DEFAULT_WORDLIST, e.length<16)throw new TypeError("Invalid key, length < 16");if(e.length>32)throw new TypeError("Invalid key, length > 32");if(e.length%4!=0)throw new TypeError("Invalid key, length % 4 != 0");return(MnemonicPhrase._bytesToBinary(e)+MnemonicPhrase._deriveChecksumBits(e)).match(/(.{11})/g).reduce((e,a)=>{var t=MnemonicPhrase._binaryToBytes(a);return e+(e?" ":"")+r[t]},"")}static mnemonicToKey(e,r){r=r||MnemonicPhrase.DEFAULT_WORDLIST;var a=e.normalize("NFKD").trim().split(/\s+/g);if(a.length<12)throw new Error("Invalid mnemonic, less than 12 words");if(a.length>24)throw new Error("Invalid mnemonic, more than 24 words");if(a.length%3!=0)throw new Error("Invalid mnemonic, words % 3 != 0");var t=a.map(function(e){var a=r.indexOf(e.toLowerCase());if(-1===a)throw new Error("Invalid mnemonic, word >"+e+"< is not in wordlist");return MnemonicPhrase._lpad(a.toString(2),"0",11)}).join(""),o=t.length-(t.length%8||8),i=t.slice(0,o),n=t.slice(o),s=i.match(/(.{8})/g).map(MnemonicPhrase._binaryToBytes);if(s.length<16)throw new Error("Invalid generated key, length < 16");if(s.length>32)throw new Error("Invalid generated key, length > 32");if(s.length%4!=0)throw new Error("Invalid generated key, length % 4 != 0");var l=new Uint8Array(s);if(MnemonicPhrase._deriveChecksumBits(l).slice(0,n.length)!==n)throw new Error("Invalid checksum");return MnemonicPhrase._arrayToHex(l)}}MnemonicPhrase.HEX_ALPHABET="0123456789abcdef", MnemonicPhrase.ENGLISH_WORDLIST="abandon ability able about above absent absorb abstract absurd abuse access accident account accuse achieve acid acoustic acquire across act action actor actress actual adapt add addict address adjust admit adult advance advice aerobic affair afford afraid again age agent agree ahead aim air airport aisle alarm album alcohol alert alien all alley allow almost alone alpha already also alter always amateur amazing among amount amused analyst anchor ancient anger angle angry animal ankle announce annual another answer antenna antique anxiety any apart apology appear apple approve april arch arctic area arena argue arm armed armor army around arrange arrest arrive arrow art artefact artist artwork ask aspect assault asset assist assume asthma athlete atom attack attend attitude attract auction audit august aunt author auto autumn average avocado avoid awake aware away awesome awful awkward axis baby bachelor bacon badge bag balance balcony ball bamboo banana banner bar barely bargain barrel base basic basket battle beach bean beauty because become beef before begin behave behind believe below belt bench benefit best betray better between beyond bicycle bid bike bind biology bird birth bitter black blade blame blanket blast bleak bless blind blood blossom blouse blue blur blush board boat body boil bomb bone bonus book boost border boring borrow boss bottom bounce box boy bracket brain brand brass brave bread breeze brick bridge brief bright bring brisk broccoli broken bronze broom brother brown brush bubble buddy budget buffalo build bulb bulk bullet bundle bunker burden burger burst bus business busy butter buyer buzz cabbage cabin cable cactus cage cake call calm camera camp can canal cancel candy cannon canoe canvas canyon capable capital captain car carbon card cargo carpet carry cart case cash casino castle casual cat catalog catch category cattle caught cause caution cave ceiling celery cement census century cereal certain chair chalk champion change chaos chapter charge chase chat cheap check cheese chef cherry chest chicken chief child chimney choice choose chronic chuckle chunk churn cigar cinnamon circle citizen city civil claim clap clarify claw clay clean clerk clever click client cliff climb clinic clip clock clog close cloth cloud clown club clump cluster clutch coach coast coconut code coffee coil coin collect color column combine come comfort comic common company concert conduct confirm congress connect consider control convince cook cool copper copy coral core corn correct cost cotton couch country couple course cousin cover coyote crack cradle craft cram crane crash crater crawl crazy cream credit creek crew cricket crime crisp critic crop cross crouch crowd crucial cruel cruise crumble crunch crush cry crystal cube culture cup cupboard curious current curtain curve cushion custom cute cycle dad damage damp dance danger daring dash daughter dawn day deal debate debris decade december decide decline decorate decrease deer defense define defy degree delay deliver demand demise denial dentist deny depart depend deposit depth deputy derive describe desert design desk despair destroy detail detect develop device devote diagram dial diamond diary dice diesel diet differ digital dignity dilemma dinner dinosaur direct dirt disagree discover disease dish dismiss disorder display distance divert divide divorce dizzy doctor document dog doll dolphin domain donate donkey donor door dose double dove draft dragon drama drastic draw dream dress drift drill drink drip drive drop drum dry duck dumb dune during dust dutch duty dwarf dynamic eager eagle early earn earth easily east easy echo ecology economy edge edit educate effort egg eight either elbow elder electric elegant element elephant elevator elite else embark embody embrace emerge emotion employ empower empty enable enact end endless endorse enemy energy enforce engage engine enhance enjoy enlist enough enrich enroll ensure enter entire entry envelope episode equal equip era erase erode erosion error erupt escape essay essence estate eternal ethics evidence evil evoke evolve exact example excess exchange excite exclude excuse execute exercise exhaust exhibit exile exist exit exotic expand expect expire explain expose express extend extra eye eyebrow fabric face faculty fade faint faith fall false fame family famous fan fancy fantasy farm fashion fat fatal father fatigue fault favorite feature february federal fee feed feel female fence festival fetch fever few fiber fiction field figure file film filter final find fine finger finish fire firm first fiscal fish fit fitness fix flag flame flash flat flavor flee flight flip float flock floor flower fluid flush fly foam focus fog foil fold follow food foot force forest forget fork fortune forum forward fossil foster found fox fragile frame frequent fresh friend fringe frog front frost frown frozen fruit fuel fun funny furnace fury future gadget gain galaxy gallery game gap garage garbage garden garlic garment gas gasp gate gather gauge gaze general genius genre gentle genuine gesture ghost giant gift giggle ginger giraffe girl give glad glance glare glass glide glimpse globe gloom glory glove glow glue goat goddess gold good goose gorilla gospel gossip govern gown grab grace grain grant grape grass gravity great green grid grief grit grocery group grow grunt guard guess guide guilt guitar gun gym habit hair half hammer hamster hand happy harbor hard harsh harvest hat have hawk hazard head health heart heavy hedgehog height hello helmet help hen hero hidden high hill hint hip hire history hobby hockey hold hole holiday hollow home honey hood hope horn horror horse hospital host hotel hour hover hub huge human humble humor hundred hungry hunt hurdle hurry hurt husband hybrid ice icon idea identify idle ignore ill illegal illness image imitate immense immune impact impose improve impulse inch include income increase index indicate indoor industry infant inflict inform inhale inherit initial inject injury inmate inner innocent input inquiry insane insect inside inspire install intact interest into invest invite involve iron island isolate issue item ivory jacket jaguar jar jazz jealous jeans jelly jewel job join joke journey joy judge juice jump jungle junior junk just kangaroo keen keep ketchup key kick kid kidney kind kingdom kiss kit kitchen kite kitten kiwi knee knife knock know lab label labor ladder lady lake lamp language laptop large later latin laugh laundry lava law lawn lawsuit layer lazy leader leaf learn leave lecture left leg legal legend leisure lemon lend length lens leopard lesson letter level liar liberty library license life lift light like limb limit link lion liquid list little live lizard load loan lobster local lock logic lonely long loop lottery loud lounge love loyal lucky luggage lumber lunar lunch luxury lyrics machine mad magic magnet maid mail main major make mammal man manage mandate mango mansion manual maple marble march margin marine market marriage mask mass master match material math matrix matter maximum maze meadow mean measure meat mechanic medal media melody melt member memory mention menu mercy merge merit merry mesh message metal method middle midnight milk million mimic mind minimum minor minute miracle mirror misery miss mistake mix mixed mixture mobile model modify mom moment monitor monkey monster month moon moral more morning mosquito mother motion motor mountain mouse move movie much muffin mule multiply muscle museum mushroom music must mutual myself mystery myth naive name napkin narrow nasty nation nature near neck need negative neglect neither nephew nerve nest net network neutral never news next nice night noble noise nominee noodle normal north nose notable note nothing notice novel now nuclear number nurse nut oak obey object oblige obscure observe obtain obvious occur ocean october odor off offer office often oil okay old olive olympic omit once one onion online only open opera opinion oppose option orange orbit orchard order ordinary organ orient original orphan ostrich other outdoor outer output outside oval oven over own owner oxygen oyster ozone pact paddle page pair palace palm panda panel panic panther paper parade parent park parrot party pass patch path patient patrol pattern pause pave payment peace peanut pear peasant pelican pen penalty pencil people pepper perfect permit person pet phone photo phrase physical piano picnic picture piece pig pigeon pill pilot pink pioneer pipe pistol pitch pizza place planet plastic plate play please pledge pluck plug plunge poem poet point polar pole police pond pony pool popular portion position possible post potato pottery poverty powder power practice praise predict prefer prepare present pretty prevent price pride primary print priority prison private prize problem process produce profit program project promote proof property prosper protect proud provide public pudding pull pulp pulse pumpkin punch pupil puppy purchase purity purpose purse push put puzzle pyramid quality quantum quarter question quick quit quiz quote rabbit raccoon race rack radar radio rail rain raise rally ramp ranch random range rapid rare rate rather raven raw razor ready real reason rebel rebuild recall receive recipe record recycle reduce reflect reform refuse region regret regular reject relax release relief rely remain remember remind remove render renew rent reopen repair repeat replace report require rescue resemble resist resource response result retire retreat return reunion reveal review reward rhythm rib ribbon rice rich ride ridge rifle right rigid ring riot ripple risk ritual rival river road roast robot robust rocket romance roof rookie room rose rotate rough round route royal rubber rude rug rule run runway rural sad saddle sadness safe sail salad salmon salon salt salute same sample sand satisfy satoshi sauce sausage save say scale scan scare scatter scene scheme school science scissors scorpion scout scrap screen script scrub sea search season seat second secret section security seed seek segment select sell seminar senior sense sentence series service session settle setup seven shadow shaft shallow share shed shell sheriff shield shift shine ship shiver shock shoe shoot shop short shoulder shove shrimp shrug shuffle shy sibling sick side siege sight sign silent silk silly silver similar simple since sing siren sister situate six size skate sketch ski skill skin skirt skull slab slam sleep slender slice slide slight slim slogan slot slow slush small smart smile smoke smooth snack snake snap sniff snow soap soccer social sock soda soft solar soldier solid solution solve someone song soon sorry sort soul sound soup source south space spare spatial spawn speak special speed spell spend sphere spice spider spike spin spirit split spoil sponsor spoon sport spot spray spread spring spy square squeeze squirrel stable stadium staff stage stairs stamp stand start state stay steak steel stem step stereo stick still sting stock stomach stone stool story stove strategy street strike strong struggle student stuff stumble style subject submit subway success such sudden suffer sugar suggest suit summer sun sunny sunset super supply supreme sure surface surge surprise surround survey suspect sustain swallow swamp swap swarm swear sweet swift swim swing switch sword symbol symptom syrup system table tackle tag tail talent talk tank tape target task taste tattoo taxi teach team tell ten tenant tennis tent term test text thank that theme then theory there they thing this thought three thrive throw thumb thunder ticket tide tiger tilt timber time tiny tip tired tissue title toast tobacco today toddler toe together toilet token tomato tomorrow tone tongue tonight tool tooth top topic topple torch tornado tortoise toss total tourist toward tower town toy track trade traffic tragic train transfer trap trash travel tray treat tree trend trial tribe trick trigger trim trip trophy trouble truck true truly trumpet trust truth try tube tuition tumble tuna tunnel turkey turn turtle twelve twenty twice twin twist two type typical ugly umbrella unable unaware uncle uncover under undo unfair unfold unhappy uniform unique unit universe unknown unlock until unusual unveil update upgrade uphold upon upper upset urban urge usage use used useful useless usual utility vacant vacuum vague valid valley valve van vanish vapor various vast vault vehicle velvet vendor venture venue verb verify version very vessel veteran viable vibrant vicious victory video view village vintage violin virtual virus visa visit visual vital vivid vocal voice void volcano volume vote voyage wage wagon wait walk wall walnut want warfare warm warrior wash wasp waste water wave way wealth weapon wear weasel weather web wedding weekend weird welcome west wet whale what wheat wheel when where whip whisper wide width wife wild will win window wine wing wink winner winter wire wisdom wise wish witness wolf woman wonder wood wool word work world worry worth wrap wreck wrestle wrist write wrong yard year yellow you young youth zebra zero zone zoo".split(" "), MnemonicPhrase.DEFAULT_WORDLIST=MnemonicPhrase.ENGLISH_WORDLIST, "undefined"!=typeof module&&(module.exports=MnemonicPhrase);

class XMnemonicPhrase extends XElement {

    styles() { return ['x-recovery-phrase'] }

    set privateKey(privateKey) {
        const phrase = MnemonicPhrase.keyToMnemonic(privateKey);
        const words = phrase.split(/\s+/g);

        // Clear existing words
        this.clear();

        words.forEach((word, index) => {
            const $span = document.createElement('span');
            $span.className = 'x-word';
            $span.title = 'word #' + (index + 1);
            $span.style.animationDelay = (700 + 64 * index) + 'ms';

            $span.textContent = word;
            this.$el.appendChild($span);
        });
    }

    animateEntry() {
        this.addStyle('x-entry');
        setTimeout(() => {
            this.removeStyle('x-entry');
        }, 4000);
    }
}

class ScreenPhrase extends XScreenFit {
    html() {
        return `
            <h2 secondary>Write down the following 24 words to recover your account later</h2>
            <x-mnemonic-phrase></x-mnemonic-phrase>
            <x-grow></x-grow>
            <a href="#backup-phrase-validate" button>Validate</a>
            `;
    }

    children() { return [XMnemonicPhrase] }
}

class ScreenBackupPhrase extends XScreen {
    html() {
        return `
            <h1>Backup your Recovery Phrase</h1>
            <x-slides>
                <screen-privacy></screen-privacy>
                <screen-phrase></screen-phrase>
            </x-slides>
            `;
    }

    types() {
        /** @type {ScreenPrivacy} */
        this.$screenPrivacy = null;
        /** @type {ScreenPhrase} */
        this.$screenPhrase = null;
    }

    children() { return [ScreenPrivacy, ScreenPhrase] }
    
    onCreate(){
        this.addEventListener('x-surrounding-checked', e => this.goTo('phrase'));
    }

    set privateKey(privateKey) {
        this.$screenPhrase.$mnemonicPhrase.privateKey = privateKey;
    }
}

// Todo: [low priority] add warning "screenshots are not safe" ?

class ScreenMnemonicValidate extends XScreenFit {
    html() {
        return `
            <p>Please select the following word from your phrase:</p>
            <x-target-index></x-target-index>
            <x-wordlist>
                <button class="small"></button>
                <button class="small"></button>
                <button class="small"></button>
                <button class="small"></button>
                <button class="small"></button>
                <button class="small"></button>
                <button class="small"></button>
                <button class="small"></button>
            </x-wordlist>
            <x-grow>
            `;
    }

    onCreate() {
        this.$buttons = this.$$('button');
        this.$targetIndex = this.$('x-target-index');
        this.addEventListener('click', e => this._onClick(e));
    }

    /**
     * @param {string[]} wordlist
     * @param {number} targetIndex
     * @param {string} targetWord
     */
    set(wordlist, targetIndex, targetWord) {
        this.$$('.correct').forEach(button => button.classList.remove('correct'));
        this.$$('.wrong').forEach(button => button.classList.remove('wrong'));
        this.setWordlist(wordlist);
        this.setTargetIndex(targetIndex);
        this._targetWord = targetWord;
    }

    setWordlist(wordlist) {
        this._wordlist = wordlist;
        wordlist.forEach((word, index) => this.$buttons[index].textContent = word);
        this.$buttons.forEach(button => button.removeAttribute('disabled'));
    }

    setTargetIndex(index) {
        this.$targetIndex.textContent = index;
    }

    _onClick(e) {
        if (e.target.localName !== 'button') return;
        this._onButtonPressed(e.target);
    }

    _onButtonPressed($button) {
        this.$buttons.forEach(button => button.setAttribute('disabled', 'disabled'));

        if ($button.textContent !== this._targetWord) {
            this._showAsWrong($button);
            const correctButtonIndex = this._wordlist.indexOf(this._targetWord);
            this._showAsCorrect(this.$buttons[correctButtonIndex]);
            this.fire('screen-mnemonic-validate', false);
            return;
        }

        this._showAsCorrect($button);
        this.fire('screen-mnemonic-validate', true);
    }

    _showAsWrong($el) {
        $el.classList.add('wrong');
        this.animate('shake', $el);
    }

    _showAsCorrect($el) {
        $el.classList.add('correct');
    }
}

class ScreenBackupPhraseValidate extends XScreen {
    html() {
        return `
            <h1>Validate Recovery Phrase</h1>
            <x-slides>
                <screen-mnemonic-validate route="1"></screen-mnemonic-validate>
                <screen-mnemonic-validate route="2"></screen-mnemonic-validate>
                <screen-mnemonic-validate route="3"></screen-mnemonic-validate>
                <screen-success>
                    Phrase validated
                </screen-success>
            </x-slides>
            <x-slide-indicator></x-slide-indicator>
            <a secondary href="#backup-phrase/phrase">Back to phrase</a>
        `
    }

    onHide() {
        this.reset();
    }

    children() { return [ [ScreenMnemonicValidate], ScreenSuccess, XSlideIndicator ] }

    onCreate() {
        this.$screenMnemonicValidates.forEach(slide => {
            slide.addEventListener('screen-mnemonic-validate', e => this._onSlideEvent(e.detail));
        });
    }

    set privateKey(privateKey) {
        this.mnemonic = MnemonicPhrase.keyToMnemonic(privateKey);
    }

    set mnemonic(mnemonic) {
        if (!mnemonic) return;
        this._mnemonic = mnemonic.split(/\s+/g);
    }

    _onBeforeEntry() {
        this._activeSlideIndex = 0;
        this._generateIndices();
        this._setSlideContent(this._activeSlideIndex);
        this._showActiveSlide();
    }

    reset() {
        if (!this._mnemonic) return;
        this.mnemonic = this._mnemonic.join(' ');
    }

    resetSlide() {
        this.requiredWords[this._activeSlideIndex] = this._generateIndex(this._activeSlideIndex);
        this._setSlideContent(this._activeSlideIndex);
    }

    _next() {
        this._activeSlideIndex += 1;
        if (this._activeSlideIndex < 3) this._setSlideContent(this._activeSlideIndex);
        this._showActiveSlide();
    }

    _onSlideEvent(valid) {
        if (!valid) setTimeout(() => this.resetSlide(), 820);
        else {
            if (this._activeSlideIndex === 2) this._success();
            setTimeout(() => this._next(), 500);
        }
    }

    _success() {
        setTimeout(e => this.fire('x-phrase-validated'), 2500);
    }

    _generateIndices() {
        this.requiredWords = [0, 1, 2].map(this._generateIndex);
    }

    _generateIndex(index) {
        return Math.floor(Math.random() * 8) + index * 8;
    }

    _setSlideContent(slideIndex) {
        this.$screenMnemonicValidates[slideIndex].set(
            this._generateWords(this.requiredWords[slideIndex]), // wordlist
            this.requiredWords[slideIndex] + 1, // targetIndex
            this._mnemonic[this.requiredWords[slideIndex]] // targetWord
        );
    }

    _generateWords(wordIndex) {
        const words = {};

        words[this._mnemonic[wordIndex]] = wordIndex;

        // Select 7 additional unique words from the mnemonic phrase
        while (Object.keys(words).length < 8) {
            const index = Math.floor(Math.random() * 24);
            words[this._mnemonic[index]] = index;
        }

        return Object.keys(words).sort();
    }

    _showActiveSlide() {
        const activeSlide = this._activeSlideIndex < 3 ?
            this.$screenMnemonicValidates[this._activeSlideIndex] :
            this.$screenSuccess;
        this.goTo(activeSlide.route);
    }
}

class ScreenError extends XScreen {
    html() {
        return `
            <img src="screen-error.svg">
            <h1>Error</h1>
            <h2>Unfortunately we don't know the reason</h2>
            <a button href="" class="small hidden"></a>
        `
    }

    onCreate() {
        this.$h2 = this.$('h2');
        this.$button = this.$('[button]');
        const message = this.$el.getAttribute('message');
        if (message !== undefined) {
            this.show(message);
        }
    }

    show(message) {
        this.$h2.textContent = message;
    }

    setLink(href, text) {
        this.$button.href = href;
        this.$button.textContent = text;
        this.$button.classList.remove('hidden');
    }
}

class Clipboard {
    static copy(text) {
        // A <span> contains the text to copy
        var span = document.createElement('span');
        span.textContent = text;
        span.style.whiteSpace = 'pre'; // Preserve consecutive spaces and newlines

        // An <iframe> isolates the <span> from the page's styles
        var iframe = document.createElement('iframe');
        iframe.sandbox = 'allow-same-origin';
        document.body.appendChild(iframe);

        var win = iframe.contentWindow;
        win.document.body.appendChild(span);

        var selection = win.getSelection();

        // Firefox fails to get a selection from <iframe> window, so fallback
        if (!selection) {
            win = window;
            selection = win.getSelection();
            document.body.appendChild(span);
        }

        var range = win.document.createRange();
        selection.removeAllRanges();
        range.selectNode(span);
        selection.addRange(range);

        var success = false;
        try {
            success = win.document.execCommand('copy');
        } catch (err) {}

        selection.removeAllRanges();
        span.remove();
        iframe.remove();

        return success
    }
}

class XAddress extends XElement {
    children() { return [XToast] }

    styles() { return ['x-address'] }
    
    onCreate() {
        this.addEventListener('click', e => this._onCopy());
    }

    _onCopy() {
        Clipboard.copy(this.$el.textContent);
        this.$toast.show('Address copied to clipboard!');
    }

    set address(address) {
        this.$el.textContent = address;
    }
}

class ActivationUtils {
    static get API_ROOT() { return 'https://activate.nimiq-network.com' }

    /** @param {string} ethAddress
     *  @return {Promise<number>}*/
    static async fetchBalance(ethAddress) {
        const response = await fetch(`https://api.etherscan.io/api?module=account&action=tokenbalance&contractaddress=0xcfb98637bcae43C13323EAa1731cED2B716962fD&tag=latest&address=${ethAddress}`);
        return (await response.json()).result;
    }

    /** @param {string} dashboardToken */
    static async getDashboardData(dashboardToken) {
        try {
            const request = fetch(
                `${ActivationUtils.API_ROOT}/list/${dashboardToken}`,
                { method: 'GET' }
            );
            return await request;
        } catch(e) {
            throw Error('Request failed');
        }
    }

    /** @param {string} activationToken
     *  @returns {boolean} */
    static async isValidToken(activationToken) {
        const request = fetch(
            `${ActivationUtils.API_ROOT}/activate/${activationToken}`,
            { method: 'GET' }
        );
        try {
            const response = await request;
            return response.ok;
        } catch (e) {
            return false;
        }
    }

    /** @param {string} activationToken
     * @param {string} nimiqAddress
     * @returns {boolean} */
    static async activateAddress(activationToken, nimiqAddress) {
        const request = fetch(
            `${ActivationUtils.API_ROOT}/activate/address`,
            { 
                method: 'POST',
                body: JSON.stringify({
                    'activation_token': activationToken,
                    'nimiq_address': nimiqAddress
                }),
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
            }
        );

        const response = await request;
        return response.ok;
    }

    /** @param {{birthday: Date, city: string, country_residence: string, country_nationality: string, email: string, sex: string, first_name: string, last_name: string, street: string, zip: string }} kycData */
    static async submitKyc(kycData) {
        const request = fetch(
            `${ActivationUtils.API_ROOT}/submit`,
            {
                method: 'POST',
                body: JSON.stringify(kycData),
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            }
        );

        return await request;
    }
}

class ScreenActivationAddress extends XScreenFit {
    html() {
        return `
            1. Copy your Activation Address
            <x-address></x-address>

            2. On the Ethereum Blockchain send your NET from your wallet to your Activation Address.                        
            <h3>Transfer Options</h3>
            <ul>
                <li>Send your NET directly from an exchange,</li>
                <li>or you can use <a href="https://www.myetherwallet.com/" target="_blank" class="my-ether-wallet">MyEtherWallet.com</a>,</li>
                <li>or any wallet that supports ERC20 tokens.</li>
            </ul>
            <x-grow></x-grow>
            3. Wait here until your activation balance arrives.
        `
    }

    children() { return [XAddress] }

    _onEntry() {
        window.setInterval(this._onCheckBalance.bind(this), 10000);
    }

    async _onCheckBalance() {
        const balance = await ActivationUtils.fetchBalance(this._ethAddress);
        this.fire('x-balance', balance);
    }

    setAddress(ethAddress) {
        this.$address.address = ethAddress;
        this._ethAddress = ethAddress;
    }

    get route() { return 'address' }
}

class ScreenActivation extends XScreen {
    html() {
        return `
            <h1>Activate your Nimiq Account</h1>
            <h2 secondary>Send your NET to the unique Activation Address for your Nimiq Account</h2>
            <x-slides>
                <screen-warning>
                    On the next screen you will see an Ethereum Address.
                    <ul>
                        <li>Send only NET to this address.</li>
                        <li>If you send Ether it will become inaccessible!</li>
                    </ul>
                </screen-warning>
                <screen-activation-address></screen-activation-address>
                <screen-success></screen-success>
            </x-slides>
            `
    }

    children() { return [ScreenWarning, ScreenActivationAddress, ScreenSuccess] }

    listeners() {
        return {
            'x-warning-complete': '_onWarningComplete',
            'x-balance': '_onCheckBalance'
        }
    }

    _onWarningComplete() {
        this.goTo('address');
    }

    _onCheckBalance(balance) {
        if (balance > 0) {
            window.setTimeout(() => {
                this.$screenSuccess.show(`Activation successfull.`);
                this.goTo('success');
                this.fire('x-activation-complete');
            }, 1000);
        }
    }

    setAddress(ethAddress) {
        this.$screenActivationAddress.setAddress(ethAddress);
    }
}

class XNimiqApi extends XElement {
    onCreate() {
        const connect = this.$el.getAttribute('connect') === 'true';
        this._api = NanoApi.getApi();
        this._api.setXElement(this);
        if (connect) this._api.connect();
    }
}

class ActivationTool extends XAppScreen {
    html() {
        return `
            <screen-loading><h2>Checking activation token...</h2></screen-loading>
            <screen-welcome></screen-welcome>
            <screen-identicons></screen-identicons>
            <screen-backup-file></screen-backup-file>
            <screen-backup-phrase></screen-backup-phrase>
            <screen-backup-phrase-validate></screen-backup-phrase-validate>
            <screen-activation></screen-activation>
            <screen-error></screen-error>
            <x-nimiq-api></x-nimiq-api>
        `
    }

    types() {
        /** @type {ScreenBackupPhrase} */
        this.$screenBackupPhrase = null;
        /** @type {ScreenBackupPhraseValidate} */
        this.$screenBackupPhraseValidate = null;
        /** @type {ScreenBackupFile} */
        this.$screenBackupFile = null;
        /** @type {ScreenActivation} */
        this.$screenActivation = null;
        /** @type {ScreenError} */
        this.$screenError = null;
    }

    children() {
        return [
            ScreenLoading,
            ScreenWelcome,
            ScreenBackupPhrase,
            ScreenBackupPhraseValidate,
            ScreenBackupFile,
            ScreenIdenticons,
            ScreenActivation,
            ScreenError,
            XNimiqApi
        ]
    }

    listeners() {
        return {
            'nimiq-different-tab-error':'_onDifferentTabError',
            'x-keypair': '_onKeyPair',
            'x-phrase-validated': '_onPhraseValidated',
            'x-backup-file-complete': '_onBackupFileComplete',
            'x-activation-complete': '_onActivationComplete'
        }
    }

    onCreate() {
        if (!this._error) location.href = "#";
    }

    async _onEntry() {
        this._activationToken = new URLSearchParams(document.location.search).get("activation_token");
        const isValidToken = await ActivationUtils.isValidToken(this._activationToken);
        if (isValidToken) {
            location.href = '#welcome';
        }
        else {
            this.$screenError.show('Your activation token is invalid. Please go back to the dashboard and try again.');
            this.$screenError.setLink('/apps/nimiq-activation/dashboard', 'Go to Dashboard');
            location.href = '#error';
        }
    }

    async _onKeyPair(keyPair) {
        const api = NanoApi.getApi();
        const nimAddress = keyPair.address;

        const activationSuccessfull = await ActivationUtils.activateAddress(this._activationToken, nimAddress);
        if (activationSuccessfull) {
            const ethAddress = await api.nim2ethAddress(nimAddress);
            this.$screenActivation.setAddress(ethAddress);
            const hexedPrivKey = keyPair.privateKey.toHex();
            this.$screenBackupPhrase.privateKey = hexedPrivKey;
            this.$screenBackupPhraseValidate.privateKey = hexedPrivKey;
            this.$screenBackupFile.setKeyPair(keyPair);
            location.href = '#backup-file';
        } else {
            this.$screenError.show('Your activation token is invalid. Please go back to the dashboard and try again.');
            this.$screenError.setLink('/apps/nimiq-activation/dashboard', 'Go to Dashboard');
            location.href = '#error';
        }
    }

    _onBackupFileComplete() {
        location = '#backup-phrase';
    }

    _onPhraseValidated() {
        location = '#activation';
    }

    _onActivationComplete() {
        window.location.href = `../dashboard/?address=${this._userFriendlyNimAddress}#account`;
    }

    _onDifferentTabError() {
        this._error = 'Nimiq is already running in a different tab';
        this.$screenError.show(this._error);
        location = '#error';
    }
}

ActivationTool.launch();

// Todo: Back links

return ActivationTool;

}());
