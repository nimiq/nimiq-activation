import XAppIndicatorScreen from '/elements/x-screen/x-app-indicator-screen.js';
import ScreenWelcome from '../screen-welcome/screen-welcome.js';
import ScreenIdenticons from '/elements/legacy/screen-identicons/screen-identicons.js';
import ScreenBackupFile from '/elements/legacy/screen-backup-file/screen-backup-file.js';
import ScreenBackupPhrase from '/elements/legacy/screen-backup-phrase/screen-backup-phrase.js';
import ScreenBackupPhraseValidate from '/elements/legacy/screen-backup-phrase-validate/screen-backup-phrase-validate.js';
import ScreenError from '/elements/legacy/screen-error/screen-error.js';
import ScreenForward from '../screen-forward/screen-forward.js';
import XNimiqApi from '/elements/x-nimiq-api/x-nimiq-api.js';
import NanoApi from '/libraries/nano-api/nano-api.js';

export default class ContributorsActivationTool extends XAppIndicatorScreen {
    html() {
        return `
            <screen-welcome></screen-welcome>
            <screen-identicons></screen-identicons>
            <screen-backup-file></screen-backup-file>
            <screen-backup-phrase></screen-backup-phrase>
            <screen-backup-phrase-validate></screen-backup-phrase-validate>
            <screen-forward></screen-forward>
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
        /** @type {ScreenForward} */
        this.$screenForward = null;
        /** @type {ScreenError} */
        this.$screenError = null;
    }

    children() {
        return [
            ScreenWelcome,
            ScreenIdenticons,
            ScreenBackupFile,
            ScreenBackupPhrase,
            ScreenBackupPhraseValidate,
            ScreenForward,
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
            'x-backup-file-complete': '_onBackupFileComplete'
        }
    }

    onCreate() {
        super.onCreate();
        // Go to start at page (re-)load
        location.href = '#welcome';
    }

    async _onKeyPair(keyPair) {
        const api = NanoApi.getApi();
        this._nimAddress = keyPair.address;
        const hexedPrivKey = keyPair.privateKey.toHex();
        this.$screenBackupPhrase.privateKey = hexedPrivKey
        this.$screenBackupPhraseValidate.privateKey = hexedPrivKey;
        this.$screenBackupFile.setKeyPair(keyPair);
        location.href = '#backup-file';
    }

    _onBackupFileComplete() {
        location.href = '#backup-phrase';
    }

    _onPhraseValidated() {
        this.$screenForward.setAddress(this._nimAddress);
        location.href = '#forward';
    }

    _onDifferentTabError() {
        XAppIndicatorScreen.instance.showError('Nimiq is already running in a different tab');
    }

    _onApiInitFail() {
        XAppIndicatorScreen.instance.showError('Your operating system version has a bug and is therefore not supported. Please use a different device.');
    }

    get __childScreenFilter() { return ['no-password', 'welcome']; }
}

ContributorsActivationTool.launch();

// Todo: Back links
