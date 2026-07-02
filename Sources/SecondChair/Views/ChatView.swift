import SwiftUI

struct ChatView: View {
    let store: WorkspaceStore

    @State private var draft = ""
    @FocusState private var composerFocused: Bool

    private var isSendDisabled: Bool {
        draft.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty || store.isSendingMessage
    }

    private var usesManus: Bool {
        ManusClient.liveFromEnvironment() != nil
    }

    var body: some View {
        VStack(spacing: 0) {
            ChatHeader(usesManus: usesManus, taskID: store.activeManusTaskID) {
                store.startNewChat()
            }

            Divider()

            HStack(spacing: 0) {
                transcript

                Divider()

                ChatApprovalRail(store: store, usesManus: usesManus)
                    .frame(width: 300)
            }

            Divider()
            composer
        }
        .onAppear {
            composerFocused = true
        }
    }

    private var transcript: some View {
        ScrollViewReader { proxy in
            ScrollView {
                LazyVStack(alignment: .leading, spacing: 14) {
                    ForEach(store.chatMessages) { message in
                        ChatBubble(message: message)
                            .id(message.id)
                    }

                    if store.isSendingMessage {
                        HStack(spacing: 8) {
                            ProgressView()
                                .controlSize(.small)
                            Text("Waiting for Second Chair")
                                .font(.callout)
                                .foregroundStyle(.secondary)
                        }
                        .padding(.top, 2)
                    }
                }
                .padding(22)
                .frame(maxWidth: .infinity, alignment: .leading)
            }
            .background(Color(nsColor: .textBackgroundColor))
            .onChange(of: store.chatMessages.count) {
                guard let lastID = store.chatMessages.last?.id else { return }
                withAnimation(.easeOut(duration: 0.18)) {
                    proxy.scrollTo(lastID, anchor: .bottom)
                }
            }
        }
    }

    private var composer: some View {
        HStack(alignment: .bottom, spacing: 10) {
            TextField("Message Second Chair", text: $draft, axis: .vertical)
                .textFieldStyle(.plain)
                .lineLimit(1...5)
                .focused($composerFocused)
                .padding(.horizontal, 12)
                .padding(.vertical, 10)
                .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 8, style: .continuous))
                .overlay {
                    RoundedRectangle(cornerRadius: 8, style: .continuous)
                        .stroke(.quaternary)
                }

            Button {
                send()
            } label: {
                Label("Send", systemImage: "paperplane.fill")
                    .labelStyle(.iconOnly)
            }
            .buttonStyle(.borderedProminent)
            .tint(Brand.blue)
            .disabled(isSendDisabled)
            .keyboardShortcut(.return, modifiers: [.command])
            .help("Send")
        }
        .padding(14)
        .background(.bar)
    }

    private func send() {
        let message = draft.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !message.isEmpty else { return }
        draft = ""
        composerFocused = true

        Task {
            await store.sendChatMessage(message)
        }
    }
}

private struct ChatHeader: View {
    let usesManus: Bool
    let taskID: String?
    let startNewChat: () -> Void

    var body: some View {
        HStack(spacing: 14) {
            Image(systemName: "sparkles")
                .font(.title3)
                .foregroundStyle(Brand.blue)
                .frame(width: 32, height: 32)
                .background(Brand.blue.opacity(0.12), in: RoundedRectangle(cornerRadius: 8, style: .continuous))

            VStack(alignment: .leading, spacing: 2) {
                Text("Second Chair")
                    .font(.title3.bold())
                Text(taskID == nil ? "New operating thread" : "Manus task connected")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            Spacer()

            StatusChip(
                title: usesManus ? "Manus" : "Local",
                systemImage: usesManus ? "bolt.horizontal.circle.fill" : "desktopcomputer",
                color: usesManus ? Brand.mint : .secondary
            )

            Button {
                startNewChat()
            } label: {
                Label("New Chat", systemImage: "plus.bubble")
                    .labelStyle(.iconOnly)
            }
            .help("New chat")
        }
        .padding(.horizontal, 18)
        .padding(.vertical, 12)
    }
}

private struct ChatBubble: View {
    let message: ChatMessage

    private var isUser: Bool { message.role == .user }

