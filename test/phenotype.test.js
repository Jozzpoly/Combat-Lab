import test from "node:test";
import assert from "node:assert/strict";

import {
  ANCHOR_FIXTURES,
  createActor,
  derivePhenotype,
  fitsGap,
  withEquipment
} from "../src/phenotype.js";
import {
  resolveBodyOverlap,
  shieldIntercept
} from "../src/contact.js";
import { runRoute } from "../src/world.js";

test("anchors expose shared properties rather than class authority", () => {
  for (const spec of Object.values(ANCHOR_FIXTURES)) {
    assert.equal(Object.hasOwn(spec, "class"), false);
    assert.ok(spec.body.mass > 0);
    assert.ok(spec.body.radius > 0);
    assert.ok(spec.body.locomotorDrive > 0);
    assert.ok(spec.weapon);
  }
});

test("brace trades mobility for displacement resistance through one shared derivation", () => {
  for (const spec of Object.values(ANCHOR_FIXTURES)) {
    const neutral = derivePhenotype(spec, 0);
    const braced = derivePhenotype(spec, 1);

    assert.ok(braced.maxSpeed < neutral.maxSpeed);
    assert.ok(braced.acceleration < neutral.acceleration);
    assert.ok(braced.turnRate < neutral.turnRate);
    assert.ok(braced.contactAuthority > neutral.contactAuthority);
  }
});

test("heavy body yields less than light body under the same overlap", () => {
  const heavy = createActor(ANCHOR_FIXTURES.bulwark, { id: "heavy", x: 0, y: 0 });
  const light = createActor(ANCHOR_FIXTURES.skirmisher, { id: "light", x: 30, y: 0 });

  const result = resolveBodyOverlap(heavy, light);

  assert.equal(result.contact, true);
  assert.ok(result.movedA > 0);
  assert.ok(result.movedB > 0);
  assert.ok(result.movedA < result.movedB);
});

test("braced heavy body holds more space without becoming immovable", () => {
  const neutralHeavy = createActor(ANCHOR_FIXTURES.bulwark, { x: 0, y: 0 });
  const neutralLight = createActor(ANCHOR_FIXTURES.skirmisher, { x: 30, y: 0 });
  const neutral = resolveBodyOverlap(neutralHeavy, neutralLight);

  const bracedHeavy = createActor(ANCHOR_FIXTURES.bulwark, { x: 0, y: 0 });
  bracedHeavy.brace = 1;
  const attackingLight = createActor(ANCHOR_FIXTURES.skirmisher, { x: 30, y: 0 });
  const braced = resolveBodyOverlap(bracedHeavy, attackingLight);

  assert.ok(braced.movedA > 0);
  assert.ok(braced.movedA < neutral.movedA);
  assert.ok(braced.movedB > neutral.movedB);
});

test("shield occupancy is geometric and directional", () => {
  const heavy = createActor(ANCHOR_FIXTURES.bulwark, { x: 0, y: 0, facing: 0 });

  const frontal = shieldIntercept(heavy, {
    ax: 70, ay: 0,
    bx: 0, by: 0
  });
  const rear = shieldIntercept(heavy, {
    ax: -70, ay: 0,
    bx: -30, by: 0
  });

  assert.ok(frontal);
  assert.equal(rear, null);
});

test("body envelope creates a real route difference without a class gate", () => {
  const gap = 34;

  assert.equal(fitsGap(ANCHOR_FIXTURES.skirmisher, gap), true);
  assert.equal(fitsGap(ANCHOR_FIXTURES.bulwark, gap), false);
  assert.equal(fitsGap(ANCHOR_FIXTURES.hybrid, gap), false);
});

test("continuity hybrid lies between anchor extremes on core derived behavior", () => {
  const heavy = derivePhenotype(ANCHOR_FIXTURES.bulwark, 0);
  const hybrid = derivePhenotype(ANCHOR_FIXTURES.hybrid, 0);
  const light = derivePhenotype(ANCHOR_FIXTURES.skirmisher, 0);

  assert.ok(heavy.totalMass > hybrid.totalMass);
  assert.ok(hybrid.totalMass > light.totalMass);

  assert.ok(heavy.maxSpeed < hybrid.maxSpeed);
  assert.ok(hybrid.maxSpeed < light.maxSpeed);

  assert.ok(heavy.acceleration < hybrid.acceleration);
  assert.ok(hybrid.acceleration < light.acceleration);

  assert.ok(heavy.turnRate < hybrid.turnRate);
  assert.ok(hybrid.turnRate < light.turnRate);

  const heavyBraced = derivePhenotype(ANCHOR_FIXTURES.bulwark, 1);
  const hybridBraced = derivePhenotype(ANCHOR_FIXTURES.hybrid, 1);
  const lightBraced = derivePhenotype(ANCHOR_FIXTURES.skirmisher, 1);

  assert.ok(heavyBraced.contactAuthority > hybridBraced.contactAuthority);
  assert.ok(hybridBraced.contactAuthority > lightBraced.contactAuthority);
});


test("ordinary equipment burden moves one unchanged body smoothly through phenotype space", () => {
  const naked = withEquipment(ANCHOR_FIXTURES.skirmisher, [], "same body / no load");
  const medium = withEquipment(
    ANCHOR_FIXTURES.skirmisher,
    [{ kind: "armour", mass: 20 }],
    "same body / medium load"
  );
  const heavyLoad = withEquipment(
    ANCHOR_FIXTURES.skirmisher,
    [{ kind: "armour", mass: 50 }],
    "same body / heavy load"
  );

  const a = derivePhenotype(naked, 0);
  const b = derivePhenotype(medium, 0);
  const c = derivePhenotype(heavyLoad, 0);

  assert.equal(naked.body.radius, medium.body.radius);
  assert.equal(medium.body.radius, heavyLoad.body.radius);
  assert.equal(naked.body.locomotorDrive, medium.body.locomotorDrive);
  assert.equal(medium.body.locomotorDrive, heavyLoad.body.locomotorDrive);

  assert.ok(a.totalMass < b.totalMass && b.totalMass < c.totalMass);
  assert.ok(a.maxSpeed > b.maxSpeed && b.maxSpeed > c.maxSpeed);
  assert.ok(a.acceleration > b.acceleration && b.acceleration > c.acceleration);
  assert.ok(a.turnRate > b.turnRate && b.turnRate > c.turnRate);
  assert.ok(a.contactAuthority < b.contactAuthority && b.contactAuthority < c.contactAuthority);
});


test("route envelope is demonstrated by actual world collision, not a diameter predicate", () => {
  const walls = [
    { id: "left-wall", x: -100, y: 0, w: 83, h: 120 },
    { id: "right-wall", x: 17, y: 0, w: 83, h: 120 }
  ];

  const light = createActor(ANCHOR_FIXTURES.skirmisher, { x: 0, y: 150 });
  const heavy = createActor(ANCHOR_FIXTURES.bulwark, { x: 0, y: 150 });

  const lightResult = runRoute(light, {
    walls,
    inputY: -1,
    seconds: 1.6
  });
  const heavyResult = runRoute(heavy, {
    walls,
    inputY: -1,
    seconds: 1.6
  });

  assert.ok(lightResult.y < 70, `light body should enter corridor; y=${lightResult.y}`);
  assert.ok(heavyResult.y > 120, `heavy body should be stopped at corridor mouth; y=${heavyResult.y}`);
  assert.ok(heavyResult.blockedFrames > lightResult.blockedFrames);
});
