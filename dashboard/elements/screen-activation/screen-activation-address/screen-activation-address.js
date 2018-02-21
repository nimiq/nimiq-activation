import XScreenFit from '/elements/x-screen/x-screen-fit.js';
import XAddress from '/elements/x-address/x-address.js';

export default class ScreenActivationAddress extends XScreenFit {
    html() {
        return `
            <strong><big>1.</big> Copy the following specific Ethereum address:</strong>
            <x-address></x-address>

            <strong><big>2.</big> From your NET wallet send all NET with which you want to activate NIM to this specific Ethereum address.</strong>
            <h3>Transfer Options</h3>
            <ul>
                <li>Send your NET directly from an exchange</li>
                <li>or from <a href="https://www.myetherwallet.com/" target="_blank" class="my-ether-wallet">MyEtherWallet.com</a></li>
                <li>or from any wallet that supports ERC20 tokens</li>
            </ul>
            <a button href="#home/accounts">Go to dashboard</a>
        `
    }

    children() { return [XAddress] }

    setAddress(ethAddress) {
        this.$address.address = ethAddress;
        this._ethAddress = ethAddress;
    }

    get route() { return 'address' }
}