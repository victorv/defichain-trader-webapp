<svelte:options immutable/>
<script context="module">
    const prefix = '#explore/PoolSwap/'

    const defaultTokenSymbols = {
        fromTokenSymbol: '',
        toTokenSymbol: ''
    }
</script>

<script>
    import FromToTokenFilter from "../dex/FromToTokenFilter.svelte";
    import PoolSwapDetails from "./PoolSwapDetails.svelte";
    import Icon from "../common/Icon.svelte";
    import PoolSwapBreakdown from "../dex/PoolSwapBreakdown.svelte";
    import {
        asShortAmount,
        avg,
        getTokenSymbols,
        hasItems
    } from "../common/common";
    import Limit from "../common/Limit.svelte";
    import TimePastSince from "../common/TimePastSince.svelte";
    import {onDestroy, onMount} from "svelte";
    import ProfitLoss from "../dex/ProfitLoss.svelte";
    import QuickGraph from "./QuickGraph.svelte";

    export let allTokens

    export let refresh
    export let items
    export let filter
    export let currentFilter
    export let screen

    let notificationTitle

    let minInputAmount = currentFilter.minInputAmount
    let maxInputAmount = currentFilter.maxInputAmount
    let minOutputAmount = currentFilter.minOutputAmount
    let maxOutputAmount = currentFilter.maxOutputAmount

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
    let fromTokenSymbol = (tokenSymbols.fromTokenSymbol ? tokenSymbols.fromTokenSymbol : currentFilter.fromTokenSymbol) || 'Any'
    let toTokenSymbol = (tokenSymbols.toTokenSymbol ? tokenSymbols.toTokenSymbol : currentFilter.toTokenSymbol) || 'Any'

    let selectedTX
    let selectionType

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
        location.hash = `#explore/PoolSwap/${fromTokenSymbol}+to+${toTokenSymbol}`
        const filter = createSearch()
        await refresh(filter)
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

    const toggleTX = async (type, tx, swapResult) => {
        if (selectionType === type && tx === selectedTX) {
            selectedTX = null
            swapBreakdown = null
        } else {
            swapBreakdown = swapResult
            selectedTX = tx
            selectionType = type
        }
    }

    const showProfitLoss = tx => {
        return tx.swap &&
            tx.swap.estimate > 0.0001 &&
            tx.inverseSwap &&
            tx.inverseSwap.estimate > 0.0001
    }

    const showUSD = tx => {
        return showProfitLoss(tx) &&
            tx.usdtSwap &&
            tx.usdtSwap.estimate > 0.01 &&
            tx.usdtInverseSwap &&
            tx.usdtInverseSwap.estimate > 0.01
    }

    const createTitle = (tx, selectionType) => {
        if (selectionType === 'swap') {
            return `if you swap
            <span class="amount">${tx.amountFrom}</span>
            <span class="token">${tx.tokenFrom}</span>
            to
            <span class="token">${tx.tokenTo}</span>
            now`
        }
        if (selectionType === 'inverseSwap') {
            return `if you swap
            <span class="amount">${tx.amountTo}</span>
            <span class="token">${tx.tokenTo}</span>
            to
            <span class="token">${tx.tokenFrom}</span>
            now`
        }
        return ''
    }
</script>

<form class="pure-form"
      on:submit|preventDefault>
    <fieldset>
        <FromToTokenFilter supportAnyToken={true}
                           supportPseudo={true}
                           {allTokens}
                           {fromTokenSymbol}
                           {toTokenSymbol}
                           {onTokenSelectionChanged}/>
    </fieldset>
</form>

