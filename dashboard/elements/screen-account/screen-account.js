import XScreen from '/elements/x-screen/x-screen.js';
import XIdenticon from '/elements/x-identicon/x-identicon.js';
import XAddress from '/elements/x-address/x-address.js';
import XAmount from '/elements/x-amount/x-amount.js';
import ActivationUtils from '/libraries/nimiq-utils/activation-utils/activation-utils.js';
import XAppScreen from '/elements/x-screen/x-app-screen.js';
import NanoApi from '/libraries/nano-api/nano-api.js';

export default class ScreenAccount extends XScreen {
    html() {
        return `
        	<h1>Nimiq Account</h1>
        	<h2>View account information</h2>
			<x-grow>
				<x-identicon></x-identicon>
				<x-address></x-address>
				<x-amount></x-amount>
			</x-grow>
            <a secondary class="activate-nim hidden">Click here to activate more NIM from NET on this account</a>
			<button class="secondary">Back to Dashboard</button>
		`
    }

    children() { return [XIdenticon, XAddress, XAmount] }

    onCreate() {
        this.$('button').addEventListener('click', e => this._onBack());

        this.$('.activate-nim').addEventListener('click', e => {
            this.fire('x-activate-nim', this._address);
        });
    }

    async _onBack() {
        await this.goTo('home/accounts');
    }

    async _onBeforeEntry() {
        this.address = new URLSearchParams(document.location.search).get("address");
        this._fetchAmount();

        if (!XAppScreen.instance.accounts) {
            const dashboardToken = localStorage.getItem('dashboardToken');

            if (dashboardToken === null) return;

            let apiResponse;
            try {
                apiResponse = await ActivationUtils.getDashboardData(dashboardToken);
            } catch (e) {
               XAppScreen.instance.showError('Server unavailable. Please try again later.');
               return;
            }

            if (apiResponse.ok) {
                const result = await apiResponse.json();
                XAppScreen.instance.activationToken = result.activation_token;
                XAppScreen.instance.accounts = result.addresses;
            } else {
                XAppScreen.instance.showError('Invalid dashboard token. Please use a valid link.');
                return;
            }
        }

       if(XAppScreen.instance.accounts.includes(this._address)) this.$('.activate-nim').classList.remove('hidden');

    }

    set address(address) {
        this.$identicon.addressAsImg = address;
        this.$address.address = address;
        this._address = address;
    }

    async _fetchAmount() {
        const ethAddress = await NanoApi.getApi().nim2ethAddress(this._address);
        const netBalance = await ActivationUtils.fetchBalance(ethAddress);
        this.$amount.value = netBalance * 100; // 1 NET = 100 NIM
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