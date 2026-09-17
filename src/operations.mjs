/**
 * Fulfilment, inventory, crossposting and housekeeping.
 *
 * Less glamorous than pricing, and this is where the money actually leaks: a
 * late ship costs a metric that costs placement, a zero-quantity listing left
 * live costs a cancellation, and a disconnected platform costs everything it
 * was doing until somebody notices.
 */

export const fulfilment = [
  {
    name: 'Warn me a day before a ship-by date',
    description:
      'Every marketplace punishes late shipping harder than it rewards fast shipping, and the ' +
      'penalty lands on placement rather than on the order. One notification the day before is ' +
      'the cheapest insurance in this list.',
    trigger: { type: 'order.ship_by_soon', config: {} },
    action: {
      type: 'notify.telegram',
      config: { template: 'Ship-by tomorrow: {{order.platform}} #{{order.id}} — {{listing.title}}' },
    },
  },

  {
    name: 'Shout when an order is overdue',
    description:
      'Deliberately louder than the reminder above. By the time this fires the metric damage has ' +
      'started, so it goes to email rather than a chat channel you may have muted.',
    trigger: { type: 'order.ship_by_overdue', config: {} },
    action: {
      type: 'notify.email_user',
      config: {
        subject: 'OVERDUE: an order has passed its ship-by date',
        body:
          'Order {{order.id}} on {{order.platform}} is past its ship-by date. Shipping it now ' +
          'limits the damage; cancelling costs more than a late ship on most platforms.',
      },
    },
  },

  {
    name: 'Chase anything unshipped after three days',
    description:
      'Catches the order that never made it onto your desk — the one where the notification ' +
      'arrived while you were driving and was never seen again.',
    trigger: { type: 'order.unshipped_after', config: { daysOverdue: 3 } },
    action: {
      type: 'notify.email_user',
      config: {
        subject: 'Unshipped for 3 days',
        body: 'Order {{order.id}} on {{order.platform}} has not shipped. Still have it?',
      },
    },
  },

  {
    name: 'Ask for a review once it is actually delivered',
    description:
      'On delivery, not on shipment. Asking while the parcel is still in transit is the fastest ' +
      'way to get a review about the courier.',
    trigger: { type: 'order.delivered', config: {} },
    action: {
      type: 'inbox.send_message',
      config: {
        template:
          'Hope it arrived safely! If you are happy with it, a quick review really helps a small ' +
          'shop like mine. Any problems at all, message me first and I will sort it.',
      },
    },
  },

  {
    name: 'Alert me the moment an order is disputed',
    description:
      'Disputes have clocks, and the clocks are short. This is the one notification worth ' +
      'interrupting you for.',
    trigger: { type: 'order.disputed', config: {} },
    action: {
      type: 'notify.telegram',
      config: {
        template: 'DISPUTE on {{order.platform}} #{{order.id}}. Response windows are short.',
      },
    },
  },

  {
    name: 'Log returns to your CRM',
    description:
      'A return is a customer-history fact, not just an accounting one. Replace `integrationId` ' +
      'with your own CRM connection id.',
    trigger: { type: 'order.returned', config: {} },
    action: { type: 'crm.push_buyer', config: { integrationId: 'REPLACE_WITH_INTEGRATION_ID' } },
  },
];

export const inventory = [
  {
    name: 'Tell me before something runs out, not after',
    description:
      'Fires at the last unit rather than at zero. Zero is already a problem; one is a decision.',
    trigger: { type: 'inventory.low_stock', config: { threshold: 1 } },
    action: {
      type: 'notify.telegram',
      config: { template: 'Low stock: {{listing.title}} — {{inventory.quantity}} left.' },
    },
  },

  {
    name: 'Delist everywhere when quantity hits zero',
    description:
      'The cancellation preventer. A sold-out listing left live on a second marketplace is an ' +
      'order you have to cancel, and a cancellation costs more than the sale was worth on most ' +
      'platforms.',
    trigger: { type: 'inventory.zero_qty', config: {} },
    action: { type: 'listing.delist', config: {} },
  },

  {
    name: 'Flag restockable items for review when they sell out',
    description:
      'Tags rather than reorders. Nothing here knows your supplier or your margins, so the useful ' +
      'automation is to put it in front of you, not to act for you.',
    trigger: { type: 'inventory.zero_qty', config: {} },
    condition: { type: 'listing.has_tags', config: { tags: ['restockable'], matchAll: false } },
    action: { type: 'listing.add_tag', config: { tag: 'needs-restock' } },
  },
];

export const crossposting = [
  {
    name: 'Crosspost every new listing to your main platforms',
    description:
      'The reason most people are here. Edit `targetPlatforms` to the ones you are actually ' +
      'connected to — an unconnected platform is a failed job, not a silent skip.',
    trigger: { type: 'listing.created', config: {} },
    action: {
      type: 'listing.expand_platforms',
      config: { targetPlatforms: ['poshmark', 'mercari', 'depop', 'ebay'] },
    },
  },

  {
    name: 'Crosspost only items above $25',
    description:
      'Crossposting has a real per-item cost in time and in platform limits. On low-value stock ' +
      'the fees and the shipping usually eat the difference, so this keeps the fan-out for items ' +
      'where it pays.',
    trigger: { type: 'listing.created', config: {} },
    condition: { type: 'listing.price_above', config: { threshold: 25 } },
    action: {
      type: 'listing.expand_platforms',
      config: { targetPlatforms: ['poshmark', 'mercari', 'ebay'] },
    },
  },

  {
    name: 'Relist anything still sitting at 45 days',
    description:
      'On several marketplaces a relist resets the listing date and puts an item back into the ' +
      'newest-first feed, which is most of where discovery comes from. Cheaper than a discount ' +
      'and often works better.',
    trigger: { type: 'listing.age_reached', config: { ageDays: 45 } },
    action: {
      type: 'listing.auto_relist',
      config: { minDaysListed: 45, copyPhotos: true, platforms: ['poshmark', 'depop'] },
    },
  },

  {
    name: 'Archive anything a year old with nothing to show for it',
    description:
      'Housekeeping nobody does by hand. An item that has been listed a year with almost no views ' +
      'is not priced wrong, it is the wrong item — and it is costing you listing slots and making ' +
      'your own analytics useless.',
    trigger: { type: 'schedule.cron', config: { cron: '0 3 1 * *' } },
    action: { type: 'listing.archive_stale', config: { olderThanDays: 365, viewsBelow: 25 } },
  },
];

