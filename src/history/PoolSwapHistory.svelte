<script context="module">
    const prefix = '#explore/swaps/'

    const defaultTokenSymbols = {
        fromTokenSymbol: 'Any',
        toTokenSymbol: 'Any'
    }
</script>

<script>
    import FromToTokenFilter from "../dex/FromToTokenFilter.svelte";
    import PoolSwapDetails from "./PoolSwapDetails.svelte";
    import Icon from "../common/Icon.svelte";
    import PoolSwapBreakdown from "../dex/PoolSwapBreakdown.svelte";
    import {asUSDT, avg, getTokenSymbols, hasItems} from "../common/common";
    import Help from "../common/Help.svelte";
    import Limit from "../common/Limit.svelte";
    import TimePastSince from "../common/TimePastSince.svelte";
    import {onDestroy, onMount} from "svelte";
    import ProfitLoss from "../dex/ProfitLoss.svelte";

    export let allTokens

    export let refresh
    export let items
    export let filter
    export let currentFilter
    export let screen

    let notificationTitle

    let minInputAmount
    let maxInputAmount
    let minOutputAmount
    let maxOutputAmount

    let subs = []
    let now = new Date().getTime()
    let interval
    let statsRequest

    $: poolSwaps = items
    $: if (items) {
        now = new Date().getTime()
    }

    const tokenSymbols = getTokenSymbols(allTokens, defaultTokenSymbols, prefix)

    let swapBreakdown
    let fromTokenSymbol = currentFilter.fromTokenSymbol || tokenSymbols.fromTokenSymbol
    let toTokenSymbol = currentFilter.toTokenSymbol || tokenSymbols.toTokenSymbol

    let selectedTX

    onMount(async () => {
        interval = setInterval(() => {
            now = new Date().getTime()
        }, 30000)

        await update()
    })

    onDestroy(() => {
        clearInterval(interval)
        subs.forEach(sub => sub())
    })

    async function update() {
        await refresh(createSearch())
        location.hash = `#explore/swaps/${fromTokenSymbol}+to+${toTokenSymbol}`
    }

    const clearInputAmount = async () => {
        minInputAmount = undefined
        maxInputAmount = undefined
        await update()
    }

    const clearOutputAmount = async () => {
        minOutputAmount = undefined
        maxOutputAmount = undefined
        await update()
    }

    const createSearch = () => {
        const newSearch = {
            minInputAmount: minInputAmount || undefined,
            maxInputAmount: maxInputAmount || undefined,
            minOutputAmount: minOutputAmount || undefined,
            maxOutputAmount: maxOutputAmount || undefined,
            fromTokenSymbol: fromTokenSymbol === 'Any' ? undefined : fromTokenSymbol,
            toTokenSymbol: toTokenSymbol === 'Any' ? undefined : toTokenSymbol,
        }
        return newSearch
    }

    const onTokenSelectionChanged = async selection => {
        fromTokenSymbol = selection.fromTokenSymbol
        toTokenSymbol = selection.toTokenSymbol
        await update()
    }

    const toggleTXDetails = async tx => {
        swapBreakdown = null

        selectedTX === tx ? selectedTX = null : selectedTX = tx
    }

    const toggleSwapBreakdown = async (swap, swapResult, desiredResult) => {
        if (desiredResult) {
            swap.desiredResult = desiredResult
            swapResult.desiredResult = desiredResult
        }

        if (selectedTX === swap && swapResult == swapBreakdown) {
            selectedTX = null
            swapBreakdown = null
            return
        }

        swapBreakdown = swapResult
        selectedTX = swap
    }
</script>

<form class="pure-form" on:submit|preventDefault>
    <fieldset>
        <FromToTokenFilter supportAnyToken={true} supportPseudo={true}
                           {allTokens} {fromTokenSymbol} {toTokenSymbol} {onTokenSelectionChanged}/>
    </fieldset>
</form>

