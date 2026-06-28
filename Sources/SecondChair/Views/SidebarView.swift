import SwiftUI

struct SidebarView: View {
    @Binding var selection: AppSection?
    let readyCount: Int

    var body: some View {
        List(selection: $selection) {
            Section("Workspace") {
                ForEach(AppSection.allCases) { section in
                    HStack(spacing: 10) {
                        Image(systemName: section.systemImage)
                            .foregroundStyle(.secondary)
                            .frame(width: 16)

                        Text(section.title)
                            .lineLimit(1)

                        Spacer()

                        if section == .approvals, readyCount > 0 {
                            Text("\(readyCount)")
                                .font(.caption2.weight(.semibold))
                                .foregroundStyle(.white)
                                .padding(.horizontal, 7)
                                .padding(.vertical, 2)
                                .background(Brand.coral, in: Capsule())
                        }
                    }
                    .tag(section)
                }
            }
        }
        .listStyle(.sidebar)
        .safeAreaInset(edge: .bottom) {
            VStack(alignment: .leading, spacing: 5) {
                Label("Human-guided mode", systemImage: "person.badge.shield.checkmark")
                    .font(.caption.weight(.medium))
                Text("No live actions are enabled.")
                    .font(.caption2)
                    .foregroundStyle(.secondary)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding()
        }
    }
}
