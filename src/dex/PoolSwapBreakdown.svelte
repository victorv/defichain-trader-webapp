<script>
    import Fee from "./Fee.svelte";
    import Req from "./Req.svelte";
    import {hasItems} from "../common/common";
    import Percentage from "./Percentage.svelte";
    import Help from "../common/Help.svelte";
    import ProfitLoss from "./ProfitLoss.svelte";
    import {getHeader, isWorseDefaultPath} from "./dex";
    import BreakdownHeader from "./BreakdownHeader.svelte";

    export let poolSwap

    let breakdownIndex = 0
    let breakdown
    let prevPoolSwap
    let header

    const setBreakdown = index => {
        if (hasItems(poolSwap.breakdown)) {
            breakdownIndex = index
            breakdown = withPath(poolSwap.breakdown[breakdownIndex])
        }
        header = getHeader(poolSwap, index)
    }

    $: if (poolSwap) {
        if (prevPoolSwap !== poolSwap) {
            breakdownIndex = 0
            prevPoolSwap = poolSwap
        }
        setBreakdown(breakdownIndex)
    }

    const withPath = breakdown => {
        const tokens = [poolSwap.tokenFrom]
        for (const swap of breakdown.swaps) {
            tokens.push(swap.poolSymbol)
        }
        tokens.push(poolSwap.tokenTo)

        return {
            ...breakdown,
            pathText: tokens.join(' → ')
        }
    }
</script>

<BreakdownHeader {breakdownIndex} {poolSwap} {setBreakdown}/>

{#if breakdown}
    <table class="pure-table">
        <tbody>
        <tr>
            <th role="rowheader" class="banner">Summary</th>
            <td>
                <strong>{header}</strong>
                {#if isWorseDefaultPath(poolSwap, breakdown)}
                    <Help warning={true}
                          help="Careful! A swap from {poolSwap.tokenFrom} to {poolSwap.tokenTo} will always go through this pool! Swap to another token first or use a wallet that automatically does this for you."/>
                {/if}
            </td>
        </tr>
        <tr>
            <th role="rowheader">Path</th>
            <td>
                {breakdown.pathText}
            </td>
        </tr>
        <tr>
            <th role="rowheader">
                Estimate
                <Help warning={true}
                      help="Swaps from <= 0.00001 are currently inaccurate and are off by at least 0.2%. The estimate may have changed by the time you try your swap. Always use the max price to prevent unexpected slippage."/>
            </th>
            <td>
                {breakdown.estimate} {poolSwap.tokenTo}
            </td>
        </tr>
        {#if poolSwap.desiredResult}
            <tr>
                <th role="rowheader">
                    Profit/loss
                </th>
                <td>
                    <ProfitLoss {poolSwap} estimate={breakdown.estimate}/>
                </td>
            </tr>
            <tr>
                <th role="rowheader">
                    Desired Result
                    <Help help="Used to calculate your profit/loss% and the maximum price."/>
                </th>
                <td>
                    {poolSwap.desiredResult.toFixed(8)} {poolSwap.tokenTo}
                </td>
            </tr>
            {#if poolSwap.maxPrice}
                <tr>
                    <th role="rowheader">
                        Max Price
                        <Help help="Maximum price you can pay while still reaching your desired result. This number can be used for on-chain-swaps to prevent unexpected slippage."/>
                    </th>
                    <td>
                        {poolSwap.maxPrice.toFixed(8)} {poolSwap.tokenFrom} = 1 {poolSwap.tokenTo}
                    </td>
                </tr>
            {/if}
        {/if}
        {#if breakdown.price}
            <tr>
                <th role="rowheader">
                    Average Price Payed
                    <Help help="Average price you have payed."/>
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
                    <Percentage inverse={true} number={breakdown.premium}/>
                {:else}
                    Unknown
                {/if}
            </td>
        </tr>
        {#each breakdown.swaps as swap, index}
            <tr>
                <th role="rowheader" class="banner">
                    Swap {index + 1}
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