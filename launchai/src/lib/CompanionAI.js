/**
 * CompanionAI.js
 * AI engine for the Build Companion feature.
 * Supports Anthropic Claude Sonnet and Google Gemini Pro.
 * Falls back to demo responses when no API keys are configured.
 */

const MODE_PROMPTS = {
  diagnose: {
    label: 'Diagnose',
    emoji: '🔍',
    system: `You are a patient, expert AI diagnostic assistant working inside the LaunchAI Build Companion.

Your job is to analyze the user's AI-generated output and diagnose issues clearly.

RULES:
- Separate "what is wrong" from "how to fix it" using clear headings
- Rate the overall clarity/quality as: LOW, MEDIUM, or HIGH
- Identify what is missing, broken, or incomplete
- Point out common mistakes the user may not realize
- Use plain language — the user may be a complete beginner
- Use numbered lists for easy scanning
- Never be condescending; be encouraging but honest
- Always end with one clear, practical first step

FORMAT YOUR RESPONSE LIKE THIS:
**Clarity Level:** [LOW/MEDIUM/HIGH]

**What's Working**
(list what's correct or good)

**What Needs Fixing**
(numbered list of specific issues)

**How to Fix It**
(numbered list of solutions matching the issues above)

**Your First Step**
(one single clear action to take right now)`,
  },

  improve: {
    label: 'Improve',
    emoji: '✨',
    system: `You are an expert AI output improver working inside the LaunchAI Build Companion.

Your job is to take the user's rough, broken, or incomplete AI output and produce a cleaner, more complete version.

RULES:
- First show the IMPROVED version in full
- Then explain every significant change you made and why
- Keep explanations beginner-friendly — assume the user has no technical background
- Preserve the user's original intent; don't change the goal
- If the output has errors, fix them silently in the improved version
- If context is missing, make reasonable assumptions and note them
- Format the improved version so it's ready to use
- Always end with a one-line summary of the key improvements

FORMAT YOUR RESPONSE LIKE THIS:
**Improved Version**
(the complete, improved output)

**Changes Made**
(numbered list explaining each change and why)

**Assumptions**
(any assumptions you made about missing context)

**Summary**
(one-line summary of what was improved)`,
  },

  explain: {
    label: 'Explain',
    emoji: '💡',
    system: `You are a plain-language AI explainer working inside the LaunchAI Build Companion.

Your job is to break down what AI-generated output means so anyone can understand it, regardless of their technical skill level.

RULES:
- Explain as if talking to a smart friend who is NOT technical
- Use everyday analogies to explain complex concepts
- Number every key point for easy reference
- Define any jargon or technical terms inline the first time you use them
- Break long explanations into short paragraphs
- Highlight the most important takeaway
- Never assume knowledge — when in doubt, explain more
- Be warm and encouraging, not academic
- End with "In plain terms:" followed by a one-sentence summary

FORMAT YOUR RESPONSE LIKE THIS:
**In Simple Terms**
(2-3 sentence overview anyone can understand)

**Breaking It Down**
(numbered explanations of each part)

**Key Terms Explained**
(any technical terms defined simply)

**In Plain Terms**
(one-sentence summary of what this output does/means)`,
  },

  nextsteps: {
    label: 'Next Steps',
    emoji: '📋',
    system: `You are a practical next-steps advisor working inside the LaunchAI Build Companion.

Your job is to tell the user exactly what to do next with their AI output.

RULES:
- Give ORDERED steps — numbered and sequential
- Each step should be a single, concrete action (not vague)
- Include estimated time or effort for each step when possible
- Provide 1-2 alternative approaches after the main path
- Warn about common mistakes or pitfalls
- Always give exactly ONE clear first action as the priority
- Keep steps beginner-friendly — assume the user might not know tools or processes
- If tools are needed, name specific ones and explain WHY that tool
- Never give more than 7 steps — simplify if needed
- End with encouragement

FORMAT YOUR RESPONSE LIKE THIS:
**Do This First**
(one single, specific action to take right now)

**Step-by-Step Plan**
(numbered steps, each with a brief description)

**Alternative Approach**
(1-2 different ways to achieve the same goal)

**Watch Out For**
(common mistakes or pitfalls)

**You've Got This**
(brief encouragement)`,
  },

  finish: {
    label: 'Finish It',
    emoji: '🏁',
    system: `You are a project completion assistant working inside the LaunchAI Build Companion.

Your job is to convert messy, incomplete, or confusing AI output into a complete, actionable implementation plan that a beginner can follow.

RULES:
- Break the work into numbered PHASES (no more than 5)
- Each phase should have 2-4 concrete tasks
- Estimate time for each phase (e.g., "~30 minutes", "~2 hours")
- Suggest specific tools for each task
- Make every instruction beginner-friendly — no assumed knowledge
- Include what "done" looks like for each phase
- Reduce confusion — if something is ambiguous, clarify it
- If the output is code, provide the corrected/completed code
- If the output is content, provide the polished version
- Always end with a completion checklist
- Be encouraging — make it feel achievable

FORMAT YOUR RESPONSE LIKE THIS:
**Overview**
(2-3 sentences describing the final goal)

**Phase 1: [Name]** (~estimated time)
- Task 1: ...
- Task 2: ...
- ✅ Done when: ...

**Phase 2: [Name]** (~estimated time)
(repeat pattern)

**Tools You'll Need**
(list of specific tools with brief descriptions)

**Completion Checklist**
(checkboxes the user can mentally tick off)

**Final Note**
(encouragement and what to do after completion)`,
  },
}

