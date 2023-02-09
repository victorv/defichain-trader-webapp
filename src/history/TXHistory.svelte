<script context="module">
    import {filterStore} from "../store";

    let storedFilter = {}

    const storeFilter = filter => {
        storedFilter = filter || {}
        filterStore.set(storedFilter)
    }

    filterStore.subscribe(filter => {
        if (localStorage && filter && typeof filter === 'object') {
            localStorage.setItem('filter', JSON.stringify(filter))
        }
    })

    filterStore.subscribe(filter => storedFilter = filter)
</script>

<script>
    import PoolSwapHistory from "./PoolSwapHistory.svelte";
    import {onDestroy, onMount} from "svelte";
    import Icon from "../common/Icon.svelte";
    import {accountStore, screenStore, uuidStore} from "../store";
    import Request from "../Request.svelte";
    import PoolLiquidity from "./PoolLiquidity.svelte";
    import GlobalFilters from "./GlobalFilters.svelte";
    import Tools from "./Tools.svelte";
    import Loans from "./Loans.svelte";

    export let allTokens

    let viewTypes = [{
        id: 'PoolSwap',
        label: 'Pool Swaps',
        path: 'poolswaps',
        tools: {
            stats: true,
            telegram: true,
            download: true,
        }
    }, {
        id: 'PoolLiquidity',
        label: 'Pool Liquidity',
        path: 'poolliquidity',
        tools: {
            stats: false,
            telegram: false,
            download: true,
        }
    },
        {
            id: 'Loan',
            label: 'Loans',
            path: 'loans',
            tools: {
                stats: false,
                telegram: false,
                download: true,
            }
        }
    ]

    const getViewType = (filter) => {
        const hash = (window.location.hash || '').toLowerCase()
        for (const viewType of viewTypes) {
            if (hash.includes(viewType.id.toLowerCase())) {
                return viewType
            }
        }
        return viewTypes.find(v => v.id === filter.id) || viewTypes[0]
    }

    let currentFilter = storedFilter
    let query = currentFilter.query

    let viewType = getViewType(currentFilter)
    let abortController = new AbortController()
    let items
    let search
    let request
    let screen

    let subs = []
    let uuid
    let account
    let hasMore
    let pager = {offset: 0}

    const createPager = items => {
        if (items && items.length) {
            const maxBlockHeight = Math.min(
                ...items.map(item => item.blockHeight)
            )
            const blacklist = items
                .filter(item => item.blockHeight === maxBlockHeight)
                .map(item => item.id)

            return {
                maxBlockHeight,
                blacklist,
            }
        }
        return {offset: 0}
    }

    const setRemoteFilter = async () => {
        const requestBody = {
            ...(currentFilter || {}),
            id: viewType.id,
            minDateText: undefined,
            maxDateText: undefined,
            fromAddressGroupText: undefined,
            toAddressGroupText: undefined
        }

        const response = await fetch(`/update?uuid=${uuid}`, {
            method: 'POST',
            body: JSON.stringify(requestBody),
            signal: abortController.signal,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        })
        return response.ok
    }

    async function fetchItems(filter, getMore) {
        hasMore = false

        search = getMore ? search : null
        items = getMore ? items : null

        const requestBody = {
            ...(currentFilter || {}),
            ...filter,
            id: viewType.id,
            pager: null,
            query
        }
        currentFilter = requestBody
        storeFilter(currentFilter)

        if (getMore) {
            requestBody.pager = pager
        }

        abortController.abort()
        abortController = new AbortController()

        request = {
            loading: true,
            error: null,
        }

        const response = await fetch(`/${viewType.path}?uuid=${uuid}`, {
            method: 'POST',
            body: JSON.stringify({
                ...requestBody,
                minDateText: undefined,
                maxDateText: undefined,
                fromAddressGroupText: undefined,
                toAddressGroupText: undefined
            }),
            signal: abortController.signal,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        })

        search = await response.json()
        let newItems = search.results
        request = {
            loading: false,
            error: null,
        }
        hasMore = newItems.length > 25
        newItems = newItems.slice(0, 25)

        pager = createPager(newItems)
        items = getMore
            ? items = items.concat(...newItems)
            : newItems

    }

    const changeViewType = () => {
        items = null
        pager = {offset: 0}
    }

    const showMore = async () => {
        await refresh(currentFilter || {}, true)
    }

    const refresh = async (filter, getMore) => {
        return await fetchItems(filter, getMore).catch(e => {
            if (e.name !== 'AbortError') {
                request = {
                    loading: false,
                    error: `Unable to fetch results: ${e.message}`,
                }
                throw e
            }
        })
    }

    onMount(() => {
        const sub1 = accountStore.subscribe(newAccount => account = newAccount)
        const sub2 = uuidStore.subscribe(newUUID => {
            uuid = newUUID
        })
        const sub3 = screenStore.subscribe(newScreen => screen = newScreen)

        subs.push(sub1, sub2, sub3)
    })

    onDestroy(() => subs.forEach(sub => sub()))
</script>

<form on:submit|preventDefault={() => refresh(currentFilter || {})}>
    <select on:change={changeViewType} bind:value={viewType}>
        {#each viewTypes as viewType}
            <option value={viewType}>{viewType.label}</option>
        {/each}
    </select>
    <input bind:value={query} type="text" placeholder="address/tx/block height"/>
    <button class="pure-button icon" type="submit">
        <Icon icon="search"/>
    </button>
    <p class="overflow">
        <GlobalFilters {currentFilter} updateSearch={refresh}/>
    </p>
</form>

<Tools tools={viewType.tools} {uuid} {items} {setRemoteFilter} {currentFilter}/>
{#if screen}
    {#if viewType.id === 'PoolSwap'}
        <PoolSwapHistory {currentFilter} {screen} {allTokens} {items} {refresh}/>
    {:else if viewType.id === 'PoolLiquidity'}
        <PoolLiquidity {items} {refresh}/>
    {:else if viewType.id === 'Loan'}
        <Loans {items} {refresh}/>
    {/if}
{/if}

{#if hasMore && !request.error}
    <section class="pager">
        <button on:click={showMore} class="pure-button"
                type="button">
            Show more
        </button>
    </section>
{/if}

{#if items && !items.length}
    <div class="message">
        <p class="info">
            0 results found
        </p>
    </div>
{/if}

<Request {request}/>

<style>
    .pager {
        display: flex;
        padding: 0.3rem;
        justify-content: center;
    }

    form {
        padding-left: 0.2rem;
    }

    .message {
        display: flex;
        justify-content: center;
    }

    .overflow {
        overflow: visible;
    }
</style>