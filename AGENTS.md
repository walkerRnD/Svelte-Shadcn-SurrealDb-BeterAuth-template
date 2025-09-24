# Best Practices

## Direction
  * After each feature → check alignment with Svelte 5 idioms (Context 7)
  * use the web wisely
  * follow the existing pattern like vault
  * each time you finish the task you have to update the progress in md file refrence ( if user specify some plan md) `- [x]`
  * frontend uses vitest and backend jest for testing
  * if no specification, use preview:test-non-block to test the UI

### IMPORTANT:
NEVER report to the user without checking the result in
http://localhost:5173/
USE YOUR playwrite MCP


## Svelte 5 UI patterns: snippets and {@render}

Follow Context 7 Svelte 5 idioms for composing UI:

- Prefer snippet props over legacy named slots
- Render snippet props in children using {@render ...}
- Use DOM event attributes (onclick, oninput, etc.), not on:click
- Prefer callback props to createEventDispatcher for component events

### Child: accept snippets, render with {@render}

Example: SideBySidePanel.svelte
```svelte
<script lang="ts">
  // declare types separately
  type Props = {
    left?: Snippet<[]>;
    right?: Snippet<[]>;
  };
  // apply types to object. DON'T apply on function like $props<Props>()
  let { left, right }: Props = $props(); // snippet functions
</script>
<div class="left">{@render left?.()}</div>
<div class="right">{@render right?.()}</div>
```

### Parent: provide snippets and pass as props

```svelte
<SideBySidePanel>
  {#snippet left()} ... {/snippet}
  {#snippet right()} ... {/snippet}
</SideBySidePanel>
```

### Migrating from legacy named slots

Old (legacy):
```svelte
<SideBySidePanel>
  <svelte:fragment slot="left">...</svelte:fragment>
  <svelte:fragment slot="right">...</svelte:fragment>
</SideBySidePanel>
```
New (Svelte 5):
```svelte
{#snippet left()} ... {/snippet}
{#snippet right()} ... {/snippet}
<SideBySidePanel {left} {right} />
```

### Events: use DOM attributes and callback props

```svelte
<script>
  // declare types separately
  type Props = {
    onclick?: (event: MouseEvent) => void;
  };
  // apply types to object. DON'T apply on function like $props<Props>()
  let { onclick }: Props = $props();
</script>
<button {onclick}>Click</button>
```

## Structure
domain driven design check Agent as example
- src/lib/domain/ai/agents
- src/lib/domain/ai/services
- src/lib/domain/ai/tools
- src/lib/domain/ai/types  - internal/exeternal type (ex.: Task, UITask)
- src/lib/domain/ai/schema - zod schema for DB and controller (ex.: createTaskSchema)
- src/lib/domain/ai/ui - svelte components related to this domain
- src/lib/domain/ai/ui/atoms
- src/lib/domain/ai/ui/molecules
- src/lib/domain/ai/ui/organisms
- src/lib/domain/ai/ui/layout
- src/lib/domain/ai/ui/page
Other wise it will go to
- src/lib/domain/+shared/* - same structure above
for example shared Uis will be
- src/lib/domain/+shared/ui/{atoms,molecules,organisms,layout,page}/{ComponentName}Page.svelte

## types

```typescript
// this type represent the data in DB
export interface VaultPublic {
  id: RecordId<'vault'>;
  name: string;
  description?: string;
  created_at?: Date; // in DB data is stored as Date
  updated_at?: Date;
}

type EntityUITypeDiff = 'id' | 'created_at' | 'updated_at'
export interface UIVaultPublic extends Omit<VaultPublic, EntityUITypeDiff> {
  id: string;
  name: string;
  description?: string;
  created_at?: string | number;
  updated_at?: string | number;
}
```

## API Endpoint

```typescript
const vaultService = new UserVaultService(getDb); // prepare service out side to share with other methods

export const PUT: RequestHandler = async ({ request, locals, params }) => {
  const user = getAuthUser(locals); // get the auth user. throw unauthorized if the user is not logged in (Guard)
  try {
    // inside service, the ids has to be RecordId or StringRecordId
    const ownerId = new StringRecordId(user.id); // prepare variable to beused
    const itemId = new StringRecordId(params.id); // same above. it makes easy to extend the code
    const body = await request.json();
    // service must use RecordId or StringRecordId. if it is accepting raw string, you must fix the service or type/schema
    const updated = await vaultService.update(ownerId, { id: itemId, name: body.name, description: body.description, value_plain: body.value });
    const uiData = transform(updated); // transform from Array<VaultPublic> to Array<UIVaultPublic>
    return json({ item: uiData });
  } catch (e: any) {
    return json({ error: e?.message || 'Failed to update' }, { status: 400 });
  }
};
```

## API service

```typescript
export class UserVaultService {
  // the first param must be getDb
  constructor(private readonly getDb: () => Promise<Surreal>) { }
  // ... other methods

  async list(ownerId: StringRecordId): Promise<VaultPublic[]> {
    const db = await this.getDb();
    // Surreal DB returns the query results in [RESULT_OF_FIRST_QUERY, RESULT_OF_SECOND_QUERY] format
    // use bind for security
    const [res] = (await db.query<[Array<VaultPublic>]>(
      /* surql */ `SELECT id, name, description, created_at, updated_at
        FROM vault
        WHERE owner = $ownerId ORDER BY created_at DESC`,
      { ownerId }
    ));
    return res; // Obs. res has Array<VaultPublic> format ( result of the first query)
  }
}
```

## tests that requres DB

```typescript
// always create getDB connected to memory for tests
const getDB = createDbConnection({
	host: "mem://test.db",
	namespace: "test",
	database: "test",
});

