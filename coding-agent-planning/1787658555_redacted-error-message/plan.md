# Plan: Add redacted error-message extraction

## Task contract

Add a public function named `extractRedactedMessage` that accepts an `error: unknown` and a `readonly string[]` of sensitive values, extracts the message using the package's existing behavior, and replaces every matching sensitive value with the fixed text `[redacted]`. If none of the supplied values occur in the extracted message, including when the list is empty or contains only empty strings, return the extracted message unchanged.

The function is intended to reduce accidental disclosure when an application renders or logs an extracted error message. It is exact-value redaction, not automatic secret discovery.

## Repository evidence

- `README.md` defines `extractMessage(error: unknown): string` as the package's public unknown-error normalization API and documents the package-root import surface. It is the only state-bearing documentation relevant to this change; the repository has no `docs/`, `errors/`, or `cache/` documentation trees.
- `src/error-handler/index.ts` owns `extractMessage` and the other public error-handler functions. It already centralizes string, `Error`, cause-chain, Zod, nested error-like object, array, and fallback object extraction, so the new function should compose with it instead of creating a second traversal path.
- `src/error-handler/utilities.ts` owns focused pure support logic used by the public error-handler functions. It is the appropriate location for literal redaction mechanics that should remain internal to the error-handler module.
- `src/error-handler/index.test-unit.ts` covers public extraction behavior, including nested causes, circular references, Zod errors, fallback stringification, encoding, and decoding. `src/error-handler/utilities.test-unit.ts` covers the internal pure utilities.
- `src/index.ts` is the package-root explicit export boundary. The new function must be added there to be consumable through `error-message-utils`.
- `package.json` uses npm, Jest 29 with `ts-jest`, TypeScript 5.7 in strict mode, Prettier 3.6, and the granular `test:unit` script. `tsconfig.build.json` already excludes `src/**/*.test-*.ts`, so no build or test configuration change is required.
- `src/error-handler/index.ts` currently logs the original unknown error when fallback `JSON.stringify` fails, and the corresponding unit test expects three `console.error` calls. That side effect can expose the sensitive values before the returned message is redacted, so it must be removed for the new API to provide a safe redaction path.
- The worktree already contains user-authored version changes in `package.json` and `package-lock.json` from `1.2.12` to `1.2.13`. They are unrelated to this implementation and must remain untouched and unclaimed.

## Desired public contract

```ts
extractRedactedMessage(error: unknown, sensitiveValues: readonly string[]): string;
```

The contract will be:

- Call `extractMessage(error)` first so every currently supported input shape retains identical extraction behavior.
- Treat each non-empty sensitive value as a literal, case-sensitive substring rather than a regular expression.
- Replace every occurrence with exactly `[redacted]`, including repeated occurrences and occurrences in extracted cause-chain or stringified-object content.
- Ignore empty strings because redacting an empty substring would insert replacement text throughout an otherwise valid message.
- Deduplicate repeated sensitive values and prioritize longer overlapping values, so `secret-token` is fully redacted when both `secret-token` and `secret` are supplied.
- Perform replacement in one logical pass so newly inserted `[redacted]` markers are not processed again when a supplied value contains `redacted`.
- Return the extracted message unchanged when no non-empty sensitive value matches, when the list is empty, or when it contains only empty strings.
- Do not mutate the error or the supplied array.
- Keep `[redacted]` fixed for this initial API. A configurable replacement and an exported replacement constant are excluded until a concrete consumer requirement justifies expanding the contract.

## Architecture and implementation design

The new public function will remain thin: extract through `extractMessage`, then pass the resulting string and sensitive values to one pure internal redaction utility.

The internal utility will:

1. Filter only exact empty strings, preserving whitespace and all other characters as potentially meaningful secret content.
2. Deduplicate values with `Set` and sort them by descending string length.
3. Escape regular-expression metacharacters in every value with a small private helper.
4. Build one global, case-sensitive alternation and use a replacement callback that always returns `[redacted]`; the callback avoids replacement-string interpolation and prevents the marker from being reprocessed.
5. Return early with the original message when no usable sensitive values remain.

This design reuses the authoritative extraction path, avoids dependencies, handles overlap deterministically, and avoids a sequence of replacements whose earlier output could be changed by later values.

## Exact file changes

### `src/error-handler/utilities.ts`

- Add a private regular-expression escaping helper following the existing `__` private-helper convention.
- Add an internal `REDACTION_REPLACEMENT` constant with the fixed value `[redacted]`.
- Add and document `redactSensitiveValues(message: string, sensitiveValues: readonly string[]): string` as a pure module-internal utility.
- Keep existing Zod and decoded-code helpers unchanged.

