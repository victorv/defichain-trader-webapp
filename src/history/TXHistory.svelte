<script>
    import PoolSwapHistory from "./PoolSwapHistory.svelte";
    import {onDestroy, onMount} from "svelte";
    import Help from "../common/Help.svelte";
    import Icon from "../common/Icon.svelte";
    import {accountStore} from "../store";
    import Mempool from "../mempool/Mempool.svelte";

    export let allTokens
    export let filterOverrides

    let abortController = new AbortController()
    let items
    let error
    let mempool = false
    let filtersActive

    let loading
    let currentFilter

    let account
    let sub
    let hasMore
    let pager = {offset: 0}

    const filterState = state => filtersActive = state

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

        const requestBody = {...filter, ...(currentFilter || {}), ...(filterOverrides || {})}

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

    onMount(() => {
        sub = accountStore.subscribe(newAccount => account = newAccount)
    })

    onDestroy(() => sub())
</script>

{#if !filterOverrides}
    <form class="pure-form" on:submit|preventDefault={() => refresh(currentFilter || {})}>
        <fieldset>
            <select>
                <option>Pool Swaps</option>
            </select>
            <button disabled={mempool} class="pure-button icon" type="submit">
                <Icon icon="search"/>
            </button>
            <label on:click|preventDefault>
                Mempool
                <input bind:checked={mempool} type="checkbox"/>
                <Help help="Make a cup of tea, relax and watch transactions that were just announced come in. Maybe you will even see your own transaction here shortly after you have submitted it from your wallet."/>
            </label>
        </fieldset>
    </form>
{/if}

{#if mempool}
    <Mempool {allTokens}/>
{:else}
    <PoolSwapHistory {filterState} {allTokens} {items} {refresh} filter={!filterOverrides} mempool={false}/>

    {#if hasMore && !error && !filtersActive}
        <section class="pager">
            <button on:click={showMore} disabled={currentFilter && currentFilter.sort} class="pure-button"
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
    {:else if error}
        <div class="message">
            <p class="error">{error}</p>
        </div>
    {:else if loading}
        <div class="message">
            <p class="info">Loading results...</p>
        </div>
    {/if}
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