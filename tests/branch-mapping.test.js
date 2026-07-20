const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const scriptPath = path.join(__dirname, "..", "script.js");
const scriptSource = fs.readFileSync(scriptPath, "utf8");

const context = {
  console,
  window: {},
  document: {
    addEventListener() {},
    getElementById() {
      return {
        value: "",
        textContent: "",
        innerHTML: "",
        addEventListener() {},
        insertAdjacentHTML() {},
        querySelector() { return null; },
        closest() { return null; },
        setAttribute() {},
        getAttribute() { return null; }
      };
    },
    querySelectorAll() { return []; }
  },
  fetch: async () => ({ ok: true, text: async () => "" }),
  alert() {},
  URL,
  Blob,
  Date,
  Math,
  Array,
  Object,
  String,
  Number,
  Boolean,
  RegExp,
  Map,
  Set,
  Promise,
  parseInt,
  parseFloat,
  isNaN,
  NaN,
  Infinity
};
context.globalThis = context;

vm.createContext(context);
vm.runInContext(scriptSource, context);

const rawRows = [
  {
    "Dealer Branch": "Branch 4",
    "Service Centre": "Service Center 2",
    "Customer Name": "Asha Menon",
    "Case Status": "Open",
    "Complaint Category": "Service Delay",
    Date: "2025-01-01"
  }
];

const prepared = context.prepareRows(rawRows, "branch-mapping-test");
assert.strictEqual(prepared.rows[0].branch, "Branch 4", "branch should map from Dealer Branch");
assert.strictEqual(prepared.rows[0].service_centre, "Service Center 2", "service centre should map from Service Centre");
assert.strictEqual(prepared.rows[0].status, "Open", "status should normalize correctly");

console.log("branch-mapping regression test passed");
