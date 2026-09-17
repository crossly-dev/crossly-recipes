# Recipe index

44 recipes.

### messaging

| recipe | trigger | action |
|---|---|---|
| [Thank every buyer the moment they purchase](recipes/messaging/thank-every-buyer-the-moment-they-purchase.json) | listing.sold | inbox.send_thank_you |
| [Archive obvious scams before you ever see them](recipes/messaging/archive-obvious-scams-before-you-ever-see-them.json) | inbox.message_received | inbox.archive_scam |
| [Answer "is this still available?" instantly](recipes/messaging/answer-is-this-still-available-instantly.json) | inbox.message_received | inbox.send_message |
| [Answer sizing and measurement questions with your canned reply](recipes/messaging/answer-sizing-and-measurement-questions-with-your-canned-rep.json) | inbox.message_received | inbox.send_canned |
| [Follow the buyer after a sale](recipes/messaging/follow-the-buyer-after-a-sale.json) | listing.sold | social.follow_buyer |

### offers

| recipe | trigger | action |
|---|---|---|
| [Auto-decline anything under 60%, counter at 85%](recipes/offers/auto-decline-anything-under-60-counter-at-85.json) | inbox.offer_received | inbox.offer_auto_respond |
| [Offer 12% to everyone who liked an item](recipes/offers/offer-12-to-everyone-who-liked-an-item.json) | listing.liked | listing.send_offer_to_likers |
| [eBay best offer: accept over 90%, decline under 65%, counter between](recipes/offers/ebay-best-offer-accept-over-90-decline-under-65-counter-betw.json) | inbox.ebay_offer_received | inbox.ebay_best_offer_auto_respond |
| [eBay: send offers to interested buyers, weekly](recipes/offers/ebay-send-offers-to-interested-buyers-weekly.json) | schedule.cron | listing.ebay_send_offer_to_interested_buyers |
| [Decline lowballs on premium stock without countering](recipes/offers/decline-lowballs-on-premium-stock-without-countering.json) | inbox.offer_received | inbox.auto_decline_low_offer |

### crossposting

| recipe | trigger | action |
|---|---|---|
| [Crosspost every new listing to your main platforms](recipes/crossposting/crosspost-every-new-listing-to-your-main-platforms.json) | listing.created | listing.expand_platforms |
| [Crosspost only items above $25](recipes/crossposting/crosspost-only-items-above-25.json) | listing.created | listing.expand_platforms |
| [Relist anything still sitting at 45 days](recipes/crossposting/relist-anything-still-sitting-at-45-days.json) | listing.age_reached | listing.auto_relist |
| [Archive anything a year old with nothing to show for it](recipes/crossposting/archive-anything-a-year-old-with-nothing-to-show-for-it.json) | schedule.cron | listing.archive_stale |

### engagement

| recipe | trigger | action |
|---|---|---|
| [Share your whole closet twice a day](recipes/engagement/share-your-whole-closet-twice-a-day.json) | schedule.cron | listing.share_closet |
| [Follow back everyone who follows you](recipes/engagement/follow-back-everyone-who-follows-you.json) | schedule.interval | social.follow_back |
| [Share to the community pool](recipes/engagement/share-to-the-community-pool.json) | schedule.interval | network.share_pool |
| [Follow sellers in your niche](recipes/engagement/follow-sellers-in-your-niche.json) | schedule.daily | social.brand_follow_proactive |
| [Thank people who comment](recipes/engagement/thank-people-who-comment.json) | listing.commented | inbox.send_message |

### fulfilment

