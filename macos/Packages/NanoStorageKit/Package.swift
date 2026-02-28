// swift-tools-version: 6.0

import PackageDescription

let package = Package(
    name: "NanoStorageKit",
    platforms: [.macOS(.v14)],
    products: [
        .library(name: "NanoStorageKit", targets: ["NanoStorageKit"]),
    ],
    dependencies: [
        .package(path: "../NanoCore"),
    ],
    targets: [
        .target(
            name: "NanoStorageKit",
            dependencies: [
                .product(name: "NanoCore", package: "NanoCore"),
            ],
            swiftSettings: [.swiftLanguageMode(.v5)]
        ),
        .testTarget(
            name: "NanoStorageKitTests",
            dependencies: ["NanoStorageKit"],
            swiftSettings: [.swiftLanguageMode(.v5)]
        ),
    ]
)
