/* ============================================================
   EDIT THIS FILE – it's the only one you need to touch.
   1) Fill in SITE with your details.
   2) Add one object to POSTS for every weekly blog.
   Tips for writing content (inside the backticks):
   - Code blocks: use ~~~js ... ~~~  (instead of triple backticks)
   - Inline code: write \`like this\`  (escape the backticks with a backslash)
   - Supported: # headings, **bold**, *italic*, lists, > quotes, [links](url), ![images](url), ---
   - Quiz is optional; omit it or use an array of questions with a valid answer index.
   ============================================================ */

const SITE = {
  name: "Gargi Joshi",
  logoEmoji: "✿",
  tagline: ["Notes from things I’m learning.", "A few things worth remembering.", "Bits and pieces from my week."],
  bio: "Hi, I’m Gargi. I made this little space to keep my notes, follow my curiosity, and write down things I don’t want to forget.",
  about: [
    "I started this blog to keep my learning notes in one place.",
    "I’ll write about things I’m figuring out, useful bits I come across, and whatever catches my attention.",
    "Have a read, and leave me a note if you feel like it."
  ],
  links: []
};

const POSTS = [
  {
    slug: "week-1-vibecoding",
    week: 1,
    title: "Vibe Coding: Build Your First Little Project",
    date: "2026-11-01",
    emoji: "🎮",
    tags: ["Vibe Coding", "Beginner", "AI Tools"],
    summary: "A beginner-friendly, game-style guide to building with AI, checking the result, and staying in control.",
    content: `
Imagine you have an idea for a tiny website, but you don't know all the code yet. You explain what you want to an AI coding tool, it suggests code, and you try it out. You keep giving it clear directions until the project starts looking the way you imagined.

That is the basic idea behind **vibe coding**: describing what you want in everyday language, then working with an AI coding assistant to create and change the code.

You are still the player in charge. The tool can make mistakes, so you need to run the project, check the result, and understand the important parts before you trust it.

## Your mission

**Build a tiny personal webpage** with a heading, a short introduction, and a button that changes a message.

You don't need to finish it all at once. Play through these levels in order.

## Level 1: Pick your idea

Start with something small enough to finish in one sitting.

Good first missions:
- A personal introduction page
- A study timetable
- A simple recipe collection
- A page that gives you a random positive message

Avoid starting with a huge app that needs logins, payments, or private user data. Small projects are easier to understand and test.

## Level 2: Explain the mission clearly

Open an AI coding assistant that can help write or edit code. Tell it what you want, who the page is for, and what it should do.

Here is a prompt you can copy and change:

:::promptbuilder
Make your own copy-ready prompt. Add your name and press the copy button.
:::

Specific instructions usually lead to a more useful first version. If you say only "make me a cool website", the tool has to guess what you mean.

## Level 3: Build one part at a time

Ask for the basic page first. Once it works, ask for one change at a time.

For example:
1. "Make the heading a little bigger."
2. "Add more space around the button."
3. "Make the button show a different message when clicked."

After each change, look at the page again. This makes it easier to spot which change caused a problem.

## The whole game, as a flowchart

Follow the cards from left to right. If something breaks, fix it and run the project again.

:::stepcards
01|PICK YOUR IDEA|Choose one small project.
02|DESCRIBE IT|Tell the AI what you want to build.
03|GET THE FIRST VERSION|Let it suggest the code.
04|RUN YOUR PROJECT|Open it and try it out.
05|CHECK EVERY DETAIL|Test buttons, links and the mobile layout.
06|SAVE YOUR WORK|Keep a copy of the working version.
:::

## Level 4: Test before you celebrate

Try the page yourself. Click every button. Resize the browser. Check what happens if you leave a field empty or type something unexpected.

Ask yourself:
- Does every button do what its label says?
- Does the page work on a phone?
- Are there any strange errors?
- Can I explain what the main parts of the code do?

If something breaks, copy the exact error message and tell the coding assistant what you did just before it happened. Ask it to explain the fix, too.

## Level 5: Keep your progress safe

Before making a big change, save a copy of the working version. If you use Git, make a commit when the project works.

A useful request is:

:::safeprompt
Copy this request before asking for changes to your project.
:::

## Boss level: Don't trust every answer automatically

AI coding tools can misunderstand instructions, invent functions, or write code with security problems.

Keep these rules:
- Never paste passwords, API keys, or private information into a prompt.
- Do not publish code you have not tested.
- Be extra careful with logins, payments, personal data, and file uploads.
- Ask the tool to explain unfamiliar code. If you still don't understand it, pause and learn that part before relying on it.

## Quick checkpoint

Vibe coding can help you get started quickly, especially when you are learning. Your job is to give clear instructions, test what gets built, and decide whether the result is actually good.

You don't have to understand every line on day one. Try to understand a little more with every level.

**Mission for you:** Pick one tiny idea and build its first version. Keep it small, test it, and make one improvement at a time.
`,
    quiz: [
      { q: "What is the best way to start a first vibe-coding project?", options: ["Build a huge app with many features", "Choose one small idea with a clear goal", "Ask for random code and publish it"], answer: 1 },
      { q: "What should you do after the AI suggests a code change?", options: ["Assume it works", "Delete your old files", "Run the project and test the change"], answer: 2 },
      { q: "Which information should you never paste into an AI coding prompt?", options: ["A public colour preference", "A password or private API key", "The title of your project"], answer: 1 },
      { q: "What should you do when something breaks?", options: ["Share the exact error and explain what you did", "Keep changing random files", "Publish it anyway"], answer: 0 }
    ]
  },
];
