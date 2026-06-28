import Foundation

enum AppSection: String, CaseIterable, Identifiable {
    case today
    case approvals
    case workstreams
    case brief
    case connectors

    var id: String { rawValue }

    var title: String {
        switch self {
        case .today: "Today"
        case .approvals: "Approvals"
        case .workstreams: "Workstreams"
        case .brief: "Executive Brief"
        case .connectors: "Connectors"
        }
    }

    var systemImage: String {
        switch self {
        case .today: "sun.max"
        case .approvals: "checkmark.seal"
        case .workstreams: "square.grid.2x2"
        case .brief: "doc.text"
        case .connectors: "link"
        }
    }
}
