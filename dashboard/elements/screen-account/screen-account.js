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
                <div class="identicon-address-container">
                    <x-identicon></x-identicon>
                    <x-address></x-address>
                </div>
                <x-amount></x-amount>
                <span class="warning">Minimum of 1 NET = 100 NIM required per Account for Genesis Block (see <a href="https://nimiq.com/activation/terms">Terms</a>)!</span>
            </x-grow>
            <button class="secondary activate-nim hidden">Activate more NIM</button>
            <button class="to-dashboard">Back to Dashboard</button>
        `
    }

    children() { return [XIdenticon, XAddress, XAmount] }

    onCreate() {
        this.$('.to-dashboard').addEventListener('click', e => this._onBack());

        this.$('.activate-nim').addEventListener('click', e => {
            this.fire('x-activate-nim', this._address);
        });

        this.$warning = this.$('span.warning');
    }

    async _onBack() {
        await this.goTo('home/accounts');
    }

    async _onBeforeEntry() {
        try {
            this.address = new URLSearchParams(document.location.search).get("address");
        } catch(e) {
            XAppScreen.instance.showError('Your browser does not support certain functionality. Please use e.g. Chrome, Firefox or Safari.');
            return;
        }

        this.$warning.style.display = 'none';
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
        const balance = netBalance * 100; // 1 NET = 100 NIM
        this.$amount.value = balance;
        if (balance < 100) this.$warning.style.display = 'initial';
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