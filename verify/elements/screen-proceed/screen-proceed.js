import XScreen from '/elements/x-screen/x-screen.js';
import XActivationUtils from '/elements/x-activation-utils/x-activation-utils.js';
import ScreenLoading from '/elements/screen-loading/screen-loading.js';
import ScreenError from '/elements/screen-error/screen-error.js';

export default class ScreenProceed extends XScreen {
    html() {
        return `
            <screen-loading>Generate new token and redirect...</screen-loading>
            <screen-error message="Could not proceed"></screen-error>
            <x-activation-utils></x-activation-utils>
        `
    }

    children() { return [ScreenLoading, ScreenError, XActivationUtils]; }

    types() {
        /** @type {ScreenLoading} */
        this.$screenLoading = null;
        /** @type {XActivationUtils} */
        this.$activationUtils = null;
    }

    _onEntry() {
        const params = new URLSearchParams(window.location.search);
        // Todo tba
        //this.$activationUtils._api.proceed(params);
    }

    /** @param {string} redirectUrl */
    _onPostSuccess(redirectUrl) {
        window.location.href = redirectUrl;
    }

    _onPostError() {
        this.goTo('error');
    }
}