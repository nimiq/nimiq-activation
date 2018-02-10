import XScreen from '/elements/x-screen/x-screen.js';
import XActivationUtils from '/elements/x-activation-utils/x-activation-utils.js';
import ScreenError from '/elements/screen-error/screen-error.js';
import ScreenForm from './screen-form/screen-form.js';
import FormToObject from '/libraries/nimiq-utils/form-to-object/form-to-object.js';

export default class ScreenFormHandler extends XScreen {
    html() {
        return `
            <x-activation-utils></x-activation-utils>
            <x-slides>
                <screen-form></screen-form>
                <screen-error message="Your data was already used to initiate the KYC process."></screen-error>
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
        this.$screenForm.$form.addEventListener('submit', this._onFormSubmit.bind(this));
    }

    _onFormSubmit(e) {
        e.preventDefault();
        const data = FormToObject(this.$screenForm.$form);
        data.gender = parseInt(data.gender);
        this.$activationUtils._api.submitKyc(data);
    }

    _onPostSuccess(clientRedirectUrl) {
        window.location.href = clientRedirectUrl;
    }

    _onPostError() {
        this.goTo('error');
    }

}
