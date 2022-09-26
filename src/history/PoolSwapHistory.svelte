<script>
    import {onMount} from "svelte";
    import FromToTokenFilter from "../dex/FromToTokenFilter.svelte";
    import PoolSwapDetails from "./PoolSwapDetails.svelte";
    import Icon from "../common/Icon.svelte";
    import PoolSwapBreakdown from "../dex/PoolSwapBreakdown.svelte";
    import {hasItems} from "../common/common";

    export let allTokens

    let swapFrom
    let fromTokenSymbol
    let toTokenSymbol
    let filterString = ''
    let error

    let poolSwaps
    let selectedTX

    async function fetchPoolSwaps() {
        error = null
        poolSwaps = null

        const requestBody = {}
        if (fromTokenSymbol && fromTokenSymbol != 'Any') {
            requestBody.fromTokenSymbol = fromTokenSymbol
        }
        if (toTokenSymbol && toTokenSymbol != 'Any') {
            requestBody.toTokenSymbol = toTokenSymbol
        }
        if (filterString) {
            requestBody.filterString = filterString
        } else if (filterString === 'NA') {
            requestBody.filterString = ''
        }

        const response = await fetch(`/poolswaps`, {
            method: 'POST',
            body: JSON.stringify(requestBody),
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        })

        poolSwaps = await response.json()
    }

    const submitFilter = async () => {
        await fetchPoolSwaps().catch(e => {
            error = `Unable to fetch results: ${e.message}`
            throw e
        })
    }

    const onTokenSelectionChanged = async selection => {
        fromTokenSymbol = selection.fromTokenSymbol
        toTokenSymbol = selection.toTokenSymbol
        await fetchPoolSwaps().catch(e => {
            error = `Unable to fetch results: ${e.message}`
            throw e
        })
    }

    onMount(async () => {
        await fetchPoolSwaps().catch(e => {
            error = `Unable to fetch results: ${e.message}`
            throw e
        })
    })

    const limitLength = s => {
        return `${s.substring(0, 9)}...`
    }

    const toggleTXDetails = async tx => {
        swapFrom = null

        selectedTX === tx ? selectedTX = null : selectedTX = tx
    }

    const toggleEstimateFrom = async (swap) => {
        selectedTX = null

        if (swapFrom && swapFrom.tx === swap) {
            swapFrom = null
            return
        }

        const request = `${swap.amountFrom}+${swap.tokenFrom}+to+${swap.tokenTo}+desiredResult+${swap.amountTo}`
        const response = await fetch(`/estimate?poolswap=${request}`)
        swapFrom = await response.json()
        swapFrom.tx = swap
    }
</script>

<form class="pure-form" on:submit|preventDefault={submitFilter}>
    <fieldset>
        <FromToTokenFilter supportAnyToken={true}
                           {allTokens} {fromTokenSymbol} {toTokenSymbol} {onTokenSelectionChanged}/>
        <input bind:value={filterString} type="text" placeholder="TX ID/Address/Block Hash"/>
    </fieldset>
</form>
{#if poolSwaps && poolSwaps.length}

    <table class="pure-table pure-table-striped">
        <thead>
        <tr>
            <th>Transaction ID</th>
            <th>Block</th>
            <th>Fee</th>
            <th>Input Amount</th>
            <th>Output Amount</th>
            <th>From</th>
            <th>To</th>
        </tr>
        </thead>
        {#each poolSwaps as tx}
            <tr class:selected-row={tx === selectedTX}>
                <td>
                    <button on:click={() => toggleTXDetails(tx)}
                            class:info={tx === selectedTX}
                            type="button"
                            class="pure-button info-button">
                        <Icon icon="info"/>
                    </button>
                    <a href="https://defiscan.live/transactions/{tx.txID}" target="_blank">
                        {limitLength(tx.txID)}
                    </a>
                </td>
                <td>
                    {#if tx.block}
                        <a href="https://defiscan.live/blocks/{tx.block.blockHeight}" target="_blank">
                            {tx.block.blockHeight}
                        </a>
                    {:else}
                        First seen: {tx.mempool.blockHeight}
                    {/if}
                </td>
                <td>
                    {tx.fee}
                </td>
                <td>
                    <button on:click={() => toggleEstimateFrom(tx)}
                            class:info={swapFrom && swapFrom.tx === tx}
                            type="button"
                            class="pure-button info-button">
                        <Icon icon="info"/>
                    </button>
                    {tx.amountFrom} {tx.tokenFrom}
                </td>
                <td>
                    {#if tx.amountTo}
                        {tx.amountTo} {tx.tokenTo}
                    {:else}
                        N/A {tx.tokenTo}
                    {/if}
                </td>
                <td>
                    <a href="https://defiscan.live/address/{tx.from}" target="_blank">
                        {limitLength(tx.from)}
                    </a>
                </td>
                <td>
                    {#if tx.from != tx.to}
                        <a href="https://defiscan.live/address/{tx.to}" target="_blank">
                            {limitLength(tx.to)}
                        </a>
                    {:else}
                        &lt;from address&gt;
                    {/if}
                </td>
            </tr>
            {#if tx === selectedTX}
                <tr>
                    <td colspan="7">
                        {#if selectedTX}
                            <PoolSwapDetails tx={selectedTX}/>
                        {/if}
                    </td>
                </tr>
            {:else if swapFrom && swapFrom.tx === tx}
                <tr>
                    <td colspan="7">
                        {#if hasItems(swapFrom.breakdown)}
                            <PoolSwapBreakdown poolSwap={swapFrom}/>
                        {:else}
                            <div class="warning">
                                Something went wrong
                            </div>
                        {/if}
                    </td>
                </tr>
            {/if}
        {/each}
    </table>
{:else if poolSwaps}
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
    tr.selected-row td {
        background: #333;
        color: white;
    }

    tr.selected-row a {
        color: white;
    }

    td[colspan="7"] {
        padding: 0.5rem;
    }

    .message {
        display: flex;
        justify-content: center;
    }
</style>
