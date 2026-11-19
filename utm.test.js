"use strict";

const test = require("node:test");
const assert = require("node:assert");
const { buildUtmUrl } = require("./script.js");

const base = { source: "LinkedIn", medium: "Social", campaign: "Spring Launch", term: "", content: "" };

test("builds a link and cleans values", () => {
  const r = buildUtmUrl("example.com/page", base);
  assert.strictEqual(
    r.url,
    "https://example.com/page?utm_source=linkedin&utm_medium=social&utm_campaign=spring-launch"
  );
});

test("keeps existing query params and fragment", () => {
  const r = buildUtmUrl("https://example.com/p?ref=abc#section", base);
  assert.ok(r.url.includes("ref=abc"));
  assert.ok(r.url.endsWith("#section"));
  assert.ok(r.url.indexOf("?") < r.url.indexOf("#"));
});

test("overwrites existing utm values instead of duplicating", () => {
  const r = buildUtmUrl("https://example.com/?utm_source=old", base);
  assert.strictEqual((r.url.match(/utm_source/g) || []).length, 1);
  assert.ok(r.url.includes("utm_source=linkedin"));
});

test("optional fields are added only when filled", () => {
  const r = buildUtmUrl("https://example.com", { ...base, term: "Waste Disposal", content: "v2" });
  assert.ok(r.url.includes("utm_term=waste-disposal"));
  assert.ok(r.url.includes("utm_content=v2"));
});

test("clean=false keeps the original value", () => {
  const r = buildUtmUrl("https://example.com", { ...base, campaign: "Spring" }, { clean: false });
  assert.ok(r.url.includes("utm_campaign=Spring"));
});

test("rejects empty or invalid URL", () => {
  assert.ok(buildUtmUrl("", base).error);
  assert.ok(buildUtmUrl("not a url", base).error);
  assert.ok(buildUtmUrl("ftp://example.com", base).error);
  assert.ok(buildUtmUrl("http://localhost", base).error);
});

test("requires source, medium and campaign", () => {
  assert.match(buildUtmUrl("https://example.com", { ...base, source: " " }).error, /utm_source/);
  assert.match(buildUtmUrl("https://example.com", { ...base, medium: "" }).error, /utm_medium/);
  assert.match(buildUtmUrl("https://example.com", { ...base, campaign: "" }).error, /utm_campaign/);
});