<table class:small={screen.small}
       class:large={screen.large}
       class="pure-table server">
    <thead>
    <tr>
        <th>
            In
            <span class:block={screen.small}>
                $
                <input min="0"
                       step="0.00000001"
                       type="number"
                       bind:value={minInputAmount}
                       on:change={update}/>
            </span>
            -
            <span class:block={screen.small}>
                $
                <input min="0"
                       step="0.00000001"
                       type="number"
                       bind:value={maxInputAmount}
                       on:change={update}/>
                <strong on:click={clearInputAmount}
                        class="red">X
                </strong>
            </span>
        </th>
        <th>
            Out
            <span class:block={screen.small}>
                $
                <input min="0"
                       step="0.00000001"
                       type="number"
                       bind:value={minOutputAmount}
                       on:change={update}/>
            </span>
            -
            <span class:block={screen.small}>
                $
                <input min="0"
                       step="0.00000001"
                       type="number"
                       bind:value={maxOutputAmount}
                       on:change={update}/>
                <strong on:click={clearOutputAmount}
                        class="red">X
                </strong>
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
            <tr class="header">
                <td>
                    <TimePastSince start={tx.block.medianTime * 1000}
                                   end={now}/>
                    <strong>{tx.block.blockHeight}</strong>
                </td>
                <td>
                    <button on:click={() => toggleTX('info', tx)}
                            class:info={tx === selectedTX && selectionType === 'info'}
                            type="button"
                            class="pure-button icon">
                        <Icon icon="info"/>
                    </button>
                    <button on:click={() => toggleTX('graph', tx)}
                            class:info={tx === selectedTX && selectionType === 'graph'}
                            type="button"
                            class="pure-button icon">
                        <Icon icon="graph"/>
                    </button>
                </td>
                {#if screen.large}
                    <td></td>
                    <td></td>
                {/if}
            </tr>
            <tr class:selected-row={tx === selectedTX}>
                <td>
                    <span class="amount">{tx.amountFrom}</span>
                    <span class="token">{tx.tokenFrom}</span>

                    {#if showProfitLoss(tx)}
                        <br/>
                        <span class="avg">
                            <span class="amount">~{avg(tx.amountFrom, tx.amountTo)}</span>
                            <span class="token">{tx.tokenTo}</span>
                        </span>

                        <br/>
                        <button on:click|preventDefault={() => toggleTX('swap', tx, tx.swap)}
                                class:info={tx === selectedTX && selectionType === 'swap'}
                                class="pure-button icon"
                                type="button">
                            <ProfitLoss poolSwap={tx.swap}
                                        estimate={tx.swap.estimate}/>
                        </button>
                    {/if}

                    <span class="dollar avg">
                        {#if showUSD(tx)}
                            {#if tx.tokenFrom !== 'USDT' && tx.tokenFrom !== 'USDC'}
                                <span class="amount">
                                    ${asShortAmount(tx.usdtSwap.estimate)}
                                </span>
                                <br/>
                            {/if}
                            <span class="amount">{asShortAmount(tx.dusd)}</span>
                            <span class="token">DUSD</span>
                        {/if}
                    </span>
                </td>
                <td>
                    <span>
                        <span class="amount">{tx.amountTo}</span>
                        <span class="token">{tx.tokenTo}</span>
                    </span>

                    {#if showProfitLoss(tx)}
                        <br/>
                        <span class="avg">
                            <span class="amount">~{avg(tx.amountTo, tx.amountFrom)} </span>
                            <span class="token">{tx.tokenFrom}</span>
                        </span>

                        <br/>
                        <button on:click|preventDefault={() => toggleTX('inverseSwap', tx, tx.inverseSwap)}
                                class:info={tx === selectedTX && selectionType === 'inverseSwap'}
                                class="pure-button icon"
                                type="button">
                            <ProfitLoss poolSwap={tx.inverseSwap}
                                        estimate={tx.inverseSwap.estimate}/>
                        </button>
                    {/if}

                    <span class="dollar avg">
                        {#if showUSD(tx)}
                            {#if tx.tokenTo !== 'USDT' && tx.tokenTo !== 'USDC'}
                                <span class="amount">
                                    ${asShortAmount(tx.usdtInverseSwap.estimate)}
                                </span>
                                <br/>
                            {/if}
                            <span class="amount">{asShortAmount(tx.inverseDUSD)}</span>
                            <span class="token">DUSD</span>
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
                            <Limit text={tx.to} />
                        {:else}
                            &lt;from address&gt;
                        {/if}
                    </td>
                {/if}
            </tr>
            {#if tx === selectedTX}
                <tr>
                    <td colspan={screen.small ? 2 : 4}>
                        {#if selectionType === 'info'}

                            {#if selectedTX}
                                <PoolSwapDetails tx={selectedTX}/>
                            {/if}
                        {:else if selectionType === 'graph'}
                            <QuickGraph freezeTokens={true}
                                        {allTokens}
                                        amount={1.0}
                                        fromTokenSymbol={tx.tokenFrom}
                                        toTokenSymbol={tx.tokenTo}/>
                        {:else if selectionType}
                            {#if hasItems(swapBreakdown.breakdown)}
                                <PoolSwapBreakdown maxPrice={false}
                                                   title={createTitle(tx, selectionType)}
                                                   poolSwap={swapBreakdown}/>
                            {:else}
                                <div class="warning">
                                    Something went wrong
                                </div>
                            {/if}
                        {/if}
                    </td>
                </tr>
            {/if}
        {/each}
        </tbody>
    {/if}
</table>

<style>
    td {
        position: relative;
    }

    .dollar {
        position: absolute;
        right: 0;
        bottom: 0;
        text-align: right;
        padding: 0.2rem;
    }

    table.large {
        table-layout: fixed;
    }

    .header td {
        border: 0;
        background-color: rgb(240, 240, 240);
    }

    table.small thead th {
        width: 50%;
    }

    table.large th:nth-child(3),  table.large th:nth-child(4) {
        width: 16ch;
    }

    table.small {
        font-size: 90%;
    }

    form, fieldset {
        padding: 0;
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

    .avg {
        font-size: 80%;
    }

    .avg .token {
        color: gray;
    }
</style>
