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
                        <li>You can <strong class="red">NOT</strong> change your Nimiq Account once created</li>
                        <li>Complete <strong class="red">ALL</strong> of the following steps to secure future access to this Nimiq Account</li>
                        <li>You can <strong class="red">NOT</strong> use your allocated NIM until 6 months after Mainnet launch</li>
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
            <h1>Welcome to Nimiq Account Creation for Early Contributors</h1>
            <h2>Follow this process to create your Nimiq Account</h2>
            <x-grow></x-grow>
            <a href="#welcome/warning" button>Let's go!</a>`
    }
}