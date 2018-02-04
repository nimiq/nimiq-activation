import XAppScreen from '/elements/x-screen/x-app-screen.js';
import ScreenLoading from '/elements/screen-loading/screen-loading.js';
import ScreenOverview from '../screen-overview/screen-overview.js';
import ActivationUtils from '/elements/x-activation-utils/x-activation-utils.js'

export default class Dashboard extends XAppScreen {
    html() {
        return `
            <h1>Accounts Dashboard</h1>
            <screen-loading></screen-loading>
            <screen-overview></screen-overview>
            <x-activation-utils></x-activation-utils>
        `
    }

    children() {
        return [
            ScreenLoading, ScreenOverview, ActivationUtils
        ]
    }

    listeners() {
        return {
            'x-api-ready': '_onApiReady',
            'x-api-dashboard-data': '_onDashboardDataResult',
            'x-create-account': '_onCreateAccount',
        }
    }

    _onEntry() {
        const dashboard_token = new URLSearchParams(document.location.search).get("dashboard_token")
        this.$activationUtils.getDashboardData(dashboard_token);
    }

    _getDefaultScreen() { return this.$screenLoading; }

    _onDashboardDataResult(e) {
        const { addresses, activationToken } = e.details;
        this._activationToken = activationToken;
        this.$screenOverview.addresses = addresses;
        this.goTo('overview');
    }

    _onCreateAccount() {
        window.location.href = '/activate/' + this._activationToken;
    }
}
Dashboard.launch();