/**
 * Get the system prompt for a given mode, enhanced with content type context.
 */
function buildSystemPrompt(mode, contentType) {
  const base = MODE_PROMPTS[mode]?.system
  if (!base) return ''

  const typeContext = contentType && contentType !== 'other'
    ? `\n\nCONTENT TYPE CONTEXT: The user's input has been detected as "${contentType}". Tailor your response accordingly — use terminology and examples relevant to this type of content.`
    : ''

  return base + typeContext
}

/**
 * Call with Anthropic Claude Sonnet API.
 */
async function callAnthropic(apiKey, systemPrompt, userMessage) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20240620',
      max_tokens: 2048,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Anthropic API error: ${res.status} — ${err}`)
  }

  const data = await res.json()
  return data.content?.[0]?.text || 'No response received.'
}

/**
 * Call with Google Gemini Pro API.
 */
async function callGemini(apiKey, systemPrompt, userMessage) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemPrompt }],
        },
        contents: [
          {
            role: 'user',
            parts: [{ text: userMessage }],
          },
        ],
        generationConfig: {
          maxOutputTokens: 2048,
          temperature: 0.7,
        },
      }),
    }
  )

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Gemini API error: ${res.status} — ${err}`)
  }

  const data = await res.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response received.'
}

/**
 * Demo responses for when no API key is configured.
 */
