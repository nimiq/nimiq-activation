import XAppScreen from '/elements/x-screen/x-app-screen.js';
import ScreenWelcome from '../screen-welcome/screen-welcome.js';
import ScreenTerms from '../screen-terms/screen-terms.js';

export default class Verify extends XAppScreen {
    html() {
        return `
            <screen-welcome></screen-welcome>
            <screen-terms></screen-terms>
        `
    }

    children() {
        return [
            ScreenWelcome,
            ScreenTerms
        ]
    }

    listeners() {
        return {
            'x-api-ready': '_onApiReady',
        }
    }
}

Verify.launch();