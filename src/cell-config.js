import { ANCHOR_FIXTURES } from "./phenotype.js";

export const CELL_WALLS = Object.freeze([
  Object.freeze({ id: "barrier-left", x: -140, y: 70, w: 112, h: 30 }),
  Object.freeze({ id: "barrier-middle", x: 28, y: 70, w: 50, h: 30 }),
  Object.freeze({ id: "barrier-right", x: 112, y: 70, w: 28, h: 30 })
]);

export const PRESSURE_SPEC = Object.freeze({
  label: "Shared pressure body",
  body: Object.freeze({
    radius: 17,
    mass: 68,
    locomotorDrive: 7200,
    turnDrive: 560,
    support: 0.55
  }),
  equipment: Object.freeze([
    Object.freeze({ kind: "plain-gear", mass: 7 })
  ]),
  weapon: Object.freeze({ ...ANCHOR_FIXTURES.skirmisher.weapon })
});
