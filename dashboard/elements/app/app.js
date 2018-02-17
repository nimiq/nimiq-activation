import XAppScreen from '/elements/x-screen/x-app-screen.js';
import ScreenHome from '../screen-home/screen-home.js';
import ScreenAccount from '../screen-account/screen-account.js';
import ScreenError from '/elements/screen-error/screen-error.js';
import XNimiqApi from '/elements/x-nimiq-api/x-nimiq-api.js';

export default class Dashboard extends XAppScreen {
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
            'nimiq-api-fail':'_onApiInitFail',
            'x-account-selected': '_onAccountSelected'
        }
    }

    _onAccountSelected(address) {
        window.location = '?address=' + address + '#account';
    }

    _onDifferentTabError() {
        this._error = 'Nimiq is already running in a different tab';
    }

    _onApiInitFail() {
        this._error = 'Your operating system version has a bug and is therefore not supported. Please use a different device.';
    }
}

Dashboard.launch();
