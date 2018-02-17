import XScreen from '/elements/x-screen/x-screen.js';
import XIdenticon from '/elements/x-identicon/x-identicon.js';
import XAddress from '/elements/x-address/x-address.js';
import XAmount from '/elements/x-amount/x-amount.js';
import ActivationUtils from '/libraries/nimiq-utils/activation-utils/activation-utils.js';
import NanoApi from '/libraries/nano-api/nano-api.js';

export default class ScreenAccount extends XScreen {
    html() {
        return `
        	<h1>Nimiq Account</h1>
        	<h2>Check your activated account's identicon, address and balance</h2>
			<x-grow>
				<x-identicon></x-identicon>
				<x-address></x-address>
				<x-amount></x-amount>
			</x-grow>
			<button>Back to Dashboard</button>
		`
    }

    children() { return [XIdenticon, XAddress, XAmount] }

    onCreate() {
        this.$('button').addEventListener('click', e => this._onBack());
    }

    async _onBack() {
        await this.goTo('home/accounts');
    }

    async _onBeforeEntry() {
        this.address = new URLSearchParams(document.location.search).get("address");
        await this._fetchAmount();
    }

    set address(address) {
        this.$identicon.address = address;
        this.$address.address = address;
        this._address = address;
    }

    async _fetchAmount() {
        const ethAddress = await NanoApi.getApi().nim2ethAddress(this._address);
        const balance = await ActivationUtils.fetchBalance(ethAddress);
        this.$amount.value = balance;
    }

    types() {
        /** @type {XIdenticon} */
        this.$identicon = null;
        /&& @type {XAddress} */
        this.$address = null;
        /** @type {XAmount} */
        this.$amount = null
    }
}