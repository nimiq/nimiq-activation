import XScreen from '/elements/x-screen/x-screen.js';
import ScreenAccounts from './screen-accounts/screen-accounts.js'

export default class ScreenOverview extends XScreen {
    html() {
        return `
            <x-slides>
                <screen-accounts route="1"></screen-accounts>
                <screen-accounts route="2"></screen-accounts>
                <screen-accounts route="3"></screen-accounts>
            </x-slides
        `
    }

    children() {
        return [ [ScreenAccounts] ];
    }
}

// Todo: Create screen-accounts element for each set of accounts (paging.) We don't know in advance, how many pages we have. Alternative: Horizontal scroll. Or just assume there is a maximum number of accounts. 
// Todo: [low] Show account balances with help of NET balances etherscan: https://api.etherscan.io/api?module=account&action=tokenbalance&contractaddress={}&address={}&tag=latest&apikey=YourApiKeyToken