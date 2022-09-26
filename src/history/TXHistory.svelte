<script>
    import PoolSwapHistory from "./PoolSwapHistory.svelte";
    import {onMount} from "svelte";

    export let allTokens

    let error
    let loading
    let items
    let filterString = ''
    let currentFilter

    async function fetchItems(filter) {
        error = null
        items = null

        const requestBody = {...filter, ...(currentFilter || {})}

        if (filterString) {
            requestBody.filterString = filterString
        } else if (filterString === 'NA') {
            requestBody.filterString = ''
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
            items = await response.json()
        } finally {
            loading = false
        }
    }

    const refresh = async filter => {
        currentFilter = filter
        await fetchItems(filter).catch(e => {
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
    .message {
        display: flex;
        justify-content: center;
    }
</style>