### `src/error-handler/utilities.test-unit.ts`

- Add focused unit cases for literal global replacement, including regular-expression metacharacters.
- Cover duplicate and overlapping values, confirming longest-value precedence.
- Cover empty values, an empty list, and a non-matching list, confirming unchanged output.
- Cover a list containing `redacted` to confirm the inserted marker is not processed again.
- Confirm case-sensitive matching without introducing normalization behavior.

### `src/error-handler/index.ts`

- Import the internal redaction utility.
- Add the documented public `extractRedactedMessage` function immediately after `extractMessage`, composing extraction and redaction without duplicating traversal logic.
- Remove the file-level `no-console` suppression and remove raw `console.error` calls from the fallback stringification failure. Preserve the existing return value of `DEFAULT_MESSAGE` and every other `extractMessage` behavior.
- Do not change `encodeError`, `decodeError`, `Exception`, error-code behavior, or existing extraction precedence.

### `src/error-handler/index.test-unit.ts`

- Import and test `extractRedactedMessage` at the public error-handler boundary.
- Verify redaction after extraction from an `Error` and its nested cause, including repeated sensitive content.
- Verify that a present sensitive-values list with no matches returns the extracted message unchanged, as explicitly required.
- Verify empty and empty-string-only lists return the extracted message unchanged.
- Change the fallback-stringification regression test to assert that the default message is returned without any raw `console.error` call.

### `src/index.ts`

- Add `extractRedactedMessage` to the explicit package-root error-handler exports.
- Preserve all existing exports and ordering conventions.

### `README.md`

- Add a focused common-task example showing package-root import, exact replacement, repeated values, and the unchanged result when no sensitive value is present.
- State that matching is literal and case-sensitive, empty values are ignored, and transformed or encoded variants must be supplied separately if they also need redaction.
- Add the exact signature and description to the Public API functions table and include the function in the package-root import example.
- Keep the wording clear that this helper reduces known-value exposure but does not automatically identify secrets.

## Ordered implementation steps

1. Make fallback extraction side-effect-free in `src/error-handler/index.ts` and update the existing regression test to prove an unstringifiable error returns `DEFAULT_MESSAGE` without logging the raw object. Review checkpoint: all current extraction return contracts remain unchanged, and the security leak that could bypass subsequent redaction is removed.
2. Implement `redactSensitiveValues` in `src/error-handler/utilities.ts` with literal escaping, empty-value filtering, deduplication, descending-length precedence, global case-sensitive matching, and callback replacement. Add adversarial utility tests for metacharacters, overlaps, duplicates, empty values, absent matches, case differences, and replacement-marker safety. Review checkpoint: no sensitive-value ordering can leave a shorter overlapping suffix exposed or rewrite an inserted marker.
3. Add `extractRedactedMessage` in `src/error-handler/index.ts`, export it from `src/index.ts`, and add public-boundary tests proving it composes with existing unknown-error and cause-chain extraction while preserving unchanged output when values are absent. Review checkpoint: the change is an additive public API with no duplicated extraction flow and no changes to encoding, decoding, codes, or exceptions.
4. Synchronize `README.md` examples and the Public API table with the exact implemented signature and limitations. Review checkpoint: consumers can distinguish exact known-value redaction from automatic secret detection and understand the no-match behavior.
5. Format only the touched files, run focused and package-wide unit regression checks, then run typechecking, linting, formatting verification, and the production build. Inspect the built output to confirm the additive declaration/export exists and test files are excluded. Review checkpoint: the final diff contains only the planned source, test, export, and README changes plus the separately identified pre-existing version changes.

## Testing strategy

Unit tests are the appropriate level because extraction and redaction are deterministic, synchronous, pure string behavior with no I/O or component integration. No integration test is needed.

Focused coverage must demonstrate:

- ordinary and cause-chain extraction occurs before redaction;
- all repeated exact occurrences are replaced;
- an absent match returns the exact extracted content unchanged;
- empty arrays and empty-string-only arrays are no-ops;
- values containing `.`, `*`, `+`, `?`, brackets, parentheses, backslashes, dollar signs, and similar metacharacters are treated literally;
- overlapping values prefer the longest complete value;
- duplicate values do not affect the result;
- matching remains case-sensitive;
- `[redacted]` output is inserted once and is not processed by a later sensitive value;
- fallback stringification failure returns `DEFAULT_MESSAGE` without logging the original object;
- all existing encoding, decoding, exception, Zod, circular-reference, and code-resolution tests continue to pass.

## Verification commands

Run these commands from the repository root after implementation:

```bash
npx --no-install prettier --write README.md src/error-handler/index.ts src/error-handler/index.test-unit.ts src/error-handler/utilities.ts src/error-handler/utilities.test-unit.ts src/index.ts
npm run test:unit -- --runTestsByPath src/error-handler/index.test-unit.ts src/error-handler/utilities.test-unit.ts
npm test
npx --no-install tsc --noEmit -p tsconfig.json
npx --no-install eslint src/error-handler/index.ts src/error-handler/index.test-unit.ts src/error-handler/utilities.ts src/error-handler/utilities.test-unit.ts src/index.ts
npx --no-install prettier --check README.md src/error-handler/index.ts src/error-handler/index.test-unit.ts src/error-handler/utilities.ts src/error-handler/utilities.test-unit.ts src/index.ts
npm run build
```

After `npm run build`, inspect `dist/index.d.ts` and `dist/index.js` for the new package-root export and confirm no `*.test-unit.*`, `*.test-integration.*`, `*.test-e2e.*`, or `*.test-bench.*` artifacts were emitted. If formatting changes any file after a behavioral check, review the diff and rerun the affected checks.

## Documentation, error contracts, and protected instructions

- `README.md` is the authoritative state-bearing documentation affected by this additive public API and will be updated in the same change.
- No `ApiException`, `AppException`, `Exception`, error code, stable exception message, response mapping, or `@throws` contract is introduced or changed, so no canonical error-registry or `@throws` synchronization is required.
- No protected coding-instruction file exists in the repository. The supplied coding instructions already cover the durable security, public-export, testing, and documentation expectations relevant to this work, so no coding-instructions handoff is expected unless implementation reveals genuinely new durable repository guidance.

## Security, compatibility, and performance considerations

- Removing raw fallback logging is required because output redaction cannot protect a secret that has already been written to `console.error`. Applications remain responsible for explicitly logging the final redacted string when desired.
- Redaction only covers exact strings supplied by the caller. Case variants, URL-encoded values, base64 values, hashes, truncated values, or other transformations remain visible unless supplied as additional values.
- Very short or common supplied values can redact unrelated text. Documentation will advise callers to supply complete sensitive values rather than broad fragments.
- The API is additive and keeps every existing return contract intact. The only existing side-effect change is the intentional removal of undocumented raw console logging on stringification failure.
- The implementation compiles one literal alternation from the deduplicated list. Its cost scales with the extracted message and total supplied sensitive-value content. The plan assumes the list is application-supplied and reasonably bounded; it will not introduce an arbitrary capacity limit.
- There are no dependencies, persistence changes, migrations, configuration changes, deployment ordering requirements, or rollback data concerns.
- Rolling back the feature consists of removing the additive function, internal utility, tests, export, and README entry. Restoring raw-error logging is not recommended because it would restore the identified disclosure risk.

## Explicit exclusions

- Automatic secret detection, key-name-based redaction, recursive mutation of the original error, structured-data sanitization, case-insensitive matching, partial/fuzzy matching, and transformed-value discovery.
- A configurable replacement string or a new public redaction constant.
- Changes to `extractMessage` typing, traversal precedence, default message text, encoding, decoding, error codes, or `Exception` behavior beyond removing the unsafe logging side effect.
- Package versioning, release notes, publishing, commits, or changes to package/build/test configuration.
- Modification of the existing uncommitted `package.json` and `package-lock.json` version changes.
- Unrelated refactors, naming cleanup, test-runner migration, or legacy tooling normalization.

## Acceptance criteria

- Consumers can import `extractRedactedMessage` from `error-message-utils` with the exact signature `(error: unknown, sensitiveValues: readonly string[]) => string`.
- Every exact, case-sensitive occurrence of each non-empty supplied value is replaced with `[redacted]` after normal message extraction.
- Repeated, duplicate, overlapping, and regular-expression-like values are handled without leakage or marker corruption.
- When no supplied value is present, the returned string exactly matches `extractMessage(error)`; empty and empty-string-only lists behave the same way.
- Unstringifiable unknown errors do not cause the package to log the raw error and still resolve to `DEFAULT_MESSAGE`.
- Existing public extraction, encoding, decoding, code, and exception behavior remains compatible.
- Focused tests, the full existing unit suite, typechecking, linting, formatting verification, and the build pass.
- `README.md` and the built package export/declaration surface match the implementation, and production output contains no test artifacts.
- The final implementation diff does not modify or claim the pre-existing package version changes.

## Approval required

Approval is required to implement the complete scope above: add the fixed-marker `extractRedactedMessage` public API and internal literal-redaction utility, remove unsafe raw fallback logging, add focused unit coverage, update the package-root export and README, and run the specified verification without modifying the pre-existing package version changes or beginning any excluded work.
