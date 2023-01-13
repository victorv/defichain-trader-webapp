<script>
    import FromToTokenFilter from "../dex/FromToTokenFilter.svelte";
    import PoolSwapDetails from "./PoolSwapDetails.svelte";
    import Icon from "../common/Icon.svelte";
    import PoolSwapBreakdown from "../dex/PoolSwapBreakdown.svelte";
    import {asDollars, asUSDT, hasItems} from "../common/common";
    import Help from "../common/Help.svelte";
    import {accountStore, screenStore, updateAccount, uuidStore} from "../store";
    import Limit from "../common/Limit.svelte";
    import TimePastSince from "../common/TimePastSince.svelte";
    import {onDestroy, onMount} from "svelte";
    import Popup from "../Popup.svelte";
    import ActiveFilters from "./ActiveFilters.svelte";

    let account
    let search
    let filterForm
    let createNotification
    let notificationError
    let notificationURL

    export let allTokens
    export let refresh
    export let items
    export let filter
    export let filterState

    let notificationTitle
    let txID
    let minBlock
    let maxBlock
    let minInputAmount
    let maxInputAmount
    let minOutputAmount
    let maxOutputAmount
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
            search = account.swapSearch || {}
            txID = search.txID
            minBlock = search.minBlock
            maxBlock = search.maxBlock
            minInputAmount = search.minInputAmount
            maxInputAmount = search.maxInputAmount
            minOutputAmount = search.minOutputAmount
            maxOutputAmount = search.maxOutputAmount
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
            txID: txID || undefined,
            minBlock: minBlock || undefined,
            maxBlock: maxBlock || maxBlock,
            minInputAmount: minInputAmount || undefined,
            maxInputAmount: maxInputAmount || undefined,
            minOutputAmount: minOutputAmount || undefined,
            maxOutputAmount: maxOutputAmount || undefined,
            fromAddressGroup: fromAddressGroup || undefined,
            fromAddress: fromAddress || undefined,
            toAddressGroup: toAddressGroup || undefined,
            toAddress: toAddress || undefined
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
        searchUpdate.swapSearch = newSearch

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
        const newSearch = createSearch()
        newSearch.fromAddressGroup = findAddresses(newSearch.fromAddressGroup)
        newSearch.toAddressGroup = findAddresses(newSearch.toAddressGroup)
        const response = await fetch(`/notification?uuid=${uuid}&description=${encodeURIComponent(notificationTitle)}`, {
            method: 'POST',
            body: JSON.stringify(newSearch),
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        })
        if (response.ok) {
            const bot = window.location.hostname === 'localhost' ? 'DeFiChainTraderTestBot' : 'DeFiChainTraderBot'
            notificationURL = `https://telegram.me/${bot}?start=${uuid}`
        } else {
            notificationError = 'Sorry we are unable to create this notification: ' + response.statusText
        }
    }

    const newTelegramNotification = () => {
        createNotification = true
        notificationError = null
        notificationURL = null
    }
</script>

