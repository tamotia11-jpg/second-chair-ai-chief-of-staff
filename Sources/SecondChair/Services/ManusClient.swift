import Foundation

struct ManusExchangeResult: Sendable {
    let taskID: String
    let reply: String
    let eventIDs: Set<String>
    let status: ManusRunStatus
}

enum ManusRunStatus: Equatable, Sendable {
    case answered
    case waiting(String)
}

enum ManusClientError: LocalizedError, Sendable {
    case missingAPIKey
    case invalidResponse
    case requestFailed(Int, String)
    case apiError(String)
    case timedOut

    var errorDescription: String? {
        switch self {
        case .missingAPIKey:
            "Set MANUS_API_KEY before launching Second Chair to use Manus."
        case .invalidResponse:
            "Manus returned a response Second Chair could not read."
        case let .requestFailed(status, message):
            "Manus request failed with HTTP \(status): \(message)"
        case let .apiError(message):
            message
        case .timedOut:
            "Manus is still working. Try again in a moment."
        }
    }
}

struct ManusClient: Sendable {
    private static let defaultTaskTitle = "Second Chair Chief of Staff Chat"

    let apiKey: String
    let baseURL: URL
    let session: URLSession

    init(
        apiKey: String,
        baseURL: URL = URL(string: "https://api.manus.ai")!,
        session: URLSession = .shared
    ) {
        self.apiKey = apiKey
        self.baseURL = baseURL
        self.session = session
    }

    static func liveFromEnvironment(_ environment: [String: String] = ProcessInfo.processInfo.environment) -> ManusClient? {
        guard let rawKey = environment["MANUS_API_KEY"]?.trimmingCharacters(in: .whitespacesAndNewlines),
              !rawKey.isEmpty
        else {
            return nil
        }

        let baseURL = environment["MANUS_BASE_URL"]
            .flatMap(URL.init(string:))
            ?? URL(string: "https://api.manus.ai")!

        return ManusClient(apiKey: rawKey, baseURL: baseURL)
    }

    func sendSecondChairMessage(
        _ userMessage: String,
        existingTaskID: String?,
        knownEventIDs: Set<String>
    ) async throws -> ManusExchangeResult {
        let taskID: String
        if let existingTaskID, !existingTaskID.isEmpty {
            try await sendMessage(userMessage, taskID: existingTaskID)
            taskID = existingTaskID
        } else {
            taskID = try await createTask(firstMessage: userMessage)
        }

        return try await pollForReply(taskID: taskID, knownEventIDs: knownEventIDs)
    }

    private func createTask(firstMessage: String) async throws -> String {
        let request = CreateTaskRequest(
            message: ManusMessage(content: prompt(for: firstMessage), connectors: []),
            interactiveMode: true,
            hideInTaskList: false,
            shareVisibility: "private",
            agentProfile: "manus-1.6",
            title: Self.defaultTaskTitle
        )
        let response: CreateTaskResponse = try await postJSON(request, to: "/v2/task.create")
        guard response.ok else {
            throw ManusClientError.apiError(response.error?.message ?? "Manus did not create the task.")
        }
        return response.taskID
    }

    private func sendMessage(_ userMessage: String, taskID: String) async throws {
        let request = SendMessageRequest(
            taskID: taskID,
            message: ManusMessage(content: prompt(for: userMessage), connectors: nil),
            agentProfile: "manus-1.6"
        )
        let response: SendMessageResponse = try await postJSON(request, to: "/v2/task.sendMessage")
        guard response.ok else {
            throw ManusClientError.apiError(response.error?.message ?? "Manus did not accept the message.")
        }
    }

    private func pollForReply(taskID: String, knownEventIDs: Set<String>) async throws -> ManusExchangeResult {
        var latestEvents: [ManusEvent] = []

        for attempt in 0..<18 {
            let response = try await listMessages(taskID: taskID)
            latestEvents = response.messages

            if let errorMessage = latestEvents.compactMap(\.errorMessage?.content).first {
                throw ManusClientError.apiError(errorMessage)
            }

            if let waiting = latestEvents.compactMap(\.statusUpdate?.statusDetail).first(where: { $0.waitingForEventID != nil }) {
                let description = waiting.waitingDescription ?? "Manus needs human input before continuing."
                return ManusExchangeResult(
                    taskID: taskID,
                    reply: "Manus is waiting for approval or input: \(description)",
                    eventIDs: Set(latestEvents.map(\.id)),
                    status: .waiting(description)
                )
            }

            if let assistantEvent = latestEvents.first(where: { event in
                guard let content = event.assistantMessage?.content else { return false }
                return !content.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
                    && !knownEventIDs.contains(event.id)
            }) {
                return ManusExchangeResult(
                    taskID: taskID,
                    reply: assistantEvent.assistantMessage?.content ?? "",
                    eventIDs: Set(latestEvents.map(\.id)),
                    status: .answered
                )
            }

            let delay = min(UInt64(1_500_000_000 + (attempt * 250_000_000)), 4_000_000_000)
            try await Task.sleep(nanoseconds: delay)
        }

        if let assistantEvent = latestEvents.first(where: { $0.assistantMessage?.content?.isEmpty == false }) {
            return ManusExchangeResult(
                taskID: taskID,
                reply: assistantEvent.assistantMessage?.content ?? "",
                eventIDs: Set(latestEvents.map(\.id)),
                status: .answered
            )
        }

        throw ManusClientError.timedOut
    }