| recipe | trigger | action |
|---|---|---|
| [Warn me a day before a ship-by date](recipes/fulfilment/warn-me-a-day-before-a-ship-by-date.json) | order.ship_by_soon | notify.telegram |
| [Shout when an order is overdue](recipes/fulfilment/shout-when-an-order-is-overdue.json) | order.ship_by_overdue | notify.email_user |
| [Chase anything unshipped after three days](recipes/fulfilment/chase-anything-unshipped-after-three-days.json) | order.unshipped_after | notify.email_user |
| [Ask for a review once it is actually delivered](recipes/fulfilment/ask-for-a-review-once-it-is-actually-delivered.json) | order.delivered | inbox.send_message |
| [Alert me the moment an order is disputed](recipes/fulfilment/alert-me-the-moment-an-order-is-disputed.json) | order.disputed | notify.telegram |
| [Log returns to your CRM](recipes/fulfilment/log-returns-to-your-crm.json) | order.returned | crm.push_buyer |

### housekeeping

| recipe | trigger | action |
|---|---|---|
| [Tell me immediately when a platform disconnects](recipes/housekeeping/tell-me-immediately-when-a-platform-disconnects.json) | platform.disconnected | notify.telegram |
| [Turn on vacation mode everywhere with one rule](recipes/housekeeping/turn-on-vacation-mode-everywhere-with-one-rule.json) | schedule.window | account.toggle_vacation |
| [Daily sales digest to Slack](recipes/housekeeping/daily-sales-digest-to-slack.json) | schedule.daily | notify.slack |
| [Push every sale to a webhook](recipes/housekeeping/push-every-sale-to-a-webhook.json) | listing.sold | notify.webhook |

### inventory

| recipe | trigger | action |
|---|---|---|
| [Tell me before something runs out, not after](recipes/inventory/tell-me-before-something-runs-out-not-after.json) | inventory.low_stock | notify.telegram |
| [Delist everywhere when quantity hits zero](recipes/inventory/delist-everywhere-when-quantity-hits-zero.json) | inventory.zero_qty | listing.delist |
| [Flag restockable items for review when they sell out](recipes/inventory/flag-restockable-items-for-review-when-they-sell-out.json) | inventory.zero_qty | listing.add_tag |

### pricing

| recipe | trigger | action |
|---|---|---|
| [Nudge stale listings down 5% after 30 days](recipes/pricing/nudge-stale-listings-down-5-after-30-days.json) | listing.age_reached | listing.price_drop |
| [Ladder: 5% at 30 days, 10% at 60, 15% at 90](recipes/pricing/ladder-5-at-30-days-10-at-60-15-at-90.json) | listing.age_reached | listing.price_drop |
| [Ladder step three — 15% at 90 days](recipes/pricing/ladder-step-three-15-at-90-days.json) | listing.age_reached | listing.price_drop |
| [Drop the price on anything with no views after two weeks](recipes/pricing/drop-the-price-on-anything-with-no-views-after-two-weeks.json) | listing.no_views_after | listing.price_drop |
| [Undercut the market by 2% when a competitor goes lower](recipes/pricing/undercut-the-market-by-2-when-a-competitor-goes-lower.json) | market.competitor_underprice | listing.reprice |
| [Hold the median of comparable sold listings](recipes/pricing/hold-the-median-of-comparable-sold-listings.json) | schedule.daily | listing.reprice |
| [Raise the price 5% on anything getting a lot of attention](recipes/pricing/raise-the-price-5-on-anything-getting-a-lot-of-attention.json) | listing.metric_threshold | listing.price_raise |
| [Weekend flash sale: 15% off Friday evening, back up Sunday night](recipes/pricing/weekend-flash-sale-15-off-friday-evening-back-up-sunday-nigh.json) | schedule.cron | listing.timed_discount |
| [Match the lowest listed price, with a floor](recipes/pricing/match-the-lowest-listed-price-with-a-floor.json) | schedule.interval | listing.sync_price_to_lowest |
| [Bundle discount: 15% off when a buyer takes three](recipes/pricing/bundle-discount-15-off-when-a-buyer-takes-three.json) | schedule.daily | listing.bundle_promo |
| [Gentle decay: 2% a week, never below your cost band](recipes/pricing/gentle-decay-2-a-week-never-below-your-cost-band.json) | schedule.cron | listing.reprice |
| [Premium hold — never discount tagged items](recipes/pricing/premium-hold-never-discount-tagged-items.json) | listing.age_reached | listing.add_tag |
