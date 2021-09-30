# Docs CLI

CLI/CMS to generate contentful [OpenAPI](http://spec.openapis.org/oas/v3.0.2#openapi-specification) specs and [ReDoc](https://github.com/Redocly/redoc) HTML from longform markdown.

## Installation

```sh
npm install --save-dev redocgen
```

## Build Binaries

You can use [pkg](https://www.npmjs.com/package/pkg) to bundle binaries for various operating systems.

```sh
npm run build
# /bin/redocgen-linux
# /bin/redocgen-macos
# /bin/redocgen-win.exe
```

## Usage

```sh
redocgen openapi.json # also accepts .yaml or .yml OpenAPI spec files
```

will output

```sh
/dist/openapi.json # Modified OpenApi document with added markdown content
/dist/openapi.html # Styles and static HTML ReDoc content
```

### Flags

| Flag| Description| Default|
| - | - | - |
| `--out`         | Directory to put build artifacts| `dist`|
| `--redocConfig` | Path to JSON file containing Redoc configuration passed to `Redoc` when compiling HTML. Properties will be merged with the default config. | See [`defaultRedocConfig.js` and [Redoc's Documentation](https://github.com/Redocly/redoc#redoc-options-object)|
| `--name`        | Name to give build artifacts| `openapi`|
| `--content`     | Content directory containing markdown|`content`|
| `--cwd`         | Working directory from which to resolve relative output, content, and configuration.| `process.cwd()`|


## Documentation

- [CommonMark Markdown](https://commonmark.org/)

By default, the CLI will look for `**/*.md` files within the `content` directory and attempt to insert the markdown into a given path within the provided `OpenAPI` document.

### [Using Front Matter](https://www.npmjs.com/package/front-matter)

The front matter `yaml` at the top of any markdown file can be any kind of valid [OpenApi Object](http://spec.openapis.org/oas/v3.0.2#openapi-specification).

The front matter must include a `path` key of type `string` where the parsed front matter yaml will be deeply inserted into the given OpenAPI document using [Lodash's `set` syntax](https://lodash.com/docs/4.17.15#set)

For example, given this OpenAPI spec and markdown file:

```json
{
  "openapi": "3.1",
  "info": {
    "title": "API Docs",
    "contact": {
      "name": "API Support",
      "email": "support@api.io"
    },
    "version": "1.0.0"
  }
}
```

```md
---
path: info
---
Some text
```

The outputted `dist/openapi.json` file will be:

```json
{
  "openapi": "3.1",
  "info": {
    "title": "Docs",
    "contact": {
      "name": "Support",
      "email": "support@api.io"
    },
    "version": "1.0.0",
    "description": "Some text"
  }
}
```

The front matter can optionally include a `key` key of type `string` where the markdown body will be inserted at the given `path`. This defaults to `description` (since ReDoc knows to render description fields as markdown) but can be valid string key to support decorating any part of the spec.

For example, given this OpenAPI spec and markdown file:

```json
{
  "openapi": "3.1",
  "info": {
    "title": "Docs"
  },
  "servers": [],
  "paths": {
    "/endpoint": {
      "post": {
        "operationId": "postRequest",
        "description": "Sends a request.",
        "parameters": [],
        "requestBody": {},
        "responses": {},
        "x-codeSamples": []
      }
    }
  }
}
```

```md
---
path: paths./endpoint.post.x-codeSamples[0]
key: source
lang: Shell
label: curl
---
curl
  --request POST
  --url https://api.io/endpoint
  --data '{}'
```

The outputted `dist/openapi.json` file will be:

```json
{
  "openapi": "3.1",
  "info": {
    "title": " Docs"
  },
  "servers": [],
  "paths": {
    "/endpoint": {
      "post": {
        "operationId": "postRequest",
        "description": "Sends a request.",
        "parameters": [],
        "requestBody": {},
        "responses": {},
        "x-codeSamples": [
          {
            "lang": "Shell",
            "label": "curl",
            "source": "\ncurl --request POST   --url https://api.io/endpoint   --data '{}'\n"
          }
        ]
      }
    }
  }
}
```

Since you can embed entire `OpenAPI` objects into front matter as `yaml`, you could theoretically build entire specs from scratch using nothing but the `path` and `key` fields!

