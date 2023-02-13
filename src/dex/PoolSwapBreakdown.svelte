<script>
    import Req from "./Req.svelte";
    import {calcProfitLoss, hasItems, roundTo} from "../common/common";
    import Percentage from "./Percentage.svelte";
    import Help from "../common/Help.svelte";
    import ProfitLoss from "./ProfitLoss.svelte";
    import {getHeader, isWorseDefaultPath} from "./dex";
    import BreakdownHeader from "./BreakdownHeader.svelte";
    import Fee from "./Fee.svelte";

    export let poolSwap
    export let title
    export let maxPrice = true

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

{#if poolSwap.amountFrom < 0.0005 || breakdown.estimate < 0.0005}
    <div class="error">
        Swaps where the input or output amount are smaller than 0.0005 are unsupported.
    </div>
{:else if breakdown}
    <table class="pure-table server">
        <tbody>
        <tr>
            <th role="rowheader"
                class="banner">Target
            </th>
            <td>
                <strong>{header}</strong>
                {#if title}
                    {@html title}
                {/if}
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
                Current result
            </th>
            <td>
                <span class="amount">{breakdown.estimate}</span>
                <span class="token">{poolSwap.tokenTo}</span>
            </td>
        </tr>
        <tr>
            <th role="rowheader">
                {#if !maxPrice}
                    Past result
                {:else}
                    Desired Result
                {/if}
            </th>
            <td>
                <span class="amount">{poolSwap.desiredResult.toFixed(8)}</span>
                <span class="token">{poolSwap.tokenTo}</span>
            </td>
        </tr>
        {#if poolSwap.desiredResult}
            <tr>
                <th role="rowheader">
                    {#if calcProfitLoss(poolSwap.desiredResult, breakdown.estimate) >= 0.0}
                        Profit
                        {#if maxPrice}
                            (relative to target)
                        {:else}
                            (relative to past result)
                        {/if}
                    {:else}
                        Loss
                        {#if maxPrice}
                            (relative to target)
                        {:else}
                            (relative to past result)
                        {/if}
                    {/if}
                </th>
                <td>
                    <ProfitLoss {poolSwap} estimate={breakdown.estimate}/>
                </td>
            </tr>
            {#if maxPrice && poolSwap.maxPrice}
                <tr>
                    <th role="rowheader">
                        Max Price
                    </th>
                    <td>
                        pay at most
                        <span class="amount">{poolSwap.maxPrice.toFixed(8)}</span>
                        <span class="token">{poolSwap.tokenFrom}</span>
                        for
                        <span class="amount">1</span>
                        <span class="token">{poolSwap.tokenTo}</span>
                        to reach you desired result
                    </td>
                </tr>
            {/if}
        {/if}
        <tr>
            <th role="rowheader" class="banner">Oracle</th>
            <td>
            </td>
        </tr>
        <tr>
            <th role="rowheader">
                Oracle Price
                <Help help="Latest price reported by DeFiChain oracles. Oracles represent the asset price outside of DeFiChain."/>
            </th>
            <td>
                {#if poolSwap.oraclePrice}
                    <span class="amount">{poolSwap.oraclePrice.toFixed(8)}</span>
                    <span class="token">{poolSwap.tokenFrom}</span>
                    =
                    <span class="amount">1</span>
                    <span class="token">{poolSwap.tokenTo}</span>
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
                    <span class="amount">{swap.amountFrom}</span>
                    <span class="token">{swap.tokenFrom}</span>
                    to
                    <span class="amount">{swap.amountTo}</span>
                    <span class="token">{swap.tokenTo}</span>
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
                <th role="rowheader">{swap.tokenFrom}:{swap.tokenTo}</th>
                <td>
                    <span class="amount">1</span>
                    <span class="token">{swap.tokenFrom}</span>
                    =
                    <span class="amount">{roundTo(swap.amountTo / swap.amountFrom, 8)}</span>
                    <span class="token">{swap.tokenTo}</span>
                </td>
            </tr>
            <tr>
                <th role="rowheader">{swap.tokenTo}:{swap.tokenFrom}</th>
                <td>
                    <span class="amount">1</span>
                    <span class="token">{swap.tokenTo}</span>
                    =
                    <span class="amount">{roundTo(swap.amountFrom / swap.amountTo, 8)}</span>
                    <span class="token">{swap.tokenFrom}</span>
                </td>
            </tr>
            <tr>
                <th role="rowheader">Commission</th>
                <td>
                    <span class="amount">{swap.commission}</span>
                    <span class="token">{swap.tokenFrom}</span>
                    <Fee number={swap.commissionPct}/>
                </td>
            </tr>
            <tr>
                <th role="rowheader">In Fee</th>
                <td>
                    {#if swap.inFee}
                        <span class="amount">{swap.inFee}</span>
                        <span class="token">{swap.tokenFrom}</span>
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
                        <span class="amount">{swap.outFee.toFixed(8)}</span>
                        <span class="token">{swap.tokenTo}</span>
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