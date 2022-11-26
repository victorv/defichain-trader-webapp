<script>
    import FromToTokenFilter from "../dex/FromToTokenFilter.svelte";
    import PoolSwapDetails from "./PoolSwapDetails.svelte";
    import Icon from "../common/Icon.svelte";
    import PoolSwapBreakdown from "../dex/PoolSwapBreakdown.svelte";
    import {hasItems} from "../common/common";
    import Help from "../common/Help.svelte";
    import {accountStore, screenStore, updateAccount} from "../store";
    import Limit from "../common/Limit.svelte";
    import TimePastSince from "../common/TimePastSince.svelte";
    import {onDestroy, onMount} from "svelte";

    let account
    let search

    export let allTokens
    export let refresh
    export let items
    export let filter
    export let mempool

    let txID
    let minBlock
    let maxBlock
    let minInputAmount
    let maxInputAmount
    let minOutputAmount
    let maxOutputAmount
    let minFee
    let maxFee
    let fromAddressGroup
    let fromAddress
    let toAddressGroup
    let toAddress

    let sub
    let now = new Date().getTime()
    let interval

    $: poolSwaps = items
    $: if (items) {
        now = new Date().getTime()
    }

    let swapFromTo
    let swapToFrom
    let fromTokenSymbol
    let toTokenSymbol

    let selectedTX
    let screen

    onMount(async () => {
        sub = accountStore.subscribe(newAccount => {
            account = newAccount
            search = (mempool ? account.mempoolSearch : account.swapSearch) || {}
            txID = search.txID
            minBlock = search.minBlock
            maxBlock = search.maxBlock
            minInputAmount = search.minInputAmount
            maxInputAmount = search.maxInputAmount
            minOutputAmount = search.minOutputAmount
            maxOutputAmount = search.maxOutputAmount
            minFee = search.minFee
            maxFee = search.maxFee
            fromAddressGroup = search.fromAddressGroup || ''
            fromAddress = search.fromAddress
            toAddressGroup = search.toAddressGroup || ''
            toAddress = search.toAddress
        })

        interval = setInterval(() => {
            now = new Date().getTime()
        }, 30000)

        await update()
    })

    onDestroy(() => {
        clearInterval(interval)
        sub()
    })

    screenStore.subscribe(newScreen => screen = newScreen)

    async function update() {
        const newSearch = createSearch()
        newSearch.fromAddressGroup = findAddresses(newSearch.fromAddressGroup)
        newSearch.toAddressGroup = findAddresses(newSearch.toAddressGroup)
        await refresh(newSearch)
    }

    const findAddresses = groupName => {
        const group = account.addressGroups.find(ag => ag.name === groupName)
        if (group) {
            return group.addresses
        }
        return undefined
    }

    const clearAllFilters = async () => {
        txID = undefined
        minBlock = undefined
        maxBlock = undefined
        minInputAmount = undefined
        maxInputAmount = undefined
        minOutputAmount = undefined
        maxOutputAmount = undefined
        minFee = undefined
        maxFee = undefined
        fromAddress = undefined
        toAddress = undefined
        await updateSearch()
    }

    const clearTXID = async () => {
        txID = undefined
        await updateSearch()
    }

    const clearBlockRange = async () => {
        minBlock = undefined
        maxBlock = undefined
        await updateSearch()
    }

    const clearInputAmountRange = async () => {
        minInputAmount = undefined
        maxInputAmount = undefined
        await updateSearch()
    }

    const clearOutputAmountRange = async () => {
        minOutputAmount = undefined
        maxOutputAmount = undefined
        await updateSearch()
    }

    const clearFeeRange = async () => {
        minFee = undefined
        maxFee = undefined
        await updateSearch()
    }

    const clearFromAddress = async () => {
        fromAddress = undefined
        await updateSearch()
    }

    const clearToAddress = async () => {
        toAddress = undefined
        await updateSearch()
    }

    const createSearch = () => {
        const newSearch = {
            txID,
            minBlock,
            maxBlock,
            minInputAmount,
            maxInputAmount,
            minOutputAmount,
            maxOutputAmount,
            minFee,
            maxFee,
            fromAddressGroup,
            fromAddress,
            toAddressGroup,
            toAddress
        }
        if (fromTokenSymbol && fromTokenSymbol != 'Any') {
            newSearch.fromTokenSymbol = fromTokenSymbol
        }
        if (toTokenSymbol && toTokenSymbol != 'Any') {
            newSearch.toTokenSymbol = toTokenSymbol
        }

        return newSearch
    }

    const updateSearch = async () => {
        const newSearch = createSearch()

        const searchUpdate = {}
        if (mempool) {
            searchUpdate.mempoolSearch = newSearch
        } else {
            searchUpdate.swapSearch = newSearch
        }
        updateAccount(searchUpdate)
        await update()
    }

    const onTokenSelectionChanged = async selection => {
        fromTokenSymbol = selection.fromTokenSymbol
        toTokenSymbol = selection.toTokenSymbol
        await update()
    }

    const toggleTXDetails = async tx => {
        swapFromTo = null
        swapToFrom = null

        selectedTX === tx ? selectedTX = null : selectedTX = tx
    }

    const toggleEstimateFromTo = async (swap) => {
        selectedTX = null
        swapToFrom = null

        if (swapFromTo && swapFromTo.tx === swap) {
            swapFromTo = null
            return
        }

        const request = `${swap.amountFrom}+${swap.tokenFrom}+to+${swap.tokenTo}+desiredResult+${swap.amountTo || 1.0}`
        const response = await fetch(`/estimate?poolswap=${request}`)
        swapFromTo = await response.json()
        swapFromTo.tx = swap
    }

    const toggleEstimateToFrom = async (swap) => {
        selectedTX = null
        swapFromTo = null

        if (swapToFrom && swapToFrom.tx === swap) {
            swapToFrom = null
            return
        }

        const request = `${swap.amountTo}+${swap.tokenTo}+to+${swap.tokenFrom}+desiredResult+${swap.amountFrom}`
        const response = await fetch(`/estimate?poolswap=${request}`)
        swapToFrom = await response.json()
        swapToFrom.tx = swap
    }
