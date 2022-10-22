<script>
    import {onMount} from "svelte";
    import BoughtSold from "./BoughtSold.svelte";
    import BoughtSoldByAddress from "./BoughtSoldByAddress.svelte";

    export let allTokens

    const stats = [
        { id: 'bought_sold', label: 'Bought/Sold', component: BoughtSold},
        { id: 'bought_sold_by_address', label: 'Bought/Sold - Address', component: BoughtSoldByAddress}
    ]

    let stat = stats[1]
    let period = 120

    let error
    let items

    let fromTokenSymbol
    let toTokenSymbol

    const onTokenSelectionChanged = async selection => {
        fromTokenSymbol = selection.fromTokenSymbol
        toTokenSymbol = selection.toTokenSymbol
        await refresh()
    }

    async function fetchStats() {
        error = null
        items = null

        let url = `/stats?template=${stat.id}&period=${period}`
        if (fromTokenSymbol && fromTokenSymbol !== 'Any') {
            url += `&tokenFrom=${fromTokenSymbol}`
        }
        if (toTokenSymbol && toTokenSymbol !== 'Any') {
            url += `&tokenTo=${toTokenSymbol}`
        }
        const response = await fetch(url)
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
        stat = stats.find(stat => stat.id === e.target.value)
        await refresh()
    }

    onMount(async () => {
        await refresh()
    })
</script>

<div class="container">
    <form on:submit|preventDefault class="pure-form">
        <select class="pure-select" on:change={changeStatType} bind:value={stat.id}>
            {#each stats as stat}
                <option value={stat.id}>{stat.label}</option>
            {/each}
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
    <svelte:component this={stat.component} {items} {allTokens} {onTokenSelectionChanged} {fromTokenSymbol} {toTokenSymbol}/>
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