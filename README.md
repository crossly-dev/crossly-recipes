# Crossly automation recipes

44 ready-to-import automations for Crossly sellers. Pricing ladders, offer handling, ship-by reminders, crossposting, closet sharing, and the notifications that stop a problem from being invisible.

Every recipe here is **validated against the live automation catalog** — if one references an action that does not exist, or misses a required field, the build fails and nothing ships. A recipe library whose recipes do not import is worse than no library.

## Import one

Grab any file from `recipes/` and import it in Crossly under **Automations → Import**, or:

```bash
crossly automation import-recipes --payload "$(cat recipes/pricing/nudge-stale-listings-down-5-after-30-days.json)"
```

Or import the lot:

```bash
crossly automation import-recipes --payload "$(cat recipes/all.json)"
```

**Imported rules arrive paused.** Read them, edit the numbers to your own floors, then turn them on. Pass `activate=true` if you really want them live on arrival — but the defaults in here are examples, not advice about your margins.

## What's in it

See [INDEX.md](INDEX.md) for every recipe with its trigger and action.

| category | what it covers |
|---|---|
| `pricing` | age ladders, market repricing, timed sales, raising prices on hot items |
| `offers` | lowball filtering, offers to likers, eBay best-offer handling |
| `messaging` | thank-yous, scam archiving, instant answers to common questions |
| `fulfilment` | ship-by warnings, overdue chasing, dispute alerts, review requests |
| `inventory` | low stock, delist-at-zero, restock flagging |
| `crossposting` | crosspost on create, relist stale, archive dead stock |
| `engagement` | closet sharing, follow-back, community pool, niche following |
| `housekeeping` | disconnect alerts, vacation mode, daily digests, webhooks |

## Five fields need your values

Some recipes cannot be complete — a Slack notification needs *your* integration id, a canned reply needs *your* canned response id. Those carry a `REPLACE_WITH_…` placeholder that is deliberately **not** a valid id, so importing without editing fails loudly rather than sending a blank message to a customer.

## Read before you enable

Three of these can cost you money if you enable them without thinking, which is why they are examples rather than defaults:

- **Price ladders compound.** Importing all three ladder steps means an item can take 5%, then 10%, then 15%. Every recipe here has a `floor` — keep it, and set it to a number you would actually accept after fees.
- **`sync_price_to_lowest` is a race to the bottom by design.** It is correct for genuinely interchangeable stock and wrong for anything where your photos or condition are the differentiator.
- **Auto-accept is a sale you cannot take back.** The offer recipes accept high and counter in the middle on purpose. "Within 10% of asking" is a much wider band than it sounds once fees and shipping come out.

## Writing your own

The shape is small:

```json
{
  "schemaVersion": 1,
  "name": "Drop 5% after 30 days",
  "description": "What it does and why.",
  "trigger":   { "type": "listing.age_reached", "config": { "ageDays": 30 } },
  "condition": { "type": "listing.price_above", "config": { "threshold": 25 } },
  "action":    { "type": "listing.price_drop",  "config": { "mode": "percent", "percent": 5, "floor": 12 } }
}
```

`condition` is optional. `crossly automation catalog` lists every trigger, condition and action with its config fields, which is the authoritative answer — this library is just a set of worked examples from it.

## Contributing

Recipes live in `src/*.mjs`, not in `recipes/` — that directory is **generated**. Add yours to the right category file and run:

```bash
npx tsx build.mjs
```

It validates against the catalog and regenerates the JSON, the bundle and the index. A recipe that would not import cannot be committed.

## License

MIT
