// swift-tools-version: 6.0

import PackageDescription

let package = Package(
    name: "NanoMeme",
    platforms: [.macOS(.v14)],
    dependencies: [
        .package(path: "Packages/NanoCore"),
        .package(path: "Packages/NanoDesignKit"),
        .package(path: "Packages/NanoImageKit"),
        .package(path: "Packages/NanoStorageKit"),
        .package(url: "https://github.com/sindresorhus/KeyboardShortcuts.git", from: "2.4.0"),
    ],
    targets: [
        .target(
            name: "NanoMemeLib",
            dependencies: [
                .product(name: "NanoCore", package: "NanoCore"),
                .product(name: "NanoDesignKit", package: "NanoDesignKit"),
                .product(name: "NanoImageKit", package: "NanoImageKit"),
                .product(name: "NanoStorageKit", package: "NanoStorageKit"),
                .product(name: "KeyboardShortcuts", package: "KeyboardShortcuts"),
            ],
            path: "Sources/NanoMeme",
            swiftSettings: [.swiftLanguageMode(.v5)]
        ),
        .executableTarget(
            name: "NanoMeme",
            dependencies: ["NanoMemeLib"],
            path: "Sources/NanoMemeApp",
            swiftSettings: [.swiftLanguageMode(.v5)]
        ),
        .testTarget(
            name: "NanoMemeTests",
            dependencies: ["NanoMemeLib"],
            path: "Tests/NanoMemeTests",
            swiftSettings: [.swiftLanguageMode(.v5)]
        ),
    ]
)
