import SwiftUI

enum Brand {
    static let blue = Color(red: 0.18, green: 0.40, blue: 0.93)
    static let coral = Color(red: 0.94, green: 0.36, blue: 0.27)
    static let mint = Color(red: 0.18, green: 0.67, blue: 0.50)
}

extension WorkStatus {
    var color: Color {
        switch self {
        case .draft: Brand.blue
        case .ready: Brand.coral
        case .approved: Brand.mint
        case .held: .secondary
        }
    }
}