    private func listMessages(taskID: String) async throws -> ListMessagesResponse {
        var components = URLComponents(url: endpoint("/v2/task.listMessages"), resolvingAgainstBaseURL: false)
        components?.queryItems = [
            URLQueryItem(name: "task_id", value: taskID),
            URLQueryItem(name: "order", value: "desc"),
            URLQueryItem(name: "limit", value: "20"),
        ]
        guard let url = components?.url else { throw ManusClientError.invalidResponse }

        var request = URLRequest(url: url)
        request.setValue(apiKey, forHTTPHeaderField: "x-manus-api-key")
        return try await decodeResponse(request)
    }

    private func postJSON<T: Encodable, U: Decodable>(_ value: T, to path: String) async throws -> U {
        var request = URLRequest(url: endpoint(path))
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue(apiKey, forHTTPHeaderField: "x-manus-api-key")
        request.httpBody = try JSONEncoder().encode(value)
        return try await decodeResponse(request)
    }

    private func decodeResponse<T: Decodable>(_ request: URLRequest) async throws -> T {
        let (data, response) = try await session.data(for: request)
        guard let httpResponse = response as? HTTPURLResponse else {
            throw ManusClientError.invalidResponse
        }

        guard (200..<300).contains(httpResponse.statusCode) else {
            let apiError = try? JSONDecoder().decode(APIErrorEnvelope.self, from: data)
            throw ManusClientError.requestFailed(
                httpResponse.statusCode,
                apiError?.error.message ?? String(data: data, encoding: .utf8) ?? "Unknown error"
            )
        }

        return try JSONDecoder().decode(T.self, from: data)
    }

    private func endpoint(_ path: String) -> URL {
        URL(string: path, relativeTo: baseURL)!.absoluteURL
    }

    private func prompt(for userMessage: String) -> String {
        """
        You are Second Chair, a human-guided AI chief of staff for founders.
        Treat this as a validation-stage operating workspace. Do not send messages, launch ads, publish content, schedule calendar events, move money, update marketplaces, mutate CRM data, deploy code, or perform any irreversible external action. Draft, reason, ask clarifying questions, and create approval-ready next steps instead.

        User request:
        \(userMessage)
        """
    }
}

private struct ManusMessage: Encodable, Sendable {
    let content: String
    let connectors: [String]?
}

private struct CreateTaskRequest: Encodable, Sendable {
    let message: ManusMessage
    let interactiveMode: Bool
    let hideInTaskList: Bool
    let shareVisibility: String
    let agentProfile: String
    let title: String

    enum CodingKeys: String, CodingKey {
        case message
        case interactiveMode = "interactive_mode"
        case hideInTaskList = "hide_in_task_list"
        case shareVisibility = "share_visibility"
        case agentProfile = "agent_profile"
        case title
    }
}

private struct SendMessageRequest: Encodable, Sendable {
    let taskID: String
    let message: ManusMessage
    let agentProfile: String

    enum CodingKeys: String, CodingKey {
        case taskID = "task_id"
        case message
        case agentProfile = "agent_profile"
    }
}

private struct CreateTaskResponse: Decodable, Sendable {
    let ok: Bool
    let taskID: String
    let error: APIError?

    enum CodingKeys: String, CodingKey {
        case ok
        case taskID = "task_id"
        case error
    }
}

private struct SendMessageResponse: Decodable, Sendable {
    let ok: Bool
    let error: APIError?
}

private struct ListMessagesResponse: Decodable, Sendable {
    let messages: [ManusEvent]
}

private struct ManusEvent: Decodable, Sendable {
    let id: String
    let assistantMessage: ManusTextMessage?
    let errorMessage: ManusErrorMessage?
    let statusUpdate: ManusStatusUpdate?

    enum CodingKeys: String, CodingKey {
        case id
        case assistantMessage = "assistant_message"
        case errorMessage = "error_message"
        case statusUpdate = "status_update"
    }
}

private struct ManusTextMessage: Decodable, Sendable {
    let content: String?
}

private struct ManusErrorMessage: Decodable, Sendable {
    let content: String?
}

private struct ManusStatusUpdate: Decodable, Sendable {
    let statusDetail: ManusStatusDetail?

    enum CodingKeys: String, CodingKey {
        case statusDetail = "status_detail"
    }
}

private struct ManusStatusDetail: Decodable, Sendable {
    let waitingForEventID: String?
    let waitingDescription: String?

    enum CodingKeys: String, CodingKey {
        case waitingForEventID = "waiting_for_event_id"
        case waitingDescription = "waiting_description"
    }
}

private struct APIErrorEnvelope: Decodable, Sendable {
    let error: APIError
}

private struct APIError: Decodable, Sendable {
    let message: String
}
