import XAppScreen from '/elements/x-screen/x-app-screen.js';
import ScreenWelcome from '../screen-welcome/screen-welcome.js';
import ScreenIdenticons from '/elements/screen-identicons/screen-identicons.js';
import ScreenBackupFile from '/elements/screen-backup-file/screen-backup-file.js';
import ScreenBackupPhrase from '/elements/screen-backup-phrase/screen-backup-phrase.js';
import ScreenBackupPhraseValidate from '/elements/screen-backup-phrase-validate/screen-backup-phrase-validate.js';
import ScreenError from '/elements/screen-error/screen-error.js';
import ScreenActivation from '../screen-activation/screen-activation.js';
import ScreenSuccess from '../screen-complete/screen-complete.js';
import ScreenLoading from '/elements/screen-loading/screen-loading.js';
import XNimiqApi from '/elements/x-nimiq-api/x-nimiq-api.js';
import XToast from '/elements/x-toast/x-toast.js';
import XActivationUtils from '/elements/x-activation-utils/x-activation-utils.js';

export default class ActivationTool extends XAppScreen {
    html() {
        return `
            <screen-loading><h2>Checking activation token...</h2></screen-loading>
            <screen-welcome></screen-welcome>
            <screen-identicons></screen-identicons>
            <screen-backup-phrase></screen-backup-phrase>
            <screen-backup-phrase-validate></screen-backup-phrase-validate>
            <screen-backup-file></screen-backup-file>
            <screen-activation></screen-activation>
            <screen-complete></screen-complete>
            <screen-error></screen-error>
            <x-nimiq-api></x-nimiq-api>
            <x-activation-utils></x-activation-utils>
        `
    }

    children() {
        return [
            ScreenLoading,
            ScreenWelcome,
            ScreenBackupPhrase,
            ScreenBackupPhraseValidate,
            ScreenBackupFile,
            ScreenActivation,
            ScreenSuccess,
            ScreenError,
            ScreenIdenticons,
            XNimiqApi,
            XActivationUtils
        ]
    }

    listeners() {
        return {
            'x-activation-valid-token': '_onValidToken',
            'x-api-ready': '_onApiReady',
            'x-keypair': '_onKeyPair',
            'x-phrase-validated': '_onPhraseValidated',
            'x-encrypt-backup': '_onEncryptBackup',
            'x-backup-file-complete': '_onBackupFileComplete',
            'x-different-tab-error':'_onDifferentTabError'
        }
    }

    _onEntry() {
        const activationToken = new URLSearchParams(document.location.search).get("activation_token"); 
        this.$activationUtils._api.isValidToken(activationToken);
    }

    onStateChange(state) {
        if (this._keyInitialized) return true;
        if (!(state === 'welcome' || state === 'identicons')) location = '';
        else return true;
    }

    _onValidToken(response) {
        if (response === true) this.goTo('welcome');
        else {
            this.$screenError.show('Your activation token is invalid. Please go back to the dashboard try again.');
            this.goTo('error');
        }
    }

    _onApiReady(api) {
        console.log('api ready');
        this._api = api;
        this.$screenIdenticons.onApiReady(api);
    }

    _onKeyPair(keyPair) {
        const hexedPrivKey = keyPair.privateKey.toHex();
        this.$screenBackupPhrase.privateKey = hexedPrivKey
        this.$screenBackupPhraseValidate.privateKey = hexedPrivKey;
        this._keyPair = keyPair;
        this._keyInitialized = true;
        location.href = '#backup-file';
    }

    async _onEncryptBackup(password) {
        const encryptedKey = await this._importAndEncrypt(password);
        this.$screenBackupFile.backup(this._api.address, encryptedKey);
    }

    async _importAndEncrypt(password) {
        await this._api.importKey(this._keyPair.privateKey, false);
        const encryptedKey = await this._api.exportEncrypted(password);
        this._keyPair.privateKey = null;
        this.$screenActivation.setAddress(this._api.$.wallet.address);
        this._keyPair = null;
        return encryptedKey;
    }

    _onBackupFileComplete() {
        location = '#backup-phrase';
    }

    _onPhraseValidated() {
        location = '#activation';
    }

    _onDifferentTabError() {
        this.$screenError.show('Nimiq is already running in a different tab');
        location = '#error';
    }
}

ActivationTool.launch();