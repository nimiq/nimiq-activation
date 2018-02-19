import XScreen from '/elements/x-screen/x-screen.js';
import Verify from '../app/app.js';

export default class ScreenCountryCheckFallback extends XScreen {
    html() {
        return `
            <nimiq-logo large>Nimiq Activation</nimiq-logo>
            <h2>Are you a citizen, resident or green card holder of the United States or Puerto Rico?</h2>
            <div buttons>
                <a href="#" button button-yes>Yes</a><a button href="#welcome">No</a>
            </div>
        `;
    }

    onCreate() {
        this.$buttonYes = this.$('[button-yes]');
        this.$buttonYes.addEventListener('click', () => this._showError());
    }

    _showError() {
        Verify.instance.showError('Please be aware that NIM Activation from NET is not available to citizens, green card holders or residents of the US and citizens or residents of Puerto Rico.');
    }
}