import XAppScreen from '/elements/x-screen/x-app-screen.js';
import ScreenLoading from '/elements/screen-loading/screen-loading.js';
import ScreenError from '/elements/screen-error/screen-error.js';
import ScreenAccounts from '/elements/screen-accounts/screen-accounts.js';
import XNimiqApi from '/elements/x-nimiq-api/x-nimiq-api.js';
import XActivationUtils from '/elements/x-activation-utils/x-activation-utils.js'

export default class Dashboard extends XAppScreen {
    html() {
        return `
            <div class="x-screen" style="display:flex;">
                <h1>Accounts Dashboard</h1>
                <h2>Activate Nimiq Accounts and manage your activated Accounts</h2>
                <x-slides>
                    <screen-loading>Loading Data</screen-loading>                
                    <screen-error>Loading Accounts</screen-error>                
                    <screen-accounts></screen-accounts>
                </x-slides>
                <x-activation-utils></x-activation-utils>
                <x-nimiq-api></x-nimiq-api>
            </div>
        `
    }

    children() { return [ ScreenLoading, ScreenAccounts, ScreenError, XNimiqApi, XActivationUtils ] }

    listeners() {
        return {
            'x-activation-dashboard-data': '_onDashboardDataResult',
            'x-create-account': '_onCreateAccount',
            'x-api-ready': '_onApiReady'
        }
    }

    _onApiReady() {
        const dashboardToken = new URLSearchParams(document.location.search).get("dashboard_token");
        this.$activationUtils._api.getDashboardData(dashboardToken);
    }

    _onDashboardDataResult(result) {
        const addresses = result.addresses;
        const activationToken = result.activation_token;
        this._activationToken = activationToken;
        this.$screenAccounts.accounts = addresses;
        this.goTo('accounts');
    }

    _onCreateAccount() {
        window.location = '../activate/?activation_token=' + this._activationToken;
    }
}

Dashboard.launch();

// Todo: Error if there is no dashboard_token in url or if it is invalid