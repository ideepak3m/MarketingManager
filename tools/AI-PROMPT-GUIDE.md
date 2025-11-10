# AI Prompt for Phase-Specific Comment Generation

Use this prompt with ChatGPT or Claude to generate realistic comment/reply templates for your campaign phases.

---

## Prompt Template

```
I need to generate realistic social media comments and replies for a marketing campaign demo. The campaign has the following phases:

**Phase 1: [PHASE_NAME]**
- Description: [What happens in this phase]
- Duration: [Date range]
- Goal: [What this phase aims to achieve]

**Phase 2: [PHASE_NAME]**
- Description: [What happens in this phase]
- Duration: [Date range]
- Goal: [What this phase aims to achieve]

**Phase 3: [PHASE_NAME]**
- Description: [What happens in this phase]
- Duration: [Date range]
- Goal: [What this phase aims to achieve]

Please generate 6-8 comment/reply pairs for EACH phase, following these guidelines:

1. **Phase-appropriate content**: Comments should reflect the customer journey stage
   - Early phases: Discovery, curiosity, questions about basics
   - Middle phases: Comparison, deeper questions, consideration
   - Later phases: Purchase intent, onboarding questions, testimonials

2. **Sentiment mix**: Include diverse sentiments for realism
   - Positive (40%): Enthusiastic, appreciative, testimonials
   - Questions (40%): Curious, seeking information, clarification
   - Neutral (15%): Observational, informational
   - Negative (5%): Concerns, skepticism (keeps it realistic)

3. **Reply quality**: Every comment should have a helpful, brand-appropriate reply
   - Answer questions directly
   - Provide actionable information
   - Include CTAs where appropriate
   - Professional but friendly tone

4. **Format**: Return as JSON object with phase names as keys:

```json
{
  "Phase Name 1": [
    {
      "comment": "The actual comment text",
      "reply": "The brand's reply text",
      "sentiment": "positive|question|neutral|negative"
    }
  ],
  "Phase Name 2": [...]
}
```

Campaign Context:
- Industry: [Your industry]
- Product/Service: [What you're marketing]
- Target Audience: [Who the campaign targets]
- Brand Voice: [Formal/Casual/Professional/Fun]
```

---

## Example for a SaaS Marketing Tool

**Your Campaign:**
- Phase 1: Awareness (Nov 11-17) - Introduce the platform
- Phase 2: Consideration (Nov 18-24) - Show features and benefits
- Phase 3: Conversion (Nov 25-Dec 1) - Drive signups

**Prompt to AI:**

```
I need to generate realistic social media comments and replies for a SaaS marketing automation platform demo. The campaign has these phases:

**Phase 1: Awareness**
- Description: Introduce the platform to new audiences
- Duration: Nov 11-17, 2024
- Goal: Build awareness and curiosity

**Phase 2: Consideration**
- Description: Showcase features, integrations, and benefits
- Duration: Nov 18-24, 2024
- Goal: Educate prospects and address concerns

**Phase 3: Conversion**
- Description: Drive signups and onboarding
- Duration: Nov 25-Dec 1, 2024
- Goal: Convert interested users to paid customers

Generate 6-8 comment/reply pairs for EACH phase following the guidelines above.

Campaign Context:
- Industry: SaaS / Marketing Technology
- Product: AI-powered marketing campaign manager with multi-platform scheduling
- Target Audience: Small business owners, marketing managers, agencies
- Brand Voice: Professional but approachable, helpful, solutions-oriented
```

---

## Tips

1. **Match your actual phase names**: The JSON keys must exactly match your campaign_phases.name in the database
2. **Generate more templates**: 8-10 per phase gives better variety when randomized
3. **Review and edit**: AI might generate generic responses - personalize them to your brand
4. **Test first**: Use 2-3 templates per phase initially to test the tool, then generate full set
5. **Save templates**: Keep them for future campaigns with similar phases

---

## After Generation

1. Copy the JSON output from AI
2. Validate it's proper JSON (use jsonlint.com if needed)
3. Paste into the HTML tool's textarea
4. Click "Generate Comments" and watch the magic happen!

The tool will:
- Match posts to their phases
- Pick random templates from the appropriate phase
- Generate timestamps within the phase's date range
- Create realistic engagement patterns