describe("createUserCommand", () => {
  // all the services that requres DB has the first param as getDB
	const service = UserVaultService(getDB);

	afterAll(async () => {
		const db = await getDB();
    // close the conecction to the test finish properly
		await db.close();
	});

	it("description here", async () => {
		const result = await service.create({
			// ...content
		});
		// assertions
	});
});
```


## Chat
ref: .augment\knowledge\ai-chat-sdk.md

### backend
```typescript
import { createOpenAI } from '@ai-sdk/openai';
import {
  streamText,
  type UIMessage,
  convertToModelMessages,
  tool,
  stepCountIs,
} from 'ai';

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY, // get from process
});

export async function POST({ request }) {
  const { messages }: { messages: UIMessage[] } = await request.json();

  const result = streamText({
    model: openai('gpt-5-mini'), // latest and economic
    messages: convertToModelMessages(messages),
    stopWhen: stepCountIs(10), // multi-step tooling
    tools: {
      // or apply the JSON from ai_function
      weather: tool({
        description: 'Get the weather in a location (fahrenheit)',
        inputSchema: z.object({
          location: z.string().describe('The location to get the weather for'),
        }),
        execute: async ({ location }) => {
          const temperature = Math.round(Math.random() * (90 - 32) + 32);
          return {
            location,
            temperature,
          };
        },
      }),
      convertFahrenheitToCelsius: tool({
        description: 'Convert a temperature in fahrenheit to celsius',
        inputSchema: z.object({
          temperature: z
            .number()
            .describe('The temperature in fahrenheit to convert'),
        }),
        execute: async ({ temperature }) => {
          const celsius = Math.round((temperature - 32) * (5 / 9));
          return {
            celsius,
          };
        },
      }),
    },
  });

  return result.toUIMessageStreamResponse();
}
```

### frontend
```typescript
<script lang="ts">
  import { Chat } from '@ai-sdk/svelte';

  // declare Props types separately
  type Props = { title?: string; win?: Window | null };
  let {
    input = $bindable('Example'),
    win = $bindable(null)
    // apply types to object. DON'T apply on function like $props<Props>()
  }: Props = $props();
  const chat = new Chat({});

  function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    chat.sendMessage({ text: input });
    input = '';
  }
</script>

<main>
  <ul>
    {#each chat.messages as message, messageIndex (messageIndex)}
      <li>
        <div>{message.role}</div>
        <div>
          {#each message.parts as part, partIndex (partIndex)}
            {#if part.type === 'text'}
              <div>{part.text}</div>
            {:else if part.type === 'tool-weather' || part.type === 'tool-convertFahrenheitToCelsius'}
              <pre>{JSON.stringify(part, null, 2)}</pre>
            {/if}
          {/each}
        </div>
      </li>
    {/each}
  </ul>
  <form onsubmit={handleSubmit}>
    <input bind:value={input} />
    <button type="submit">Send</button>
  </form>
</main>
```

### Agent
```typescript
export class PlannerAgent {
  constructor(private model: LanguageModel, private sess: SessionLike) { }

  // accept the same param with generateText
  async run(setting: Omit<Parameters<typeof generateText>[0], 'model'>) {
    const systemPrompt = buildPlannerSystem(this.sess);
    const { messages, stopWhen, temperature, tools } = setting;
    if (!messages) throw new Error('messages must be an array');

    // Get default planner tools
    const plannerTools = makePlannerTools({ workdir: this.sess.workdir });
    const defaultPlannerTools = Object.values(plannerTools);

    const { text } = await generateText({
      model: this.model,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      tools: {
        ...Object.fromEntries(defaultPlannerTools.map(
          tool => [
            tool.description?.split(' ')[0].toLowerCase(),
            tool
          ])),
        ...(setting.tools || {}),
      },
      stopWhen: stopWhen || stepCountIs(7),
      temperature: temperature ?? 0
    });
    return (text || '').trim();
  }
}
```

Obs.: check also dynamic tooling at https://ai-sdk.dev/docs/ai-sdk-ui/chatbot-tool-usage

## Tools

### Search Tool Pattern
```typescript
export function makeGeminiSearchTools() {
  return {
    googleSearch: tool({
      description: 'Search the web using Google to get current information and answer questions',
      inputSchema: z.object({
        queries: z.array(
          z.string().min(1).describe('User query to answer using grounded web search'),
        ),
      }),
      execute: async ({ queries }) => {
        const model = 'gemini-2.5-flash-lite';
        const results = [];

        for (const query of queries) {
          try {
            const { text } = await generateText({
              model: google(model),
              tools: {
                google_search: google.tools.googleSearch({}),
              },
              prompt: query,
            });

            results.push({
              query,
              text: text || '',
            });
          } catch (e: any) {
            results.push({
              query,
              error: e?.message || String(e)
            });
          }
        }

        return results;
      },
    }),
  } as const;
}
```

Key patterns:
- Use direct destructuring in execute: `async ({ queries }) =>` instead of `async (request) =>`
- Keep descriptions concise and clear
- Handle arrays of inputs for batch processing
- Always include error handling for each item
- Return consistent result format with query and text/error
- **IMPORTANT**: inputSchema must always be `z.object()` to avoid LLM provider differences