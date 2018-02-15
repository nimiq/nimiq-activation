import XAppScreen from '/elements/x-screen/x-app-screen.js';
import ScreenWelcome from '../screen-welcome/screen-welcome.js';
import ScreenTerms from '../screen-terms/screen-terms.js';
import ScreenTerms2 from '../screen-terms2/screen-terms2.js';
import ScreenFormHandler from '../screen-form-handler/screen-form-handler.js';
import ScreenSuccess from '/elements/screen-success/screen-success.js';
import ScreenError from '/elements/screen-error/screen-error.js';

export default class Verify extends XAppScreen {
    html() {
        return `
            <screen-welcome></screen-welcome>
            <screen-terms></screen-terms>
            <screen-terms2></screen-terms2>
            <screen-form-handler></screen-form-handler>
            <screen-success>Thank you! Soon you will receive an email with further information.</screen-success>
            <screen-error message="The Safari browser and iOS devices are not supported by our external service providers. Please use another browser or device."></screen-error>
            <screen-error route="kyc-error" message="Thank you! Soon you will receive an email with further information."></screen-error>
        `
    }

    /** Just for typing. Can't do this in constructor because children are set in super(). */
    types() {
        /** @type {ScreenWelcome} */
        this.$screenWelcome = null;
        /** @type {ScreenTerms} */
        this.$screenTerms = null;
        /** @type {ScreenTerms2} */
        this.$screenTerms2 = null;
        /** @type {ScreenForm} */
        this.$screenFormHandler = null;
        /** @type {ScreenSuccess} */
        this.$screenSuccess = null;
        /** @type {ScreenError[]} */
        this.$screenError = null;
    }

    children() {
        return [
            ScreenWelcome,
            ScreenTerms,
            ScreenTerms2,
            ScreenFormHandler,
            ScreenSuccess,
            [ ScreenError ]
        ]
    }
}

Verify.launch();
