import SwiftUI

struct ContentView: View {
    let store: WorkspaceStore
    @SceneStorage("second-chair.selected-section") private var selectedSection = AppSection.chat.rawValue

    private var selection: Binding<AppSection?> {
        Binding(
            get: { AppSection(rawValue: selectedSection) ?? .chat },
            set: { selectedSection = ($0 ?? .chat).rawValue }
        )
    }

    var body: some View {
        NavigationSplitView {
            SidebarView(selection: selection, readyCount: store.readyItems.count)
                .navigationSplitViewColumnWidth(min: 190, ideal: 220, max: 260)
        } detail: {
            detail
                .navigationTitle(currentSection.title)
        }
        .navigationSplitViewStyle(.balanced)
        .toolbar {
            ToolbarItem(placement: .primaryAction) {
                Menu {
                    Button("Start New Chat") {
                        store.startNewChat()
                    }

                    Divider()

                    Button("Approve Next Ready Item") {
                        store.approveNext()
                    }
                    .disabled(store.readyItems.isEmpty)

                    Divider()

                    Button("Restore Sample Workspace") {
                        store.resetSampleData()
                    }
                } label: {
                    Label("Workspace actions", systemImage: "ellipsis.circle")
                }
            }
        }
    }

    private var currentSection: AppSection {
        AppSection(rawValue: selectedSection) ?? .chat
    }

    @ViewBuilder
    private var detail: some View {
        switch currentSection {
        case .chat:
            ChatView(store: store)
        case .today:
            TodayView(store: store)
        case .approvals:
            ApprovalQueueView(store: store)
        case .workstreams:
            WorkstreamsView(store: store)
        case .brief:
            ExecutiveBriefView(store: store)
        case .connectors:
            ConnectorsView()
        }
    }
}
