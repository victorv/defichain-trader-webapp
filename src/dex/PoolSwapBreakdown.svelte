<svelte:options immutable/>
<script>
    import Fee from "./Fee.svelte";
    import Req from "./Req.svelte";
    import {hasItems} from "../common/common";
    import Percentage from "./Percentage.svelte";
    import Help from "../common/Help.svelte";
    import ProfitLoss from "./ProfitLoss.svelte";

    export let poolSwap

    const withPath = breakdown => {
        const tokens = []
        for (const swap of breakdown.swaps) {
            for (const token of [swap.tokenFrom, swap.tokenTo]) {
                if (tokens.length === 0 || tokens[tokens.length - 1] !== token) {
                    tokens.push(token)
                }
            }
        }
        return {
            ...breakdown,
            path: tokens.join(' → ')
        }
    }

    $: breakdown = hasItems(poolSwap.breakdown) ? withPath(poolSwap.breakdown[0]) : null
</script>

{#if breakdown}
    <table class="pure-table pure-table-striped">
        <tbody>
        <tr>
            <th role="rowheader" class="banner">Summary</th>
            <td>
                {breakdown.path}
            </td>
        </tr>
        <tr>
            <th role="rowheader">
                Profit/loss
            </th>
            <td>
                <ProfitLoss {poolSwap}/>
            </td>
        </tr>
        <tr>
            <th role="rowheader">
                Estimate
                <Help warning={true} help="Swaps from <= 0.00001 are currently inaccurate and are off by at least 0.2%. The estimated result. The estimate may have changed by the time you try your swap. Always use the max price to prevent unexpected slippage."/>
            </th>
            <td>
                {breakdown.estimate} {poolSwap.tokenTo}
            </td>
        </tr>
        <tr>
            <th role="rowheader">
                Desired Result
                <Help help="The desired result you have targeted. It is used to calculate your profit or loss."/>
            </th>
            <td>
                {poolSwap.desiredResult.toFixed(8)} {poolSwap.tokenTo}
            </td>
        </tr>
        {#if poolSwap.maxPrice}
            <tr>
                <th role="rowheader">
                    Max Price
                    <Help help="This is the maximum price you can pay while still reaching your desired result. This number can be used for on-chain-swaps to prevent unexpected slippage."/>
                </th>
                <td>
                    {poolSwap.maxPrice.toFixed(8)} {poolSwap.tokenFrom} = 1 {poolSwap.tokenTo}
                </td>
            </tr>
        {/if}
        {#if breakdown.price}
            <tr>
                <th role="rowheader">
                    Average Price Payed
                    <Help help="Because of how pools work you end up paying more if you buy more. Therefore it is useful to know the average price you have payed. "/>
                </th>
                <td>
                    {breakdown.price.toFixed(8)} {poolSwap.tokenFrom} = 1 {poolSwap.tokenTo}
                </td>
            </tr>
        {/if}
        <tr>
            <th role="rowheader">
                Oracle Price
                <Help help="Latest price reported by DeFiChain oracles. Oracles represent the asset price outside of DeFiChain."/>
            </th>
            <td>
                {#if poolSwap.oraclePrice}
                    {poolSwap.oraclePrice.toFixed(8)} {poolSwap.tokenFrom} = 1 {poolSwap.tokenTo}
                {:else}
                    Unknown
                {/if}
            </td>
        </tr>
        <tr>
            <th role="rowheader">
                Premium
                <Help help="Premium you end up paying compared to buying the asset at the oracle price."/>
            </th>
            <td>
                {#if breakdown.premium}
                    <Percentage number={breakdown.premium}/>
                {:else}
                    Unknown
                {/if}
            </td>
        </tr>
        {#each breakdown.swaps as swap, index}
            <tr>
                <th role="rowheader" class="banner">
                    Swap {index + 1}
                    <Help whiteText={true}
                          help="Some swaps consist of multiple swaps. This is called a composite swap and will go through multiple pools. You pay fees and commissions each time for every pool you swap through. The height of those fees can be different for each pool and they can add up quickly."/>
                </th>
                <td>
                    {swap.amountFrom} {swap.tokenFrom} to
                    <strong>{swap.amountTo}</strong>
                    {swap.tokenTo}
                </td>
            </tr>
            {#if !swap.status}
                <tr>
                    <th role="rowheader">Lacks Liquidity</th>
                    <td>
                        <Req value={!swap.status} expect={false}/>
                    </td>
                </tr>
            {/if}
            {#if !swap.tradeEnabled}
                <tr>
                    <th role="rowheader">Trade Enabled</th>
                    <td>
                        <Req value={!swap.tradeEnabled} expect={false}/>
                    </td>
                </tr>
            {/if}
            {#if swap.overflow}
                <tr>
                    <th role="rowheader">Overflow</th>
                    <td>
                        <Req value={swap.overflow} expect={false}/>
                    </td>
                </tr>
            {/if}
            <tr>
                <th role="rowheader">Commission</th>
                <td>
                    {swap.commission} {swap.tokenFrom}
                    <Fee number={swap.commissionPct}/>
                </td>
            </tr>
            <tr>
                <th role="rowheader">In Fee</th>
                <td>
                    {#if swap.inFee}
                        {swap.inFee} {swap.tokenFrom}
                        <Fee number={swap.inFeePct}/>
                    {:else}
                        None
                    {/if}
                </td>
            </tr>
            <tr>
                <th role="rowheader">Out Fee</th>
                <td>
                    {#if swap.outFee}
                        {swap.outFee.toFixed(8)} {swap.tokenTo}
                        <Fee number={swap.outFeePct}/>
                    {:else}
                        None
                    {/if}
                </td>
            </tr>
        {/each}
        </tbody>
    </table>
{/if}

<style>
    label {
        display: block;
    }
</style>