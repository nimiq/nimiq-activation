import XScreen from '/elements/x-screen/x-screen.js';
import XScreenFit from '/elements/x-screen/x-screen-fit.js';
import ScreenWarning from '/elements/screen-warning/screen-warning.js';
export default class ScreenWelcome extends XScreen {
    html() {
        return `
            <x-slides>
                <screen-welcome-intro></screen-welcome-intro>
                <screen-warning>
                    <ul>
                        <li>You can not transfer your activated NIM until mainnet launch.</li>
                        <li>You can not change your Nimiq Account once you have activated it.</li>
                        <li>Complete all of the following steps to securely use and backup your Nimiq Account.</li>
                    <ul>
                </screen-warning>
            <x-slides>
        `
    }
    children() { return [ScreenWelcomeIntro, ScreenWarning] }
    listeners() {
        return {
            'x-warning-complete': '_onWarningComplete'
        }
    }

    _onWarningComplete() {
        document.location.href = '#identicons';
    }
}

class ScreenWelcomeIntro extends XScreenFit {

    html() {
        return `
            <nimiq-logo large>Nimiq Activation Tool</nimiq-logo>
            <h1>Welcome to the Nimiq Wallet Creation</h1>
            <h2>Create a wallet to activate your NIM from NET</h2>
            <ol>
                <li>Create your Nimiq Genesis Account</li>
                <li>Activate your Nimiq (NIM) from NET</li>
            </ol>
            <x-grow></x-grow>
            <a href="#welcome/warning" button>Let's go!</a>`
    }
}