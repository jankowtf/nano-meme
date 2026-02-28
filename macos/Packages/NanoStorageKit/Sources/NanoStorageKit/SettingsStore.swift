import Foundation
import NanoCore

public final class SettingsStore: @unchecked Sendable {
    public static let shared = SettingsStore()

    @AppStorageValue("launchAtLogin", defaultValue: false)
    public var launchAtLogin: Bool

    @AppStorageValue("showInDock", defaultValue: false)
    public var showInDock: Bool

    @AppStorageValue("defaultResolution", defaultValue: "1K")
    public var defaultResolution: String

    @AppStorageValue("defaultAspectRatio", defaultValue: "1:1")
    public var defaultAspectRatio: String

    @AppStorageValue("autoOverlayText", defaultValue: true)
    public var autoOverlayText: Bool

    private init() {}
}
