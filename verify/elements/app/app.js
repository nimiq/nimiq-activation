import XAppScreen from '/elements/x-screen/x-app-screen.js';
import ScreenWelcome from '../screen-welcome/screen-welcome.js';
import ScreenTerms from '../screen-terms/screen-terms.js';
import ScreenForm from '../screen-form/screen-form.js';

export default class Verify extends XAppScreen {
    html() {
        return `
            <screen-welcome></screen-welcome>
            <screen-terms></screen-terms>
            <screen-form></screen-form>
        `
    }

    /** Just for typing. Can't do this in constructor because children are set in super(). */
    types() {
        /** @type {ScreenWelcome} */
        this.$screenWelcome = null;
        /** @type {ScreenTerms} */
        this.$screenTerms = null;
        /** @type {ScreenForm} /*/
        this.$screenForm = null;
    }

    children() {
        return [
            ScreenWelcome,
            ScreenTerms,
            ScreenForm
        ]
    }

    listeners() {
        return {
            'x-api-ready': '_onApiReady',
        }
    }
}

Verify.launch();