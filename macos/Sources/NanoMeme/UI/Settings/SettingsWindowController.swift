import AppKit
import SwiftUI
import NanoDesignKit

@MainActor
public final class SettingsWindowController {
    public static let shared = SettingsWindowController()

    private var window: NSWindow?
    private var state: AppState?
    private var onSaveAPIKey: ((String) -> Void)?

    private init() {}

    public func configure(state: AppState, onSaveAPIKey: @escaping (String) -> Void) {
        self.state = state
        self.onSaveAPIKey = onSaveAPIKey
    }

    public func showSettings() {
        if let window, window.isVisible {
            window.makeKeyAndOrderFront(nil)
            NSApp.activate(ignoringOtherApps: true)
            return
        }

        guard let state, let onSaveAPIKey else { return }

        let settingsView = SettingsView(state: state, onSaveAPIKey: onSaveAPIKey)
        let hostingView = NSHostingView(rootView: settingsView)

        let window = NSWindow(
            contentRect: NSRect(x: 0, y: 0, width: 420, height: 340),
            styleMask: [.titled, .closable, .miniaturizable],
            backing: .buffered,
            defer: false
        )
        window.title = "NanoMeme Settings"
        window.contentView = hostingView
        window.center()
        window.makeKeyAndOrderFront(nil)
        NSApp.activate(ignoringOtherApps: true)

        self.window = window
    }
}

struct SettingsView: View {
    @Bindable var state: AppState
    let onSaveAPIKey: (String) -> Void

    @State private var apiKeyInput = ""
    @State private var showKey = false

    var body: some View {
        TabView {
            generalTab
                .tabItem { Label("General", systemImage: "gear") }

            apiTab
                .tabItem { Label("API", systemImage: "key") }

            generationTab
                .tabItem { Label("Generation", systemImage: "sparkles") }
        }
        .padding(20)
        .frame(width: 420, height: 340)
    }

    private var generalTab: some View {
        Form {
            Toggle("Launch at Login", isOn: .constant(false))
            Toggle("Show in Dock", isOn: .constant(false))
        }
        .formStyle(.grouped)
    }

    private var apiTab: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Gemini API Key")
                .font(.headline)

            HStack {
                if showKey {
                    TextField("API Key", text: $apiKeyInput)
                } else {
                    SecureField("API Key", text: $apiKeyInput)
                }

                Button(showKey ? "Hide" : "Show") {
                    showKey.toggle()
                }
            }

            HStack {
                Button("Save to Keychain") {
                    onSaveAPIKey(apiKeyInput)
                    state.isAPIKeyConfigured = true
                }
                .disabled(apiKeyInput.isEmpty)

                if state.isAPIKeyConfigured {
                    Label("Configured", systemImage: "checkmark.circle.fill")
                        .foregroundStyle(.green)
                }
            }

            Spacer()

            Text("Get your key from ai.google.dev")
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .padding()
    }

    private var generationTab: some View {
        Form {
            Picker("Default Resolution", selection: $state.selectedResolution) {
                Text("0.5K").tag("0.5K")
                Text("1K").tag("1K")
                Text("2K").tag("2K")
                Text("4K").tag("4K")
            }
        }
        .formStyle(.grouped)
    }
}
