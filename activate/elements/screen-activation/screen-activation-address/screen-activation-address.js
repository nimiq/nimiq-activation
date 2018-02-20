import XScreenFit from '/elements/x-screen/x-screen-fit.js';
import XAddress from '/elements/x-address/x-address.js';
import ActivationUtils from '/libraries/nimiq-utils/activation-utils/activation-utils.js';

export default class ScreenActivationAddress extends XScreenFit {
    html() {
        return `
            <strong><big>1.</big> Copy the following specific Ethereum Address:</strong>
            <x-address></x-address>

            <strong><big>2.</big> From your NET wallet send your NET to this specific Ethereum address.</strong>
            <h3>Transfer Options</h3>
            <ul>
                <li>Send your NET directly from an exchange</li>
                <li>or from <a href="https://www.myetherwallet.com/" target="_blank" class="my-ether-wallet">MyEtherWallet.com</a></li>
                <li>or from any wallet that supports ERC20 tokens</li>
            </ul>
            <strong><big>3.</big> Once NET arrive at the above Ethereum address, this page will redirect you to your dashboard and Activation is complete!</strong>
        `
    }

    children() { return [XAddress] }

    _onEntry() {
        window.setInterval(this._onCheckBalance.bind(this), 10000);
    }

    async _onCheckBalance() {
        const balance = await ActivationUtils.fetchBalance(this._ethAddress);
        this.fire('x-balance', balance);
    }

    setAddress(ethAddress) {
        this.$address.address = ethAddress;
        this._ethAddress = ethAddress;
    }

    get route() { return 'address' }
}