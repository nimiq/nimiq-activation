import XScreen from '/elements/x-screen/x-screen.js';

export default class ScreenWelcome extends XScreen {
    html() {
        return `
            <nimiq-logo large>Nimiq Activation</nimiq-logo>
            <h1>Welcome to Nimiq Activation</h1>
            <h2>The Nimiq Activation Tool will help guide you through the process of activating your Genesis Nimiq (NIM) from NET.</h2>
            <a button href="#terms">View Terms</a>
        `
    }
}