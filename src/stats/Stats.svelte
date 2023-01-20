<script>
    import {onDestroy, onMount} from "svelte";
    import {screenStore} from "../store";
    import {asDollars, asTokenAmount} from "../common/common";

    export let request

    let txCount
    let stats
    let error
    let screen
    let screenSub

    let selectedItem
    let swaps
    let mode

    const getStats = async () => {
        const response = await fetch(`/stats`, {
            method: 'POST',
            body: JSON.stringify(request),
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        })
        stats = await response.json()
        txCount = stats.map(stat => stat.boughtTXCount).reduce((a, b) => a + b, 0.0)
    }

    onMount(async () => {
        screenSub = screenStore.subscribe(newScreen => screen = newScreen)

        await getStats().catch(e => {
            error = `Unable to fetch results: ${e.message}`
            throw e
        })
    })

    onDestroy(() => screenSub && screenSub())
</script>

{#if stats}
    <table class="pure-table">
        <thead>
        <tr>
            {#if screen.large}
                <th>Volume</th>
            {/if}
            <th>Net</th>
            <th>Bought</th>
            <th>Sold</th>
        </tr>
        </thead>
        {#each stats as item}
            <tr>
                {#if screen.large}
                    <td>
                        {asDollars(item.volumeUSD)}
                        <br/>
                        <strong>{asTokenAmount(item.volume)}</strong>
                    </td>
                {/if}
                <td>
                    <span class:red={item.amountNetUSD < 0.0} class:green={item.amountNetUSD >= 0.0}>
                        {asDollars(item.amountNetUSD)}
                    </span>
                    <br/>
                    <strong>{asTokenAmount(item.amountNet)} {item.token}</strong>
                    <br/>
                    <a href="#" on:click={() => {swaps = item.net; selectedItem = item; mode = 'net'}}>details</a>
                </td>
                <td>
                    {asDollars(item.amountBoughtUSD)}
                    <br/>
                    <strong>{asTokenAmount(item.amountBought)}</strong>
                    <br/>
                    <a href="#" on:click={() => {swaps = item.bought; selectedItem = item; mode = 'bought'}}>details</a>
                </td>
                <td>
                    {asDollars(item.amountSoldUSD)}
                    <br/>
                    <strong>{asTokenAmount(item.amountSold)}</strong>
                    <br/>
                    <a href="#" on:click={() => {swaps = item.sold; selectedItem = item; mode = 'sold'}}>details</a>
                </td>
            </tr>
            {#if item === selectedItem}
                <tr>
                    <td colspan="5">
                        <a href="#" on:click={() => {swaps = null; selectedItem = null}}>hide</a>
                        {#if mode === 'net'}

                            <table class="pure-table">
                                <thead>
                                <tr>
                                    {#if screen.large}
                                        <th>Volume</th>
                                        <th>Net</th>
                                    {/if}
                                    <th>Bought with {item.token}</th>
                                    <th>Sold for {item.token}</th>
                                </tr>
                                </thead>
                                {#each swaps as swap}
                                    <tr>
                                        {#if screen.large}
                                            <td>
                                                {asDollars(swap.volumeUSD)}
                                                <br/>
                                                <strong>{asTokenAmount(swap.volume)}</strong>
                                            </td>
                                            <td>
                    <span class:red={swap.amountNetUSD < 0.0} class:green={swap.amountNetUSD >= 0.0}>
                        {asDollars(swap.amountNetUSD)}
                    </span>
                                                <br/>
                                                <strong>{asTokenAmount(swap.amountNet)} {swap.token}</strong>
                                            </td>
                                        {/if}
                                        <td>
                                            {asDollars(swap.amountBoughtUSD)}
                                            <br/>
                                            <strong>{asTokenAmount(swap.amountBought)} {swap.token}</strong>
                                        </td>
                                        <td>
                                            {asDollars(swap.amountSoldUSD)}
                                            <br/>
                                            <strong>{asTokenAmount(swap.amountSold)} {swap.token}</strong>
                                        </td>
                                    </tr>
                                {/each}
                            </table>

                        {:else}

                            {#if mode === 'bought'}
                                {item.boughtTXCount} transactions
                            {:else if mode === 'sold'}
                                {item.soldTXCount} transactions
                            {/if}
                            {#if swaps}
                                <table class="pure-table">
                                    <thead>
                                    <tr>
                                        <th>Sold</th>
                                        <th>Bought</th>
                                        {#if screen.large}
                                            <th>TX Count</th>
                                        {/if}
                                    </tr>
                                    </thead>
                                    {#each swaps as swap}
                                        <tr>
                                            <td>
                                                {asDollars(swap.inputAmountUSD)}
                                                <br/>
                                                <strong>
                                                    {asTokenAmount(swap.inputAmount)}
                                                    {#if mode === 'bought'}
                                                        {swap.token}
                                                    {:else}
                                                        {item.token}
                                                    {/if}
                                                </strong>
                                            </td>
                                            <td>
                                                {asDollars(swap.outputAmountUSD)}
                                                <br/>
                                                <strong>
                                                    {asTokenAmount(swap.outputAmount)}
                                                    {#if mode === 'sold'}
                                                        {swap.token}
                                                    {:else}
                                                        {item.token}
                                                    {/if}
                                                </strong>
                                            </td>
                                            {#if screen.large}
                                                <td>
                                                    {swap.txCount}
                                                </td>
                                            {/if}
                                        </tr>
                                    {/each}
                                </table>
                            {/if}
                        {/if}
                    </td>
                </tr>
            {/if}
        {/each}
    </table>

    {#if stats.length === 0}
        <div class="message">
            <p class="info">0 results found</p>
        </div>
    {/if}
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

    .message {
        display: flex;
        justify-content: center;
    }
</style>