    var body: some View {
        HStack(alignment: .bottom) {
            if isUser { Spacer(minLength: 80) }

            VStack(alignment: .leading, spacing: 8) {
                HStack(spacing: 6) {
                    Text(message.role.title)
                        .font(.caption.weight(.semibold))
                    Text(message.createdAt, format: .dateTime.hour().minute())
                        .font(.caption2)
                        .foregroundStyle(isUser ? .white.opacity(0.75) : .secondary)
                }

                Text(message.content)
                    .textSelection(.enabled)
                    .fixedSize(horizontal: false, vertical: true)
            }
            .foregroundStyle(isUser ? .white : .primary)
            .padding(.horizontal, 14)
            .padding(.vertical, 11)
            .frame(maxWidth: 720, alignment: .leading)
            .background(bubbleBackground, in: RoundedRectangle(cornerRadius: 8, style: .continuous))
            .overlay {
                if message.role == .system {
                    RoundedRectangle(cornerRadius: 8, style: .continuous)
                        .stroke(Brand.coral.opacity(0.4))
                }
            }

            if !isUser { Spacer(minLength: 80) }
        }
        .frame(maxWidth: .infinity, alignment: isUser ? .trailing : .leading)
    }

    private var bubbleBackground: AnyShapeStyle {
        switch message.role {
        case .user:
            AnyShapeStyle(Brand.blue)
        case .assistant:
            AnyShapeStyle(.regularMaterial)
        case .system:
            AnyShapeStyle(Brand.coral.opacity(0.10))
        }
    }
}

private struct ChatApprovalRail: View {
    let store: WorkspaceStore
    let usesManus: Bool

    var body: some View {
        VStack(alignment: .leading, spacing: 18) {
            VStack(alignment: .leading, spacing: 10) {
                Text("Run State")
                    .font(.headline)
                StatusRow(label: "Model", value: usesManus ? "Manus" : "Local demo")
                StatusRow(label: "Live actions", value: "0")
                StatusRow(label: "Ready drafts", value: "\(store.readyItems.count)")
            }

            Divider()

            VStack(alignment: .leading, spacing: 10) {
                Text("Approval Queue")
                    .font(.headline)

                if store.readyItems.isEmpty {
                    Text("No drafts waiting.")
                        .font(.callout)
                        .foregroundStyle(.secondary)
                } else {
                    ForEach(store.readyItems.prefix(4)) { item in
                        CompactApprovalItem(item: item, store: store)
                    }
                }
            }

            Spacer()
        }
        .padding(16)
        .background(Color(nsColor: .windowBackgroundColor))
    }
}

private struct CompactApprovalItem: View {
    let item: WorkItem
    let store: WorkspaceStore

    var body: some View {
        VStack(alignment: .leading, spacing: 9) {
            Label(item.workstream.title, systemImage: item.workstream.systemImage)
                .font(.caption.weight(.semibold))
                .foregroundStyle(.secondary)

            Text(item.title)
                .font(.callout.weight(.semibold))
                .lineLimit(2)

            HStack {
                Button {
                    store.hold(item.id)
                } label: {
                    Label("Hold", systemImage: "pause.circle")
                        .labelStyle(.iconOnly)
                }
                .help("Hold")

                Button {
                    store.approve(item.id)
                } label: {
                    Label("Approve", systemImage: "checkmark.circle.fill")
                        .labelStyle(.iconOnly)
                }
                .buttonStyle(.borderedProminent)
                .tint(Brand.mint)
                .help("Approve")
            }
        }
        .padding(10)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 8, style: .continuous))
        .overlay {
            RoundedRectangle(cornerRadius: 8, style: .continuous)
                .stroke(.quaternary)
        }
    }
}

private struct StatusRow: View {
    let label: String
    let value: String

    var body: some View {
        HStack {
            Text(label)
                .foregroundStyle(.secondary)
            Spacer()
            Text(value)
                .fontWeight(.semibold)
        }
        .font(.callout)
    }
}

private struct StatusChip: View {
    let title: String
    let systemImage: String
    let color: Color

    var body: some View {
        Label(title, systemImage: systemImage)
            .font(.caption.weight(.semibold))
            .foregroundStyle(color)
            .padding(.horizontal, 9)
            .padding(.vertical, 5)
            .background(color.opacity(0.12), in: Capsule())
    }
}
