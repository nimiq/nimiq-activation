import XScreen from '/elements/x-screen/x-screen.js';
import ScreenAccounts from '/elements/screen-accounts/screen-accounts.js'

export default class ScreenOverview extends XScreen {
    html() {
        return `
            <screen-accounts></screen-accounts>
        `
    }

    children() {
        return [ ScreenAccounts ];
    }

    onCreate() {
        // this.$screenAccounts.$button.text = "Create Account";
    }

    set accounts(accounts) {
        this.$screenAccounts.accounts = accounts;
    }
}