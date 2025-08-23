import { Plugin, SettingsTypes } from "@highlite/core";

export default class AutoSprint extends Plugin {
    pluginName = 'AutoSprint';
    pluginDescription = 'Automatically turns on Run/Sprint mode on login';
    author = 'DarkIdol';

    // Tracking of the users logged in our out state
    private isLoggedIn = false;
    private sprintObserver: MutationObserver | null = null;

    // Initialization
    init(): void {}

    // Startup function when enabled
    start(): void {

        // Determine the logged in state
        if (document.highlite?.gameHooks?.EntityManager?.Instance?.MainPlayer) {
            this.isLoggedIn = true;
        }

        // Run the toggle function
        this.toggleSprintState();

        // Setup observer
        this.setupSprintObserver();
    }

    // Stopping function when disabled
    stop(): void {
        this.cleanupSprintObserver();
    }

    // Login function when logged in
    SocketManager_loggedIn(): void {

        // Toggle logged in state
        this.isLoggedIn = true;

        // Run the toggle function
        this.toggleSprintState();

        // Setup observer
        this.setupSprintObserver();
    }

    // Logged Out
    SocketManager_handleLoggedOut(): void {

        // Toggled logged out state
        this.isLoggedIn = false;

        // Cleanup observer
        this.cleanupSprintObserver();
    }

    // Handle the sprint state toggling
    private toggleSprintState() {

        // Return if not enabled
        if (!this.settings.enable.value) return;

        // Only run if the user is already logged in
        if (this.isLoggedIn) {
            
            // Find the button (only if not already activated)
            const sprintButton = document.querySelector(
                'button.hs-button.hs-action-bar-button:has(.hs-action-bar-item__image--sprint)'
            );

            // Check if the button is disabled
            if (!sprintButton?.classList.contains('hs-action-bar-button--selected')) {
                const sprintAmountElement = sprintButton?.querySelector(
                    '.hs-action-bar-item__text--combat-skill'
                );

                if (sprintAmountElement) {
                    const sprintAmount = parseInt(sprintAmountElement.innerText);

                    // Check if the amount is more than 20
                    if (sprintAmount > 10) {

                        // Click the toggle
                        sprintButton.dispatchEvent(
                            new PointerEvent('pointerdown', {
                                bubbles: true,
                                cancelable: true,
                                pointerId: 1,
                                pointerType: 'mouse',
                                isPrimary: true,
                            })
                        );

                        console.log('Sprint has been successfully toggled on');
                    }
                }
            }
        }
    }

    // Set up mutation observer for sprint amount changes
    private setupSprintObserver() {

        // Clean up existing observer first
        this.cleanupSprintObserver();

        if (!this.isLoggedIn || !this.settings.enable.value) return;

        const sprintButton = document.querySelector(
            'button.hs-button.hs-action-bar-button:has(.hs-action-bar-item__image--sprint)'
        );

        if (!sprintButton) return;

        const sprintAmountElement = sprintButton.querySelector(
            '.hs-action-bar-item__text--combat-skill'
        );

        if (!sprintAmountElement) return;

        this.sprintObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' || mutation.type === 'characterData') {
                    this.toggleSprintState();
                }
            });
        });

        // Observe changes to the sprint amount text
        this.sprintObserver.observe(sprintAmountElement, {
            childList: true,
            subtree: true,
            characterData: true
        });
    }

    // Cleanup observer when component is destroyed
    private cleanupSprintObserver() {
        if (this.sprintObserver) {
            this.sprintObserver.disconnect();
            this.sprintObserver = null;
        }
    }
}
