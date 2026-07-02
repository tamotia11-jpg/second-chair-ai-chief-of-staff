import Foundation

enum ChatRole: String, Codable, Sendable {
    case user
    case assistant
    case system

    var title: String {
        switch self {
        case .user: "You"
        case .assistant: "Second Chair"
        case .system: "System"
        }
    }
}

enum ChatSource: String, Codable, Sendable {
    case local
    case manus
    case system
}

struct ChatMessage: Identifiable, Codable, Hashable, Sendable {
    let id: UUID
    let role: ChatRole
    let content: String
    let createdAt: Date
    let source: ChatSource

    init(
        id: UUID = UUID(),
        role: ChatRole,
        content: String,
        createdAt: Date = Date(),
        source: ChatSource
    ) {
        self.id = id
        self.role = role
        self.content = content
        self.createdAt = createdAt
        self.source = source
    }
}

extension ChatMessage {
    static let welcome = ChatMessage(
        role: .assistant,
        content: "Bring me the operating work: leads, sales follow-through, campaign drafts, admin loose ends, finance exceptions, or the weekly brief. I will keep anything consequential in review.",
        source: .local
    )
}
