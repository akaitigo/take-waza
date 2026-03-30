.PHONY: build test lint format typecheck check clean install deps-check wasm quality test-e2e

install:
	npm install

build:
	npx tsc
	npx vite build

test:
	npx vitest run --exclude 'test/e2e/**' --passWithNoTests

test-e2e:
	npx playwright test

lint:
	npx oxlint .
	npx biome check .

format:
	npx biome format --write .

typecheck:
	npx tsc --noEmit

check: format lint typecheck test build
	@echo "All checks passed."

quality:
	@echo "=== Quality Gate ==="
	@test -f LICENSE || { echo "ERROR: LICENSE missing. Fix: add MIT LICENSE file"; exit 1; }
	@! grep -rn "TODO\|FIXME\|HACK\|console\.log\|println\|print(" src/ 2>/dev/null | grep -v "node_modules" || { echo "ERROR: debug output or TODO found. Fix: remove before ship"; exit 1; }
	@! grep -rn "password=\|secret=\|api_key=\|sk-\|ghp_" src/ 2>/dev/null | grep -v '\$${' | grep -v "node_modules" || { echo "ERROR: hardcoded secrets. Fix: use env vars with no default"; exit 1; }
	@test ! -f PRD.md || ! grep -q "\[ \]" PRD.md || { echo "ERROR: unchecked acceptance criteria in PRD.md"; exit 1; }
	@test ! -f CLAUDE.md || [ $$(wc -l < CLAUDE.md) -le 50 ] || { echo "ERROR: CLAUDE.md is $$(wc -l < CLAUDE.md) lines (max 50). Fix: remove build details, use pointers only"; exit 1; }
	@echo "OK: automated quality checks passed"
	@echo "Manual checks required: README quickstart, demo GIF, input validation, ADR >=1"

wasm:
	@test -d wasm-engine || { echo "ERROR: wasm-engine/ not found. Create Rust crate first: cargo init wasm-engine --lib"; exit 1; }
	cd wasm-engine && wasm-pack build --target web

deps-check:
	npx knip || echo "WARN: unused dependencies detected"

clean:
	rm -rf dist/ coverage/ node_modules/.cache/
