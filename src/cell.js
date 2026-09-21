import { normalize } from "./math.js";
import {
  resolveActorShieldContact,
  resolveBodyOverlap
} from "./contact.js";
import {
  driveActorInWorld,
  resolveActorWorld
} from "./world.js";
import { CELL_WALLS } from "./cell-config.js";

export function moveToward(actor, x, y, strength, dt) {
  const d = normalize(x - actor.x, y - actor.y, 0, 0);
  return driveActorInWorld(
    actor,
    d.x * strength,
    d.y * strength,
    dt,
    CELL_WALLS
  );
}

export function updatePressureGuardMotion(guard, player, dt) {
  guard.brace = 0.85;

  const playerInCentralRelation = Math.abs(player.x) < 42 && player.y > guard.y;
  const targetX = 0;
  const targetY = playerInCentralRelation ? Math.min(132, player.y - 34) : 86;
  const strength = playerInCentralRelation ? 0.62 : 0.42;

  guard.facing = Math.atan2(player.y - guard.y, player.x - guard.x);
  moveToward(guard, targetX, targetY, strength, dt);
}

export function resolveCellPair(player, guard) {
  const out = {
    shieldContact: null,
    bodyContact: null,
    worldContacts: 0
  };

  const shieldContact = resolveActorShieldContact(player, guard);
  if (shieldContact.contact) {
    out.shieldContact = shieldContact;
  } else {
    const bodyContact = resolveBodyOverlap(player, guard);
    if (bodyContact.contact) out.bodyContact = bodyContact;
  }

  out.worldContacts += resolveActorWorld(player, CELL_WALLS);
  out.worldContacts += resolveActorWorld(guard, CELL_WALLS);
  return out;
}
