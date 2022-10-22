<script>
    import {onMount} from "svelte";
    import BoughtSold from "./BoughtSold.svelte";
    import TXCountByAddress from "./TXCountByAddress.svelte";

    const components = {
        'bought_sold': BoughtSold,
        'tx_count_by_address': TXCountByAddress
    }
    let statType = 'bought_sold'
    let period = 120

    let error
    let items

    async function fetchStats() {
        error = null
        items = null

        const response = await fetch(`/stats?template=${statType}&period=${period}`)
        items = await response.json()
    }

    async function refresh() {
        await fetchStats().catch(e => {
            error = `Unable to fetch results: ${e.message}`
            throw e
        })
    }

    async function changePeriod(e) {
        period = +e.target.value
        await refresh()
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
            <option value="bought_sold">Bought/Sold</option>
            <option value="tx_count_by_address">TX count by address</option>
        </select>
        <select class="pure-select" on:change={changePeriod}>
            <option value="120">1 hour</option>
            <option value="1440">12 hours</option>
            <option value="2880">1 day</option>
            <option value="20160">1 week</option>
            <option value="87600">1 month</option>
            <option value="1051200">1 year</option>
            <option value="900000000">Everything</option>
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