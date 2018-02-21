import XScreen from '/elements/x-screen/x-screen.js';

export default class ScreenForward extends XScreen {
    html() {
        return `
            <nimiq-logo large>Nimiq Activation</nimiq-logo>
            <h1>Data upload successful</h1>
            <h2>We are sending you an email with a link to start Identity Verification.</h2>
            <p>Please check your inbox and also your spam folder for a message from us.</p>
            <x-grow></x-grow>
        `
    }
}