function getDemoResponse(mode, contentType) {
  // Content-type-specific overrides for diagnose mode
  const typeSpecificDiagnose = {
    code: `**Clarity Level:** MEDIUM

**What's Working**
1. The core function logic is sound — the algorithm approach is correct
2. Variable naming is reasonable and follows conventions
3. The overall structure shows understanding of the problem

**What Needs Fixing**
1. **No input validation** — your function doesn't check for null, undefined, or empty inputs which will cause runtime crashes
2. **Missing error handling** — there's no try/catch or fallback behavior when data is malformed
3. **Edge cases ignored** — empty arrays, missing properties, and type mismatches aren't handled
4. **No return type consistency** — the function can return undefined in some code paths

**How to Fix It**
1. Add a guard clause at the top: \`if (!items || !Array.isArray(items)) return 0;\`
2. Wrap the core logic in a try/catch block with a meaningful error message
3. Add property checks: \`items[i].price !== undefined && typeof items[i].price === 'number'\`
4. Ensure every code path returns a consistent type (number, in this case)

**Your First Step**
Add input validation as the very first line of your function — this alone will prevent 80% of potential crashes.`,

    design: `**Clarity Level:** MEDIUM

**What's Working**
1. The visual concept has a clear direction and strong foundation
2. Color choices show good brand awareness
3. The layout structure follows modern UI patterns

**What Needs Fixing**
1. **Inconsistent spacing** — margins and padding vary without a clear system (use an 8px grid)
2. **Typography hierarchy is weak** — headings and body text don't have enough contrast in size and weight
3. **Missing responsive considerations** — no indication of how this adapts to mobile screens
4. **Accessibility gaps** — contrast ratios may not meet WCAG AA standards on some elements

**How to Fix It**
1. Establish a spacing scale (4, 8, 12, 16, 24, 32, 48, 64px) and apply consistently
2. Set clear type scales: headings at 1.25–1.5× the body size, with distinct weights
3. Add breakpoint annotations for tablet (768px) and mobile (375px)
4. Test all text/background combinations with a contrast checker tool

**Your First Step**
Run your colors through WebAIM's contrast checker (webaim.org/resources/contrastchecker) — fix any failing ratios.`,

    content: `**Clarity Level:** MEDIUM

**What's Working**
1. The core message is clear and the topic is well-chosen
2. The tone is engaging and appropriate for the target audience
3. The overall structure follows a logical flow

**What Needs Fixing**
1. **Opening is too generic** — the first two sentences could apply to any topic; make them specific and hook-worthy
2. **Missing call-to-action** — there's no clear next step for the reader at the end
3. **Weak transitions** — sections feel disconnected; they need bridge sentences
4. **Too long without breaks** — large text blocks need subheadings, bullet points, or visuals

**How to Fix It**
1. Rewrite the opening with a specific stat, question, or bold claim
2. End with one clear CTA: what should the reader do after reading?
3. Add one transition sentence between each section connecting the ideas
4. Break up paragraphs longer than 3 lines; add subheadings every 200-300 words

**Your First Step**
Rewrite your opening line to start with a surprising fact or a direct question that hooks the reader.`,

    business: `**Clarity Level:** MEDIUM

**What's Working**
1. The value proposition is clearly stated and addresses a real problem
2. Target audience is defined at a high level
3. Revenue model concept is present and viable

**What Needs Fixing**
1. **No market sizing** — you need TAM/SAM/SOM numbers to validate the opportunity
2. **Competitive landscape missing** — what alternatives exist and what's your unfair advantage?
3. **Vague customer segments** — "small businesses" is too broad; narrow to a specific niche
4. **No traction metrics** — even early signals (waitlist, LOIs, conversations) matter

**How to Fix It**
1. Research your market size using Statista, IBISWorld, or Google Trends data
2. List 3-5 competitors and map your differentiators vs. each
3. Pick ONE ideal customer profile and describe them in detail (role, company size, pain)
4. Add any early signals: # of waitlist signups, customer interviews, pilot users

**Your First Step**
Define your ICP (Ideal Customer Profile) in one sentence: "[Role] at [Company type] who struggles with [Specific problem]."`,
  }

  const demos = {
    diagnose: typeSpecificDiagnose[contentType] || `**Clarity Level:** MEDIUM

**What's Working**
1. The overall structure of your output is sound — you have a clear starting point
2. The intent behind what you're trying to build is well-defined
3. There's enough context here to work with

**What Needs Fixing**
1. **Missing specifics** — the output is too vague in several areas and needs concrete details to be actionable
2. **Incomplete logic** — there are gaps where the AI left out important steps or connections
3. **Formatting issues** — the structure could be cleaner to make it easier to follow and implement
4. **No error handling** — there's no guidance on what to do when things go wrong

**How to Fix It**
1. Add specific examples or values where the output is vague
2. Fill in the missing steps — ask the AI to "expand on step 3" or "add the missing parts"
3. Reorganize into clear, numbered sections with headings
4. Add a "what if this doesn't work?" section

**Your First Step**
Copy your output and ask the AI: "Make this more specific and fill in any missing details. Add concrete examples for each point."`,

    improve: `**Improved Version**
Here is a cleaned-up, more complete version of your output with all the gaps filled in, errors corrected, and structure improved for clarity:

---
[Your improved, polished output would appear here — restructured with clear headings, corrected language, filled-in gaps, and actionable detail. Each section flows logically into the next.]
---

**Changes Made**
1. **Reorganized the structure** — moved from a flat list to clearly labeled sections so each part is easy to find
2. **Filled in missing details** — added specifics where the original was vague or left gaps
3. **Fixed inconsistencies** — corrected areas where the output contradicted itself or used confusing terms
4. **Added actionable language** — replaced passive descriptions with clear instructions
5. **Simplified the language** — removed unnecessary jargon and made everything beginner-friendly

**Assumptions**
- Assumed you're building this for a general audience, not experts
- Assumed you want this to be ready to implement, not just a brainstorm

**Summary**
Restructured for clarity, filled in 4 missing details, fixed 2 inconsistencies, and simplified language throughout.`,

    explain: `**In Simple Terms**
Think of your AI output as a recipe. Right now, you have the list of ingredients and some of the cooking steps, but a few key instructions are missing and some steps are in the wrong order. That's completely normal — AI gives you a great starting draft, not a finished product.

**Breaking It Down**
1. **The first part** is setting up the foundation — like prepping your workspace before cooking. This is where you define what you want to create and who it's for.
2. **The middle section** is the actual building — this is where most of the work happens. The AI has given you a decent outline, but you'll need to fill in your specific details.
3. **The output section** is what your users or audience will actually see. Think of this as the plated dish — it needs to look good AND work well.
4. **The missing pieces** are mostly about connecting these sections together. The AI gave you islands of content, but you need bridges between them.

**Key Terms Explained**
- **Implementation** = actually building or creating the thing (turning plans into reality)
- **Iteration** = making small improvements, one round at a time (like editing a draft)
- **Scope** = how big or small your project is (start small, expand later)

**In Plain Terms**
Your AI output is a solid 60% draft — it has the right ideas, but needs you to fill in your specific details and connect the dots to make it actually work.`,

    nextsteps: `**Do This First**
Open a new document and paste your AI output at the top. Below it, write one sentence answering: "What does DONE look like?" This gives you a clear finish line to work toward.

**Step-by-Step Plan**
1. **Define your finish line** (~5 min) — Write one sentence describing what "complete" looks like for this project
2. **Highlight the gaps** (~10 min) — Read through the output and mark anything that feels vague, broken, or confusing
3. **Fill in the biggest gap first** (~20 min) — Pick the most important missing piece and flesh it out with specifics
4. **Test the output** (~15 min) — Try to actually use or implement the first part — if it works, keep going; if not, you've found what needs fixing
5. **Get one person's feedback** (~10 min) — Share it with someone and ask: "Does this make sense to you?"
6. **Polish and finalize** (~30 min) — Clean up formatting, fix any issues from feedback, and prepare the final version

**Alternative Approach**
- **Quick path:** Use the "Finish It" mode in Build Companion to get a complete implementation plan generated for you — then just follow it step by step
- **Collaborative path:** Paste this into the AI Copilot chat and work through it conversationally, asking for help on each section

**Watch Out For**
⚠️ Don't try to perfect everything at once — ship a rough version first, then improve
⚠️ If you've been staring at it for 30+ minutes without progress, step back and re-read with fresh eyes
⚠️ Avoid adding new features before finishing the core — scope creep is the #1 project killer

**You've Got This**
You've already done the hardest part — starting. Most people never get past "I have an idea." You have an actual output to work with. Now it's just about refining it step by step. 💪`,

    finish: `**Overview**
Your AI output needs to be transformed from a rough draft into a finished, working result. We'll break this into 4 manageable phases that you can complete one at a time, even if you've never done this before.

**Phase 1: Foundation** (~20 minutes)
- Task 1: Read through your entire output and highlight anything you don't understand
- Task 2: Use the "Explain" mode to clarify any confusing parts
- Task 3: Create a simple checklist of everything your final result needs to include
- ✅ Done when: You have a clear checklist and understand every part of the output

**Phase 2: Build the Core** (~1-2 hours)
- Task 1: Start with the first item on your checklist and implement it
- Task 2: Test it immediately — does it work? If not, use "Diagnose" mode
- Task 3: Move to the next item only after the current one is working
- ✅ Done when: All core checklist items are implemented and working

**Phase 3: Polish & Connect** (~30-45 minutes)  
- Task 1: Review the complete result from start to finish as if you're seeing it for the first time
- Task 2: Fix any rough edges, typos, or awkward transitions
- Task 3: Add any missing details that would confuse someone new
- ✅ Done when: A friend could read/use your result without asking questions

**Phase 4: Ship It** (~15 minutes)
- Task 1: Do one final review — is anything broken or missing?
- Task 2: Save/publish/share your finished result
- Task 3: Celebrate! 🎉
- ✅ Done when: Your result is live, shared, or in use

**Tools You'll Need**
- **A text editor** — Google Docs, Notion, or VS Code (for text/content/code)
- **LaunchAI Build Companion** — for diagnosing and improving as you go
- **A way to share** — Google Drive, GitHub, or email (to get feedback)

**Completion Checklist**
☐ Output is fully understood (no confusing parts)
☐ Core elements are built and working
☐ Result has been tested or reviewed
☐ Rough edges are polished
☐ Result is shared or published
☐ You feel confident about what you created

**Final Note**
Remember: done is better than perfect. You can always come back and improve later. The goal right now is to get from "rough AI output" to "finished result I can actually use." You're closer than you think! 🚀`,
  }

  return demos[mode] || demos.diagnose
}

