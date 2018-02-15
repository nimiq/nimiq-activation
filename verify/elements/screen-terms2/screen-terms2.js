import XScreen from '/elements/x-screen/x-screen.js';

export default class ScreenTerms2 extends XScreen {
    html() {
        return `
		    <h1>Activation Terms</h1>
		    <h2>Please read the following terms carefully</h2>
		    <section>
		    	<h3>Heading 1</h3>
		    	<p>
		    		Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
		    	</p>
		    	<h3>Heading 2</h3>
		    	<p>
		    		Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
		    	</p>
		    	<h3>Heading 3</h3>
		    	<p>
		    		Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
		    	</p>
		    	<div class="same-size-buttons">
				    <a id="disagree" button class="small fixed-size secondary" href="https://www.nimiq.com">I Disagree</a>
				    <a id="agree" button class="small fixed-size" href="#form-handler">I Agree</a>
				</div>
		    </section>
		`
    }
}
