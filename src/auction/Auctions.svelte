<script>
    import {onDestroy, onMount} from "svelte";
    import {asDollars, calcProfitLoss, hasItems} from "../common/common";
    import PoolSwapBreakdown from "../dex/PoolSwapBreakdown.svelte";
    import {auctionStore} from "../store";
    import Percentage from "../dex/Percentage.svelte";

    let auctions
    let activeCollateral
    let activeSwap
    let subs = []

    const toggleSwapBreakdown = (collateral, swap) => {
        if (collateral === activeCollateral) {
            activeCollateral = null
            activeSwap = null
            return
        }

        activeCollateral = collateral
        activeSwap = swap
    }

    onMount(async () => {
        let sub1 = auctionStore.subscribe(newAuctions => {
            auctions = newAuctions
        })
        subs.push(sub1)

        const response = await fetch(`/auctions`)
        auctions = await response.json()
    })

    onDestroy(() => subs.forEach(sub => sub()))
</script>

<h1>BETA</h1>

{#if hasItems(auctions)}
    <ul class="server">
        {#each auctions as auction}
            <li>
                Vault: <a target="_blank" href="https://defiscan.live/vaults/{auction.vaultId}">{auction.vaultId}</a>
                {#each auction.batches as batch}
                    <table class="pure-table">
                        <thead>
                        <tr>
                            <td>
                                Batch <span class="amount">{batch.index}</span>, expires in <span
                                    class="amount">{auction.blocksRemaining}</span> blocks
                            </td>
                        </tr>
                        </thead>
                        <tbody>
                        {#each batch.collaterals as collateral}
                            <tr>
                                <td>
                                    <span class="amount">{collateral.tokenAmount.value}</span>
                                    <span class="token">{collateral.tokenAmount.token}</span>
                                    =
                                    <span class="amount">{collateral.loanTokenAmount}</span>
                                    <span class="token">{batch.loan.token}</span>
                                    <br/>
                                    <span class="brown">{asDollars(collateral.tokenAmount.valueUSD)}</span>
                                </td>
                            </tr>
                            {#if activeSwap && collateral === activeCollateral}
                                <tr>
                                    <td colspan="3">
                                        {#if hasItems(activeSwap.breakdown)}
                                            <PoolSwapBreakdown poolSwap={activeSwap}/>
                                        {:else}
                                            <div class="warning">
                                                Something went wrong
                                            </div>
                                        {/if}
                                    </td>
                                </tr>
                            {/if}
                        {/each}
                        <tr>
                            <td>
                                <span class="amount">{batch.maxBid}</span>
                                <span class="token">{batch.loan.token}</span>
                                (max bid)
                                -
                                <span class="amount">{batch.minBid}</span>
                                <span class="token">{batch.loan.token}</span>
                                (min bid)
                                <br/>
                                = {+batch.maxBid - + batch.minBid}
                                or
                                <Percentage number={calcProfitLoss(batch.minBid, batch.maxBid)}/>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                {/each}
            </li>
        {/each}
    </ul>
{:else}
    <h2>There are no auctions</h2>
{/if}

<style>
    ul {
        list-style-type: none;
        margin: 0;
        padding: 0;
    }

    li {
        margin: 1rem;
    }

    .brown {
        color: saddlebrown;
    }
</style>