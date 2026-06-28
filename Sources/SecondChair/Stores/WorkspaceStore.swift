import Foundation
import Observation

@MainActor
@Observable
final class WorkspaceStore {
    var items: [WorkItem] {
        didSet { persist() }
    }

    @ObservationIgnored private let defaults: UserDefaults
    @ObservationIgnored private let storageKey = "second-chair.workspace-items.v1"

    init(defaults: UserDefaults = .standard) {
        self.defaults = defaults

        if let data = defaults.data(forKey: storageKey),
           let decoded = try? JSONDecoder().decode([WorkItem].self, from: data) {
            items = decoded
        } else {
            items = WorkItem.samples
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

    private func update(_ id: WorkItem.ID, status: WorkStatus) {
        guard let index = items.firstIndex(where: { $0.id == id }) else { return }
        items[index].status = status
    }

    private func persist() {
        guard let encoded = try? JSONEncoder().encode(items) else { return }
        defaults.set(encoded, forKey: storageKey)
    }
}
