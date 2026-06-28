// swift-tools-version: 6.0

import PackageDescription

let package = Package(
    name: "SecondChair",
    platforms: [
        .macOS(.v14),
    ],
    products: [
        .executable(name: "SecondChair", targets: ["SecondChair"]),
    ],
    targets: [
        .executableTarget(
            name: "SecondChair",
            path: "Sources/SecondChair"
        ),
        .testTarget(
            name: "SecondChairTests",
            dependencies: ["SecondChair"],
            path: "Tests/SecondChairTests"
        ),
    ]
)
