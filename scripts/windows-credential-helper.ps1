$ErrorActionPreference = 'Stop'

function Emit-Result($value, $exitCode = 0) {
  [Console]::Out.Write(($value | ConvertTo-Json -Compress -Depth 6))
  exit $exitCode
}

function Get-StoredCredential($vault, $resource, $account) {
  try {
    return $vault.Retrieve($resource, $account)
  } catch {
    # Windows reports an absent PasswordVault item as HRESULT 0x80070490.
    # Every other failure means the vault state is unknown and must fail closed.
    if ($_.Exception.HResult -eq -2147023728) { return $null }
    throw
  }
}

try {
  $raw = [Console]::In.ReadToEnd()
  $request = $raw | ConvertFrom-Json
  $resource = [string]$request.service
  $account = [string]$request.account
  if ([string]::IsNullOrWhiteSpace($resource)) { throw 'invalid service' }

  [void][Windows.Security.Credentials.PasswordVault, Windows.Security.Credentials, ContentType = WindowsRuntime]
  [void][Windows.Security.Credentials.PasswordCredential, Windows.Security.Credentials, ContentType = WindowsRuntime]
  $vault = New-Object -TypeName Windows.Security.Credentials.PasswordVault

  if ($request.operation -eq 'list') {
    try {
      $allCredentials = $vault.RetrieveAll()
    } catch {
      if ($_.Exception.HResult -eq -2147023728) { $allCredentials = @() } else { throw }
    }
    $accounts = @($allCredentials | Where-Object { $_.Resource -eq $resource } | ForEach-Object { $_.UserName } | Sort-Object -Unique)
    Emit-Result @{ ok = $true; found = ($accounts.Count -gt 0); accounts = $accounts }
  }

  if ([string]::IsNullOrWhiteSpace($account)) { throw 'invalid account' }

  if ($request.operation -eq 'save') {
    $existing = Get-StoredCredential $vault $resource $account
    if ($null -ne $existing) { $vault.Remove($existing) }
    $credential = New-Object -TypeName Windows.Security.Credentials.PasswordCredential -ArgumentList $resource, $account, ([string]$request.secret)
    $vault.Add($credential)
    Emit-Result @{ ok = $true; found = $true }
  }

  if ($request.operation -eq 'get') {
    $credential = Get-StoredCredential $vault $resource $account
    if ($null -eq $credential) { Emit-Result @{ ok = $true; found = $false } }
    $credential.RetrievePassword()
    Emit-Result @{ ok = $true; found = $true; secret = $credential.Password }
  }

  if ($request.operation -eq 'remove') {
    $credential = Get-StoredCredential $vault $resource $account
    if ($null -ne $credential) { $vault.Remove($credential) }
    Emit-Result @{ ok = $true; found = $false }
  }

  throw 'unsupported operation'
} catch {
  Emit-Result @{ ok = $false } 3
}
