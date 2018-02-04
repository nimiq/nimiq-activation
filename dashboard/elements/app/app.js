import XAppScreen from '/elements/x-screen/x-app-screen.js';
import ScreenDashboard from '../screen-select-action/screen-select-action.js';
import ScreenLoading from '/elements/screen-loading/screen-loading.js';
import ScreenOverview from '../screen-overview/screen-overview.js';
import ScreenSelectAction from '../screen-select-action/screen-select-action.js';
import ActivationApi from '/elements/x-activation-api/x-activation-api.js'

export default class Dashboard extends XAppScreen {
    html() {
        return `
            <h1>Accounts Dashboard</h1>
            <screen-loading></screen-loading>
            <screen-select-action></screen-select-action>
            <screen-overview></screen-overview>
            <x-activation-api></x-activation-api>
        `
    }

    children() {
        return [
            ScreenLoading, ScreenSelectAction, ScreenOverview, ActivationApi
        ]
    }

    listeners() {
        return {
            'x-api-ready': '_onApiReady',
        }
    }

    onEntry() {
        // api.getAddressList({dashboard_token})

    }
    
    _getDefaultScreen() { return this.$screenLoading; }

}
Dashboard.launch();