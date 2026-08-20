import Foundation
import Security

struct Request: Decodable {
    let operation: String
    let service: String
    let account: String?
    let secret: String?
}

struct Response: Encodable {
    let ok: Bool
    let found: Bool?
    let secret: String?
    let status: Int32?
    let accounts: [String]?
}

func emit(_ response: Response, exitCode: Int32 = 0) -> Never {
    let encoder = JSONEncoder()
    if let data = try? encoder.encode(response) {
        FileHandle.standardOutput.write(data)
    }
    exit(exitCode)
}

let input = FileHandle.standardInput.readDataToEndOfFile()
guard let request = try? JSONDecoder().decode(Request.self, from: input) else {
    emit(Response(ok: false, found: nil, secret: nil, status: errSecParam, accounts: nil), exitCode: 2)
}

func accountQuery(_ request: Request) -> [CFString: Any]? {
    guard let account = request.account, !account.isEmpty else { return nil }
    return [
        kSecClass: kSecClassGenericPassword,
        kSecAttrService: request.service,
        kSecAttrAccount: account,
    ]
}

switch request.operation {
case "save":
    guard let base = accountQuery(request) else {
        emit(Response(ok: false, found: nil, secret: nil, status: errSecParam, accounts: nil), exitCode: 2)
    }
    guard let secret = request.secret, let secretData = secret.data(using: .utf8) else {
        emit(Response(ok: false, found: nil, secret: nil, status: errSecParam, accounts: nil), exitCode: 2)
    }
    var query = base
    query[kSecReturnData] = true
    query[kSecMatchLimit] = kSecMatchLimitOne
    var existing: CFTypeRef?
    let lookup = SecItemCopyMatching(query as CFDictionary, &existing)
    let status: OSStatus
    if lookup == errSecSuccess {
        status = SecItemUpdate(base as CFDictionary, [kSecValueData: secretData] as CFDictionary)
    } else if lookup == errSecItemNotFound {
        var item = base
        item[kSecValueData] = secretData
        status = SecItemAdd(item as CFDictionary, nil)
    } else {
        status = lookup
    }
    if status == errSecSuccess { emit(Response(ok: true, found: true, secret: nil, status: status, accounts: nil)) }
    emit(Response(ok: false, found: nil, secret: nil, status: status, accounts: nil), exitCode: 3)

case "get":
    guard let base = accountQuery(request) else {
        emit(Response(ok: false, found: nil, secret: nil, status: errSecParam, accounts: nil), exitCode: 2)
    }
    var query = base
    query[kSecReturnData] = true
    query[kSecMatchLimit] = kSecMatchLimitOne
    var result: CFTypeRef?
    let status = SecItemCopyMatching(query as CFDictionary, &result)
    if status == errSecItemNotFound { emit(Response(ok: true, found: false, secret: nil, status: status, accounts: nil)) }
    guard status == errSecSuccess, let data = result as? Data, let secret = String(data: data, encoding: .utf8) else {
        emit(Response(ok: false, found: nil, secret: nil, status: status, accounts: nil), exitCode: 3)
    }
    emit(Response(ok: true, found: true, secret: secret, status: status, accounts: nil))

case "remove":
    guard let base = accountQuery(request) else {
        emit(Response(ok: false, found: nil, secret: nil, status: errSecParam, accounts: nil), exitCode: 2)
    }
    let status = SecItemDelete(base as CFDictionary)
    if status == errSecItemNotFound { emit(Response(ok: true, found: false, secret: nil, status: status, accounts: nil)) }
    if status == errSecSuccess { emit(Response(ok: true, found: false, secret: nil, status: status, accounts: nil)) }
    emit(Response(ok: false, found: nil, secret: nil, status: status, accounts: nil), exitCode: 3)

case "list":
    let query: [CFString: Any] = [
        kSecClass: kSecClassGenericPassword,
        kSecAttrService: request.service,
        kSecReturnAttributes: true,
        kSecMatchLimit: kSecMatchLimitAll,
    ]
    var result: CFTypeRef?
    let status = SecItemCopyMatching(query as CFDictionary, &result)
    if status == errSecItemNotFound {
        emit(Response(ok: true, found: false, secret: nil, status: status, accounts: []))
    }
    guard status == errSecSuccess, let items = result as? [[String: Any]] else {
        emit(Response(ok: false, found: nil, secret: nil, status: status, accounts: nil), exitCode: 3)
    }
    let accounts = items.compactMap { $0[kSecAttrAccount as String] as? String }.sorted()
    emit(Response(ok: true, found: !accounts.isEmpty, secret: nil, status: status, accounts: accounts))

default:
    emit(Response(ok: false, found: nil, secret: nil, status: errSecParam, accounts: nil), exitCode: 2)
}
