import XAppScreen from '/elements/x-screen/x-app-screen.js';
import ScreenDashboard from '../screen-dashboard/screen-dashboard.js';

export default class ActivationTool extends XAppScreen {
    html() {
        return `
            <screen-dashboard></screen-dashboard>
            <screen-terms></screen-terms>
        `
    }

    children() {
        return [
            ScreenDashboard
        ]
    }

    listeners() {
        return {
            'x-api-ready': '_onApiReady',
        }
    }
}
ActivationTool.launch();