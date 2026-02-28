import Testing
@testable import NanoCore

@Suite("NanoConfig")
struct NanoConfigTests {

    @Test("nanoMeme preset has correct identity")
    func nanoMemePreset() {
        let config = NanoConfig.nanoMeme
        #expect(config.appName == "NanoMeme")
        #expect(config.bundleId == "com.kaosmaps.nanomeme")
    }

    @Test("default current config is nanoMeme")
    func defaultCurrent() {
        let config = NanoConfig.current
        #expect(config.appName == "NanoMeme")
        #expect(config.bundleId == "com.kaosmaps.nanomeme")
    }

    @Test("log directory derives from appName")
    func logDirectory() {
        let config = NanoConfig.nanoMeme
        #expect(config.logDirectory.path.contains("NanoMeme"))
    }

    @Test("data cache directory derives from appName")
    func dataCacheDirectory() {
        let config = NanoConfig.nanoMeme
        #expect(config.dataCacheDirectory.path.contains("NanoMeme"))
    }

    @Test("custom config overrides defaults")
    func customConfig() {
        let custom = NanoConfig(appName: "TestApp", bundleId: "com.test.app")
        #expect(custom.appName == "TestApp")
        #expect(custom.bundleId == "com.test.app")
        #expect(custom.logDirectory.path.contains("TestApp"))
    }

    @Test("global current config can be mutated")
    func globalMutation() {
        let original = NanoConfig.current
        NanoConfig.current = NanoConfig(appName: "Temp", bundleId: "com.test.temp")
        #expect(NanoConfig.current.appName == "Temp")
        NanoConfig.current = original
    }
}
