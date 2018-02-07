import XScreen from '/elements/x-screen/x-screen.js';
import ScreenLoading from '/elements/screen-loading/screen-loading.js';
import ScreenError from '/elements/screen-error/screen-error.js';
import ScreenAccounts from '/elements/screen-accounts/screen-accounts.js';
import XActivationUtils from '/elements/x-activation-utils/x-activation-utils.js'

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
            <x-activation-utils></x-activation-utils>
        `
    }

    children() { return [ ScreenLoading, ScreenAccounts, ScreenError, XActivationUtils ] }

    listeners() {
        return {
            'x-activation-dashboard-data': '_onDashboardDataResult',
            'x-activation-dashboard-token-error': '_onDashboardTokenError',
            'x-create-account': '_onCreateAccount',
            'x-api-ready': '_onApiReady'
        }
    }

    _onBeforeEntry() {
        let dashboardToken = new URLSearchParams(document.location.search).get("dashboard_token");
        if (dashboardToken !== null) {
            localStorage.setItem('dashboardToken', dashboardToken);
        } else {
            dashboardToken = localStorage.getItem('dashboardToken');
        }
        this.$activationUtils._api.getDashboardData(dashboardToken);
    }

    _onDashboardDataResult(result) {
        const addresses = result.addresses;
        const activationToken = result.activation_token;
        this._activationToken = activationToken;
        this.$screenAccounts.accounts = addresses;
        this.goTo('accounts');
    }

    _onDashboardTokenError() {
        this.$screenError.show('Invalid dashboard token. Please use a valid link.');
        this.goTo('error');
    }

    _onCreateAccount() {
        window.location.href = '../activate/?activation_token=' + this._activationToken;
    }
}

// Todo: Error if there is no dashboard_token in url or if it is invalid