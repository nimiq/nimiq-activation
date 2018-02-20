import XScreen from '/elements/x-screen/x-screen.js';
import ScreenWarning from '/elements/screen-warning/screen-warning.js';
import ScreenSuccess from '/elements/screen-success/screen-success.js';
import XAddress from '/elements/x-address/x-address.js';
import ScreenActivationAddress from './screen-activation-address/screen-activation-address.js'

export default class ScreenActivation extends XScreen {
    html() {
        return `
            <h1>Activate your NIM</h1>
            <h2>To activate NIM for your NET, precisely follow these steps.</h2>
            <x-slides>
                <screen-warning>
                    Make sure you really own this Nimiq Account:
                    <strong class="red"><x-address></x-address></strong>
                    <p>&nbsp;</p>
                    <strong class="red">Compare</strong> this account number to the one on your saved Account Access File!
                </screen-warning>
                <screen-warning route="warning2">
                    On the next screen you will see an Ethereum address.
                    <ul>
                        <li>Send all NET with which you want to activate NIM to this address (<strong class="red">at least 1 NET</strong>)</li>
                        <li>Sending any other digital asset or less then 1 NET will result in permanent loss!</li>
                    </ul>
                </screen-warning>
                <screen-activation-address></screen-activation-address>
                <screen-success></screen-success>
            </x-slides>
            `
    }

    children() { return [[ScreenWarning], ScreenActivationAddress, ScreenSuccess, XAddress] }

    listeners() {
        return {
            'x-warning-complete': '_onWarningComplete'
        }
    }

    onCreate() {
        this.activeWarning = 'warning';
    }

    _onWarningComplete() {
        if(this.activeWarning === 'warning') {
            this.goTo('warning2');
            this.activeWarning = 'warning2';
        }
        else {
            this.goTo('address');
            this.activeWarning = 'warning';
        }
    }

    setNimAddress(nimAddress) {
        this.$address.address = nimAddress;
    }

    setAddress(ethAddress) {
        this.$screenActivationAddress.setAddress(ethAddress);
    }
}