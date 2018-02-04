import XScreen from '/elements/x-screen/x-screen.js';

export default class ScreenAccounts extends XScreen {
    html() {
        return `
            <h1>Accounts Dashboard</h1>
            <h2>The Nimiq Activation Tool will help guide you through the process of activating your Genesis Nimiq (NIM) from NET.</h2>
            <a button href="#terms">View Terms</a>
        `
    }
}

// Todo: [low] Show account balances with help of NET balances etherscan: https://api.etherscan.io/api?module=account&action=tokenbalance&contractaddress={}&address={}&tag=latest&apikey=YourApiKeyToken