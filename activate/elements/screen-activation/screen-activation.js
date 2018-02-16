import XScreen from '/elements/x-screen/x-screen.js';
import ScreenWarning from '/elements/screen-warning/screen-warning.js';
import ScreenSuccess from '/elements/screen-success/screen-success.js';
import ScreenActivationAddress from './screen-activation-address/screen-activation-address.js'

export default class ScreenActivation extends XScreen {
    html() {
        return `
            <h1>Activate your Nimiq Account</h1>
            <h2 secondary>Send your NET to the unique Activation Address for your Nimiq Account</h2>
            <x-slides>
                <screen-warning>
                    On the next screen you will see an Ethereum Address.
                    <ul>
                        <li>Send <strong>at least 1 NET</strong> to this address.</li>
                        <li>Sending any other digital asset or less then 1 NET will result in permanent loss!</li>
                    </ul>
                </screen-warning>
                <screen-activation-address></screen-activation-address>
                <screen-success></screen-success>
            </x-slides>
            `
    }

    children() { return [ScreenWarning, ScreenActivationAddress, ScreenSuccess] }

    listeners() {
        return {
            'x-warning-complete': '_onWarningComplete',
            'x-balance': '_onCheckBalance'
        }
    }

    _onWarningComplete() {
        this.goTo('address');
    }

    _onCheckBalance(balance) {
        if (balance > 0) {
            window.setTimeout(() => {
                this.$screenSuccess.show(`Activation successfull.`);
                this.goTo('success');
                this.fire('x-activation-complete');
            }, 1000);
        }
    }

    setAddress(ethAddress) {
        this.$screenActivationAddress.setAddress(ethAddress);
    }
}