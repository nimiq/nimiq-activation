import XAppScreen from '/elements/x-screen/x-app-screen.js';
import ScreenWelcome from '../screen-welcome/screen-welcome.js';
import ScreenBackupFileImport from '/elements/screen-backup-file-import/screen-backup-file-import.js';
import ScreenBackupPhraseImport from '/elements/screen-backup-phrase-import/screen-backup-phrase-import.js';
import ScreenForward from '../screen-forward/screen-forward.js';
import ScreenError from '/elements/screen-error/screen-error.js';
import XNimiqApi from '/elements/x-nimiq-api/x-nimiq-api.js';
import NanoApi from '/libraries/nano-api/nano-api.js';

export default class ValidationTool extends XAppScreen {
    html() {
        return `
            <screen-welcome></screen-welcome>
            <screen-backup-file-import></screen-backup-file-import>
            <screen-backup-phrase-import></screen-backup-phrase-import>
            <screen-forward></screen-forward>
            <screen-error></screen-error>
            <x-nimiq-api></x-nimiq-api>
        `
    }

    types() {
        /** @type {ScreenWelcome} */
        this.$screenWelcome = null;
        /** @type {ScreenBackupFileImport} */
        this.$screenBackupFileImport = null;
        /** @type {ScreenBackupPhraseImport} */
        this.$screenBackupPhraseImport = null;
        /** @type {ScreenForward} */
        this.$screenForward = null;
        /** @type {ScreenError} */
        this.$screenError = null;
    }

    children() {
        return [
            ScreenWelcome,
            ScreenBackupFileImport,
            ScreenBackupPhraseImport,
            ScreenForward,
            ScreenError,
            XNimiqApi
        ]
    }

    listeners() {
        return {
            'nimiq-different-tab-error':'_onDifferentTabError',
            'nimiq-api-fail':'_onApiInitFail',
            'x-phrase-imported': '_onPhraseImported',
            'x-decrypt-backup': '_onDecryptBackup'
        }
    }

    onCreate() {
        // Go to start at page (re-)load
        location.href = '#';
    }

    async _onDecryptBackup(backup) {
        const password = backup.password;
        const encryptedKey = backup.encryptedKey;
        try {
            await NanoApi.getApi().importEncrypted(encryptedKey, password, false); // false = do not persist
            const decryptedAddress = await NanoApi.getApi().getAddress();
            this.$screenForward.setAddress(decryptedAddress);
            this.$screenBackupFileImport.onPasswordCorrect();
            this._onValidationComplete();
        } catch (e) {
            console.error(e)
            this.$screenBackupFileImport.onPasswordIncorrect();
        }
    }

    async _onPhraseImported(privateKey) {
        await NanoApi.getApi().importKey(privateKey, false); // false = do not persist
        const importedAddress = await NanoApi.getApi().getAddress();
        this.$screenForward.setAddress(importedAddress);
        this._onValidationComplete();
    }

    _onValidationComplete() {
        setTimeout(() => this.goTo('/forward'), 2000);
    }

    _onDifferentTabError() {
        XAppScreen.instance.showError('Nimiq is already running in a different tab');
    }

    _onApiInitFail() {
        XAppScreen.instance.showError('Your operating system version has a bug and is therefore not supported. Please use a different device.');
    }
}

ValidationTool.launch();

// Todo: Back links
