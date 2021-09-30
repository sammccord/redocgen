#!/usr/bin/env node
const arg = require("arg");
const fs = require("fs");
const path = require("path");
const YAML = require("yaml");
const glob = require("glob");
const fm = require("front-matter");
const _ = require("lodash");
const React = require("react");
const { renderToString } = require("react-dom/server");
const { ServerStyleSheet } = require("styled-components");
const { createStore, Redoc } = require("redoc");
const defaultRedocConfig = require("./defaultRedocConfig");

const args = arg({
  "--out": String,
  "--redocConfig": String,
  "--name": String,
  "--content": String,
  "--cwd": String,

  // Aliases
  "-o": "--out",
  "-r": "--redocConfig",
  "-c": "--content",
  "-n": "--name",
});

// args._ = spec

const cwd = args["--cwd"] || process.cwd();
const contentDir = args["--content"] || "./content";
const outDir = path.resolve(cwd, args["--out"] || "./dist");
const name = args["--name"] || "openapi";

function parseJsonOrYaml(file) {
  const content = fs.readFileSync(path.resolve(cwd, file)).toString();
  if (file.endsWith(".json")) {
    return JSON.parse(content);
  } else {
    return YAML.parse(content);
  }
}

async function cli() {
  // parse openapi file
  fs.mkdirSync(outDir, { recursive: true });
  const specFile = _.first(args._);
  let spec = parseJsonOrYaml(specFile);
  // open content
  const contentPath = path.resolve(cwd, contentDir);
  const files = glob.sync("**/*.md", { cwd: contentPath });
  files.sort();
  // parse content headers
  files
    .map((f) => fm(fs.readFileSync(path.resolve(contentPath, f)).toString()))
    .forEach(({ attributes, body }) => {
      const { path, key, ...openapi } = attributes;
      if (!path) {
        spec = { ...spec, ...openapi };
      } else if (_.size(openapi) > 0) {
        _.set(spec, path, { ..._.get(spec, path, {}), ...openapi });
      }
      if (path && body) {
        if (_.isArray(path)) {
          path.forEach((p) =>
            _.set(spec, p + "." + (key || "description"), body)
          );
        } else _.set(spec, path + "." + (key || "description"), body);
      }
    });
  const pathToSpec = path.resolve(outDir, `./${name}.json`);
  fs.writeFileSync(pathToSpec, JSON.stringify(spec, null, 2));
  // generate redoc out
  const redocOptions = args["--redocConfig"]
    ? {
        ...defaultRedocConfig,
        ...parseJsonOrYaml(args["--redocConfig"]),
      }
    : defaultRedocConfig;

  const store = await createStore(spec, pathToSpec, redocOptions);
  const sheet = new ServerStyleSheet();
  const html = renderToString(
    sheet.collectStyles(React.createElement(Redoc, { store }))
  );
  const css = sheet.getStyleTags();
  // write to fs
  const pathToHtml = path.resolve(outDir, `./${name}.html`);
  fs.writeFileSync(pathToHtml, css + html);
}

cli();
