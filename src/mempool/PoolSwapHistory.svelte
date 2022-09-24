<script>
    import {onMount} from "svelte";
    import FromToTokenFilter from "../dex/FromToTokenFilter.svelte";

    export let allTokens

    let fromTokenSymbol
    let toTokenSymbol
    let error

    const utcOffset = new Date().getTimezoneOffset()
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

    const toTime = utcMilliseconds => {
        console.log(utcOffset)
        const date = new Date(utcMilliseconds)
        date.setMinutes(date.getMinutes() + utcOffset);
        return date.toLocaleTimeString()
    }
</script>

<form class="pure-form pure-form-stacked" on:submit|preventDefault>
    <fieldset>
        <FromToTokenFilter supportAnyToken={true}
                           {allTokens} {fromTokenSymbol} {toTokenSymbol} {onTokenSelectionChanged}/>
    </fieldset>
</form>
{#if poolSwaps && poolSwaps.length}

    <table class="pure-table pure-table-striped">
        <thead>
        <tr>
            <th>Transaction ID</th>
            <th>Block</th>
            <th>Ordinal</th>
            <th>Fee</th>
            <th>Input Amount</th>
            <th>Output Amount</th>
            <th>From</th>
            <th>To</th>
        </tr>
        </thead>
        {#each poolSwaps as tx}
            <tr class:selected-row={tx === selectedTX}
                on:click={() => selectedTX === tx ? selectedTX = null : selectedTX = tx}>
                <td>
                    <a href="https://defiscan.live/transactions/{tx.txID}" target="_blank">
                        {limitLength(tx.txID)}
                    </a>
                </td>
                <td>
                    <a href="https://defiscan.live/blocks/{tx.blockHeight}" target="_blank">
                        {tx.blockHeight}
                    </a>
                </td>
                <td>
                    {tx.ordinal}
                </td>
                <td>
                    {tx.fee}
                </td>
                <td>
                    {tx.amountFrom} {tx.tokenFrom}
                </td>
                <td>
                    {tx.amountTo} {tx.tokenTo}
                </td>
                <td>
                    <a href="https://defiscan.live/address/{tx.from}" target="_blank">
                        {limitLength(tx.from)}
                    </a>
                </td>
                <td>
                    <a href="https://defiscan.live/address/{tx.to}" target="_blank">
                        {limitLength(tx.to)}
                    </a>
                </td>
            </tr>
            {#if tx === selectedTX}
                <tr>
                    <td colspan="3">
                        {#if selectedTX}
                            <table>
                                <tr>
                                    <td>
                                        <strong>Block Height Received</strong>
                                        <br/>
                                        {selectedTX.blockHeightReceived}
                                    </td>
                                    <td>
                                        <strong>Block Height Confirmed</strong>
                                        <br/>
                                        {selectedTX.blockHeight}
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <strong>Fee Received</strong>
                                        <br/>
                                        {selectedTX.feeReceived}
                                    </td>
                                    <td>
                                        <strong>Confirmed Fee</strong>
                                        <br/>
                                        {selectedTX.fee}
                                    </td>
                                </tr>
                            </table>
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

    td[colspan="3"] {
        padding: 1rem;
    }

    .message {
        display: flex;
        justify-content: center;
    }
</style>
