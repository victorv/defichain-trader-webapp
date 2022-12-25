<script>
    import FromToTokenFilter from "../dex/FromToTokenFilter.svelte";
    import PoolSwapDetails from "./PoolSwapDetails.svelte";
    import Icon from "../common/Icon.svelte";
    import PoolSwapBreakdown from "../dex/PoolSwapBreakdown.svelte";
    import {asDollars, hasItems} from "../common/common";
    import Help from "../common/Help.svelte";
    import {accountStore, screenStore, updateAccount, uuidStore} from "../store";
    import Limit from "../common/Limit.svelte";
    import TimePastSince from "../common/TimePastSince.svelte";
    import {onDestroy, onMount} from "svelte";

    let account
    let search
    let filterForm

    export let allTokens
    export let refresh
    export let items
    export let filter
    export let mempool
    export let filterState

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

    let subs = []
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

    let uuid

    onMount(async () => {
        const sub1 = accountStore.subscribe(newAccount => {
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

        const sub2 = uuidStore.subscribe(newUUID => {
            uuid = newUUID
        })

        subs.push(sub1)
        subs.push(sub2)

        interval = setInterval(() => {
            now = new Date().getTime()
        }, 30000)

        await update()
    })

    onDestroy(() => {
        clearInterval(interval)
        subs.forEach(sub => sub())
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

        filterForm = false
        filterState(filterForm)
        await updateSearch()
    }

    const clearTXID = async () => {
        txID = undefined
        await updateSearch()
    }

    const clearMinBlock = async () => {
        minBlock = undefined
        await updateSearch()
    }

    const clearMaxBlock = async () => {
        maxBlock = undefined
        await updateSearch()
    }

    const clearMinInputAmount = async () => {
        minInputAmount = undefined
        await updateSearch()
    }

    const clearMaxInputAmount = async () => {
        maxInputAmount = undefined
        await updateSearch()
    }

    const clearMinOutputAmount = async () => {
        minOutputAmount = undefined
        await updateSearch()
    }

    const clearMaxOutputAmount = async () => {
        maxOutputAmount = undefined
        await updateSearch()
    }

    const clearMinFee = async () => {
        minFee = undefined
        await updateSearch()
    }

    const clearMaxFee = async () => {
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

    const submitFilterForm = async () => {
        filterForm = false
        filterState(filterForm)
        await updateSearch()
    }

    const createTelegramNotification = async () => {
        const description = prompt("Describe your notification in short")
        if (description && description.length < 100) {
            const newSearch = createSearch()
            newSearch.fromAddressGroup = findAddresses(newSearch.fromAddressGroup)
            newSearch.toAddressGroup = findAddresses(newSearch.toAddressGroup)
            const response = await fetch(`/notification?uuid=${uuid}&description=${encodeURIComponent(description)}`, {
                method: 'POST',
                body: JSON.stringify(newSearch),
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            })
            if (response.ok) {
                const bot = window.location.hostname === 'localhost' ? 'DeFiChainTraderTestBot' : 'DeFiChainTraderBot'
                window.open(`https://telegram.me/${bot}?start=${uuid}`)
            } else {
                alert('Sorry we are unable to create this notification: ' + response.statusText)
            }
        }
    }
</script>

{#if filter !== false}
    <form class="pure-form" on:submit|preventDefault>
        <fieldset>
            <FromToTokenFilter supportAnyToken={true}
                               {allTokens} {fromTokenSymbol} {toTokenSymbol} {onTokenSelectionChanged}/>
            {#if account && !mempool}
                <p class="from-to">
                    From
                    <select class="pure-select" bind:value={fromAddressGroup} on:change={updateSearch}>
                        <option value="">Any</option>
                        {#each account.addressGroups as group}
                            <option value={group.name}>{group.name}</option>
                        {/each}
                    </select>
                    To
                    <select class="pure-select" bind:value={toAddressGroup} on:change={updateSearch}>
                        <option value="">Any</option>
                        {#each account.addressGroups as group}
                            <option value={group.name}>{group.name}</option>
                        {/each}
                    </select>

                    <button on:click={() => {filterForm = !filterForm; filterState(filterForm)}}
                            class="pure-button icon">
                        <Icon icon="filter"/>
                    </button>
                    <button disabled={!hasItems(poolSwaps) || txID} on:click={createTelegramNotification} class="pure-button" type="button">Create
                        notification
                    </button>
                </p>
            {/if}

        </fieldset>
    </form>
{/if}

{#if filterForm}
    <form class="pure-form pure-form-stacked" on:submit|preventDefault={submitFilterForm}>
        <fieldset>
            {#if !mempool}
                <label>
                    TX ID
                    <input type="text" bind:value={txID}/>
                </label>
            {/if}

            <div class="row">
                <label>
                    From Address
                    <input type="text" bind:value={fromAddress}/>
                </label>

                <label>
                    To Address
                    <input type="text" bind:value={toAddress}/>
                </label>
            </div>

            <div class="row">
                <label>
                    Min block height
                    <input min="0" step="1" type="number" bind:value={minBlock}/>
                </label>

                <label>
                    Max block height
                    <input min="0" step="1" type="number" bind:value={maxBlock}/>
                </label>
            </div>

            <div class="row">
                <label>
                    Min input amount (USD)
                    <input min="0" step="0.00000001" type="number" bind:value={minInputAmount}/>
                </label>

                <label>
                    Max input amount (USD)
                    <input min="0" step="0.00000001" type="number" bind:value={maxInputAmount}/>
                </label>
            </div>

            <div class="row">
                <label>
                    Min output amount (USD)
                    <input min="0" step="0.00000001" type="number" bind:value={minOutputAmount}/>
                </label>

                <label>
                    Max output amount (USD)
                    <input min="0" step="0.00000001" type="number" bind:value={maxOutputAmount}/>
                </label>
            </div>

            <div class="row">
                <label>
                    Min fee
                    <input min="0" step="0.00000001" type="number" bind:value={minFee}/>
                </label>
                <label>
                    Max fee
                    <input min="0" step="0.00000001" type="number" bind:value={maxFee}/>
                </label>
            </div>
            <button class="pure-button" type="submit">Apply filters</button>
        </fieldset>
    </form>
{:else}
    {#if account && !mempool}
        <form class="pure-form active-filters" on:submit|preventDefault>
            {#if minFee || maxFee || minBlock || maxBlock ||
            minInputAmount || maxInputAmount || minOutputAmount || maxOutputAmount ||
            txID || fromAddress || toAddress}
                <button on:click={clearAllFilters} class="pure-button" type="button">Remove filters</button>
            {/if}
            {#if minFee}
                <button on:click={clearMinFee} class="pure-button" type="button">
                    <strong class="red">X</strong> min fee: <strong>{minFee}</strong>
                </button>
            {/if}
            {#if maxFee}
                <button on:click={clearMaxFee} class="pure-button" type="button">
                    <strong class="red">X</strong> max fee: <strong>{maxFee}</strong>
                </button>
            {/if}
            {#if minBlock}
                <button on:click={clearMinBlock} class="pure-button" type="button">
                    <strong class="red">X</strong> min block height: <strong>{minBlock}</strong>
                </button>
            {/if}
            {#if maxBlock}
                <button on:click={clearMaxBlock} class="pure-button" type="button">
                    <strong class="red">X</strong> max block height: <strong>{maxBlock}</strong>
                </button>
            {/if}
            {#if minInputAmount}
                <button on:click={clearMinInputAmount} class="pure-button" type="button">
                    <strong class="red">X</strong> min input amount: <strong>${minInputAmount}</strong>
                </button>
            {/if}
            {#if maxInputAmount}
                <button on:click={clearMaxInputAmount} class="pure-button" type="button">
                    <strong class="red">X</strong> max input amount: <strong>${maxInputAmount}</strong>
                </button>
            {/if}
            {#if minOutputAmount}
                <button on:click={clearMinOutputAmount} class="pure-button" type="button">
                    <strong class="red">X</strong> min output amount: <strong>${minOutputAmount}</strong>
                </button>
            {/if}
            {#if maxOutputAmount}
                <button on:click={clearMaxOutputAmount} class="pure-button" type="button">
                    <strong class="red">X</strong> max output amount: <strong>${maxOutputAmount}</strong>
                </button>
            {/if}
            {#if txID}
                <button on:click={clearTXID} class="pure-button" type="button">
                    <strong class="red">X</strong> TX ID: <strong>{txID}</strong>
                </button>
            {/if}
            {#if fromAddress}
                <button on:click={clearFromAddress} class="pure-button" type="button">
                    <strong class="red">X</strong> From: <strong>{fromAddress}</strong>
                </button>
            {/if}
            {#if toAddress}
                <button on:click={clearToAddress} class="pure-button" type="button">
                    <strong class="red">X</strong> To: <strong>{toAddress}</strong>
                </button>
            {/if}
        </form>
        <br/>
    {/if}
    <table class:small={screen.small} class="pure-table pure-table-striped">
        {#if account && search}
            <thead>
            <tr>
                {#if screen.large}
                    <th>
                        TX ID
                    </th>
                {/if}
                <th>
                    {#if mempool}
                        Time
                    {:else}
                        Block
                    {/if}
                </th>
                <th>
                    Input Amount
                </th>
                <th>
                    Output Amount
                </th>
                {#if screen.large}
                    <th>
                        Fee
                    </th>
                    <th>
                        From
                    </th>
                    <th>
                        To
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
                        <br/>
                        <span>
                            <strong>{asDollars(tx.fromAmountUSD)}</strong>
                        </span>
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
                        <br/>
                        <span>
                            <strong>{asDollars(tx.toAmountUSD)}</strong>
                        </span>
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
{/if}

<style>
    form, fieldset {
        padding: 0;
    }

    .from-to {
        display: inline-block;
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

    .active-filters button {
        margin-bottom: 0.2rem;
    }

    .red {
        color: red;
    }

    .row {
        display: flex;
        flex-direction: row;
        gap: 0.5rem;
    }
</style>
