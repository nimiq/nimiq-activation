import XAppScreen from '/elements/x-screen/x-app-screen.js';
import ScreenHome from '../screen-home/screen-home.js';
import ScreenAccount from '../screen-account/screen-account.js';

export default class Dashboard extends XAppScreen {
    html() {
        return `
            <screen-home></screen-home>
            <screen-account></screen-account>
        `
    }

    children() { return [ScreenHome, ScreenAccount] }

    listeners() {
        return { 'x-account-selected': '_onAccountSelected' }
    }

    _onAccountSelected(address) {
        window.location = '?address=' + address + '#account';
    }
}

Dashboard.launch();

// Todo: Error if there is no dashboard_token in url or if it is invalid