/**
 * Main function: analyze user input with the Build Companion.
 * @param {string} input - The user's pasted AI output or problem description
 * @param {string} contentType - Detected content type (e.g., 'code', 'design')
 * @param {string} mode - One of: 'diagnose', 'improve', 'explain', 'nextsteps', 'finish'
 * @returns {Promise<{ response: string, provider: string, mode: string }>}
 */
export async function analyzeWithCompanion(input, contentType, mode) {
  // Check localStorage first, then fallback to import.meta.env
  const anthropicKey = localStorage.getItem('VITE_ANTHROPIC_API_KEY') || import.meta.env.VITE_ANTHROPIC_API_KEY
  const geminiKey    = localStorage.getItem('VITE_GOOGLE_API_KEY') || import.meta.env.VITE_GOOGLE_API_KEY

  const systemPrompt = buildSystemPrompt(mode, contentType)
  const userMessage = `Here is my AI-generated output (detected type: ${contentType}):\n\n---\n${input}\n---\n\nPlease analyze this using the ${MODE_PROMPTS[mode]?.label || mode} mode.`

  // Try Anthropic first, then Gemini, then demo
  if (anthropicKey) {
    try {
      const response = await callAnthropic(anthropicKey, systemPrompt, userMessage)
      return { response, provider: 'Claude Sonnet', mode }
    } catch (err) {
      console.error('Anthropic call failed:', err.message)
      // If the key was provided but failed, we should probably tell the user why instead of silently falling back
      if (err.message.includes('401') || err.message.includes('403')) {
        throw new Error(`Anthropic Key Error: Please check your API key in Settings. (${err.message})`)
      }
    }
  }

  if (geminiKey) {
    try {
      const response = await callGemini(geminiKey, systemPrompt, userMessage)
      return { response, provider: 'Gemini Pro', mode }
    } catch (err) {
      console.error('Gemini call failed:', err.message)
      if (err.message.includes('401') || err.message.includes('400')) {
        throw new Error(`Gemini Key Error: Please check your API key in Settings. (${err.message})`)
      }
    }
  }

  // Demo fallback
  await new Promise(r => setTimeout(r, 1200 + Math.random() * 800))
  return {
    response: getDemoResponse(mode, contentType),
    provider: 'Demo',
    mode,
  }
}

/**
 * Get metadata about a specific mode.
 */
export function getModeInfo(mode) {
  return MODE_PROMPTS[mode] || null
}

/**
 * Get all available modes.
 */
export function getAllModes() {
  return Object.entries(MODE_PROMPTS).map(([key, val]) => ({
    key,
    label: val.label,
    emoji: val.emoji,
  }))
}
