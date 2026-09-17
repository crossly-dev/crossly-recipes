/**
 * Offers and inbox automations.
 *
 * This is the category where automation is most obviously worth it — offers
 * and messages arrive at all hours and the response time is most of the
 * conversion — and also where it is most obviously risky, because everything
 * here talks to a human in your voice.
 *
 * Two rules the recipes below follow:
 *
 *   Never auto-accept near your floor. An auto-accept is a sale you cannot
 *   take back, and "within 10%" is a much bigger range than it sounds once
 *   fees and shipping come out.
 *
 *   Say something. An auto-decline with no message reads as a wall; the same
 *   decline with a counter reads as a negotiation, and a counter converts.
 */

export const offers = [
  {
    name: 'Auto-decline anything under 60%, counter at 85%',
    description:
      'The lowball filter. Under 60% of asking is almost never a real buyer working up to a price ' +
      'and is usually a bot; countering it anyway costs nothing and occasionally converts. Uses ' +
      'NET payout, so the percentages mean what you think after fees.',
    trigger: { type: 'inbox.offer_received', config: {} },
    action: {
      type: 'inbox.offer_auto_respond',
      config: {
        acceptAtOrAbovePercent: 92,
        declineBelowPercent: 60,
        basis: 'net',
        counterStrategy: 'percent',
        counterPercent: 85,
        floorCents: 1200,
      },
    },
  },

  {
    name: 'Offer 12% to everyone who liked an item',
    description:
      'The single highest-converting automation most resellers are not running. A like is the ' +
      'strongest buying signal a marketplace gives you, and an offer to a liker lands as an ' +
      'answer to a question they already asked. `excludeRecentOfferDays` keeps it from becoming ' +
      'nagging.',
    trigger: { type: 'listing.liked', config: {} },
    action: {
      type: 'listing.send_offer_to_likers',
      config: {
        discountPercent: 12,
        shippingFree: true,
        minLikeCount: 1,
        excludeRecentOfferDays: 14,
      },
    },
  },

  {
    name: 'eBay best offer: accept over 90%, decline under 65%, counter between',
    description:
      "eBay's own auto-respond, driven from Crossly so the thresholds live with the rest of your " +
      'rules instead of in a separate screen you forget exists.',
    trigger: { type: 'inbox.ebay_offer_received', config: {} },
    action: {
      type: 'inbox.ebay_best_offer_auto_respond',
      config: { acceptAbove: 90, declineBelow: 65, counter: 82 },
    },
  },

  {
    name: 'eBay: send offers to interested buyers, weekly',
    description:
      "eBay surfaces buyers who watched or abandoned a cart. This asks them, once a week, at a " +
      'real discount. `minEligibleBuyerCount` stops it firing at an audience of one.',
    trigger: { type: 'schedule.cron', config: { cron: '0 18 * * 3' } },
    action: {
      type: 'listing.ebay_send_offer_to_interested_buyers',
      config: {
        discountPercent: 10,
        maxListingsPerRun: 50,
        durationHours: 48,
        allowCounterOffer: true,
        minEligibleBuyerCount: 2,
        message: 'Thanks for watching — here is 10% off for the next two days.',
      },
    },
  },

  {
    name: 'Decline lowballs on premium stock without countering',
    description:
      'The exception to "always counter". On genuinely scarce items a counter signals the price is ' +
      'soft, and it is not. Declines cleanly and leaves the asking price standing.',
    trigger: { type: 'inbox.offer_received', config: {} },
    condition: { type: 'listing.has_tags', config: { tags: ['premium', 'rare'], matchAll: false } },
    action: {
      type: 'inbox.auto_decline_low_offer',
      config: { minAcceptablePercent: 90, useNetPayout: true },
    },
  },
];

export const messaging = [
  {
    name: 'Thank every buyer the moment they purchase',
    description:
      'Costs nothing, measurably moves review rate. Sent on sale detection, so it fires whichever ' +
      'marketplace the sale came from.',
    trigger: { type: 'listing.sold', config: {} },
    action: {
      type: 'inbox.send_thank_you',
      config: {
        template:
          'Thank you so much for your order! It will be packed and shipped within one business ' +
          'day, and you will get tracking as soon as it moves. Any questions at all, just reply here.',
      },
    },
  },

  {
    name: 'Archive obvious scams before you ever see them',
    description:
      'The "is this still available, text me at" genre. Scored and archived rather than deleted, ' +
      'so a false positive is recoverable — which matters, because the score is a heuristic and ' +
      'a real buyer who writes tersely can trip it.',
    trigger: { type: 'inbox.message_received', config: {} },
    action: { type: 'inbox.archive_scam', config: { scamScoreThreshold: 75 } },
  },

  {
    name: 'Answer "is this still available?" instantly',
    description:
      'The most common message on every marketplace and the one where reply speed decides the ' +
      'sale. Uses intent detection rather than keyword matching, so it catches the twenty ways ' +
      'people phrase it.',
    trigger: { type: 'inbox.message_received', config: { intent: 'availability' } },
    action: {
      type: 'inbox.send_message',
      config: {
        template:
          'Yes, it is still available and ready to ship! Let me know if you would like more photos ' +
          'or measurements.',
      },
    },
  },

  {
    name: 'Answer sizing and measurement questions with your canned reply',
    description:
      'Points at a canned response you write once. Replace `cannedId` with yours — the recipe ' +
      'cannot know your id, and importing it without editing will fail validation rather than ' +
      'send a blank message.',
    trigger: { type: 'inbox.message_received', config: { intent: 'sizing' } },
    action: { type: 'inbox.send_canned', config: { cannedId: 'REPLACE_WITH_YOUR_CANNED_ID' } },
  },

  {
    name: 'Follow the buyer after a sale',
    description:
      'On closet-style platforms a follow after purchase is how repeat buyers happen. Low effort, ' +
      'and the follow-back rate from someone who just bought from you is the highest you will see.',
    trigger: { type: 'listing.sold', config: {} },
    action: { type: 'social.follow_buyer', config: {} },
  },
];
