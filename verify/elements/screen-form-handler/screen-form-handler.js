import XScreen from '/elements/x-screen/x-screen.js';
import XActivationUtils from '/elements/x-activation-utils/x-activation-utils.js';
import ScreenError from '/elements/screen-error/screen-error.js';
import ScreenForm from './screen-form/screen-form.js';

export default class ScreenFormHandler extends XScreen {
    html() {
        return `
            <x-activation-utils></x-activation-utils>
            <x-slides>
                <screen-form></screen-form>
                <screen-error></screen-error>
            </x-slides>
        `
    }

    types() {
        /** @type {XActivationUtils} */
        this.$activationUtils = null;
        /** @type {ScreenForm} */
        this.$screenForm = null;
        /** @type {ScreenError} */
        this.$screenError = null;
    }

    children() {
        return [XActivationUtils, ScreenForm, ScreenError];
    }

    listeners() {
        return {
            'x-activation-post-success': '_onPostSuccess',
            'x-activation-post-error': '_onPostError'
        }
    }

    onCreate() {
        this.$screenForm.$form.addEventListener('submit', e => this._onFormSubmit());
    }

    _onFormSubmit() {
        // form to json
        this.$activationUtils._api.submitKyc();
    }

    _onPostSuccess(clientRedirectUrl) {
        window.location.href = clientRedirectUrl;
    }

    _onPostError() {
        this.goTo('error');
    }

}


// Todo: Send it to kyc api