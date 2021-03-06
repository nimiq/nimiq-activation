import XScreen from '/elements/x-screen/x-screen.js';
import ScreenLoading from '/elements/legacy/screen-loading/screen-loading.js';
import ScreenError from '/elements/legacy/screen-error/screen-error.js';
import ScreenAccounts from '/elements/legacy/screen-accounts/screen-accounts.js';
import ActivationUtils from '/libraries/nimiq-utils/activation-utils/activation-utils.js';
import XAppScreen from '/elements/x-screen/x-app-screen.js';

export default class ScreenHome extends XScreen {
    html() {
        return `
            <h1>Accounts Dashboard</h1>
            <h2>Create and manage your Nimiq Accounts</h2>
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
        if (!XAppScreen.instance.accounts) {
            let dashboardToken;
            try {
                dashboardToken = new URLSearchParams(document.location.search).get("dashboard_token");
            } catch(e) {
                XAppScreen.instance.showError('Your browser does not support certain functionality. Please use e.g. Chrome, Firefox or Safari.');
                return;
            }

            if (dashboardToken !== null) {
                localStorage.setItem('dashboardToken', dashboardToken);
            } else {
                dashboardToken = localStorage.getItem('dashboardToken');
            }

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

        this.$screenAccounts.accounts = XAppScreen.instance.accounts;
        await this.goTo('accounts');
    }

    _onCreateAccount() {
        window.location.href = '../activate/?activation_token=' + XAppScreen.instance.activationToken;
    }
}
