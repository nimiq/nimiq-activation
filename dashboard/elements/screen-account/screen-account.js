import XScreen from '/elements/x-screen/x-screen.js';
import XIdenticon from '/elements/x-identicon/x-identicon.js';
import XAddress from '/elements/x-address/x-address.js';
import XAmount from '/elements/x-amount/x-amount.js';
import ActivationUtils from '/library/nimiq-utils/activation-utils/activation-utils.js';
import XNimiqApi from '/elements/x-nimiq-api/x-nimiq-api.js';

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
			<x-nimiq-api></x-nimiq-api>
			<button>Back to Dashboard</button>
		`
    }

    children() { return [XIdenticon, XAddress, XAmount, XNimiqApi] }

    listeners() {
        return {
            'x-api-ready': '_onApiReady'
        }
    }

    onCreate() {
        this.$('button').addEventListener('click', e => this._onBack());
    }

    _onBack() {
        this.goTo('home/accounts');
    }

    _onApiReady() {
        if (!this._address) return;
        this._fetchAmount(this._address);
    }

    set address(address) {
        this.$identicon.address = address;
        this.$address.address = address;
        this._address = address;
        if (this.$nimiqApi.initialized)
            this._onApiReady();
    }

    async _fetchAmount(address) {
        const ethAddress = await ActivationUtils.nim2ethAddress(address);
        const balance = await ActivationUtils.fetchBalance(ethAddress);
        this.$amount.value = balance;
    }

    _onBeforeEntry() {
        this.address = new URLSearchParams(document.location.search).get("address");
    }
}