{#if createNotification}
    <Popup onClose={() => createNotification = false}>
        <form class="pure-form notification-form" slot="header" on:submit|preventDefault={createTelegramNotification}>
            {#if notificationError}
                <p class="error">
                    {notificationError}
                </p>
            {:else}
                <input on:keydown={() => notificationURL = null} type="text" bind:value={notificationTitle}
                       placeholder="Title"/>
                <button disabled={!notificationTitle || notificationTitle.length > 75 || notificationURL}
                        class="pure-button pure-button-primary" type="submit">
                    Submit notification
                </button>
            {/if}
        </form>
        <div slot="content">
            <br/>
            <p>
                {#if notificationURL}
                    You can now approve your notification <a href={notificationURL} target="_blank">in
                    Telegram</a>. While you do so you need to keep this tab open or it won't work. Click the link to get
                    started.
                {:else}
                    <em>Submit your notification with a title of your choice.</em>
                {/if}
            </p>
            <ActiveFilters
                    {txID}
                    {minBlock}
                    {maxBlock}
                    {fromTokenSymbol}
                    {toTokenSymbol}
                    {minInputAmount}
                    {maxInputAmount}
                    {minOutputAmount}
                    {maxOutputAmount}
                    {fromAddressGroup}
                    {fromAddress}
                    {toAddressGroup}
                    {toAddress}/>
        </div>
    </Popup>
{/if}

{#if filter !== false}
    <form class="pure-form" on:submit|preventDefault>
        <fieldset>
            {#if !filterForm}
                <FromToTokenFilter supportAnyToken={true} supportPseudo={true}
                                   {allTokens} {fromTokenSymbol} {toTokenSymbol} {onTokenSelectionChanged}/>
                {#if account}
                    <p class="from-to">
                        <button disabled={filterForm} on:click={() => {filterForm = true; filterState(filterForm)}}
                                class="pure-button icon" type="button">
                            <Icon icon="filter"/>
                        </button>

                        <button disabled={!hasItems(poolSwaps)} on:click={newTelegramNotification}
                                class="pure-button icon" type="button">
                            <Icon icon="telegram"/>
                        </button>
                    </p>
                {/if}
            {/if}
        </fieldset>
    </form>
{/if}

{#if filterForm}
    <form class="pure-form pure-form-stacked" on:submit|preventDefault={submitFilterForm}>
        <fieldset>
            <label>
                TX ID
                <input type="text" bind:value={txID}/>
            </label>

            <div class="row">
                <label>
                    From address in
                    <select class="pure-select address-group" bind:value={fromAddressGroup}
                            on:change={updateSearch}>
                        <option value="">Any</option>
                        {#each account.addressGroups as group}
                            <option value={group.name}>{group.name}</option>
                        {/each}
                    </select>
                </label>

                <label>
                    To address in
                    <select class="pure-select address-group" bind:value={toAddressGroup} on:change={updateSearch}>
                        <option value="">Any</option>
                        {#each account.addressGroups as group}
                            <option value={group.name}>{group.name}</option>
                        {/each}
                    </select>
                </label>
            </div>

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
                    Min input amount (USDT)
                    <input min="0" step="0.00000001" type="number" bind:value={minInputAmount}/>
                </label>

                <label>
                    Max input amount (USDT)
                    <input min="0" step="0.00000001" type="number" bind:value={maxInputAmount}/>
                </label>
            </div>

            <div class="row">
                <label>
                    Min output amount (USDT)
                    <input min="0" step="0.00000001" type="number" bind:value={minOutputAmount}/>
                </label>

                <label>
                    Max output amount (USDT)
                    <input min="0" step="0.00000001" type="number" bind:value={maxOutputAmount}/>
                </label>
            </div>
            <button class="pure-button" type="submit">Apply filters</button>
        </fieldset>
    </form>
{:else}
    {#if account}
        <form class="pure-form active-filters" on:submit|preventDefault>
            {#if minBlock || maxBlock ||
            minInputAmount || maxInputAmount || minOutputAmount || maxOutputAmount ||
            txID || fromAddress || toAddress}
                <button on:click={clearAllFilters} class="pure-button" type="button">Remove filters</button>
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
                    <strong class="red">X</strong> min input amount: <strong>{minInputAmount} USDT</strong>
                </button>
            {/if}
            {#if maxInputAmount}
                <button on:click={clearMaxInputAmount} class="pure-button" type="button">
                    <strong class="red">X</strong> max input amount: <strong>{maxInputAmount} USDT</strong>
                </button>
            {/if}
            {#if minOutputAmount}
                <button on:click={clearMinOutputAmount} class="pure-button" type="button">
                    <strong class="red">X</strong> min output amount: <strong>{minOutputAmount} USDT</strong>
                </button>
            {/if}
            {#if maxOutputAmount}
                <button on:click={clearMaxOutputAmount} class="pure-button" type="button">
                    <strong class="red">X</strong> max output amount: <strong>{maxOutputAmount} USDT</strong>
                </button>
            {/if}
            {#if txID}
                <button on:click={clearTXID} class="pure-button" type="button">
                    <strong class="red">X</strong> TX ID: <strong class="limited">{txID}</strong>
                </button>
            {/if}
            {#if fromAddress}
                <button on:click={clearFromAddress} class="pure-button" type="button">
                    <strong class="red">X</strong> From: <strong class="limited">{fromAddress}</strong>
                </button>
            {/if}
            {#if toAddress}
                <button on:click={clearToAddress} class="pure-button" type="button">
                    <strong class="red">X</strong> To: <strong class="limited">{toAddress}</strong>
                </button>
            {/if}
        </form>
        <br/>
    {/if}
    <table class:small={screen.small} class="pure-table pure-table-striped">
        {#if account && search}
            <thead>
            <tr>
                <th>
                    Block
                </th>
                <th>
                    Input Amount
                </th>
                <th>
                    Output Amount
                </th>
                {#if screen.large}
                    <th>
                        From
                        <select class="pure-select address-group" bind:value={fromAddressGroup}
                                on:change={updateSearch}>
                            <option value="">Any</option>
                            {#each account.addressGroups as group}
                                <option value={group.name}>{group.name}</option>
                            {/each}
                        </select>
                    </th>
                    <th>
                        To
                        <select class="pure-select address-group" bind:value={toAddressGroup} on:change={updateSearch}>
                            <option value="">Any</option>
                            {#each account.addressGroups as group}
                                <option value={group.name}>{group.name}</option>
                            {/each}
                        </select>
                    </th>
                {/if}
            </tr>
            </thead>
        {/if}
        {#if items && items.length}
            <tbody>
            {#each poolSwaps as tx}
                <tr class:selected-row={tx === selectedTX || (swapFromTo && swapFromTo.tx === tx) || (swapToFrom && swapToFrom.tx === tx)}>
                    <td>

                        <button on:click={() => toggleTXDetails(tx)}
                                class:info={tx === selectedTX}
                                type="button"
                                class="pure-button info-button icon">
                            <Icon icon="info"/>
                        </button>

                        {#if tx.block}
                            <TimePastSince start={tx.block.medianTime * 1000} end={now}/>
                            <br/>
                            <strong>{tx.block.blockHeight}</strong>
                        {:else}
                            <TimePastSince start={tx.mempool.time} end={now}/>
                            <br/>
                            <strong>{tx.mempool.blockHeight}</strong>
                            <Help warning={true} help="This TX has not been confirmed so far"/>
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
                            <strong>{asUSDT(tx.fromAmountUSD)}</strong>
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
                            <strong>{asUSDT(tx.toAmountUSD)}</strong>
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

    .notification-form {
        display: flex;
        flex-direction: row;
        gap: 1rem;
    }

    .address-group {
        max-width: 6rem;
    }
</style>
