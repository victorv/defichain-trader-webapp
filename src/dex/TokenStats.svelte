<script>
    import {onMount} from "svelte";
    import {asDollars} from "../common/common";

    let filterType = 'bought-recently'

    let error
    let tokens

    async function fetchTokensStatistics() {
        error = null
        tokens = null

        const response = await fetch(`/stats?template=bought_sold&period=1200000`)
        tokens = await response.json()
        tokens = tokens.sort((a, b) => {
            return Math.abs(b["net_usd"]) - Math.abs(a["net_usd"])
        })
    }

    async function refresh() {
        await fetchTokensStatistics().catch(e => {
            error = `Unable to fetch results: ${e.message}`
            throw e
        })
    }

    async function changeFilterType(newFilterType) {
        filterType = newFilterType
        await refresh()
    }

    onMount(async () => {
        await refresh()
    })
</script>

{#if tokens && tokens.length}
    <div class="container">
        <form on:submit|preventDefault class="pure-form">
            <select class="pure-select">
                <option>Bought/Sold</option>
            </select>
            <select class="pure-select">
                <option>Everything</option>
            </select>
            <button on:click={refresh} type="button" class="pure-button">Refresh</button>
        </form>
    </div>
    <table class="pure-table pure-table-striped">
        <thead>
        <tr>
            <th>Token</th>
            <th>Net</th>
            <th>Bought</th>
            <th>TX Count</th>
            <th>Sold</th>
            <th>TX Count</th>

        </tr>
        </thead>
        {#each tokens as token}
            <tr>
                <td>
                    {token["token_symbol"]}
                </td>
                <td class:red={token["net_usd"] < 0.0} class:green={token["net_usd"] >= 0.0}>
                    {asDollars(token["net_usd"])}
                </td>
                <td>
                    {asDollars(token["bought_usd"])}
                </td>
                <td>
                    {token["bought_tx_count"]}
                </td>
                <td>
                    {asDollars(token["sold_usd"])}
                </td>
                <td>
                    {token["sold_tx_count"]}
                </td>
            </tr>
        {/each}
    </table>
{:else if tokens}
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
    .green {
        color: green;
    }

    .red {
        color: red;
    }

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