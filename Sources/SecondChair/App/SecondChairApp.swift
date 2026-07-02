import AppKit
import SwiftUI

@main
@MainActor
struct SecondChairApp: App {
    @NSApplicationDelegateAdaptor(AppDelegate.self) private var appDelegate
    @State private var store = WorkspaceStore()

    var body: some Scene {
        WindowGroup("Second Chair", id: "main") {
            ContentView(store: store)
                .frame(minWidth: 920, minHeight: 640)
        }
        .defaultSize(width: 1180, height: 760)
        .commands {
            CommandMenu("Work") {
                Button("Start New Chat") {
                    store.startNewChat()
                }
                .keyboardShortcut("n", modifiers: [.command, .shift])

                Divider()

                Button("Approve Next Ready Item") {
                    store.approveNext()
                }
                .keyboardShortcut("a", modifiers: [.command, .shift])
                .disabled(store.readyItems.isEmpty)

                Button("Restore Sample Workspace") {
                    store.resetSampleData()
                }
            }
        }
    }
}

@MainActor
final class AppDelegate: NSObject, NSApplicationDelegate {
    func applicationDidFinishLaunching(_ notification: Notification) {
        NSApp.setActivationPolicy(.regular)
        NSApp.activate(ignoringOtherApps: true)
    }
}
