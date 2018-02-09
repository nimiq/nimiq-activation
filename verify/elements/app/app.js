import XAppScreen from '/elements/x-screen/x-app-screen.js';
import XSlideIndicator from '/elements/x-slide-indicator/x-slide-indicator.js';
import ScreenWelcome from '../screen-welcome/screen-welcome.js';
import ScreenTerms from '../screen-terms/screen-terms.js';
import ScreenFormHandler from '../screen-form-handler/screen-form-handler.js';
import ScreenSuccess from '/elements/screen-success/screen-success.js';
import ScreenProceed from '../screen-proceed/screen-proceed.js';

export default class Verify extends XAppScreen {
    html() {
        return `
            <screen-welcome></screen-welcome>
            <screen-terms></screen-terms>
            <screen-form-handler></screen-form-handler>
            <screen-success>Thank you! Soon you will receive an email with further information.</screen-success>
            <screen-proceed></screen-proceed>
            <x-slide-indicator></x-slide-indicator>
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
    }

    children() {
        return [
            ScreenWelcome,
            ScreenTerms,
            ScreenFormHandler,
            ScreenSuccess,
            ScreenProceed,
            XSlideIndicator
        ]
    }

    onCreate() {
        // Proceed screen should not be part of progress shown by slide indicator
        this._filteredSlides.push('proceed');
    }
}

Verify.launch();