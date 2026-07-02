import Foundation
import Testing
@testable import SecondChair

@MainActor
@Suite(.serialized)
struct WorkspaceStoreTests {
    @Test
    func approvingReadyItemPersists() throws {
        let (defaults, suiteName) = makeDefaults()
        defer { defaults.removePersistentDomain(forName: suiteName) }
        let store = WorkspaceStore(defaults: defaults)
        let item = try #require(store.readyItems.first)

        store.approve(item.id)

        #expect(store.items.first(where: { $0.id == item.id })?.status == .approved)

        let restoredStore = WorkspaceStore(defaults: defaults)
        #expect(restoredStore.items.first(where: { $0.id == item.id })?.status == .approved)
    }

    @Test
    func heldItemCanReturnToReview() throws {
        let (defaults, suiteName) = makeDefaults()
        defer { defaults.removePersistentDomain(forName: suiteName) }
        let store = WorkspaceStore(defaults: defaults)
        let item = try #require(store.heldItems.first)

        store.returnToReview(item.id)

        #expect(store.items.first(where: { $0.id == item.id })?.status == .ready)
    }

    @Test
    func resetRestoresSampleStatuses() {
        let (defaults, suiteName) = makeDefaults()
        defer { defaults.removePersistentDomain(forName: suiteName) }
        let store = WorkspaceStore(defaults: defaults)
        store.approveNext()

        store.resetSampleData()

        #expect(store.items == WorkItem.samples)
    }

    @Test
    func chiefOfStaffHasTenWorkstreams() {
        #expect(Workstream.allCases.count == 10)
        #expect(Workstream.allCases.contains(.analytics))
        #expect(Workstream.allCases.contains(.executiveAssistant))
    }

    @Test
    func chatTranscriptPersistsAndCanStartFresh() {
        let (defaults, suiteName) = makeDefaults()
        defer { defaults.removePersistentDomain(forName: suiteName) }
        let store = WorkspaceStore(defaults: defaults)

        store.chatMessages.append(
            ChatMessage(role: .user, content: "Prepare the weekly brief.", source: .local)
        )

        let restoredStore = WorkspaceStore(defaults: defaults)
        #expect(restoredStore.chatMessages.count == 2)
        #expect(restoredStore.chatMessages.last?.content == "Prepare the weekly brief.")

        restoredStore.startNewChat()
        #expect(restoredStore.chatMessages == [.welcome])
        #expect(restoredStore.activeManusTaskID == nil)
    }

    private func makeDefaults() -> (UserDefaults, String) {
        let suiteName = "SecondChairTests.\(UUID().uuidString)"
        let defaults = UserDefaults(suiteName: suiteName)!
        defaults.removePersistentDomain(forName: suiteName)
        return (defaults, suiteName)
    }
}
