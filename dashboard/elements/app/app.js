import XAppScreen from '/elements/x-screen/x-app-screen.js';
import ScreenLoading from '/elements/screen-loading/screen-loading.js';
import ScreenError from '/elements/screen-error/screen-error.js';
import ScreenAccounts from '/elements/screen-accounts/screen-accounts.js';
import XActivationUtils from '/elements/x-activation-utils/x-activation-utils.js'

export default class Dashboard extends XAppScreen {
    html() {
        return `
            <div class="x-screen" style="display:flex;">
                <h1>Accounts Dashboard</h1>
                <x-slides>
                    <screen-loading>Loading Data</screen-loading>                
                    <screen-error>Loading Accounts</screen-error>                
                    <screen-accounts></screen-accounts>
                </x-slides>
                <x-activation-utils></x-activation-utils>
            </div>
        `
    }

    children() { return [ ScreenLoading, ScreenAccounts, ScreenError, XActivationUtils ] }

    listeners() {
        return {
            'x-api-ready': '_onApiReady',
            'x-api-dashboard-data': '_onDashboardDataResult',
            'x-create-account': '_onCreateAccount',
        }
    }

    _onEntry() {
        const dashboard_token = new URLSearchParams(document.location.search).get("dashboard_token");
        this.$activationUtils.getDashboardData(dashboard_token);
    }

    _onDashboardDataResult(e) {
        const { addresses, activationToken } = e.detail;
        this._activationToken = activationToken;
        this.$screenOverview.addresses = addresses;
    }

    _onCreateAccount() {
        window.location.href = '/activate/' + this._activationToken;
    }
}
Dashboard.launch();