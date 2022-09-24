<script>
    import {onMount} from "svelte";

    let filterType = 'bought-recently'

    let error
    let tokens

    async function fetchTokensStatistics() {
        error = null
        tokens = null

        const response = await fetch(`/tokens/${filterType}`)
        tokens = await response.json()
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

    const asDollars = num => {
        return new Intl.NumberFormat(`en-US`, {
            currency: `USD`,
            style: 'currency',
        }).format(num)
    }

    onMount(async () => {
        await refresh()
    })
</script>

{#if tokens && tokens.length}
    <div class="container">
        <form on:submit|preventDefault>
            <label>
                Bought
                <input on:click={() => changeFilterType('bought-recently')} bind:group={filterType} value={'bought-recently'} type="radio" name="filter-types"/>
            </label>
            <label>
                Sold
                <input on:click={() => changeFilterType('sold-recently')} bind:group={filterType} value={'sold-recently'} type="radio" name="filter-types"/>
                during the most recent 120 blocks (1 hour on average)
            </label>
            <button on:click={refresh} type="button">Refresh</button>
        </form>

    </div>
    <table class="pure-table pure-table-striped">
        <thead>
        <tr>
            <th>Token</th>
            <th>{filterType} USD</th>
            <th>TX Count</th>
            <th>Most Recent Block Height</th>
            <th>{filterType}</th>

        </tr>
        </thead>
        {#each tokens as token}
            <tr>
                <td>
                    {token.tokenSymbol}
                </td>
                <td>
                    {asDollars(token.aggregateUSD)}
                </td>
                <td>
                    {token.txCount}
                </td>
                <td>
                    <a href="https://defiscan.live/blocks/{token.mostRecentBlockHeight}" target="_blank">
                        {token.mostRecentBlockHeight}
                    </a>
                </td>
                <td>
                    {token.aggregate} {token.tokenSymbol}
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