import AppKit
import SwiftUI
import NanoCore
import NanoImageKit
import NanoStorageKit
import KeyboardShortcuts

@MainActor
public final class AppDelegate: NSObject, NSApplicationDelegate {
    private var menuBarManager: MenuBarManager!
    private var state: AppState!
    private var coordinator: MemeCoordinator!
    private var keychainHelper: KeychainHelper!

    public func applicationDidFinishLaunching(_ notification: Notification) {
        NanoConfig.current = .nanoMeme
        FileLog.shared.reconfigure()
        FileLog.shared.installCrashHandlers()

        Log.app.info("NanoMeme starting...")

        // Initialize state
        state = AppState()
        coordinator = MemeCoordinator(state: state)
        keychainHelper = KeychainHelper()

        // Check for existing API key
        if keychainHelper.resolveAPIKey() != nil {
            state.isAPIKeyConfigured = true
        }

        // Configure settings
        SettingsWindowController.shared.configure(state: state) { [weak self] key in
            try? self?.keychainHelper.save(key)
            self?.state.isAPIKeyConfigured = true
        }

        // Setup menu bar
        menuBarManager = MenuBarManager(state: state) { [weak self] in
            guard let self else { return AnyView(EmptyView()) }
            return AnyView(
                PopoverView(
                    state: self.state,
                    onGenerate: { [weak self] in self?.generate() },
                    onCancel: { [weak self] in self?.coordinator.cancelGeneration() },
                    onSettings: { SettingsWindowController.shared.showSettings() },
                    onQuit: { NSApp.terminate(nil) }
                )
            )
        }
        menuBarManager.setup()

        // Register shortcuts
        KeyboardShortcuts.onKeyUp(for: .togglePopover) { [weak self] in
            if self?.menuBarManager.isPopoverShown == true {
                self?.menuBarManager.hidePopover()
            } else {
                self?.menuBarManager.showPopover()
            }
        }

        KeyboardShortcuts.onKeyUp(for: .generateMeme) { [weak self] in
            self?.generate()
        }

        // Observe generating state for icon updates
        Task { @MainActor [weak self] in
            guard let self else { return }
            // Poll state changes (withObservationTracking alternative)
            while true {
                try? await Task.sleep(for: .milliseconds(500))
                self.menuBarManager.updateIcon(isGenerating: self.state.isGenerating)
            }
        }

        Log.app.info("NanoMeme ready")
    }

    // Handle dock icon click — show the popover
    public func applicationShouldHandleReopen(_ sender: NSApplication, hasVisibleWindows flag: Bool) -> Bool {
        if !flag {
            menuBarManager.showPopover()
        }
        return true
    }

    private func generate() {
        guard let apiKey = keychainHelper.resolveAPIKey() else {
            state.lastError = "No API key configured. Open Settings to add one."
            SettingsWindowController.shared.showSettings()
            return
        }
        coordinator.generateMeme(apiKey: apiKey)
    }
}
