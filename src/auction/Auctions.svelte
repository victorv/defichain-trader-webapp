<script>
    import {onDestroy, onMount} from "svelte";
    import ProfitLoss from "../dex/ProfitLoss.svelte";
    import Help from "../common/Help.svelte";
    import {hasItems} from "../common/common";
    import PoolSwapBreakdown from "../dex/PoolSwapBreakdown.svelte";
    import {auctionStore} from "../store";

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

{#if auctions}
    <ul>
        {#each auctions as auction}
            <li>
                Vault: <a target="_blank" href="https://defiscan.live/vaults/{auction.vaultId}">{auction.vaultId}</a>
                {#each auction.batches as batch}
                    <p>
                        Batch {batch.index}, expires in {auction.blocksRemaining} blocks<br/>
                        min bid: <strong>{batch.minimumBid.toFixed(8)} {batch.loan.token}</strong>
                        max bid: <strong>{batch.maximumBid.toFixed(8)} {batch.loan.token}</strong>
                    </p>
                    <table class="pure-table">
                        <thead>
                        <tr>
                            <td>
                                Amount
                            </td>
                            <td>
                                Loan to collateral
                            </td>
                            <td>
                                Collateral to loan
                            </td>
                        </tr>
                        </thead>
                        <tbody>
                        {#each batch.collaterals as collateral}
                            <tr>
                                <td>
                                    {collateral.tokenAmount.value} {collateral.tokenAmount.token}
                                    <br/>
                                    ${collateral.tokenAmount.valueUSD}
                                </td>
                                <td>
                                    {collateral.swapFromLoan.amountFrom.toFixed(8)}
                                    {collateral.swapFromLoan.tokenFrom} to
                                    {collateral.swapFromLoan.estimate.toFixed(8)}
                                    {collateral.swapFromLoan.tokenTo}
                                    <br/>
                                    {#if collateral.swapFromLoan && collateral.swapFromLoan.amountFrom >= 0.0001}
                                        <ProfitLoss poolSwap={collateral.swapFromLoan}
                                                    estimate={collateral.swapFromLoan.estimate}/>
                                        <a href="#"
                                           on:click|preventDefault={() => toggleSwapBreakdown(collateral, collateral.swapFromLoan)}>
                                            proof
                                        </a>
                                    {:else}
                                        profit/loss
                                        <Help warning={true}
                                              help="Currently it is not possible to calculate profit/loss for input amounts that are smaller than 0.0001."/>
                                    {/if}
                                </td>
                                <td>
                                    {collateral.swapToLoan.amountFrom.toFixed(8)}
                                    {collateral.swapToLoan.tokenFrom} to
                                    {collateral.swapToLoan.estimate.toFixed(8)}
                                    {collateral.swapToLoan.tokenTo}
                                    <br/>
                                    {#if collateral.swapToLoan && collateral.swapToLoan.amountFrom >= 0.0001}
                                        <ProfitLoss poolSwap={collateral.swapToLoan}
                                                    estimate={collateral.swapToLoan.estimate}/>
                                        <a href="#"
                                           on:click|preventDefault={() => toggleSwapBreakdown(collateral, collateral.swapToLoan)}>
                                            proof
                                        </a>
                                    {:else}
                                        profit/loss
                                        <Help warning={true}
                                              help="Currently it is not possible to calculate profit/loss for input amounts that are smaller than 0.0001."/>
                                    {/if}
                                </td>
                            </tr>
                            {#if activeSwap && collateral === collateral}
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
                        </tbody>
                    </table>
                {/each}
            </li>
        {/each}
    </ul>
{/if}

<style>
    ul {
        list-style-type: none;
        margin: 0;
        padding: 0;
    }
</style>