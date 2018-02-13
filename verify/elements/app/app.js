import XAppScreen from '/elements/x-screen/x-app-screen.js';
import ScreenWelcome from '../screen-welcome/screen-welcome.js';
import ScreenTerms from '../screen-terms/screen-terms.js';
import ScreenFormHandler from '../screen-form-handler/screen-form-handler.js';
import ScreenSuccess from '/elements/screen-success/screen-success.js';
import ScreenProceed from '../screen-proceed/screen-proceed.js';
import ScreenError from '/elements/screen-error/screen-error.js';

export default class Verify extends XAppScreen {
    html() {
        return `
            <screen-welcome></screen-welcome>
            <screen-terms></screen-terms>
            <screen-form-handler></screen-form-handler>
            <screen-success>Thank you! Soon you will receive an email with further information.</screen-success>
            <screen-proceed></screen-proceed>
            <screen-error message="Your browser is not supported by our external service providers. Sorry!"></screen-error>
            <screen-error route="kyc-error" message="Thank you! Soon you will receive an email with further information."></screen-error>
        `
    }

    /** Just for typing. Can't do this in constructor because children are set in super(). */
    types() {
        /** @type {ScreenWelcome} */
        this.$screenWelcome = null;
        /** @type {ScreenTerms} */
        this.$screenTerms = null;
        /** @type {ScreenForm} */
        this.$screenFormHandler = null;
        /** @type {ScreenSuccess} */
        this.$screenSuccess = null;
        /** @tpye {ScreenProceed} */
        this.$screenProceed = null;
        /** @type {ScreenError} */
        this.$screenError = null;
    }

    children() {
        return [
            ScreenWelcome,
            ScreenTerms,
            ScreenFormHandler,
            ScreenSuccess,
            ScreenProceed,
            [ ScreenError ]
        ]
    }

    _onEntry() {
        const ua = navigator.userAgent.toLowerCase();
        const iOS = !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);
        const safari = ua.includes('safari') && !ua.includes('chrome');
        if (iOS || safari) {
            this.goTo('error');
        }
    }
}

Verify.launch();

// Todo: No safari, no iOS