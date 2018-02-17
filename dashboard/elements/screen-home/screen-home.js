import XScreen from '/elements/x-screen/x-screen.js';
import ScreenLoading from '/elements/screen-loading/screen-loading.js';
import ScreenError from '/elements/screen-error/screen-error.js';
import ScreenAccounts from '/elements/screen-accounts/screen-accounts.js';
import ActivationUtils from '/libraries/nimiq-utils/activation-utils/activation-utils.js';

export default class ScreenHome extends XScreen {
    html() {
        return `
            <h1>Accounts Dashboard</h1>
            <h2>Activate Nimiq Accounts and manage your activated Accounts</h2>
            <x-slides>
                <screen-loading>Loading Data</screen-loading>                
                <screen-error></screen-error>              
                <screen-accounts></screen-accounts>
            </x-slides>
        `
    }

    children() { return [ ScreenLoading, ScreenAccounts, ScreenError ] }

    listeners() {
        return {
            'x-create-account': '_onCreateAccount',
        }
    }

    async _onBeforeEntry() {
        if (this._hasContent) return;
        this._hasContent = true;

        let dashboardToken = new URLSearchParams(document.location.search).get("dashboard_token");
        if (dashboardToken !== null) {
            localStorage.setItem('dashboardToken', dashboardToken);
        } else {
            dashboardToken = localStorage.getItem('dashboardToken');
        }

        const apiResponse = await ActivationUtils.getDashboardData(dashboardToken);
        if (apiResponse.ok) {
            const result = await apiResponse.json();
            this._activationToken = result.activation_token;
            this.$screenAccounts.accounts = result.addresses;
            await this.goTo('accounts');
        } else {
            this.$screenError.show('Invalid dashboard token. Please use a valid link.');
            await this.goTo('error');
        }
    }

    _onCreateAccount() {
        window.location.href = '../activate/?activation_token=' + this._activationToken;
    }
}
