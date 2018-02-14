import XScreen from '/elements/x-screen/x-screen.js';
import ScreenError from '/elements/screen-error/screen-error.js';
import ScreenForm from './screen-form/screen-form.js';
import ScreenConfirm from './screen-confirm/screen-confirm.js';
import ScreenLoading from '/elements/screen-loading/screen-loading.js';
import FormToObject from '/libraries/nimiq-utils/form-to-object/form-to-object.js';
import ActivationUtils from '/libraries/nimiq-utils/activation-utils/activation-utils.js';

export default class ScreenFormHandler extends XScreen {
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

// Todo: Bug: Error message not working