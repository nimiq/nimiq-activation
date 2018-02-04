import XScreen from '/elements/x-screen/x-screen.js';
import ScreenAccounts from '/elements/screen-accounts/screen-accounts.js'

export default class ScreenOverview extends XScreen {
    html() {
        return `
            <screen-accounts></screen-accounts>
            <a icon-add></a>
        `
    }

    children() {
        return [ ScreenAccounts ];
    }
}