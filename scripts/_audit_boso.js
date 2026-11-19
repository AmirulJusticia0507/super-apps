const http = require("http");
function p(u, b) {
  return new Promise((r) => {
    const q = http.request(u, { method: "POST", headers: { "Content-Type": "application/json" } }, (res) => {
      let d = "";
      res.on("data", (c) => (d += c));
      res.on("end", () => r(res.statusCode + ": " + d));
    });
    q.write(b);
    q.end();
  });
}
(async () => {
  console.log("=== Audit boso-jawa-ai ===");
  console.log(await p("http://127.0.0.1:8811/api/audit", '{"id":"boso-jawa-ai","model":"gpt-6-luna"}'));
  console.log("=== Security write boso-jawa-ai ===");
  console.log(await p("http://127.0.0.1:8811/api/security", '{"id":"boso-jawa-ai","status":"attention","findings":5,"reviewed":"2026-11-19","summary":"Test hasil audit"}'));
})();