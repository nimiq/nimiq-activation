import XAppScreen from '/elements/x-screen/x-app-screen.js';
import ScreenWelcome from '../screen-welcome/screen-welcome.js';
import ScreenIdenticons from '/elements/screen-identicons/screen-identicons.js';
import ScreenBackupFile from '/elements/screen-backup-file/screen-backup-file.js';
import ScreenBackupPhrase from '/elements/screen-backup-phrase/screen-backup-phrase.js';
import ScreenBackupPhraseValidate from '/elements/screen-backup-phrase-validate/screen-backup-phrase-validate.js';
import ScreenError from '/elements/screen-error/screen-error.js';
import ScreenActivation from '../screen-activation/screen-activation.js';
import ScreenLoading from '/elements/screen-loading/screen-loading.js';
import ActivationUtils from '/libraries/nimiq-utils/activation-utils/activation-utils.js';
import XNimiqApi from '/elements/x-nimiq-api/x-nimiq-api.js';
import NanoApi from '/libraries/nano-api/nano-api.js';

export default class ActivationTool extends XAppScreen {
    html() {
        return `
            <screen-loading><h2>Checking activation token...</h2></screen-loading>
            <screen-welcome></screen-welcome>
            <screen-identicons></screen-identicons>
            <screen-backup-file></screen-backup-file>
            <screen-backup-phrase></screen-backup-phrase>
            <screen-backup-phrase-validate></screen-backup-phrase-validate>
            <screen-activation></screen-activation>
            <screen-error></screen-error>
            <x-nimiq-api></x-nimiq-api>
        `
    }

    types() {
        /** @type {ScreenBackupPhrase} */
        this.$screenBackupPhrase = null;
        /** @type {ScreenBackupPhraseValidate} */
        this.$screenBackupPhraseValidate = null;
        /** @type {ScreenBackupFile} */
        this.$screenBackupFile = null;
        /** @type {ScreenActivation} */
        this.$screenActivation = null;
        /** @type {ScreenError} */
        this.$screenError = null;
    }

    children() {
        return [
            ScreenLoading,
            ScreenWelcome,
            ScreenBackupPhrase,
            ScreenBackupPhraseValidate,
            ScreenBackupFile,
            ScreenIdenticons,
            ScreenActivation,
            ScreenError,
            XNimiqApi
        ]
    }

    listeners() {
        return {
            'nimiq-different-tab-error':'_onDifferentTabError',
            'nimiq-api-fail':'_onApiInitFail',
            'x-keypair': '_onKeyPair',
            'x-phrase-validated': '_onPhraseValidated',
            'x-backup-file-complete': '_onBackupFileComplete',
            'x-activation-complete': '_onActivationComplete'
        }
    }

    async _onEntry() {
        if (this.isInitialized) return;
        this.isInitialized = true;
        this._activationToken = new URLSearchParams(document.location.search).get("activation_token");

        let isValidToken;
        try {
            isValidToken = await ActivationUtils.isValidToken(this._activationToken);
        } catch (e) {
            XAppScreen.instance.showError('Server unavailable. Please try again later.');
            return;
        }

        if (isValidToken) {
            location.href = '#welcome';
        }
        else {
            XAppScreen.instance.showError(
                'Your activation token is invalid. Please go back to the dashboard and try again.',
                '/apps/nimiq-activation/dashboard',
                'Go to Dashboard'
            );
        }
    }

    async _onKeyPair(keyPair) {
        const api = NanoApi.getApi();
        const nimAddress = keyPair.address;
        this._nimAddress = nimAddress;
        const ethAddress = await api.nim2ethAddress(nimAddress);
        this.$screenActivation.setAddress(ethAddress);
        const hexedPrivKey = keyPair.privateKey.toHex();
        this.$screenBackupPhrase.privateKey = hexedPrivKey
        this.$screenBackupPhraseValidate.privateKey = hexedPrivKey;
        this.$screenBackupFile.setKeyPair(keyPair);
        location.href = '#backup-file';
    }

    _onBackupFileComplete() {
        location = '#backup-phrase';
    }

    async _onPhraseValidated() {
        let activationSuccessfull;
        try {
            activationSuccessfull = await ActivationUtils.activateAddress(this._activationToken, this._nimAddress);
        } catch (e) {
            XAppScreen.instance.showError('Server unavailable. Please try again later.');
            return;
        }

        if (activationSuccessfull) {
            location = '#activation';
        } else {
            XAppScreen.instance.showError(
                'Your activation token is invalid. Please go back to the dashboard and try again.',
                '/apps/nimiq-activation/dashboard',
                'Go to Dashboard'
            );
        }
    }

    _onActivationComplete() {
        window.location.href = `../dashboard/?address=${this._userFriendlyNimAddress}#account`;
    }

    _onDifferentTabError() {
        XAppScreen.instance.showError('Nimiq is already running in a different tab');
    }

    _onApiInitFail() {
        XAppScreen.instance.showError('Your operating system version has a bug and is therefore not supported. Please use a different device.');
    }
}

ActivationTool.launch();

// Todo: Back links
