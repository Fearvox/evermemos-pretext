// hub/src/lib/mock/generate.ts
// Usage: cd hub && npx tsx src/lib/mock/generate.ts
// Generates expanded fixture files with 50+ entries for virtualization testing.

import { writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const EPISODE_TEMPLATES = [
  {
    lang: 'en',
    userContent: 'Can you help me understand how Pretext measures text?',
    agentContent: 'Pretext uses the Canvas API to measure text segments. The prepare() function handles segmentation and measurement, while layout() does pure arithmetic for line breaking.',
  },
  {
    lang: 'zh',
    userContent: '请解释一下Pretext的工作原理。它是如何处理中文文本的换行的？',
    agentContent: '好的。Pretext是一个纯TypeScript的文本测量和布局引擎。它使用浏览器Canvas API进行文本测量，通过Intl.Segmenter支持CJK文字的逐字符换行和禁则处理。',
  },
  {
    lang: 'ja',
    userContent: 'プリテキストのレイアウトエンジンについて教えてください。日本語のテキストはどう処理されますか？',
    agentContent: 'プリテキストは、ブラウザのCanvas APIを使用してテキストを測定します。日本語の禁則処理（行頭禁則・行末禁則）にも対応しています。',
  },
  {
    lang: 'ar',
    userContent: 'كيف يتعامل النظام مع النصوص العربية؟ هل يدعم الاتجاه من اليمين إلى اليسار؟',
    agentContent: 'The system handles Arabic text through bidirectional metadata in the prepareWithSegments() path. RTL rendering is managed at the application layer using segment bidi levels.',
  },
  {
    lang: 'emoji',
    userContent: 'What about emoji support? Can it handle ZWJ sequences? 🤔',
    agentContent: 'Great question! 🚀 Pretext auto-corrects emoji measurements per font size. ZWJ sequences like 👨‍💻 and flag sequences like 🇯🇵 are handled correctly through grapheme segmentation.',
  },
]

function generateEpisodes(count: number) {
  const episodes = []
  for (let i = 0; i < count; i++) {
    const template = EPISODE_TEMPLATES[i % EPISODE_TEMPLATES.length]
    const turnCount = 3 + (i % 5)
    const turns = []
    for (let t = 0; t < turnCount; t++) {
      turns.push({
        id: `turn-${i}-${t}`,
        role: t % 2 === 0 ? 'user' : 'agent',
        content: t % 2 === 0 ? template.userContent : template.agentContent,
        timestamp: new Date(2026, 0, 1 + i, 10, t * 5).toISOString(),
      })
    }
    episodes.push({
      id: `ep-${String(i + 1).padStart(3, '0')}`,
      type: 'episode',
      title: `Conversation ${i + 1}: ${template.lang.toUpperCase()} discussion`,
      turns,
      tags: [template.lang, 'conversation', i % 3 === 0 ? 'starred' : 'recent'],
      createdAt: new Date(2026, 0, 1 + i).toISOString(),
      updatedAt: new Date(2026, 0, 1 + i).toISOString(),
    })
  }
  return episodes
}

function generateProfiles(count: number) {
  const templates = [
    { name: 'Dr. Sarah Chen', role: 'AI Researcher', desc: 'Specializes in natural language processing and text layout systems. Published extensively on multilingual text rendering.' },
    { name: '田中太郎', role: 'ソフトウェアエンジニア', desc: 'テキストレイアウトシステムの開発に携わるエンジニア。CJKテキスト処理の専門家。' },
    { name: 'Ahmed Al-Rashid', role: 'Data Scientist', desc: 'Focus on bidirectional text processing and Arabic NLP. Works on cross-lingual information retrieval systems.' },
    { name: 'Maria Garcia', role: 'Product Manager', desc: 'Leads the EverMemOS product team. Background in cognitive science and human-computer interaction.' },
    { name: 'Alex Kim', role: 'ML Engineer', desc: 'Develops memory retrieval models for EverMemOS. Expertise in semantic search and embedding systems.' },
  ]
  const profiles = []
  for (let i = 0; i < count; i++) {
    const t = templates[i % templates.length]
    profiles.push({
      id: `prof-${String(i + 1).padStart(3, '0')}`,
      type: 'profile',
      name: t.name,
      role: t.role,
      description: t.desc,
      fields: [
        { label: 'Affiliation', value: `Research Institute ${i + 1}` },
        { label: 'Focus', value: 'Text Layout & Multilingual Rendering' },
      ],
      tags: ['researcher', i % 2 === 0 ? 'active' : 'archived'],
      createdAt: new Date(2026, 1, 1 + i).toISOString(),
      updatedAt: new Date(2026, 1, 1 + i).toISOString(),
    })
  }
  return profiles
}

function generateKnowledge(count: number) {
  const templates = [
    { subject: 'Pretext Layout Engine', content: 'Pretext is a pure TypeScript multiline text measurement and layout engine. It uses browser Canvas API for measurement, with prepare() handling text analysis and layout() doing pure arithmetic line breaking. Supports CJK, Arabic, emoji, and mixed-script content.' },
    { subject: '多语言文本渲染', content: '多语言文本渲染需要处理CJK换行规则、阿拉伯文双向文本、emoji测量校正等问题。Pretext通过Intl.Segmenter实现按字符分割，支持禁则处理和Zero-Width Joiner序列。👨‍💻' },
    { subject: 'Virtual Scrolling', content: 'Virtual scrolling renders only visible items in a long list. @tanstack/react-virtual v3 provides useVirtualizer with dynamic heights. Combined with Pretext layout() for exact pre-render height calculation, this eliminates scroll-jump artifacts.' },
    { subject: 'CJK Line Breaking', content: 'CJK text follows kinsoku rules: certain characters cannot appear at line start (closing brackets, periods) or line end (opening brackets). Pretext merges prohibited punctuation into adjacent graphemes during the prepare() phase.' },
    { subject: 'Bidi Text Rendering', content: 'Bidirectional text (Arabic, Hebrew mixed with Latin) requires bidi level metadata. Pretext provides segLevels on the prepareWithSegments() path. The application layer uses these levels for correct visual ordering.' },
  ]
  const entries = []
  for (let i = 0; i < count; i++) {
    const t = templates[i % templates.length]
    entries.push({
      id: `know-${String(i + 1).padStart(3, '0')}`,
      type: 'knowledge',
      subject: t.subject,
      content: t.content,
      tags: ['knowledge', i % 3 === 0 ? 'important' : 'reference'],
      createdAt: new Date(2026, 2, 1 + i).toISOString(),
      updatedAt: new Date(2026, 2, 1 + i).toISOString(),
    })
  }
  return entries
}

const episodes = generateEpisodes(25)
const profiles = generateProfiles(15)
const knowledge = generateKnowledge(15)

writeFileSync(resolve(__dirname, 'episodes.json'), JSON.stringify(episodes, null, 2))
writeFileSync(resolve(__dirname, 'profiles.json'), JSON.stringify(profiles, null, 2))
writeFileSync(resolve(__dirname, 'knowledge.json'), JSON.stringify(knowledge, null, 2))

console.log(`Generated: ${episodes.length} episodes, ${profiles.length} profiles, ${knowledge.length} knowledge entries`)
console.log(`Total: ${episodes.length + profiles.length + knowledge.length} items`)
