// swift-tools-version: 6.0

import PackageDescription

let package = Package(
    name: "NanoDesignKit",
    platforms: [.macOS(.v14)],
    products: [
        .library(name: "NanoDesignKit", targets: ["NanoDesignKit"]),
    ],
    dependencies: [
        .package(path: "../NanoCore"),
    ],
    targets: [
        .target(
            name: "NanoDesignKit",
            dependencies: [
                .product(name: "NanoCore", package: "NanoCore"),
            ],
            swiftSettings: [.swiftLanguageMode(.v5)]
        ),
        .testTarget(
            name: "NanoDesignKitTests",
            dependencies: ["NanoDesignKit"],
            swiftSettings: [.swiftLanguageMode(.v5)]
        ),
    ]
)