export const housekeeping = [
  {
    name: 'Tell me immediately when a platform disconnects',
    description:
      'The highest-value notification in the whole list. A disconnected platform fails silently — ' +
      'crossposts stop, sales stop importing, delists stop — and the usual way people find out is ' +
      'noticing a week of no sales. Sessions expire constantly; this is not an edge case.',
    trigger: { type: 'platform.disconnected', config: {} },
    action: {
      type: 'notify.telegram',
      config: {
        template:
          '{{platform}} disconnected. Crossposts, sales import and delists are stopped for it ' +
          'until you reconnect.',
      },
    },
  },

  {
    name: 'Turn on vacation mode everywhere with one rule',
    description:
      'Flip this rule on before you travel instead of visiting six apps. Turning it OFF is a ' +
      'second import of the same recipe with `enabled: false` — kept as two so neither can fire ' +
      'by accident.',
    trigger: { type: 'schedule.window', config: { startsAt: '2026-07-01T00:00:00Z', endsAt: '2026-07-14T00:00:00Z' } },
    action: {
      type: 'account.toggle_vacation',
      config: {
        enabled: true,
        message: 'Away until the 14th — orders placed now ship as soon as I am back. Thank you!',
      },
    },
  },

  {
    name: 'Daily sales digest to Slack',
    description:
      'A once-a-day summary instead of a ping per sale. Per-sale notifications are exciting for a ' +
      'week and muted forever after, which means you also miss the ones that matter.',
    trigger: { type: 'schedule.daily', config: { hourUtc: 23 } },
    action: {
      type: 'notify.slack',
      config: {
        integrationId: 'REPLACE_WITH_INTEGRATION_ID',
        template: 'Today: {{stats.salesCount}} sales, {{stats.grossFormatted}} gross.',
      },
    },
  },

  {
    name: 'Push every sale to a webhook',
    description:
      'For anyone wiring Crossly into their own system — a spreadsheet, an accounting tool, a ' +
      'Discord bot they wrote. The generic escape hatch when no built-in integration fits.',
    trigger: { type: 'listing.sold', config: {} },
    action: {
      type: 'notify.webhook',
      config: {
        integrationId: 'REPLACE_WITH_INTEGRATION_ID',
        template:
          '{"event":"sale","platform":"{{order.platform}}","orderId":"{{order.id}}","title":"{{listing.title}}"}',
      },
    },
  },
];

export const engagement = [
  {
    name: 'Share your whole closet twice a day',
    description:
      'On Poshmark, sharing is the feed. Twice a day at the hours buyers are actually browsing ' +
      'beats six times at 3am, and `delayMs` keeps it looking like a person rather than a script.',
    trigger: { type: 'schedule.cron', config: { cron: '0 13,23 * * *' } },
    action: { type: 'listing.share_closet', config: { maxItems: 200, delayMs: 2500, order: 'oldest_first' } },
  },

  {
    name: 'Follow back everyone who follows you',
    description:
      'Reciprocity is most of how closet platforms distribute reach. Capped per run because ' +
      'follow bursts are exactly what rate limiters look for.',
    trigger: { type: 'schedule.interval', config: { intervalMinutes: 240 } },
    action: { type: 'social.follow_back', config: { maxPerRun: 40 } },
  },

  {
    name: 'Share to the community pool',
    description:
      'Other Crossly sellers share your items and you share theirs. Reach you cannot get alone, ' +
      'and the cap keeps your account looking human.',
    trigger: { type: 'schedule.interval', config: { intervalMinutes: 180 } },
    action: { type: 'network.share_pool', config: { maxSharesPerRun: 30 } },
  },

  {
    name: 'Follow sellers in your niche',
    description:
      'Proactive rather than reciprocal: follows people who sell the brand you sell, whose ' +
      'followers are your buyers. Set `brand` to something you actually stock.',
    trigger: { type: 'schedule.daily', config: { hourUtc: 15 } },
    action: {
      type: 'social.brand_follow_proactive',
      config: { brand: 'REPLACE_WITH_A_BRAND_YOU_SELL', platform: 'poshmark', maxFollowsPerRun: 25 },
    },
  },

  {
    name: 'Thank people who comment',
    description:
      'A comment is a public signal other buyers see. Replying keeps it at the top and makes the ' +
      'listing look alive, which is worth more than the reply itself.',
    trigger: { type: 'listing.commented', config: {} },
    action: {
      type: 'inbox.send_message',
      config: { template: 'Thanks for the comment! Happy to answer anything about this one.' },
    },
  },
];
