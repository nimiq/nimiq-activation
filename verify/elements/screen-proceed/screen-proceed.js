import XScreen from '/elements/x-screen/x-screen.js';
import ScreenLoading from '/elements/screen-loading/screen-loading.js';
import ScreenError from '/elements/screen-error/screen-error.js';

export default class ScreenProceed extends XScreen {
    html() {
        return `
            <screen-loading>Generate new token and redirect...</screen-loading>
            <screen-error message="Could not proceed"></screen-error>
        `
    }

    children() { return [ScreenLoading, ScreenError]; }

    types() {
        /** @type {ScreenLoading} */
        this.$screenLoading = null;
        /** @type {XActivationUtils} */
    }

    _onEntry() {
        const params = new URLSearchParams(window.location.search);
        // Todo tba
        //ActivationUtils._api.proceed(params);
    }

    /** @param {string} redirectUrl */
    _onPostSuccess(redirectUrl) {
        window.location.href = redirectUrl;
    }

    _onPostError() {
        this.goTo('error');
    }
}