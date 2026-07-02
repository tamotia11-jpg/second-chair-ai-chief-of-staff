import Foundation
import Observation

@MainActor
@Observable
final class WorkspaceStore {
    var items: [WorkItem] {
        didSet { persist() }
    }

    var chatMessages: [ChatMessage] {
        didSet { persistChat() }
    }

    var activeManusTaskID: String? {
        didSet { persistManusTaskID() }
    }

    var isSendingMessage = false

    @ObservationIgnored private let defaults: UserDefaults
    @ObservationIgnored private let storageKey = "second-chair.workspace-items.v1"
    @ObservationIgnored private let chatStorageKey = "second-chair.chat-messages.v1"
    @ObservationIgnored private let manusTaskIDKey = "second-chair.manus-task-id.v1"
    @ObservationIgnored private let manusEventIDsKey = "second-chair.manus-event-ids.v1"
    @ObservationIgnored private var seenManusEventIDs: Set<String> {
        didSet { persistManusEventIDs() }
    }

    init(defaults: UserDefaults = .standard) {
        self.defaults = defaults

        if let data = defaults.data(forKey: storageKey),
           let decoded = try? JSONDecoder().decode([WorkItem].self, from: data),
           decoded.contains(where: { $0.workstream == .analytics }) {
            items = decoded
        } else {
            items = WorkItem.samples
        }

        if let data = defaults.data(forKey: chatStorageKey),
           let decoded = try? JSONDecoder().decode([ChatMessage].self, from: data),
           !decoded.isEmpty {
            chatMessages = decoded
        } else {
            chatMessages = [.welcome]
        }

        activeManusTaskID = defaults.string(forKey: manusTaskIDKey)

        if let savedIDs = defaults.array(forKey: manusEventIDsKey) as? [String] {
            seenManusEventIDs = Set(savedIDs)
        } else {
            seenManusEventIDs = []
        }
    }

    var readyItems: [WorkItem] {
        items.filter { $0.status == .ready }
    }

    var heldItems: [WorkItem] {
        items.filter { $0.status == .held }
    }

    var approvedItems: [WorkItem] {
        items.filter { $0.status == .approved }
    }

    func approve(_ id: WorkItem.ID) {
        update(id, status: .approved)
    }

    func hold(_ id: WorkItem.ID) {
        update(id, status: .held)
    }

    func returnToReview(_ id: WorkItem.ID) {
        update(id, status: .ready)
    }

    func approveNext() {
        guard let next = readyItems.first else { return }
        approve(next.id)
    }

    func resetSampleData() {
        items = WorkItem.samples
    }

    func startNewChat() {
        activeManusTaskID = nil
        seenManusEventIDs = []
        chatMessages = [.welcome]
    }

    func sendChatMessage(_ text: String) async {
        let trimmedText = text.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmedText.isEmpty, !isSendingMessage else { return }

        chatMessages.append(
            ChatMessage(role: .user, content: trimmedText, source: .local)
        )
        isSendingMessage = true
        defer { isSendingMessage = false }

        guard let client = ManusClient.liveFromEnvironment() else {
            chatMessages.append(
                ChatMessage(
                    role: .assistant,
                    content: localFallbackReply(for: trimmedText),
                    source: .local
                )
            )
            return
        }

        do {
            let result = try await client.sendSecondChairMessage(
                trimmedText,
                existingTaskID: activeManusTaskID,
                knownEventIDs: seenManusEventIDs
            )
            activeManusTaskID = result.taskID
            seenManusEventIDs.formUnion(result.eventIDs)
            chatMessages.append(
                ChatMessage(
                    role: .assistant,
                    content: result.reply,
                    source: .manus
                )
            )
        } catch {
            chatMessages.append(
                ChatMessage(
                    role: .system,
                    content: error.localizedDescription,
                    source: .system
                )
            )
        }
    }

    private func update(_ id: WorkItem.ID, status: WorkStatus) {
        guard let index = items.firstIndex(where: { $0.id == id }) else { return }
        items[index].status = status
    }

    private func persist() {
        guard let encoded = try? JSONEncoder().encode(items) else { return }
        defaults.set(encoded, forKey: storageKey)
    }

    private func persistChat() {
        guard let encoded = try? JSONEncoder().encode(chatMessages) else { return }
        defaults.set(encoded, forKey: chatStorageKey)
    }

    private func persistManusTaskID() {
        if let activeManusTaskID {
            defaults.set(activeManusTaskID, forKey: manusTaskIDKey)
        } else {
            defaults.removeObject(forKey: manusTaskIDKey)
        }
    }

    private func persistManusEventIDs() {
        defaults.set(Array(seenManusEventIDs), forKey: manusEventIDsKey)
    }

    private func localFallbackReply(for text: String) -> String {
        let lowercased = text.lowercased()
        let lane: String
        if lowercased.contains("lead") || lowercased.contains("prospect") {
            lane = "lead research"
        } else if lowercased.contains("sales") || lowercased.contains("proposal") {
            lane = "sales follow-through"
        } else if lowercased.contains("ad") || lowercased.contains("marketing") || lowercased.contains("campaign") {
            lane = "marketing planning"
        } else if lowercased.contains("invoice") || lowercased.contains("finance") {
            lane = "finance review"
        } else {
            lane = "operating coordination"
        }

        return """
        Manus is not connected in this launch, so I staged this locally as \(lane).

        Draft next move:
        1. Clarify the business outcome.
        2. Gather the source context.
        3. Produce an approval-ready draft.
        4. Keep external actions at zero until you approve them.
        """
    }
}
