# `redocgen` Example

- [`redocgen` Example](#redocgen-example)
  - [Structure](#structure)
  - [Dependencies](#dependencies)
  - [Getting Started](#getting-started)
    - [Local Development](#local-development)
  - [Presentation Notes](#presentation-notes)

## Structure

```sh
├── packages
│   │   # Consumes `redocgen` package and publishes resulting artifacts
│   ├── docs
│   │   # Contains CLI for generating structured data + html based on markdown inputs
│   ├── redocgen
│   │   # Web UI that consumes `docs` package to render documentation
│   ├── web
```

## Dependencies

- [Node + NVM](https://github.com/nvm-sh/nvm)
- [PNPM](https://pnpm.io/)

## Getting Started

Clone the repo.

```bash
git clone https://github.com/sammccord/redocgen-sample.git
cd redocgen-sample
```

Get dependencies.

```bash
npm install -g pnpm
```

Get deps

```bash
pnpm install
```

### Local Development

```sh
pnpm run dev
```

## Presentation Notes

> Slide 1 - About Me

Hey everyone, I'm Sam McCord and I'm here to tell you about how we improved docs at Infura. Very excited to talk to you all, and I really hope this goes well. A little background on me, I've been developing software for just about 10 years, primarily in Javascript, lately in Typescript, and for the last few years I've been involved with crypto startups building internal and external facing applications for ShapeShift and Infura, ShapeShift at the time being a noncustodial exchange, and Infura obviously provides access to Ethereum nodes among a suite of other growing services but I'm sure you all know that already being an NFT company. I'm from the northeast originally, but currently live in Boulder Colorado with my wife, 2 dogs, and cat. Lately I've been playing Deathloop and the Mass Effect remaster, and on the weekends I coach kids muay thai, drink margaritas, and go to the movies. And just to preface this presentation, I received consent from my old coworkers at Infura to discuss this subject, and exhibit some tech and techniques I had a hand in implementing there.

> Slide 2 - A Problem

So when I joined Infura we had a problem with our developer facing documentation at infura.io/docs. It was:

- Unstructured
  - Just a disorganized folder of markdown sync'd to s3
  - Plain markdown doesn't leave us with a whole lot of flexibility if we want to update the view and get creative with any interactivity or metadata.
  - Plain text source of truth meant that implementing features like search, for example, would've been difficult, slow, expensive, and missing context that developers might want to have in a search hit, developers being our primary audience.
- Slow
  - Originally, the application was a SPA (single page application), so there was no SEO since s3 was queried and crawled after page load.
  - Later, when we refactored to server side rendering to improve our SEO, we still queried the bucket most every request, then crawled the s3 bucket based on route params and rendered a markdown file. This was still less than optimal and still slow.
- Difficult to maintain 
  - The code to query, parse and traverse the docs bucket was legacy spaghetti and difficult to maintain.
- Hard to test
  - In other words, there were no tests. If there were, it would've just involved text processing. We knew we could do better.

> Slide 3 - Ideal Solution

Shocker here these bullets are the complete opposite of the last bullets.

- Structured
  - Really we want our docs to originate in some sort of structured format like JSON or yaml, and ideally adhering to some documented and well understood specification like OpenAPI (which is what we went with), but it doesn't necesarily have to as long as there is some consistent schema.
  - With a consistent data structure, where descriptive text and metadata live together, UI's can be iterated on more quickly and get more creative without altering the underlying content.
  - Features like search become easier to implement, so instead of full text search, you're traversing some known data structure.
- Fast / Static
  - Once you have this structured content in place, there's no reason the docs couldn't be a static, compiled artifact to help the server do as little work as possible.
  - So if the data can be static, then it stands to reason that entire pages could be statically generated which would be optimal for slow connections and environments without javascript enabled.
- Easy to maintain
  - In some cases, like with the Ethereum RPC api and Filecoin API there was prior structured we could scrape and extend with our own content. The easiest code to maintain is code you never have to write.

> Slide 4 - The New New

- OpenAPI
  - We chose this because it's a well understood schema for documenting API's, with a good ecosystem and solid knowledge availability.
  - Good extensions like support for code samples in many languages.
- Redoc
  - Redoc was a hot new OpenAPI renderer for React we had seen in use in a few projects that was configurable enough and had built in support for search with good syntax highlighting for rich text as markdown. It also had a cli that could compile static html given a spec, which we wanted to keep page loads quick.
  - We all decided that since resources were limited, we'd start here, and if we wanted different designs or different functionality Redoc didn't offer down the road, it wouldn't be a huge lift to redesign the pages now that the docs were structured.

> Slide 5 - Life is good, but it could be better

**redocgen - A small CMS/CLI to compose contentful structured data and static HTML from longform markdown**

This new approach was working great, and everyone thought Redoc was super cool, but there was a pain point we didn't anticipate. As it turns out, writing longform rich markdown for OpenAPI description fields in JSON or yaml is a real pain in the ass, and so is hand formatting codesamples for your operations. When you're writing markdown in JSON or YAML you also don't get syntax highlighting, which is a bummer.

So I quickly hacked together this small CLI that would take a folder full of markdown files, parse out and insert any front matter that may be at the head, and compile a spec with longform rich text inserted in all the spots you'd expect. It's called redocgen and now I'll show you a quick example of how it works from end to end.

DEMO TIME