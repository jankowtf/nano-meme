// swift-tools-version: 6.0

import PackageDescription

let package = Package(
    name: "NanoImageKit",
    platforms: [.macOS(.v14)],
    products: [
        .library(name: "NanoImageKit", targets: ["NanoImageKit"]),
    ],
    dependencies: [
        .package(path: "../NanoCore"),
    ],
    targets: [
        .target(
            name: "NanoImageKit",
            dependencies: [
                .product(name: "NanoCore", package: "NanoCore"),
            ],
            swiftSettings: [.swiftLanguageMode(.v5)]
        ),
        .testTarget(
            name: "NanoImageKitTests",
            dependencies: ["NanoImageKit"],
            swiftSettings: [.swiftLanguageMode(.v5)]
        ),
    ]
)
