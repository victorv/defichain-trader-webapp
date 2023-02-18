<script>
    import {onDestroy, onMount} from "svelte";
    import {screenStore} from "../store";
    import {asDollars, asTokenAmount} from "../common/common";

    export let request

    let txCount
    let stats
    let byAddress
    let error
    let screen
    let screenSub
    let fromTokenSymbol
    let toTokenSymbol

    let selectedItem
    let swaps
    let mode

    async function fetchStats(byAddress, params) {
        const response = await fetch(`/stats?byAddress=${byAddress}`, {
            method: 'POST',
            body: JSON.stringify({
                ...request,
                ...params,
                minDateText: undefined,
                maxDateText: undefined,
                fromAddressGroupText: undefined,
                toAddressGroupText: undefined,
            }),
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        })
        return response;
    }

    const getStats = async () => {
        const response = await fetchStats(false, {});
        stats = await response.json()
        txCount = stats.map(stat => stat.boughtTXCount).reduce((a, b) => a + b, 0.0)
    }

    const getStatsByAddress = async (from, to) => {
        if (from === fromTokenSymbol && to === toTokenSymbol) {
            fromTokenSymbol = null
            toTokenSymbol = null
            return
        }

        fromTokenSymbol = from
        toTokenSymbol = to
        const response = await fetchStats(true, {
            fromTokenSymbol,
            toTokenSymbol,
        });
        byAddress = await response.json()
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

{#if txCount}{txCount} transactions{/if}
{#if stats}
    <table class="pure-table">
        <thead>
        <tr>
            <th>Token</th>
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
                <td>
                    {item.token}
                </td>
                {#if screen.large}
                    <td>
                        {asDollars(item.volumeUSD)}
                        <br/>
                        <strong>{asTokenAmount(item.volume)}</strong>
                    </td>
                {/if}
                <td>
                    <span class:red={item.amountNetUSD < 0.0}
                          class:green={item.amountNetUSD >= 0.0}>
                        {asDollars(item.amountNetUSD)}
                    </span>
                    <br/>
                    <strong>{asTokenAmount(item.amountNet)}</strong>
                    <br/>
                    <a href="#"
                       on:click|preventDefault={() => {byAddress = null; swaps = item.net; selectedItem = item; mode = 'net'}}>
                        details
                    </a>
                </td>
                <td>
                    {asDollars(item.amountBoughtUSD)}
                    <br/>
                    <strong>{asTokenAmount(item.amountBought)}</strong>
                    <br/>
                    <a href="#"
                       on:click|preventDefault={() => {byAddress = null; swaps = item.bought; selectedItem = item; mode = 'bought'}}>
                        details
                    </a>
                </td>
                <td>
                    {asDollars(item.amountSoldUSD)}
                    <br/>
                    <strong>{asTokenAmount(item.amountSold)}</strong>
                    <br/>
                    <a href="#"
                       on:click|preventDefault={() => {byAddress = null; swaps = item.sold; selectedItem = item; mode = 'sold'}}>
                        details
                    </a>
                </td>
            </tr>
            {#if item === selectedItem}
                <tr>
                    <td colspan="5">
                        <a href="#"
                           on:click={() => {swaps = null; selectedItem = null}}>hide
                        </a>
                        {#if mode === 'net'}

                            <table class="pure-table server">
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
                                                <span class:red={swap.amountNetUSD < 0.0}
                                                      class:green={swap.amountNetUSD >= 0.0}>
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
                                            <br/>
                                            <a href="#"
                                               on:click|preventDefault={() => getStatsByAddress(item.token, swap.token)}>
                                                by address
                                            </a>
                                        </td>
                                        <td>
                                            {asDollars(swap.amountSoldUSD)}
                                            <br/>
                                            <strong>{asTokenAmount(swap.amountSold)} {swap.token}</strong>
                                            <br/>
                                            <a href="#"
                                               on:click|preventDefault={() => getStatsByAddress(swap.token, item.token)}>
                                                by address
                                            </a>
                                        </td>
                                    </tr>
                                    {#if byAddress && ((item.token === fromTokenSymbol && swap.token === toTokenSymbol)
                                        || (item.token === toTokenSymbol && swap.token === fromTokenSymbol))}
                                        <tr>
                                            <td colspan="4">
                                                <table>
                                                    <thead>
                                                    <tr>
                                                        <th>address</th>
                                                        <th>input amount</th>
                                                        <th>output amount</th>
                                                        <th>tx count</th>
                                                    </tr>
                                                    </thead>
                                                    <tbody>
                                                    {#each byAddress as item}
                                                        <tr>
                                                            <td>{item.address}</td>
                                                            <td>
                                                                <span class="amount">{item.inputAmount}</span>
                                                                <span class="token">{fromTokenSymbol}</span>
                                                                <br/>
                                                                {asDollars(item.inputAmountUSD)}</td>
                                                            <td>
                                                                <span class="amount">{item.outputAmount}</span>
                                                                <span class="token">{toTokenSymbol}</span>
                                                                <br/>
                                                                {asDollars(item.outputAmountUSD)}</td>
                                                            <td>{item.txCount}</td>
                                                        </tr>
                                                    {/each}
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                    {/if}
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