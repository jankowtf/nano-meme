import Foundation

/// Type-safe UserDefaults property wrapper with default values.
///
/// Usage:
///   @AppStorageValue("myKey", defaultValue: false)
///   var myFlag: Bool
///
@propertyWrapper
public struct AppStorageValue<T> {
    let key: String
    let defaultValue: T

    public init(_ key: String, defaultValue: T) {
        self.key = key
        self.defaultValue = defaultValue
    }

    public var wrappedValue: T {
        get {
            UserDefaults.standard.object(forKey: key) as? T ?? defaultValue
        }
        set {
            UserDefaults.standard.set(newValue, forKey: key)
        }
    }
}
