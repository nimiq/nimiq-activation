import XScreen from '/elements/x-screen/x-screen.js';
import XActivationUtils from '/elements/x-activation-utils/x-activation-utils.js';
import ScreenError from '/elements/screen-error/screen-error.js';
import ScreenForm from './screen-form/screen-form.js';
import ScreenConfirm from './screen-confirm/screen-confirm.js';
import ScreenLoading from '/elements/screen-loading/screen-loading.js';
import FormToObject from '/libraries/nimiq-utils/form-to-object/form-to-object.js';

export default class ScreenFormHandler extends XScreen {
    html() {
        return `
            <x-activation-utils></x-activation-utils>
            <x-slides>
                <screen-form></screen-form>
                <screen-confirm></screen-confirm>
                <screen-loading>Uploading your data...</screen-loading>
                <screen-error message="Your data was already used to initiate the KYC process."></screen-error>
            </x-slides>
        `
    }

    types() {
        /** @type {XActivationUtils} */
        this.$activationUtils = null;
        /** @type {ScreenForm} */
        this.$screenForm = null;
        /** @type {ScreenConfirm} */
        this.$screenConfirm = null;
        /** @type {ScreenError} */
        this.$screenError = null;
    }

    children() {
        return [XActivationUtils, ScreenForm, ScreenConfirm, ScreenLoading, ScreenError];
    }

    listeners() {
        return {
            'x-activation-post-success': '_onPostSuccess',
            'x-activation-post-error': '_onPostError'
        }
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

    _onConfirmSubmit() {
        this.goTo('loading');
        this.$activationUtils._api.submitKyc(this._data);
    }

    _onPostSuccess({clientRedirectUrl}) {
        window.location.href = clientRedirectUrl;
    }

    _onPostError() {
        this.goTo('error');
    }

}

// Todo: [Max] Replace borders by implicit boxes (width +- 64px)
