import SwiftUI

struct ConnectorsView: View {
    private let connectors = [
        Connector(name: "Manus", detail: "Chat tasks, research, and synthesis", systemImage: "sparkles", status: .enabled),
        Connector(name: "Meta Ads", detail: "Sandbox campaign drafts", systemImage: "megaphone", status: .sandbox),
        Connector(name: "Google Ads", detail: "Sandbox research and drafts", systemImage: "magnifyingglass", status: .sandbox),
        Connector(name: "CRM", detail: "Pipeline context and next steps", systemImage: "person.3", status: .roadmap),
        Connector(name: "Email & Calendar", detail: "Drafts and meeting preparation", systemImage: "envelope", status: .roadmap),
        Connector(name: "Finance", detail: "Exceptions and month-end review", systemImage: "dollarsign.circle", status: .roadmap),
        Connector(name: "Documents", detail: "Briefs, recaps, and proposals", systemImage: "doc.text", status: .roadmap),
    ]

    private let columns = [GridItem(.adaptive(minimum: 250), spacing: 16)]

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 22) {
                SectionHeader(
                    "Connectors",
                    subtitle: "A transparent map of what is demonstrated and what remains roadmap-only."
                )

                HStack(alignment: .top, spacing: 12) {
                    Image(systemName: "lock.shield")
                        .font(.title2)
                        .foregroundStyle(Brand.mint)
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Safe by default")
                            .font(.headline)
                        Text("Manus is used for chat and draft synthesis. This app does not confirm external actions or mutate third-party systems.")
                            .foregroundStyle(.secondary)
                    }
                }
                .padding(18)
                .background(Brand.mint.opacity(0.10), in: RoundedRectangle(cornerRadius: 8, style: .continuous))

                LazyVGrid(columns: columns, alignment: .leading, spacing: 16) {
                    ForEach(connectors) { connector in
                        ConnectorCard(connector: connector)
                    }
                }
            }
            .padding(28)
            .frame(maxWidth: 1040)
            .frame(maxWidth: .infinity)
        }
    }
}

private struct Connector: Identifiable {
    enum Status: String {
        case enabled = "Chat enabled"
        case sandbox = "Sandbox mapped"
        case roadmap = "Roadmap only"

        var color: Color {
            switch self {
            case .enabled: Brand.mint
            case .sandbox: Brand.blue
            case .roadmap: .secondary
            }
        }
    }

    let name: String
    let detail: String
    let systemImage: String
    let status: Status
    var id: String { name }
}

private struct ConnectorCard: View {
    let connector: Connector

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack {
                Image(systemName: connector.systemImage)
                    .font(.title2)
                    .foregroundStyle(connector.status.color)
                Spacer()
                Text(connector.status.rawValue)
                    .font(.caption2.weight(.semibold))
                    .foregroundStyle(connector.status.color)
            }
            Text(connector.name)
                .font(.headline)
            Text(connector.detail)
                .font(.callout)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, minHeight: 110, alignment: .topLeading)
        .padding(18)
        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 8, style: .continuous))
        .overlay {
            RoundedRectangle(cornerRadius: 8, style: .continuous)
                .stroke(.quaternary)
        }
    }
}
