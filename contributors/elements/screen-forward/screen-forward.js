import XScreen from '/elements/x-screen/x-screen.js';
import XAddress from '/elements/x-address/x-address.js';
import XIdenticon from '/elements/x-identicon/x-identicon.js';

export default class ScreenForward extends XScreen {
    html() {
        return `
            <nimiq-logo large>Nimiq Activation Tool</nimiq-logo>
            <h1>Account Creation Successful</h1>
            <p>Your Account is:</p>
            <x-grow></x-grow>
            <x-identicon></x-identicon>
            <x-address></x-address>
            <x-grow></x-grow>
            <p>Please copy this account number (by clicking on it) and send it back to us as reply to the personalized email you received.</p>
            <x-grow></x-grow>
            <h2>Thank you for your continued support!</h2>
        `
    }

    children() { return [XAddress, XIdenticon]; }

    setAddress(address) {
        this.$address.address = address;
        this.$identicon.address = address;
    }
}