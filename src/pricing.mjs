/**
 * Pricing automations.
 *
 * The category where a bad recipe costs real money, so these lean
 * conservative: every discount has a floor, every repricer has a minimum
 * change, and nothing here can walk a price to zero over time.
 *
 * A note that applies to the whole file: Crossly prices are DOLLARS on
 * listings (decimal) and CENTS where a field name says `Cents`. The catalog
 * field names carry the unit; do not translate between them by eye.
 */

export const pricing = [
  {
    name: 'Nudge stale listings down 5% after 30 days',
    description:
      'The workhorse. Anything sitting a month gets a small cut with a floor, so it keeps moving ' +
      'without you watching it. The floor is the point — without one, a repeating discount walks ' +
      'a price to nothing over a long enough listing life.',
    trigger: { type: 'listing.age_reached', config: { ageDays: 30 } },
    action: {
      type: 'listing.price_drop',
      config: { mode: 'percent', percent: 5, floor: 12, minDaysListed: 30 },
    },
  },

  {
    name: 'Ladder: 5% at 30 days, 10% at 60, 15% at 90',
    description:
      'Three rules, not one. Import all three — each fires at its own age and they compound into ' +
      'a ladder. Kept as separate recipes rather than one clever rule because you will want to ' +
      'turn off the aggressive end without losing the gentle one.',
    trigger: { type: 'listing.age_reached', config: { ageDays: 60 } },
    action: {
      type: 'listing.price_drop',
      config: { mode: 'percent', percent: 10, floor: 12, minDaysListed: 60 },
    },
  },
  {
    name: 'Ladder step three — 15% at 90 days',
    description: 'The last step before you should be asking whether to relist or archive instead.',
    trigger: { type: 'listing.age_reached', config: { ageDays: 90 } },
    action: {
      type: 'listing.price_drop',
      config: { mode: 'percent', percent: 15, floor: 10, minDaysListed: 90 },
    },
  },

  {
    name: 'Drop the price on anything with no views after two weeks',
    description:
      'Age alone is a blunt signal — an item can be three weeks old and getting looked at daily. ' +
      'No views after two weeks is the sharper one: nobody is even seeing it, so the price is not ' +
      'the only problem, but it is the one you can fix in a second.',
    trigger: { type: 'listing.no_views_after', config: { ageDays: 14, maxViews: 5 } },
    action: { type: 'listing.price_drop', config: { mode: 'percent', percent: 8, floor: 10 } },
  },

  {
    name: 'Undercut the market by 2% when a competitor goes lower',
    description:
      'Reacts to the market rather than the calendar. `minChangeCents` stops a penny war: without ' +
      'it, two sellers running this same recipe against each other will repost all day for 1c at ' +
      'a time and both end up at the floor.',
    trigger: { type: 'market.competitor_underprice', config: { minDeltaPercent: 3 } },
    action: {
      type: 'listing.reprice',
      config: {
        strategy: 'undercut',
        undercutByPct: 2,
        minChangeCents: 100,
        minSampleSize: 3,
        floorIsNet: true,
        floorCents: 1200,
      },
    },
  },

  {
    name: 'Hold the median of comparable sold listings',
    description:
      'For commodity stock where you are not trying to win on price, only to not be the outlier. ' +
      '`minSampleSize` matters: repricing off one comparable is repricing off a coincidence.',
    trigger: { type: 'schedule.daily', config: { hourUtc: 9 } },
    action: {
      type: 'listing.reprice',
      config: { strategy: 'median', percentOfMedian: 100, minSampleSize: 5, minChangeCents: 200 },
    },
  },

  {
    name: 'Raise the price 5% on anything getting a lot of attention',
    description:
      'The direction nobody automates and everybody should. If an item is pulling views well above ' +
      'your norm, it is underpriced — and finding out by selling it in an hour is the expensive way.',
    trigger: {
      type: 'listing.metric_threshold',
      config: { metric: 'views', operator: 'gte', value: 200 },
    },
    action: { type: 'listing.price_raise', config: { mode: 'percent', percent: 5 } },
  },

  {
    name: 'Weekend flash sale: 15% off Friday evening, back up Sunday night',
    description:
      'A timed discount that reverts on its own, so you are not relying on remembering. Set the ' +
      'dates each week, or point a cron at it. Times are ISO-8601 and are interpreted as written — ' +
      'edit them before importing.',
    trigger: { type: 'schedule.cron', config: { cron: '0 17 * * 5', timezone: 'America/New_York' } },
    action: {
      type: 'listing.timed_discount',
      config: {
        percentOff: 15,
        startsAt: '2026-01-02T17:00:00-05:00',
        endsAt: '2026-01-04T21:00:00-05:00',
      },
    },
  },

  {
    name: 'Match the lowest listed price, with a floor',
    description:
      'Race-to-the-bottom by design, so the floor is doing all the work. Use on genuinely ' +
      'interchangeable stock where the buyer is sorting by price and nothing else. Do not use on ' +
      'anything where condition or photos are the differentiator.',
    trigger: { type: 'schedule.interval', config: { intervalMinutes: 360 } },
    action: { type: 'listing.sync_price_to_lowest', config: { floor: 15 } },
    condition: { type: 'listing.has_tags', config: { tags: ['commodity'], matchAll: false } },
  },

  {
    name: 'Bundle discount: 15% off when a buyer takes three',
    description:
      'Moves slow stock in groups and raises average order value without discounting anything on ' +
      'its own. Works best on same-category items a buyer would plausibly want together.',
    trigger: { type: 'schedule.daily', config: { hourUtc: 8 } },
    action: { type: 'listing.bundle_promo', config: { itemsRequired: 3, percentOff: 15 } },
  },

  {
    name: 'Gentle decay: 2% a week, never below your cost band',
    description:
      'For sellers who would rather not see a listing jump 15% overnight. Small and frequent ' +
      'reads as ordinary price movement to a returning buyer; one big cut reads as desperation ' +
      'and teaches them to wait for the next one.',
    trigger: { type: 'schedule.cron', config: { cron: '0 10 * * 1' } },
    action: {
      type: 'listing.reprice',
      config: { strategy: 'decay', decayPct: 2, floorIsNet: true, floorCents: 1500, minChangeCents: 50 },
    },
  },

  {
    name: 'Premium hold — never discount tagged items',
    description:
      'Not an automation so much as a guard rail you can point at. Pair it with any ladder above ' +
      'by tagging the items you refuse to discount, so a blanket rule cannot reach them.',
    trigger: { type: 'listing.age_reached', config: { ageDays: 45 } },
    condition: { type: 'listing.has_tags', config: { tags: ['premium', 'rare'], matchAll: false } },
    action: { type: 'listing.add_tag', config: { tag: 'aged-review' } },
  },
];
