import XAppScreen from '/elements/x-screen/x-app-screen.js';
import ScreenWelcome from '../screen-welcome/screen-welcome.js';
import ScreenIdenticons from '/elements/screen-identicons/screen-identicons.js';
import ScreenBackupFile from '/elements/screen-backup-file/screen-backup-file.js';
import ScreenBackupPhrase from '/elements/screen-backup-phrase/screen-backup-phrase.js';
import ScreenBackupPhraseValidate from '/elements/screen-backup-phrase-validate/screen-backup-phrase-validate.js';
import ScreenError from '/elements/screen-error/screen-error.js';
import ScreenActivation from '../screen-activation/screen-activation.js';
import ScreenKyc from '../screen-kyc/screen-kyc.js';
import ScreenSuccess from '../screen-complete/screen-complete.js';
import XNimiqApi from '/elements/x-nimiq-api/x-nimiq-api.js';
import XToast from '/elements/x-toast/x-toast.js';

export default class ActivationTool extends XAppScreen {
    html() {
        return `
            <screen-welcome></screen-welcome>
            <screen-identicons></screen-identicons>
            <screen-kyc></screen-kyc>
            <screen-backup-phrase></screen-backup-phrase>
            <screen-backup-phrase-validate></screen-backup-phrase-validate>
            <screen-backup-file></screen-backup-file>
            <screen-activation></screen-activation>
            <screen-complete></screen-complete>
            <screen-error></screen-error>
            <x-nimiq-api></x-nimiq-api>
        `
    }

    children() {
        return [
            ScreenWelcome,
            ScreenKyc,
            ScreenBackupPhrase,
            ScreenBackupPhraseValidate,
            ScreenBackupFile,
            ScreenActivation,
            ScreenSuccess,
            ScreenError,
            ScreenIdenticons,
            XNimiqApi
        ]
    }

    listeners() {
        return {
            'x-api-ready': '_onApiReady',
            'x-keypair': '_onKeyPair',
            'x-phrase-validated': '_onPhraseValidated',
            'x-encrypt-backup': '_onEncryptBackup',
            'x-backup-file-complete': '_onBackupFileComplete',
            'x-sign-complete': '_onSignComplete',
            'x-different-tab-error':'_onDifferentTabError'
        }
    }

    onStateChange(state) {
        if (this._keyInitialized) return true;
        if (!(state === 'welcome' || state === 'identicons')) location = '';
        else return true;
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
        location = '#backup-file';
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

    _onSignComplete() {
        location = '#kyc';
    }

    _onDifferentTabError() {
        this.$screenError.show('Nimiq is already running in a different tab');
        location = '#error';
    }
}

ActivationTool.launch();