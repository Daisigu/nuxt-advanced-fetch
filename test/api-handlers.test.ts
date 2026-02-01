import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils/e2e'

function decodeHtmlEntities(s: string): string {
  return s
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
}

function extractJson(html: string, testId: string): unknown {
  const re = new RegExp(
    `data-testid="${testId}"[^>]*>\\s*([\\s\\S]*?)\\s*</div>`,
    'i',
  )
  const match = html.match(re)
  if (!match) throw new Error(`Could not find data-testid="${testId}" in HTML`)
  const raw = match[1].trim()
  return JSON.parse(decodeHtmlEntities(raw))
}

describe('$api handler order and options', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/basic', import.meta.url)),
  })

  it('runs handlers: globals first (by order), then locals (by order)', async () => {
    const html = (await $fetch('/test-order')) as string
    const order = extractJson(html, 'handler-order') as string[]
    expect(order).toEqual(['global-0', 'global-10', 'local-0', 'local-10'])
  })

  it('removeHandler removes the handler by reference', async () => {
    const html = (await $fetch('/test-remove')) as string
    const log = extractJson(html, 'handler-log') as string[]
    expect(log).toEqual(['kept'])
  })

  it('create() returns instance with isolated handlers (no global)', async () => {
    const html = (await $fetch('/test-create')) as string
    const log = extractJson(html, 'handler-log') as string[]
    expect(log).toEqual(['instance'])
  })

  it('plain function as local handler runs after global (backward compat)', async () => {
    const html = (await $fetch('/test-plain-local')) as string
    const order = extractJson(html, 'handler-order') as string[]
    expect(order).toEqual(['global', 'local'])
  })
})
