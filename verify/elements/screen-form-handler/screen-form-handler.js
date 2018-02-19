import XScreen from '/elements/x-screen/x-screen.js';
import ScreenError from '/elements/screen-error/screen-error.js';
import ScreenForm from './screen-form/screen-form.js';
import ScreenConfirm from './screen-confirm/screen-confirm.js';
import ScreenLoading from '/elements/screen-loading/screen-loading.js';
import ScreenForward from './screen-forward/screen-forward.js';
import FormToObject from '/libraries/nimiq-utils/form-to-object/form-to-object.js';
import ActivationUtils from '/libraries/nimiq-utils/activation-utils/activation-utils.js';
import XAppState from '/elements/x-screen/x-app-state.js';
import XAppScreen from '/elements/x-screen/x-app-screen.js';

export default class ScreenFormHandler extends XScreen {
    html() {
        return `
            <x-slides>
                <screen-form></screen-form>
                <screen-confirm></screen-confirm>
                <screen-loading>Uploading your data...</screen-loading>
                <screen-forward></screen-forward>
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
        /** @type {ScreenForward} */
        this.$screenForward = null;
        /** @type {ScreenError} */
        this.$screenError = null;
    }

    children() {
        return [ScreenForm, ScreenConfirm, ScreenLoading, ScreenForward, ScreenError];
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
        await this.goTo('loading');
        const appState = XAppState.getAppState();
        this._data['terms_accepted'] = appState.termsAccepted;
        this._data['privacy_terms_accepted'] = appState.privacyTermsAccepted;

        let submitResult;
        try {
            submitResult = await ActivationUtils.submitKyc(this._data);
        }
        catch (e) {
            XAppScreen.instance.showError('Server unavailable. Please try again later.');
            return;
        }

        if (submitResult.ok) {
            const result = await submitResult.json();
            this.$screenForward.setKycUrl(result.clientRedirectUrl);
            this.goTo('forward');
        }
        else {
            const errorCode = submitResult.status;
            let message = '';
            if (errorCode === 401) {
                message = 'You have to be at least 18 years old.';
            } else if (errorCode === 403) {
                message = 'Your data was already used to initiate the KYC process. Please check your email for a message from us.';
            }
            this.$screenError.show(message);
            this.goTo('error');
        }
    }
}