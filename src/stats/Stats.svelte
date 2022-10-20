<script>
    import {onMount} from "svelte";
    import BoughtSold from "./BoughtSold.svelte";

    const components = {
        'BoughtSold': BoughtSold,
    }
    let statType = 'BoughtSold'

    let error
    let items

    async function fetchTokensStatistics() {
        error = null
        items = null

        const response = await fetch(`/stats?template=bought_sold&period=1200000`)
        items = await response.json()
    }

    async function refresh() {
        await fetchTokensStatistics().catch(e => {
            error = `Unable to fetch results: ${e.message}`
            throw e
        })
    }

    async function changeStatType(e) {
        statType = e.target.value
        await refresh()
    }

    onMount(async () => {
        await refresh()
    })
</script>

<div class="container">
    <form on:submit|preventDefault class="pure-form">
        <select class="pure-select" on:change={changeStatType}>
            <option value="BoughtSold">Bought/Sold</option>
        </select>
        <select class="pure-select">
            <option>Everything</option>
        </select>
        <button on:click={refresh} type="button" class="pure-button">Refresh</button>
    </form>
</div>
{#if items && items.length}
    <svelte:component this={components[statType]} {items}/>
{:else if items}
    <div class="message">
        <p class="info">0 results found</p>
    </div>
{:else if error}
    <div class="message">
        <p class="error">{error}</p>
    </div>
{:else}
    <div class="message">
        <p class="info">Loading results...</p>
    </div>
{/if}

<style>
    form {
        padding: 0.5rem;
    }

    .container {
        padding-left: 0.5rem;
    }

    .message {
        display: flex;
        justify-content: center;
    }
</style>