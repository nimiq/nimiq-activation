import XScreen from '/elements/x-screen/x-screen.js';
import ScreenActivationTerms from './screen-activation-terms.js';
import ScreenPrivacyTerms from './screen-privacy-terms.js';

export default class ScreenTerms extends XScreen {
    html() {
        return `
            <x-slides>
    		    <screen-activation-terms></screen-activation-terms>
                <screen-privacy-terms></screen-privacy-terms>
            <x-slides>
		`
    }

    types() {
        /** @type {ScreenActivationTerms} */
        this.$screenActivationTerms = null;
        /** @type {ScreenPrivacyTerms} */
        this.$screenPrivacyTerms = null;
    }

    children() {
        return [
            ScreenActivationTerms,
            ScreenPrivacyTerms
        ]
    }
}