<table class:small={screen.small} class:large={screen.large} class="pure-table">
    <thead>
    <tr>
        <th>
            Time
        </th>
        <th>
            In
            <span class:block={screen.small}>
                    $<input min="0" step="0.00000001" type="number"
                            bind:value={minInputAmount}
                            on:change={update}/>
                    </span>
            -
            <span class:block={screen.small}>
                    $<input min="0" step="0.00000001" type="number"
                            bind:value={maxInputAmount}
                            on:change={update}/>
                    <strong on:click={clearInputAmount} class="red">X</strong>
                    </span>
        </th>
        <th>
            Out
            <span class:block={screen.small}>
                    $<input min="0" step="0.00000001" type="number"
                            bind:value={minOutputAmount}
                            on:change={update}/>
                    </span>
            -
            <span class:block={screen.small}>
                    $<input min="0" step="0.00000001" type="number"
                            bind:value={maxOutputAmount}
                            on:change={update}/>
                    <strong on:click={clearOutputAmount} class="red">X</strong>
                    </span>
        </th>
        {#if screen.large}
            <th>
                From
            </th>
            <th>
                To
            </th>
        {/if}
    </tr>
    </thead>
    {#if items && items.length}
        <tbody>
        {#each poolSwaps as tx}
            <tr class:selected-row={tx === selectedTX}>
                <td>
                    {#if tx.block}
                        <TimePastSince start={tx.block.medianTime * 1000} end={now}/>
                        <br/>
                        <button on:click={() => toggleTXDetails(tx)}
                                class:info={tx === selectedTX}
                                type="button"
                                class="pure-button info-button icon">
                            <Icon icon="info"/>
                        </button>
                        <strong>{tx.block.blockHeight}</strong>
                    {:else}
                        <TimePastSince start={tx.mempool.time} end={now}/>
                        <br/>
                        <button on:click={() => toggleTXDetails(tx)}
                                class:info={tx === selectedTX}
                                type="button"
                                class="pure-button info-button icon">
                            <Icon icon="info"/>
                        </button>
                        <strong>{tx.mempool.blockHeight}</strong>
                        <Help warning={true} help="This TX has not been confirmed so far"/>
                    {/if}
                </td>
                <td>
                    <span><strong>{tx.amountFrom}</strong></span>
                    <span>{tx.tokenFrom}</span>
                    <br/>

                    ~{avg(tx.amountFrom, tx.amountTo)} {tx.tokenTo}
                    <br/>

                    {#if tx.swap && tx.amountFrom >= 0.0001}
                        <a href="#" on:click|preventDefault={() => toggleSwapBreakdown(tx, tx.swap)}>
                            <ProfitLoss poolSwap={tx.swap} estimate={tx.swap.estimate}/>
                        </a>
                    {:else}
                        p/l
                        <Help warning={true}
                              help="{tx.amountFrom} {tx.tokenFrom} is too small! Currently it is not possible to calculate profit/loss for input amounts that are smaller than 0.0001."/>
                    {/if}

                    <span class="dollar">
                        {#if tx.tokenFrom == 'USDT' || tx.tokenFrom == 'USDC'}
                            {asUSDT(tx.usdtSwap.estimate)}
                        {:else if tx.usdtSwap}
                            {#if tx.usdtSwap.estimate > 0.09}
                                <a href="#"
                                   on:click|preventDefault={() => toggleSwapBreakdown(tx, tx.usdtSwap, tx.usdtSwap.estimate)}>
                                    {asUSDT(tx.usdtSwap.estimate)}
                                </a>
                            {:else}
                                {asUSDT(tx.usdtSwap.estimate)}
                            {/if}
                        {/if}
                        </span>
                </td>
                <td>
                    {#if tx.amountTo}
                        <span><strong>{tx.amountTo}</strong></span>
                        <span>{tx.tokenTo}</span>
                        {#if tx.tokenTo !== tx.tokenToAlt}
                            or {tx.tokenToAlt}
                            <Help help="This transaction contains conflicting information that specifies two distinct outcomes."/>
                        {/if}
                        <br/>

                        ~{avg(tx.amountTo, tx.amountFrom)} {tx.tokenFrom}
                        <br/>

                        {#if tx.inverseSwap && tx.amountTo >= 0.0001}
                            <a href="#" on:click|preventDefault={() => toggleSwapBreakdown(tx, tx.inverseSwap)}>
                                <ProfitLoss poolSwap={tx.inverseSwap} estimate={tx.inverseSwap.estimate}/>
                            </a>
                        {:else}
                            p/l
                            <Help warning={true}
                                  help="{tx.amountTo} {tx.tokenTo} is too small! Currently it is not possible to calculate profit/loss for input amounts that are smaller than 0.0001."/>
                        {/if}
                    {:else}
                        N/A {tx.tokenTo}
                    {/if}

                    <span class="dollar">
                        {#if tx.amountTo && (tx.tokenTo == 'USDT' || tx.tokenTo == 'USDC')}
                            {asUSDT(tx.amountTo)}
                        {:else if tx.usdtInverseSwap}

                            {#if tx.usdtInverseSwap.estimate > 0.09}
                                <a href="#"
                                   on:click|preventDefault={() => toggleSwapBreakdown(tx, tx.usdtInverseSwap, tx.usdtInverseSwap.estimate)}>
                                    {asUSDT(tx.usdtInverseSwap.estimate)}
                                </a>
                            {:else}
                                {asUSDT(tx.usdtInverseSwap.estimate)}
                            {/if}
                        {/if}
                        </span>
                </td>
                {#if screen.large}
                    <td>
                        {#if tx.from == 'dSPPfAPY8BA3TQdqfZRnzJ7212HPWunDms'}
                            <Icon icon="cake"/>
                        {/if}
                        <Limit text={tx.from}/>
                    </td>
                    <td>
                        {#if tx.to == '8defichainBurnAddressXXXXXXXdRQkSm'}
                            <Icon icon="burn"/>
                        {/if}
                        {#if tx.from != tx.to}
                            <Limit text={tx.to}/>
                        {:else}
                            &lt;from address&gt;
                        {/if}
                    </td>
                {/if}
            </tr>
            {#if swapBreakdown == null && tx === selectedTX}
                <tr>
                    <td colspan="7">
                        {#if selectedTX}
                            <PoolSwapDetails tx={selectedTX}/>
                        {/if}
                    </td>
                </tr>
            {:else if swapBreakdown && selectedTX === tx}
                <tr>
                    <td colspan="7">
                        {#if hasItems(swapBreakdown.breakdown)}
                            <PoolSwapBreakdown poolSwap={swapBreakdown}/>
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
    {/if}
</table>

<style>
    table.large .dollar {
        float: right;
    }

    form, fieldset {
        padding: 0;
    }

    tr.selected-row td {
        background: #333;
        color: white;
    }

    tr.selected-row a {
        color: white;
    }

    table.small th > *, table.small td > * {
        display: block;
    }


    th input, th select {
        max-width: 4rem;
    }

    .active-filters button {
        margin-bottom: 0.2rem;
    }

    .red {
        color: red;
    }

    input[type="date"] {
        max-width: none;
    }
</style>
