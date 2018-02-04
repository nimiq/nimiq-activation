import XAppScreen from '/elements/x-screen/x-app-screen.js';
import ScreenLoading from '/elements/screen-loading/screen-loading.js';
import ScreenOverview from '../screen-overview/screen-overview.js';
import ActivationTools from '/elements/x-activation-api/x-activation-api.js'

export default class Dashboard extends XAppScreen {
    html() {
        return `
            <h1>Accounts Dashboard</h1>
            <screen-loading></screen-loading>
            <screen-overview></screen-overview>
            <x-activation-api></x-activation-api>
        `
    }

    children() {
        return [
            ScreenLoading, ScreenOverview, ActivationApi
        ]
    }

    listeners() {
        return {
            'x-api-ready': '_onApiReady',
            'x-api-dashboard-data': '_onDashboardDataResult',
        }
    }

    onEntry() {
        const dashboard_token = null; // Todo get token from url
        this.$activationApi.getAddressList({dashboard_token})
    }

    _onDashboardDataResult(e) {
        const { addresses, activationToken } = e.details;
        this.$screenOverview.set({ addresses, activationToken });
    }
    
    _getDefaultScreen() { return this.$screenLoading; }

}
Dashboard.launch();