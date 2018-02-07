import XScreenFit from '/elements/x-screen/x-screen-fit.js';
import XAddress from '/elements/x-address/x-address.js';
import ActivationUtils from '/library/nimiq-utils/activation-utils/activation-utils.js'
import XAmount from '../../../../../../elements/x-amount/x-amount';

export default class ScreenActivationAddress extends XScreenFit {
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
            3. Wait here until your activation balance arrives.
        `
    }

    children() { return [XAddress] }

    _onEntry() {
        window.setInterval(this._onCheckBalance.bind(this), 10000);
    }

    async _onCheckBalance() {
        const balance = await ActivationUtils.fetchBalance(this._ethAddress);
        this.$('#balance').innerHTML = balance;
        this.fire('x-balance', balance);
    }

    setAddress(ethAddress) {
        this.$address.address = ethAddress;
        this._ethAddress = ethAddress;
    }

    get route() { return 'address' }
}