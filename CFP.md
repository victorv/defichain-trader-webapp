This CFP is for the continued development of [defichain-trader.com](https://defichain-trader.com)

# New features

## Additional data

I would like to integrate the following data:
- token transfers (whenever tokens are moved to another address)
- pool liquidity (adding and removing pool liquidity)
- future swaps (pending future swaps and past future swaps)
- loans (taking loans and paying back loans)
- vault collateral (removing collateral and adding collateral)
- historic auctions (helpful in preparing your strategy when there are no auctions, in addition to the existing live auctions) [[Twitter guide](https://twitter.com/DefichainTrader/status/1617036236861964288)]

### How will they be integrated

Simply put I will follow the same strategy that has been followed for pool swaps and the new data will receive:
- a powerful search function [Twitter guides: [1](https://twitter.com/DefichainTrader/status/1611469144284856320), [2](https://twitter.com/DefichainTrader/status/1615991464286195712) and [3](https://twitter.com/DefichainTrader/status/1615239511721795587)]
- a way to turn search results into future Telegram notifications [Twitter guides: [1](https://twitter.com/DefichainTrader/status/1617706931988365314) and [2](https://twitter.com/DefichainTrader/status/1617417920333897729)]
- a way to view detailed statistics for a search result with a single click [[Twitter guide](https://twitter.com/DefichainTrader/status/1616345262133313537)]
- a way to plot the data on a graph to gain some quick insights [[Example](https://defichain-trader.com/#graph/swap/DUSD+to+USDT)]
- a way to export search results to a format that is compatible with Excel [[Twitter guide](https://twitter.com/DefichainTrader/status/1615110508448780288)]
- additional tooling where necessary to help navigate the data as was also done for pool swaps

Additionally, I will add a unifying overview that displays all transactions in chronological order for a certain address with the option to leave out small transactions.

### Why add more data?

I was pleasantly surprised by the unique ways in which people have been using the website. 
With the addition of the aforementioned data it will be much easier to stay informed about on-chain events that are relevant to you. The applications range from tracking certain addresses or trades to doing analysis on your own addresses.

## Registering an account

Currently, there is already an account section on the website but the account is tied to your browser. 
I want to make it possible to register an account, so you can bring your account data to a device by logging in.
This will also make it possible to create Telegram notifications with a single click. Right now you have to go through several steps.

# Improvements

## Notifications for user defined pool swaps
I would like to support Telegram notifications for pool swaps that were created by the user in Account->Swaps on the following 4 metrics:
- get notified when your stop-loss target is reached
- get notified when your limit-buy target is reached
- get notified when there is a low enough discount as per DeFiChain oracle
- get notified when there is a high enough premium as per DeFiChain oracle

Currently, you can only specify a desired result, and it is not possible to use Telegram notifications.
![Example image](https://gitlab.com/defichain-trader.com/webapp/-/raw/4c438e8ae10cd3a66d10fe45e72316d5c44bdf1e/track-swap.png?inline=false "Example with desired result")

## Minor
There is a long list of mostly minor improvements that together will greatly improve the user experience.
For those I will do what I have always done and sneak a few in every other update.

## Technical
Ongoing technical changes are required to ensure the longevity of this project and keep it maintainable.

# Funding
I am asking for 110,000 DFI.

10% of that will be set aside to scale up the service so that it can handle more users. Currently, there are around 20 to 60 users connected to the website at any given time. I expect that I won't have to scale up until we see peaks of at least 100 online users.

There is also the matter of Telegram notifications. Currently, over 90 notifications are active. I expect that I won't have to scale up until at least 150 notifications are active.

Both metrics have been increasing on a daily basis. See the image below for recent numbers. ![Uptrend](https://gitlab.com/defichain-trader.com/webapp/-/raw/main/uptrend.png "Uptrend").

The remaining 90% will be used to cover development and maintenance costs including:
- new features & improvements for users
- technical changes to keep the service in good condition
- infrastructure maintenance

You can also find and leave feedback here: [CFP on Reddit](https://www.reddit.com/r/defiblockchain/comments/10l35aj/cfp_defichaintradercom/).

I have picked 3 features from the CFP to work on this February. You can view the announcement post on [Twitter](https://twitter.com/DefichainTrader/status/1619673900618764289). I will make an announcement on Twitter when each of them goes live.