</script>

{#if filter !== false}
    <form class="pure-form" on:submit|preventDefault>
        <fieldset>
            <FromToTokenFilter supportAnyToken={true}
                               {allTokens} {fromTokenSymbol} {toTokenSymbol} {onTokenSelectionChanged}/>
            <button class="pure-button" on:click={clearAllFilters}>Clear Filters</button>
        </fieldset>
    </form>
{/if}

<form on:submit|preventDefault={updateSearch}>
    <table class:small={screen.small} class="pure-table pure-table-striped">
        {#if account && search}
            <thead>
            <tr>
                {#if screen.large}
                    <th>
                        TX ID
                        {#if !mempool}
                            <button on:click={clearTXID}
                                    type="button" class="icon pure-button">X</button>
                            <div>
                                <input type="text" bind:value={txID}/>
                            </div>
                        {/if}
                    </th>
                {/if}
                <th>
                    {#if mempool}
                        Time
                    {:else}
                        Block
                        <button on:click={clearBlockRange}
                                type="button" class="icon pure-button">X</button>
                        <div>
                            <input type="number" bind:value={minBlock}/>
                            -
                            <input type="number" bind:value={maxBlock}/>
                        </div>
                    {/if}
                </th>
                <th>
                    Input Amount
                    <button on:click={clearInputAmountRange}
                            type="button" class="icon pure-button">X</button>
                    <div>
                        $<input type="number" bind:value={minInputAmount}/>
                        -
                        $<input type="number" bind:value={maxInputAmount}/>
                    </div>
                </th>
                <th>
                    Output Amount
                    <button on:click={clearOutputAmountRange}
                             type="button" class="icon pure-button">X</button>
                    <div>
                        $<input type="number" bind:value={minOutputAmount}/>
                        -
                        $<input type="number" bind:value={maxOutputAmount}/>
                    </div>
                </th>
                {#if screen.large}
                    <th>
                        Fee
                        <button on:click={clearFeeRange}
                                type="button" class="icon pure-button">X</button>
                        <div>
                            <input type="number" bind:value={minFee}/>
                            -
                            <input type="number" bind:value={maxFee}/>
                        </div>
                    </th>
                    <th>
                        From
                        <button on:click={clearFromAddress}
                                type="button" class="icon pure-button">X</button>
                        <div>
                            <select class="pure-select" bind:value={fromAddressGroup} on:change={updateSearch}>
                                <option value="">Any</option>
                                {#each account.addressGroups as group}
                                    <option value={group.name}>{group.name}</option>
                                {/each}
                            </select>
                            <input type="text" bind:value={fromAddress}/>
                        </div>
                    </th>
                    <th>
                        To
                        <button on:click={clearToAddress}
                                type="button" class="icon pure-button">X</button>
                        <div>
                            <select class="pure-select" bind:value={toAddressGroup} on:change={updateSearch}>
                                <option value="">Any</option>
                                {#each account.addressGroups as group}
                                    <option value={group.name}>{group.name}</option>
                                {/each}
                            </select>
                            <input type="text" bind:value={toAddress}/>
                        </div>
                    </th>
                {/if}
            </tr>
            </thead>
        {/if}
        {#if items && items.length}
            <tbody>
            {#each poolSwaps as tx}
                <tr class:selected-row={tx === selectedTX || (swapFromTo && swapFromTo.tx === tx) || (swapToFrom && swapToFrom.tx === tx)}>
                    {#if screen.large}
                        <td>
                            <button on:click={() => toggleTXDetails(tx)}
                                    class:info={tx === selectedTX}
                                    type="button"
                                    class="pure-button info-button icon">
                                <Icon icon="info"/>
                            </button>

                            <Limit text={tx.txID}/>
                        </td>
                    {/if}
                    <td>
                        {#if screen.small}
                            <button on:click={() => toggleTXDetails(tx)}
                                    class:info={tx === selectedTX}
                                    type="button"
                                    class="pure-button info-button icon">
                                <Icon icon="info"/>
                            </button>
                        {/if}
                        {#if tx.block}
                            <TimePastSince start={tx.block.medianTime * 1000} end={now}/>
                            <br/>
                            <strong>{tx.block.blockHeight}</strong>
                        {:else}
                            <TimePastSince start={tx.mempool.time} end={now}/>
                            {#if !mempool}
                                <br/>
                                <strong>{tx.mempool.blockHeight}</strong>
                                <Help warning={true} help="This TX has not been confirmed so far"/>
                            {/if}
                        {/if}
                    </td>
                    <td>
                        <button on:click={() => toggleEstimateFromTo(tx)}
                                class:info={swapFromTo && swapFromTo.tx === tx}
                                type="button"
                                class="pure-button info-button icon">
                            <Icon icon="exchange"/>
                        </button>
                        <span>{tx.amountFrom}</span>
                        <span>{tx.tokenFrom}</span>
                    </td>
                    <td>
                        <button on:click={() => toggleEstimateToFrom(tx)}
                                disabled={!tx.amountTo}
                                class:info={swapToFrom && swapToFrom.tx === tx}
                                type="button"
                                class="pure-button info-button icon">
                            <Icon icon="exchange"/>
                        </button>
                        {#if tx.amountTo}
                            <span>{tx.amountTo}</span>
                            <span>{tx.tokenTo}</span>
                            {#if tx.tokenTo !== tx.tokenToAlt}
                                or {tx.tokenToAlt}
                                <Help help="This transaction contains conflicting information that specifies two distinct outcomes."/>
                            {/if}
                        {:else}
                            N/A {tx.tokenTo}
                        {/if}
                    </td>
                    {#if screen.large}
                        <td>
                            {tx.fee}
                        </td>
                        <td>
                            <Limit text={tx.from}/>
                        </td>
                        <td>
                            {#if tx.from != tx.to}
                                <Limit text={tx.to}/>
                            {:else}
                                &lt;from address&gt;
                            {/if}
                        </td>
                    {/if}
                </tr>
                {#if tx === selectedTX}
                    <tr>
                        <td colspan="7">
                            {#if selectedTX}
                                <PoolSwapDetails tx={selectedTX}/>
                            {/if}
                        </td>
                    </tr>
                {:else if swapFromTo && swapFromTo.tx === tx}
                    <tr>
                        <td colspan="7">
                            {#if hasItems(swapFromTo.breakdown)}
                                <PoolSwapBreakdown poolSwap={swapFromTo}/>
                            {:else}
                                <div class="warning">
                                    Something went wrong
                                </div>
                            {/if}
                        </td>
                    </tr>
                {:else if swapToFrom && swapToFrom.tx === tx}
                    <tr>
                        <td colspan="7">
                            {#if hasItems(swapToFrom.breakdown)}
                                <PoolSwapBreakdown poolSwap={swapToFrom}/>
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
    <button type="submit"></button>
</form>

<style>
    form {
        padding: 0.2rem 0 0 0.2rem;
    }

    tr.selected-row td {
        background: #333;
        color: white;
    }

    tr.selected-row a {
        color: white;
    }

    td[colspan="7"] {
        padding: 0.5rem;
    }

    table.small td > * {
        display: block;
    }

    th input, th select {
        max-width: 4rem;
    }
</style>
