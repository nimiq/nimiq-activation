import XAppIndicatorScreen from '/elements/x-screen/x-app-indicator-screen.js';
import ScreenWelcome from '../screen-welcome/screen-welcome.js';
import ScreenIdenticons from '/elements/legacy/screen-identicons/screen-identicons.js';
import ScreenBackupFile from '/elements/legacy/screen-backup-file/screen-backup-file.js';
import ScreenBackupPhrase from '/elements/legacy/screen-backup-phrase/screen-backup-phrase.js';
import ScreenBackupPhraseValidate from '/elements/legacy/screen-backup-phrase-validate/screen-backup-phrase-validate.js';
import ScreenError from '/elements/legacy/screen-error/screen-error.js';
import ScreenActivation from '../screen-activation/screen-activation.js';
import ScreenLoading from '/elements/legacy/screen-loading/screen-loading.js';
import ActivationUtils from '/libraries/nimiq-utils/activation-utils/activation-utils.js';
import XNimiqApi from '/elements/x-nimiq-api/x-nimiq-api.js';
import NanoApi from '/libraries/nano-api/nano-api.js';

export default class ActivationTool extends XAppIndicatorScreen {
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
            ScreenIdenticons,
            ScreenBackupFile,
            ScreenBackupPhrase,
            ScreenBackupPhraseValidate,
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

    onCreate() {
        super.onCreate();
        // Go to start at page (re-)load
        location.href = '#';
    }

    async _onEntry() {
        if (this.isInitialized) return;
        this.isInitialized = true;
        this._activationToken = new URLSearchParams(document.location.search).get("activation_token");

        let isValidToken;
        try {
            isValidToken = await ActivationUtils.isValidToken(this._activationToken);
        } catch (e) {
            XAppIndicatorScreen.instance.showError('Server unavailable. Please try again later.');
            return;
        }

        if (isValidToken) {
            location.href = '#welcome';
        }
        else {
            const href = location.pathname.replace('/activate', '/dashboard');
            XAppIndicatorScreen.instance.showError(
                'Your activation token is invalid. Please go back to the dashboard and try again.',
                href,
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
        let activationSuccessful;
        try {
            activationSuccessful = await ActivationUtils.activateAddress(this._activationToken, this._nimAddress);
        } catch (e) {
            XAppIndicatorScreen.instance.showError('Server unavailable. Please try again later.');
            return;
        }

        if (activationSuccessful) {
            location = '#activation';
        } else {
            XAppIndicatorScreen.instance.showError(
                'Your activation token is invalid. Please go back to the dashboard and try again.',
                '/apps/nimiq-activation/dashboard',
                'Go to Dashboard'
            );
        }
    }

    _onActivationComplete() {
        window.location.href = `../dashboard/?address=${this._nimAddress}#account`;
    }

    _onDifferentTabError() {
        XAppIndicatorScreen.instance.showError('Nimiq is already running in a different tab');
    }

    _onApiInitFail() {
        XAppIndicatorScreen.instance.showError('Your operating system version has a bug and is therefore not supported. Please use a different device.');
    }
 
    get __childScreenFilter() { return ['no-password', 'welcome']; } 
}

ActivationTool.launch();

// Todo: Back links
