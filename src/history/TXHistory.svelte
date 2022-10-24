<script>
    import PoolSwapHistory from "./PoolSwapHistory.svelte";
    import {onMount} from "svelte";
    import Help from "../common/Help.svelte";

    export let allTokens

    let abortController = new AbortController()
    let items
    let error

    let loading
    let filterString = ''
    let currentFilter

    let hasMore
    let pager = {offset: 0}

    const createPager = items => {
        if (items && items.length) {
            const maxBlockHeight = Math.min(
                ...items.map(item => (item.block || item.mempool).blockHeight)
            )
            const blacklist = items
                .filter(item => (item.block || item.mempool).blockHeight === maxBlockHeight)
                .map(item => item.id)

            return {
                maxBlockHeight,
                blacklist,
            }
        }
        return {offset: 0}
    }

    async function fetchItems(filter, getMore) {
        hasMore = false
        error = null
        items = getMore ? items : null

        const requestBody = {...filter, ...(currentFilter || {})}

        if (filterString) {
            requestBody.filterString = filterString
        } else if (filterString === 'NA') {
            requestBody.filterString = ''
        }
        if (getMore) {
            requestBody.pager = pager
        }

        abortController.abort()
        abortController = new AbortController()

        loading = true

        const response = await fetch(`/poolswaps`, {
            method: 'POST',
            body: JSON.stringify(requestBody),
            signal: abortController.signal,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        })

        let newItems = await response.json()
        loading = false
        hasMore = newItems.length > 25
        newItems = newItems.slice(0, 25)

        pager = createPager(newItems)
        items = getMore
            ? items = items.concat(...newItems)
            : newItems

    }

    const showMore = async () => {
        await refresh(currentFilter || {}, true)
    }

    const refresh = async (filter, getMore) => {
        currentFilter = filter
        await fetchItems(filter, getMore).catch(e => {
            if (e.name !== 'AbortError') {
                loading = false
                error = `Unable to fetch results: ${e.message}`
                throw e
            }
        })
    }

    onMount(async () => {
        await refresh({})
    })
</script>

<form class="pure-form" on:submit|preventDefault={() => refresh(currentFilter || {})}>
    <fieldset>
        <select>
            <option>Pool Swaps</option>
        </select>
        <input bind:value={filterString} type="text" placeholder="TX ID/Address/Block Hash"/>
        <button class="pure-button" type="submit">Refresh</button>
    </fieldset>
</form>

<PoolSwapHistory {allTokens} {items} {refresh}/>

{#if hasMore && !error}
    <section class="pager">
        <button on:click={showMore} disabled={currentFilter && currentFilter.sort} class="pure-button" type="button">
            Show more
        </button>
        {#if currentFilter && currentFilter.sort}
            <Help help="Paging currently only works for Most Recent - Old"/>
        {/if}
    </section>
{/if}

{#if items && !items.length}
    <div class="message">
        <p class="info">
            0 results found
        </p>
    </div>
{:else if error}
    <div class="message">
        <p class="error">{error}</p>
    </div>
{:else if loading}
    <div class="message">
        <p class="info">Loading results...</p>
    </div>
{/if}

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
</style>