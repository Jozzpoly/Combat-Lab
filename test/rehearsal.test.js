import test from "node:test";
import assert from "node:assert/strict";

import { runPhenotypeStrategyMatrix } from "../src/rehearsal.js";

test("phenotype strategy matrix is finite diagnostic evidence", () => {
  const matrix = runPhenotypeStrategyMatrix();
  console.log("PHENOTYPE_STRATEGY_MATRIX", JSON.stringify(matrix));

  for (const phenotype of Object.values(matrix)) {
    for (const result of Object.values(phenotype)) {
      assert.equal(result.finite, true);
    }
  }
});
