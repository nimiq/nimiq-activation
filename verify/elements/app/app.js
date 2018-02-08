import XAppScreen from '/elements/x-screen/x-app-screen.js';
import ScreenWelcome from '../screen-welcome/screen-welcome.js';
import ScreenTerms from '../screen-terms/screen-terms.js';
import ScreenFormHandler from '../screen-form-handler/screen-form-handler.js';

export default class Verify extends XAppScreen {
    html() {
        return `
            <screen-welcome></screen-welcome>
            <screen-terms></screen-terms>
            <screen-form-handler></screen-form-handler>
        `
    }

    /** Just for typing. Can't do this in constructor because children are set in super(). */
    types() {
        /** @type {ScreenWelcome} */
        this.$screenWelcome = null;
        /** @type {ScreenTerms} */
        this.$screenTerms = null;
        /** @type {ScreenForm} /*/
        this.$screenFormHandler = null;

    }

    children() {
        return [
            ScreenWelcome,
            ScreenTerms,
            ScreenFormHandler
        ]
    }
}

Verify.launch();