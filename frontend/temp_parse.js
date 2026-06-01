const fs = require("fs");
const parser = require("@babel/parser");
const path = "src/pages/InstructorCourseBuilder.jsx";
const code = fs.readFileSync(path, "utf8");
try {
  parser.parse(code, { sourceType: "module", plugins: ["jsx", "classProperties", "decorators-legacy"] });
  console.log("parsed");
} catch (err) {
  console.error(err.message);
  if (err.loc) console.error("loc", err.loc);
  process.exit(1);
}
