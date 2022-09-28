<script>
    import PoolSwapHistory from "./PoolSwapHistory.svelte";
    import {onDestroy, onMount} from "svelte";
    import Help from "../common/Help.svelte";

    export let allTokens

    let mempool
    let items
    let error
    let connected

    let socket

    const newSocket = () => {
        if (socket) {
            socket.onclose = function () {
            }
            socket.close()
        }

        socket = new WebSocket(`${window.location.host.indexOf('localhost') >= 0 ? 'ws' : 'wss'}://${window.location.host}/stream`)

        window.onbeforeunload = function () {
            socket.onclose = function () {
            }
            socket.close()
        }

        socket.onopen = () => {
            connected = true
            items = []
            error = null
        }

        socket.onclose = function () {
            error = 'You are not connected to the server'
            items = null
            connected = false
        }

        socket.onmessage = function (event) {
            if (!mempool) {
                return
            }

            const data = JSON.parse(event.data)
            if (data.height) {
                items = []
            } else {
                items = items.concat(data)
            }
        }
    }

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
            const offset = items
                .filter(item => (item.block || item.mempool).blockHeight === maxBlockHeight)
                .length

            return {
                maxBlockHeight,
                offset,
            }
        }
        return {offset: 0}
    }

    async function fetchItems(filter, getMore) {
        mempool = false
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

    const showMore = async () => {
        await refresh(currentFilter || {}, true)
    }

    const refresh = async (filter, getMore) => {
        currentFilter = filter
        await fetchItems(filter, getMore).catch(e => {
            error = `Unable to fetch results: ${e.message}`
            throw e
        })
    }

    const toggleMempool = async event => {
        mempool = event.target.checked
        if (mempool) {
            items = []
        } else {
            await refresh(currentFilter || {})
        }
    }

    onMount(async () => {
        newSocket()
        await refresh({})
    })

    onDestroy(() => {
        socket.onclose = function () {
        }
        socket.close()
    })
</script>

{#if connected}
    <form class="pure-form" on:submit|preventDefault={() => refresh(currentFilter || {})}>
        <fieldset>
            <select>
                <option>Pool Swaps</option>
            </select>
            <input bind:value={filterString} type="text" size="64" placeholder="TX ID/Address/Block Hash"/>
            <label>
                Mempool
                <input type="checkbox" checked={mempool} on:change={toggleMempool}/>
            </label>
            <button class="pure-button" on:click={() => refresh(currentFilter || {})}>Refresh</button>
        </fieldset>
    </form>

    <PoolSwapHistory {allTokens} {items} {refresh}/>
{:else}
    <div class="message">
        <button class="pure-button" on:click={newSocket}>Reconnect</button>
    </div>
{/if}

{#if hasMore && !mempool && !error && connected}
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
            {#if mempool}
                Keep open to receive transactions...
            {:else}
                0 results found
            {/if}
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