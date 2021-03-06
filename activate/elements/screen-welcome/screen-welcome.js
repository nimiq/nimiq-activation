import XScreen from '/elements/x-screen/x-screen.js';
import XScreenFit from '/elements/x-screen/x-screen-fit.js';
import ScreenWarning from '/elements/legacy/screen-warning/screen-warning.js';

export default class ScreenWelcome extends XScreen {
    html() {
        return `
            <x-slides>
                <screen-welcome-intro></screen-welcome-intro>
                <screen-warning>
                    <ul>
                        <li>You can <strong class="red">NOT</strong> change a Nimiq Account once created (You can only create new accounts)</li>
                        <li>Complete <strong class="red">ALL</strong> of the following steps to secure future access to this Nimiq Account</li>
                        <li>You can <strong class="red">NOT</strong> transfer your activated NIM until Mainnet launch</li>
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
            <h1>Welcome to Nimiq Account Creation for NET Holders</h1>
            <h2>To activate your NIM from NET:</h2>
            <ol>
                <li>Create your Nimiq Account</li>
                <li>Activate your Nimiq (NIM) from NET</li>
            </ol>
            <x-grow></x-grow>
            <a href="#welcome/warning" button>Let's go!</a>`
    }
}