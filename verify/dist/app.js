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

class ScreenWelcome extends XScreen {
    html() {
        return `
            <nimiq-logo large>Nimiq Activation</nimiq-logo>
            <h1>Welcome to Nimiq Activation</h1>
            <h2>The Nimiq Activation Tool will help guide you through the process of activating your Genesis Nimiq (NIM) from NET.</h2>
            <a button href="#terms">View Terms</a>
        `
    }
}

class ScreenTerms extends XScreen {
    html() {
        return `
		    <h1>Activation Terms</h1>
		    <h2>Please read the following terms carefully</h2>
		    <section>
		    	<h3>Heading 1</h3>
		    	<p>
		    		Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
		    	</p>
		    	<h3>Heading 2</h3>
		    	<p>
		    		Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
		    	</p>
		    	<h3>Heading 3</h3>
		    	<p>
		    		Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
		    	</p>
		    	<div class="same-size-buttons">
				    <a id="disagree" button class="small fixed-size secondary" href="https://www.nimiq.com">I Disagree</a>
				    <a id="agree" button class="small fixed-size" href="#terms2">I Agree</a>
				</div>
		    </section>
		`
    }
}

class ScreenTerms2 extends XScreen {
    html() {
        return `
		    <h1>Activation Terms</h1>
		    <h2>Please read the following terms carefully</h2>
		    <section>
		    	<h3>Heading 1</h3>
		    	<p>
		    		Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
		    	</p>
		    	<h3>Heading 2</h3>
		    	<p>
		    		Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
		    	</p>
		    	<h3>Heading 3</h3>
		    	<p>
		    		Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
		    	</p>
		    	<div class="same-size-buttons">
				    <a id="disagree" button class="small fixed-size secondary" href="https://www.nimiq.com">I Disagree</a>
				    <a id="agree" button class="small fixed-size" href="#form-handler">I Agree</a>
				</div>
		    </section>
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

class XCountrySelect extends XElement {
    html() {
        return `
            <select name="nationality" required="">
                <option value="">Select Country</option>
                <option value="AFG">Afghanistan</option>
                <option value="ALB">Albania</option>
                <option value="DZA">Algeria</option>
                <option value="AND">Andorra</option>
                <option value="AGO">Angola</option>
                <option value="AIA">Anguilla</option>
                <option value="ATG">Antigua and Barbuda</option>
                <option value="ARG">Argentina</option>
                <option value="ARM">Armenia</option>
                <option value="AUS">Australia</option>
                <option value="AUT">Austria</option>
                <option value="AZE">Azerbaijan</option>
                <option value="BHS">Bahamas</option>
                <option value="BHR">Bahrain</option>
                <option value="BGD">Bangladesh</option>
                <option value="BRB">Barbados</option>
                <option value="BLR">Belarus</option>
                <option value="BEL">Belgium</option>
                <option value="BLZ">Belize</option>
                <option value="BEN">Benin</option>
                <option value="BMU">Bermuda</option>
                <option value="BTN">Bhutan</option>
                <option value="BOL">Bolivia, Plurinational State of</option>
                <option value="BIH">Bosnia and Herzegovina</option>
                <option value="BWA">Botswana</option>
                <option value="BRA">Brazil</option>
                <option value="BRN">Brunei Darussalam</option>
                <option value="BGR">Bulgaria</option>
                <option value="BFA">Burkina Faso</option>
                <option value="BDI">Burundi</option>
                <option value="KHM">Cambodia</option>
                <option value="CMR">Cameroon</option>
                <option value="CAN">Canada</option>
                <option value="CPV">Cape Verde</option>
                <option value="CYM">Cayman Islands</option>
                <option value="TCD">Chad</option>
                <option value="CHL">Chile</option>
                <option value="CHN">China</option>
                <option value="COL">Colombia</option>
                <option value="COM">Comoros</option>
                <option value="COD">Congo, the Democratic Republic of the</option>
                <option value="COK">Cook Islands</option>
                <option value="CRI">Costa Rica</option>
                <option value="CIV">C&ocirc;te d'Ivoire</option>
                <option value="HRV">Croatia</option>
                <option value="CUB">Cuba</option>
                <option value="CYP">Cyprus</option>
                <option value="CZE">Czech Republic</option>
                <option value="DNK">Denmark</option>
                <option value="DJI">Djibouti</option>
                <option value="DMA">Dominica</option>
                <option value="DOM">Dominican Republic</option>
                <option value="ECU">Ecuador</option>
                <option value="EGY">Egypt</option>
                <option value="SLV">El Salvador</option>
                <option value="GNQ">Equatorial Guinea</option>
                <option value="EST">Estonia</option>
                <option value="ETH">Ethiopia</option>
                <option value="FJI">Fiji</option>
                <option value="FIN">Finland</option>
                <option value="FRA">France</option>
                <option value="GAB">Gabon</option>
                <option value="GMB">Gambia</option>
                <option value="GEO">Georgia</option>
                <option value="DEU">Germany</option>
                <option value="GHA">Ghana</option>
                <option value="GIB">Gibraltar</option>
                <option value="GRC">Greece</option>
                <option value="GRD">Grenada</option>
                <option value="GTM">Guatemala</option>
                <option value="GGY">Guernsey</option>
                <option value="GIN">Guinea</option>
                <option value="GNB">Guinea-Bissau</option>
                <option value="GUY">Guyana</option>
                <option value="HTI">Haiti</option>
                <option value="HND">Honduras</option>
                <option value="HKG">Hong Kong</option>
                <option value="HUN">Hungary</option>
                <option value="ISL">Iceland</option>
                <option value="IND">India</option>
                <option value="IDN">Indonesia</option>
                <option value="IRQ">Iraq</option>
                <option value="IRL">Ireland</option>
                <option value="IMN">Isle of Man</option>
                <option value="ISR">Israel</option>
                <option value="ITA">Italy</option>
                <option value="JAM">Jamaica</option>
                <option value="JPN">Japan</option>
                <option value="JEY">Jersey</option>
                <option value="JOR">Jordan</option>
                <option value="KAZ">Kazakhstan</option>
                <option value="KEN">Kenya</option>
                <option value="KOR">Korea, Republic of</option>
                <option value="XKX">Kosovo</option>
                <option value="KWT">Kuwait</option>
                <option value="KGZ">Kyrgyzstan</option>
                <option value="LAO">Lao People's Democratic Republic</option>
                <option value="LVA">Latvia</option>
                <option value="LBN">Lebanon</option>
                <option value="LSO">Lesotho</option>
                <option value="LBR">Liberia</option>
                <option value="LBY">Libyan Arab Jamahiriya</option>
                <option value="LIE">Liechtenstein</option>
                <option value="LTU">Lithuania</option>
                <option value="LUX">Luxembourg</option>
                <option value="MAC">Macao</option>
                <option value="MKD">Macedonia, the former Yugoslav Republic of</option>
                <option value="MDG">Madagascar</option>
                <option value="MWI">Malawi</option>
                <option value="MYS">Malaysia</option>
                <option value="MDV">Maldives</option>
                <option value="MLI">Mali</option>
                <option value="MLT">Malta</option>
                <option value="MHL">Marshall Islands</option>
                <option value="MRT">Mauritania</option>
                <option value="MUS">Mauritius</option>
                <option value="MEX">Mexico</option>
                <option value="FSM">Micronesia, Federated States of</option>
                <option value="MDA">Moldova, Republic of</option>
                <option value="MCO">Monaco</option>
                <option value="MNG">Mongolia</option>
                <option value="MNE">Montenegro</option>
                <option value="MSR">Montserrat</option>
                <option value="MAR">Morocco</option>
                <option value="MOZ">Mozambique</option>
                <option value="MMR">Myanmar</option>
                <option value="NAM">Namibia</option>
                <option value="NPL">Nepal</option>
                <option value="NLD">Netherlands</option>
                <option value="NZL">New Zealand</option>
                <option value="NIC">Nicaragua</option>
                <option value="NER">Niger</option>
                <option value="NGA">Nigeria</option>
                <option value="NOR">Norway</option>
                <option value="OMN">Oman</option>
                <option value="PAK">Pakistan</option>
                <option value="PLW">Palau</option>
                <option value="PSE">Palestinian Territory, Occupied</option>
                <option value="PAN">Panama</option>
                <option value="PNG">Papua New Guinea</option>
                <option value="PRY">Paraguay</option>
                <option value="PER">Peru</option>
                <option value="PHL">Philippines</option>
                <option value="POL">Poland</option>
                <option value="PRT">Portugal</option>
                <option value="QAT">Qatar</option>
                <option value="ROU">Romania</option>
                <option value="RUS">Russian Federation</option>
                <option value="RWA">Rwanda</option>
                <option value="KNA">Saint Kitts and Nevis</option>
                <option value="LCA">Saint Lucia</option>
                <option value="VCT">Saint Vincent and the Grenadines</option>
                <option value="SMR">San Marino</option>
                <option value="STP">Sao Tome and Principe</option>
                <option value="SAU">Saudi Arabia</option>
                <option value="SEN">Senegal</option>
                <option value="SRB">Serbia</option>
                <option value="SYC">Seychelles</option>
                <option value="SLE">Sierra Leone</option>
                <option value="SGP">Singapore</option>
                <option value="SVK">Slovakia</option>
                <option value="SVN">Slovenia</option>
                <option value="ZAF">South Africa</option>
                <option value="ESP">Spain</option>
                <option value="LKA">Sri Lanka</option>
                <option value="SDN">Sudan</option>
                <option value="SUR">Suriname</option>
                <option value="SWZ">Swaziland</option>
                <option value="SWE">Sweden</option>
                <option value="CHE">Switzerland</option>
                <option value="SYR">Syrian Arab Republic</option>
                <option value="TWN">Taiwan</option>
                <option value="TJK">Tajikistan</option>
                <option value="TZA">Tanzania, United Republic of</option>
                <option value="THA">Thailand</option>
                <option value="TLS">Timor-Leste</option>
                <option value="TGO">Togo</option>
                <option value="TON">Tonga</option>
                <option value="TTO">Trinidad and Tobago</option>
                <option value="TUN">Tunisia</option>
                <option value="TUR">Turkey</option>
                <option value="TKM">Turkmenistan</option>
                <option value="TCA">Turks and Caicos Islands</option>
                <option value="UGA">Uganda</option>
                <option value="UKR">Ukraine</option>
                <option value="ARE">United Arab Emirates</option>
                <option value="GBR">United Kingdom</option>
                <option value="URY">Uruguay</option>
                <option value="UZB">Uzbekistan</option>
                <option value="VUT">Vanuatu</option>
                <option value="VEN">Venezuela, Bolivarian Republic of</option>
                <option value="VNM">Viet Nam</option>
                <option value="VGB">Virgin Islands, British</option>
                <option value="YEM">Yemen</option>
                <option value="ZMB">Zambia</option>
                <option value="ZWE">Zimbabwe</option>
            </select>
        `
    }

    onCreate() {
        this.$select = this.$('select');
        const name = this.$el.getAttribute('name');
        const required = this.$el.getAttribute('required');
        this.$select.setAttribute('name', name);
        this.$select.setAttribute('required', required);
    }
}

class XDateofbirthSelect extends XElement {
    html() {
        return `
            <input type="hidden">
            <select>
                <option value="">Year</option>
                <option>2018</option>
                <option>2017</option>
                <option>2016</option>
                <option>2015</option>
                <option>2014</option>
                <option>2013</option>
                <option>2012</option>
                <option>2011</option>
                <option>2010</option>
                <option>2009</option>
                <option>2008</option>
                <option>2007</option>
                <option>2006</option>
                <option>2005</option>
                <option>2004</option>
                <option>2003</option>
                <option>2002</option>
                <option>2001</option>
                <option>2000</option>
                <option>1999</option>
                <option>1998</option>
                <option>1997</option>
                <option>1996</option>
                <option>1995</option>
                <option>1994</option>
                <option>1993</option>
                <option>1992</option>
                <option>1991</option>
                <option>1990</option>
                <option>1989</option>
                <option>1988</option>
                <option>1987</option>
                <option>1986</option>
                <option>1985</option>
                <option>1984</option>
                <option>1983</option>
                <option>1982</option>
                <option>1981</option>
                <option>1980</option>
                <option>1979</option>
                <option>1978</option>
                <option>1977</option>
                <option>1976</option>
                <option>1975</option>
                <option>1974</option>
                <option>1973</option>
                <option>1972</option>
                <option>1971</option>
                <option>1970</option>
                <option>1969</option>
                <option>1968</option>
                <option>1967</option>
                <option>1966</option>
                <option>1965</option>
                <option>1964</option>
                <option>1963</option>
                <option>1962</option>
                <option>1961</option>
                <option>1960</option>
                <option>1959</option>
                <option>1958</option>
                <option>1957</option>
                <option>1956</option>
                <option>1955</option>
                <option>1954</option>
                <option>1953</option>
                <option>1952</option>
                <option>1951</option>
                <option>1950</option>
                <option>1949</option>
                <option>1948</option>
                <option>1947</option>
                <option>1946</option>
                <option>1945</option>
                <option>1944</option>
                <option>1943</option>
                <option>1942</option>
                <option>1941</option>
                <option>1940</option>
                <option>1939</option>
                <option>1938</option>
                <option>1937</option>
                <option>1936</option>
                <option>1935</option>
                <option>1934</option>
                <option>1933</option>
                <option>1932</option>
                <option>1931</option>
                <option>1930</option>
                <option>1929</option>
                <option>1928</option>
                <option>1927</option>
                <option>1926</option>
                <option>1925</option>
                <option>1924</option>
                <option>1923</option>
                <option>1922</option>
                <option>1921</option>
                <option>1920</option>
                <option>1919</option>
            </select>
            <select>
                <option value="">Month</option>
                <option value="01">Jan</option>
                <option value="02">Feb</option>
                <option value="03">Mar</option>
                <option value="04">Apr</option>
                <option value="05">May</option>
                <option value="06">Jun</option>
                <option value="07">Jul</option>
                <option value="08">Aug</option>
                <option value="09">Sep</option>
                <option value="10">Oct</option>
                <option value="11">Nov</option>
                <option value="12">Dec</option>
            </select>
            <select>
                <option value="">Day</option>
                <option>01</option>
                <option>02</option>
                <option>03</option>
                <option>04</option>
                <option>05</option>
                <option>06</option>
                <option>07</option>
                <option>08</option>
                <option>09</option>
                <option>10</option>
                <option>11</option>
                <option>12</option>
                <option>13</option>
                <option>14</option>
                <option>15</option>
                <option>16</option>
                <option>17</option>
                <option>18</option>
                <option>19</option>
                <option>20</option>
                <option>21</option>
                <option>22</option>
                <option>23</option>
                <option>24</option>
                <option>25</option>
                <option>26</option>
                <option>27</option>
                <option>28</option>
                <option>29</option>
                <option>30</option>
                <option>31</option>
            </select>
        `
    }

    onCreate() {
        this.$input = this.$('input');
        this.$$selects = this.$$('select');
        this.$year = this.$$selects[0];
        this.$month = this.$$selects[1];
        this.$day = this.$$selects[2];

        this.addEventListener('change', this._onChange.bind(this));

        const name = this.$el.getAttribute('name');
        const required = this.$el.getAttribute('required');

        this.$input.setAttribute('name', name);

        this.$year.setAttribute('required', required);
        this.$month.setAttribute('required', required);
        this.$day.setAttribute('required', required);
    }

    _onChange() {
        this.$input.value = [this.$year.value, this.$month.value, this.$day.value].join('-');
    }
}

class ScreenForm extends XScreenFit {
    html() {
        return `
            <h1>Enter your Details</h1>
            <form>
                <fieldset>
                <legend>Please match exactly information of identifying document</legend>
                <div>
                <label>Nationality</label>
                <x-country-select name="nationality" required></x-country-select>
                </div>
                <div>
                    <label for="gender">Salutation</label>
                    <select name="gender" required>
                        <option value="0">Mr.</option>
                        <option value="1">Mrs./Ms.</option>
                    </select>
                </div>
                <div>
                <label for="first_name">First name(s)</label>
                <input name="first_name" maxlength="100" placeholder="Satoshi" required />
                </div>
                <div>
                <label for="last_name">Last name(s)</label>
                <input name="last_name" maxlength="100" placeholder="Nakamoto" required />
                </div>
                <div>
                <label>Date of Birth</label>
                <x-dateofbirth-select name="date_of_birth" required></x-dateofbirth-select>
                </div>
                </fieldset>
                <fieldset>
                    <legend>Please provide your current address of residence</legend>
                <div>
                <label>Country of Residence</label>
                <x-country-select name="country_of_residence" required></x-country-select>
                </div>

                <div>
                <label>Address</label>
                <input name="address" maxlength="200" required />
                </div>
                <div>
                <label>City</label>
                <input name="city" maxlength="64" required />
                </div>
                <div>
                <label>Postal Code</label>
                <input name="postal_code" maxlength="15" required />
                </div>
                </fieldset>
                <fieldset>
                <legend>Please provide your personal email address, to which the NIM activation link
                        will be sent after passing the KYC/AML checks</legend>
                <div>
                <label>E-Mail</label>
                <input name="email" maxlength="100" type="email" placeholder="satoshin@gmx.com" required/>
                </div>
                <div>
                <label>E-Mail confirmation</label>
                <input name="confirm_email" maxlength="100" type="email" placeholder="satoshin@gmx.com" required/>
                </div>
                </fieldset>

                <button type="submit">Submit</button>
            </form>
        `
    }

    children() {
        return [ [ XCountrySelect ], XDateofbirthSelect ];
    }

    types() {
        /** @type {XCountrySelect[]} */
        this.$countrySelects = null;
        /** @type {XDateofbirthSelect} */
        this.$dateofbirthSelect = null;
        /** @type {Element} */
        this.$form = null;
    }

    onCreate() {
        this.$form = this.$('form');

        // email validation
        const $email = this.$('[name="email"]');
        const $confirm_email = this.$('[name="confirm_email"]');

        const validateEmail = () => {
            if($email.value != $confirm_email.value) {
                $confirm_email.setCustomValidity("Emails don't match");
            } else {
                $confirm_email.setCustomValidity('');
            }
        };

        $email.addEventListener('change', validateEmail);
        $email.addEventListener('keyup', validateEmail);
        $confirm_email.addEventListener('change', validateEmail);
        $confirm_email.addEventListener('keyup', validateEmail);

        // disallow paste in email fields
        $email.addEventListener('paste', e => e.preventDefault());
        $confirm_email.addEventListener('paste', e => e.preventDefault());
    }


}

// Todo: Show somehow possibility to scroll on Apple?

class ScreenConfirm extends XScreenFit {

    html() {
        return `
            <h1>Review your Details</h1>
            <div scroll-container>
                <fieldset>
                    <legend>Information of identifying document</legend>
                    <div>
                        <label>Nationality</label>
                        <strong name="nationality"></strong>
                    </div>
                    <div>
                        <label>Salutation</label>
                        <strong name="gender"></strong>
                    </div>
                    <div>
                        <label>First name(s)</label>
                        <strong name="first_name"></strong>
                    </div>
                    <div>
                        <label>Last name(s)</label>
                        <strong name="last_name"></strong>
                    </div>
                    <div>
                        <label>Date of Birth</label>
                        <strong name="date_of_birth"></strong>
                    </div>
                </fieldset>
                <fieldset>
                    <legend>Your current address of residence</legend>
                    <div>
                        <label>Country of Residence</label>
                        <strong name="country_of_residence"></strong>
                    </div>

                    <div>
                        <label>Address</label>
                        <strong name="address"></strong>
                    </div>
                    <div>
                        <label>City</label>
                        <strong name="city"></strong>
                    </div>
                    <div>
                        <label>Postal Code</label>
                        <strong name="postal_code"></strong>
                    </div>
                </fieldset>
                <fieldset>
                    <legend>Your personal email address, to which the NIM activation link
                            will be sent after passing the KYC/AML checks</legend>
                    <div>
                        <label>E-Mail</label>
                        <strong name="email"></strong>
                    </div>
                </fieldset>
                <button disabled="disabled">Confirm</button>
                <a secondary href="#form-handler">Back</a>
            </div>
        `
    }

    onCreate() {
        this.$button = this.$('button');

        this.$nationality = this.$('strong[name="nationality"]');
        this.$gender = this.$('strong[name="gender"]');
        this.$first_name = this.$('strong[name="first_name"]');
        this.$last_name = this.$('strong[name="last_name"]');
        this.$date_of_birth = this.$('strong[name="date_of_birth"]');
        this.$country_of_residence = this.$('strong[name="country_of_residence"]');
        this.$address = this.$('strong[name="address"]');
        this.$city = this.$('strong[name="city"]');
        this.$postal_code = this.$('strong[name="postal_code"]');
        this.$email = this.$('strong[name="email"]');

        this.monthsDict = {
            '01': 'January',
            '02': 'February',
            '03': 'March',
            '04': 'April',
            '05': 'May',
            '06': 'June',
            '07': 'July',
            '08': 'August',
            '09': 'September',
            '10': 'October',
            '11': 'November',
            '12': 'December'
        };

        this.countriesDict = {
            "AFG": "Afghanistan",
            "ALA": "&#197;land Islands",
            "ALB": "Albania",
            "DZA": "Algeria",
            "ASM": "American Samoa",
            "AND": "Andorra",
            "AGO": "Angola",
            "AIA": "Anguilla",
            "ATA": "Antarctica",
            "ATG": "Antigua and Barbuda",
            "ARG": "Argentina",
            "ARM": "Armenia",
            "ABW": "Aruba",
            "AUS": "Australia",
            "AUT": "Austria",
            "AZE": "Azerbaijan",
            "BHS": "Bahamas",
            "BHR": "Bahrain",
            "BGD": "Bangladesh",
            "BRB": "Barbados",
            "BLR": "Belarus",
            "BEL": "Belgium",
            "BLZ": "Belize",
            "BEN": "Benin",
            "BMU": "Bermuda",
            "BTN": "Bhutan",
            "BOL": "Bolivia, Plurinational State of",
            "BIH": "Bosnia and Herzegovina",
            "BWA": "Botswana",
            "BVT": "Bouvet Island",
            "BRA": "Brazil",
            "IOT": "British Indian Ocean Territory",
            "BRN": "Brunei Darussalam",
            "BGR": "Bulgaria",
            "BFA": "Burkina Faso",
            "BDI": "Burundi",
            "KHM": "Cambodia",
            "CMR": "Cameroon",
            "CAN": "Canada",
            "CPV": "Cape Verde",
            "CYM": "Cayman Islands",
            "CAF": "Central African Republic",
            "TCD": "Chad",
            "CHL": "Chile",
            "CHN": "China",
            "CXR": "Christmas Island",
            "CCK": "Cocos (Keeling) Islands",
            "COL": "Colombia",
            "COM": "Comoros",
            "COG": "Congo",
            "COD": "Congo, the Democratic Republic of the",
            "COK": "Cook Islands",
            "CRI": "Costa Rica",
            "CIV": "C&#244;te d'Ivoire",
            "HRV": "Croatia",
            "CUB": "Cuba",
            "CYP": "Cyprus",
            "CZE": "Czech Republic",
            "DNK": "Denmark",
            "DJI": "Djibouti",
            "DMA": "Dominica",
            "DOM": "Dominican Republic",
            "ECU": "Ecuador",
            "EGY": "Egypt",
            "SLV": "El Salvador",
            "GNQ": "Equatorial Guinea",
            "ERI": "Eritrea",
            "EST": "Estonia",
            "ETH": "Ethiopia",
            "FLK": "Falkland Islands (Malvinas)",
            "FRO": "Faroe Islands",
            "FJI": "Fiji",
            "FIN": "Finland",
            "FRA": "France",
            "GUF": "French Guiana",
            "PYF": "French Polynesia",
            "ATF": "French Southern Territories",
            "GAB": "Gabon",
            "GMB": "Gambia",
            "GEO": "Georgia",
            "DEU": "Germany",
            "GHA": "Ghana",
            "GIB": "Gibraltar",
            "GRC": "Greece",
            "GRL": "Greenland",
            "GRD": "Grenada",
            "GLP": "Guadeloupe",
            "GUM": "Guam",
            "GTM": "Guatemala",
            "GGY": "Guernsey",
            "GIN": "Guinea",
            "GNB": "Guinea-Bissau",
            "GUY": "Guyana",
            "HTI": "Haiti",
            "HMD": "Heard Island and McDonald Islands",
            "VAT": "Holy See (Vatican City State)",
            "HND": "Honduras",
            "HKG": "Hong Kong",
            "HUN": "Hungary",
            "ISL": "Iceland",
            "IND": "India",
            "IDN": "Indonesia",
            "IRN": "Iran, Islamic Republic of",
            "IRQ": "Iraq",
            "IRL": "Ireland",
            "IMN": "Isle of Man",
            "ISR": "Israel",
            "ITA": "Italy",
            "JAM": "Jamaica",
            "JPN": "Japan",
            "JEY": "Jersey",
            "JOR": "Jordan",
            "KAZ": "Kazakhstan",
            "KEN": "Kenya",
            "KIR": "Kiribati",
            "PRK": "Korea, Democratic People's Republic of",
            "KOR": "Korea, Republic of",
            "KWT": "Kuwait",
            "KGZ": "Kyrgyzstan",
            "LAO": "Lao People's Democratic Republic",
            "LVA": "Latvia",
            "LBN": "Lebanon",
            "LSO": "Lesotho",
            "LBR": "Liberia",
            "LBY": "Libyan Arab Jamahiriya",
            "LIE": "Liechtenstein",
            "LTU": "Lithuania",
            "LUX": "Luxembourg",
            "MAC": "Macao",
            "MKD": "Macedonia, the former Yugoslav Republic of",
            "MDG": "Madagascar",
            "MWI": "Malawi",
            "MYS": "Malaysia",
            "MDV": "Maldives",
            "MLI": "Mali",
            "MLT": "Malta",
            "MHL": "Marshall Islands",
            "MTQ": "Martinique",
            "MRT": "Mauritania",
            "MUS": "Mauritius",
            "MYT": "Mayotte",
            "MEX": "Mexico",
            "FSM": "Micronesia, Federated States of",
            "MDA": "Moldova, Republic of",
            "MCO": "Monaco",
            "MNG": "Mongolia",
            "MNE": "Montenegro",
            "MSR": "Montserrat",
            "MAR": "Morocco",
            "MOZ": "Mozambique",
            "MMR": "Myanmar",
            "NAM": "Namibia",
            "NRU": "Nauru",
            "NPL": "Nepal",
            "NLD": "Netherlands",
            "ANT": "Netherlands Antilles",
            "NCL": "New Caledonia",
            "NZL": "New Zealand",
            "NIC": "Nicaragua",
            "NER": "Niger",
            "NGA": "Nigeria",
            "NIU": "Niue",
            "NFK": "Norfolk Island",
            "MNP": "Northern Mariana Islands",
            "NOR": "Norway",
            "OMN": "Oman",
            "PAK": "Pakistan",
            "PLW": "Palau",
            "PSE": "Palestinian Territory, Occupied",
            "PAN": "Panama",
            "PNG": "Papua New Guinea",
            "PRY": "Paraguay",
            "PER": "Peru",
            "PHL": "Philippines",
            "PCN": "Pitcairn",
            "POL": "Poland",
            "PRT": "Portugal",
            "PRI": "Puerto Rico",
            "QAT": "Qatar",
            "REU": "R&#233;union",
            "ROU": "Romania",
            "RUS": "Russian Federation",
            "RWA": "Rwanda",
            "BLM": "Saint Barth&#233;lemy",
            "SHN": "Saint Helena, Ascension and Tristan da Cunha",
            "KNA": "Saint Kitts and Nevis",
            "LCA": "Saint Lucia",
            "MAF": "Saint Martin (French part)",
            "SPM": "Saint Pierre and Miquelon",
            "VCT": "Saint Vincent and the Grenadines",
            "WSM": "Samoa",
            "SMR": "San Marino",
            "STP": "Sao Tome and Principe",
            "SAU": "Saudi Arabia",
            "SEN": "Senegal",
            "SRB": "Serbia",
            "SYC": "Seychelles",
            "SLE": "Sierra Leone",
            "SGP": "Singapore",
            "SVK": "Slovakia",
            "SVN": "Slovenia",
            "SLB": "Solomon Islands",
            "SOM": "Somalia",
            "ZAF": "South Africa",
            "SGS": "South Georgia and the South Sandwich Islands",
            "ESP": "Spain",
            "LKA": "Sri Lanka",
            "SDN": "Sudan",
            "SUR": "Suriname",
            "SJM": "Svalbard and Jan Mayen",
            "SWZ": "Swaziland",
            "SWE": "Sweden",
            "CHE": "Switzerland",
            "SYR": "Syrian Arab Republic",
            "TWN": "Taiwan, Province of China",
            "TJK": "Tajikistan",
            "TZA": "Tanzania, United Republic of",
            "THA": "Thailand",
            "TLS": "Timor-Leste",
            "TGO": "Togo",
            "TKL": "Tokelau",
            "TON": "Tonga",
            "TTO": "Trinidad and Tobago",
            "TUN": "Tunisia",
            "TUR": "Turkey",
            "TKM": "Turkmenistan",
            "TCA": "Turks and Caicos Islands",
            "TUV": "Tuvalu",
            "UGA": "Uganda",
            "UKR": "Ukraine",
            "ARE": "United Arab Emirates",
            "GBR": "United Kingdom",
            "USA": "United States",
            "UMI": "United States Minor Outlying Islands",
            "URY": "Uruguay",
            "UZB": "Uzbekistan",
            "VUT": "Vanuatu",
            "VEN": "Venezuela, Bolivarian Republic of",
            "VNM": "Viet Nam",
            "VGB": "Virgin Islands, British",
            "VIR": "Virgin Islands, U.S.",
            "WLF": "Wallis and Futuna",
            "ESH": "Western Sahara",
            "YEM": "Yemen",
            "ZMB": "Zambia",
            "ZWE": "Zimbabwe"
        };
    }

    set(data) {
        const dob = data.date_of_birth.split('-');
        dob[1] = this.monthsDict[dob[1]];
        const human_dob = dob.join(' ');

        this.$nationality.textContent = this._parseHtmlEntities(this.countriesDict[data.nationality]);
        this.$gender.textContent = data.gender === 0 ? 'Mr.' : 'Mrs.';
        this.$first_name.textContent = data.first_name;
        this.$last_name.textContent = data.last_name;
        this.$date_of_birth.textContent = human_dob;
        this.$country_of_residence.textContent = this._parseHtmlEntities(this.countriesDict[data.country_of_residence]);
        this.$address.textContent = data.address;
        this.$city.textContent = data.city;
        this.$postal_code.textContent = data.postal_code;
        this.$email.textContent = data.email;

        // The confirm button is disabled on page-load, to prevent submitting empty
        // data when reloading the page at the #form-handler/confirm URL.
        this.$button.removeAttribute('disabled');
    }

    _parseHtmlEntities(str) {
        return str.replace(/&#([0-9]{1,3});/gi, function(match, numStr) {
            var num = parseInt(numStr, 10); // read num as normal number
            return String.fromCharCode(num);
        });
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

/**
 * Retrieves input data from a form and returns it as a JSON object.
 * @param  {HTMLFormControlsCollection} elements  the form elements
 * @return {Object}                               form data as an object literal
 */
var FormToObject = ({ elements }) => [].reduce.call(elements, (data, element) => {

    // Make sure the element has the required properties and should be added.
    if (isValidElement(element) && isValidValue(element)) {

        /*
         * Some fields allow for more than one value, so we need to check if this
         * is one of those fields and, if so, store the values as an array.
         */
        if (isCheckbox(element)) {
            data[element.name] = (data[element.name] || []).concat(element.value);
        } else if (isMultiSelect(element)) {
            data[element.name] = getSelectValues(element);
        } else {
            data[element.name] = element.value;
        }
    }

    return data;
}, {});

/**
 * Checks that an element has a non-empty `name` and `value` property.
 * @param  {Element} element  the element to check
 * @return {Bool}             true if the element is an input, false if not
 */
const isValidElement = element => {
    return element.name && element.value;
};

/**
 * Checks if an element’s value can be saved (e.g. not an unselected checkbox).
 * @param  {Element} element  the element to check
 * @return {Boolean}          true if the value should be added, false if not
 */
const isValidValue = element => {
    return (!['checkbox', 'radio'].includes(element.type) || element.checked);
};

/**
 * Checks if an input is a checkbox, because checkboxes allow multiple values.
 * @param  {Element} element  the element to check
 * @return {Boolean}          true if the element is a checkbox, false if not
 */
const isCheckbox = element => element.type === 'checkbox';

/**
 * Checks if an input is a `select` with the `multiple` attribute.
 * @param  {Element} element  the element to check
 * @return {Boolean}          true if the element is a multiselect, false if not
 */
const isMultiSelect = element => element.options && element.multiple;

/**
 * Retrieves the selected options from a multi-select as an array.
 * @param  {HTMLOptionsCollection} options  the options for the select
 * @return {Array}                          an array of selected option values
 */
const getSelectValues = options => [].reduce.call(options, (values, option) => {
    return option.selected ? values.concat(option.value) : values;
}, []);

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

class ScreenFormHandler extends XScreen {
    html() {
        return `
            <x-slides>
                <screen-form></screen-form>
                <screen-confirm></screen-confirm>
                <screen-loading>Uploading your data...</screen-loading>
                <screen-error></screen-error>
            </x-slides>
        `
    }

    types() {
        /** @type {ScreenForm} */
        this.$screenForm = null;
        /** @type {ScreenConfirm} */
        this.$screenConfirm = null;
        /** @type {ScreenLoading} */
        this.$screenLoading = null;
        /** @type {ScreenError} */
        this.$screenError = null;
    }

    children() {
        return [ScreenForm, ScreenConfirm, ScreenLoading, ScreenError];
    }

    onCreate() {
        this.$screenForm.$form.addEventListener('submit', this._onFormSubmit.bind(this));
        this.$screenConfirm.$button.addEventListener('click', this._onConfirmSubmit.bind(this));
    }

    _onFormSubmit(e) {
        e.preventDefault();
        this._data = FormToObject(this.$screenForm.$form);
        this._data.gender = parseInt(this._data.gender);
        this.$screenConfirm.set(this._data);
        this.goTo('confirm');
    }

    async _onConfirmSubmit() {
        this.goTo('loading');
        const submitResult = await ActivationUtils.submitKyc(this._data);
        if (submitResult.ok) {
            const result = await submitResult.json();
            window.location.href = result.clientRedirectUrl;
        }
        else {
            const errorCode = submitResult.status;
            let message = '';
            if (errorCode === 401) {
                message = 'You have to be at least 18 years old.';
            } else if (errorCode === 403) {
                message = 'Your data was already used to initiate the KYC process.';
            }
            this.$screenError.show(message);
            this.goTo('error');
        }
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

class Verify extends XAppScreen {
    html() {
        return `
            <screen-welcome></screen-welcome>
            <screen-terms></screen-terms>
            <screen-terms2></screen-terms2>
            <screen-form-handler></screen-form-handler>
            <screen-success>Thank you! Soon you will receive an email with further information.</screen-success>
            <screen-error route="kyc-error" message="Thank you! Soon you will receive an email with further information."></screen-error>
        `
    }

    /** Just for typing. Can't do this in constructor because children are set in super(). */
    types() {
        /** @type {ScreenWelcome} */
        this.$screenWelcome = null;
        /** @type {ScreenTerms} */
        this.$screenTerms = null;
        /** @type {ScreenTerms2} */
        this.$screenTerms2 = null;
        /** @type {ScreenForm} */
        this.$screenFormHandler = null;
        /** @type {ScreenSuccess} */
        this.$screenSuccess = null;
        /** @type {ScreenError} */
        this.$screenError = null;
    }

    children() {
        return [
            ScreenWelcome,
            ScreenTerms,
            ScreenTerms2,
            ScreenFormHandler,
            ScreenSuccess,
            ScreenError
        ]
    }

    onCreate() {
        location.href = "#";
    }

}

Verify.launch();

return Verify;

}());
