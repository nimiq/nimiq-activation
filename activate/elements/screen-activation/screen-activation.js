import XScreen from '/elements/x-screen/x-screen.js';
import XScreenFit from '/elements/x-screen/x-screen-fit.js';
import XAddress from '/elements/x-address/x-address.js';
import ScreenWarning from '/elements/screen-warning/screen-warning.js';
import ScreenSuccess from '/elements/screen-success/screen-success.js';
import GenesisUtils from '/library/nimiq-utils/genesis-utils/genesis-utils.js';

export default class ScreenActivation extends XScreen {
    html() {
        return `
            <h1>Activate your Nimiq Account</h1>
            <h2 secondary>Send your NET to the unique Activation Address for your Nimiq Account</h2> 
            <x-slides>
                <screen-warning>
                    On the next screen you will see an Ethereum Address. 
                    <ul>
                        <li>Send only NET to this address.</li>  
                        <li>If you send Ether it will get destroyed!</li>  
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
            'x-warning-complete': '_onWarningComplete'
        }
    }

    _onWarningComplete() {
        this.goTo('address');
    }

    setAddress(address) {
        this.$screenActivationAddress.setAddress(address);
    }
}

class ScreenActivationAddress extends XScreenFit {
    html() {
        return `
            1. Copy your Activation Address
            <x-address></x-address>

            2. On the Ethereum Blockchain send your NET from your wallet to your Activation Address.                        
            <h3>Transfer Options</h3>
            <ul>
                <li>Send your NET directly from an exchange,</li>
                <li>or you can use <a href="https://www.myetherwallet.com/" target="_blank" class="my-ether-wallet">MyEtherWallet.com</a>,</li>
                <li>or any wallet that supports ERC20 tokens.</li>
            </ul>
            <x-grow></x-grow>
            3. Check your balance with the Nimiq Genesis Explorer
            <button>Check Balance</button>
        `
    }

    children() { return [XAddress] }

    async setAddress(address) {
        address = await GenesisUtils.nim2ethAddress(address);
        this.$address.address = address;
    }

    get route() { return 'address' }
}

// Todo: [high priority] connect this view to the redeem backend