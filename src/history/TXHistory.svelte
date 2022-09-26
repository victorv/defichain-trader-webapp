<script>
    import PoolSwapHistory from "./PoolSwapHistory.svelte";
    import {onMount} from "svelte";

    export let allTokens

    let error
    let loading
    let items
    let filterString = ''
    let currentFilter

    let hasMore
    let pager = {offset: 0}

    const createPager = items => {
        if (items && items.length) {
            const maxBlockHeight = Math.min(
                ...items.map(item => (item.block || item.mempool).blockHeight)
            )
            const offset = items
                .filter(item => (item.block || item.mempool).blockHeight === maxBlockHeight)
                .length
            console.log(maxBlockHeight, offset)

            return {
                maxBlockHeight,
                offset,
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

        try {
            loading = true
            const response = await fetch(`/poolswaps`, {
                method: 'POST',
                body: JSON.stringify(requestBody),
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            })

            let newItems = await response.json()
            hasMore = newItems.length > 25
            newItems = newItems.slice(0, 25)

            pager = createPager(newItems)
            items = getMore
                ? items = items.concat(...newItems)
                : newItems
        } finally {
            loading = false
        }
    }

    const showMore = async() => {
        await refresh(currentFilter || {}, true)
    }

    const refresh = async (filter, getMore) => {
        currentFilter = filter
        await fetchItems(filter, getMore).catch(e => {
            error = `Unable to fetch results: ${e.message}`
            throw e
        })
    }

    onMount(async () => await refresh({}))
</script>

<form class="pure-form" on:submit|preventDefault={() => refresh(currentFilter || {})}>
    <fieldset>
        <select>
            <option>Pool Swaps</option>
        </select>
        <input bind:value={filterString} type="text" size="64" placeholder="TX ID/Address/Block Hash"/>
        <label>
            Mempool
            <input type="checkbox"/>
        </label>
    </fieldset>
</form>

<PoolSwapHistory {allTokens} {items} {refresh}/>

{#if hasMore && (!currentFilter || !currentFilter.sort)}
    <section class="pager">
        <button on:click={showMore} class="pure-button" type="button">Show more</button>
    </section>
{/if}

{#if items && !items.length}
    <div class="message">
        <p class="info">0 results found</p>
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