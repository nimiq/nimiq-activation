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

class ScreenLoading extends XScreenFit {
    html() {
        return `
            <x-loading-animation></x-loading-animation>
            <h2 content></h2>
        `
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

class XAccount extends XElement {
    html() {
        return `
            <x-identicon></x-identicon>
            <x-address></x-address>
        `
    }
    children() { return [XIdenticon, XAddress] }

    onCreate() {
        this.$el.addEventListener('click', e => this._onAccountSelected());
    }

    set address(address) {
        this.$identicon.address = address;
        this.$address.address = address;
        this._address = address;
    }

    _onAccountSelected() {
        this.fire('x-account-selected', this._address);
    }
}

class ScreenAccounts extends XScreenFit {
    html() {
        return `
            <x-accounts-list></x-accounts-list>
            <button>Create Account</button>
        `
    }

    onCreate() {
        this.$accountsList = this.$('x-accounts-list');
        this.$('button').addEventListener('click', e => this._onCreateAccount());
    }

    set accounts(accounts) {
        accounts.forEach(async account => await this._createAccount(account));
    }

    async addAccount(account){
        await this._createAccount(account);
    }

    async _createAccount(account) {
        const xAccount = XAccount.createElement();
        xAccount.address = account;
        this.$accountsList.appendChild(xAccount.$el);
    }

    _onCreateAccount() {
        this.fire('x-create-account');
    }
}

class ScreenHome extends XScreen {
    html() {
        return `
            <h1>Accounts Dashboard</h1>
            <h2>Activate Nimiq Accounts and manage your activated Accounts</h2>
            <x-slides>
                <screen-loading>Loading Data</screen-loading>                
                <screen-error></screen-error>              
                <screen-accounts></screen-accounts>
            </x-slides>
        `
    }

    children() { return [ ScreenLoading, ScreenAccounts, ScreenError ] }

    listeners() {
        return {
            'x-create-account': '_onCreateAccount',
        }
    }

    async _onBeforeEntry() {
        if (this._hasContent) return;
        this._hasContent = true;

        let dashboardToken = new URLSearchParams(document.location.search).get("dashboard_token");
        if (dashboardToken !== null) {
            localStorage.setItem('dashboardToken', dashboardToken);
        } else {
            dashboardToken = localStorage.getItem('dashboardToken');
        }

        const apiResponse = await ActivationUtils.getDashboardData(dashboardToken);
        if (apiResponse.ok) {
            const result = await apiResponse.json();
            this._activationToken = result.activation_token;
            this.$screenAccounts.accounts = result.addresses;
            this.goTo('accounts');
        } else {
            this.$screenError.show('Invalid dashboard token. Please use a valid link.');
            this.goTo('error');
        }
    }

    _onCreateAccount() {
        window.location.href = '../activate/?activation_token=' + this._activationToken;
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

class XAmount extends XElement {
    html(){
        return `
            <x-currency-1></x-currency-1>
            <x-currency-2></x-currency-2>`
    }

    onCreate(){
        this.$currency1 = this.$('x-currency-1');
        this.$currency2 = this.$('x-currency-2');
    }

    set value(value) {
        value = Number(value);
        this.$currency1.textContent = NanoApi.formatValue(value, 3) || '';
        this.$currency2.textContent = NanoApi.formatValueInDollar(value) || '';
    }
}

class ScreenAccount extends XScreen {
    html() {
        return `
        	<h1>Nimiq Account</h1>
        	<h2>Check your activated account's identicon, address and balance</h2>
			<x-grow>
				<x-identicon></x-identicon>
				<x-address></x-address>
				<x-amount></x-amount>
			</x-grow>
			<button>Back to Dashboard</button>
		`
    }

    children() { return [XIdenticon, XAddress, XAmount] }

    onCreate() {
        this.$('button').addEventListener('click', e => this._onBack());
    }

    _onBack() {
        this.goTo('home/accounts');
    }

    async _onBeforeEntry() {
        this.address = new URLSearchParams(document.location.search).get("address");
        await this._fetchAmount();
    }

    set address(address) {
        this.$identicon.address = address;
        this.$address.address = address;
        this._address = address;
    }

    async _fetchAmount() {
        const ethAddress = await NanoApi.getApi().nim2ethAddress(this._address);
        const balance = await ActivationUtils.fetchBalance(ethAddress);
        this.$amount.value = balance;
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

class Dashboard extends XAppScreen {
    html() {
        return `
            <screen-home></screen-home>
            <screen-account></screen-account>
            <screen-error></screen-error>
            <x-nimiq-api></x-nimiq-api>
        `
    }

    children() { return [ScreenHome, ScreenAccount, ScreenError, XNimiqApi] }

    listeners() {
        return {
            'nimiq-different-tab-error':'_onDifferentTabError',
            'x-account-selected': '_onAccountSelected'
        }
    }

    _onAccountSelected(address) {
        window.location = '?address=' + address + '#account';
    }

    _onDifferentTabError() {
        this.$screenError.show('Nimiq is already running in a different tab');
        location = '#error';
    }
}

Dashboard.launch();

return Dashboard;

}());
