<script>
    import FromToTokenFilter from "../dex/FromToTokenFilter.svelte";
    import {onDestroy, onMount} from "svelte";
    import {hasItems} from "../common/common";
    import TradeChart from "../dex/TradeChart.svelte";

    export let allTokens
    export let fromTokenSymbol = 'DFI'
    export let toTokenSymbol = 'BTC'
    export let amount = 1.0

    const oneHour = 120
    const oneDay = oneHour * 24
    const fiveDays = oneDay * 5
    const oneMonth = oneDay * 31
    const timelines = [
        {id: oneHour, label: '1 hour'},
        {id: oneDay, label: '1 day'},
        {id: fiveDays, label: '5 days'},
        {id: oneMonth, label: '1 month'},
    ]
    const timeline = {
        blocks: timelines[3].id
    }

    let abortController = new AbortController()
    let poolSwap
    let estimates
    let maxEstimates
    let pendingUpdate
    let resizeSeed

    const subscriptions = []

    const updateEstimates = newEstimates => {
        estimates = newEstimates
    }

    const resize = () => {
        clearTimeout(pendingUpdate)
        pendingUpdate = setTimeout(() => resizeSeed = pendingUpdate, 500)
    }

    onDestroy(() => {
        clearTimeout(pendingUpdate)
        screen.orientation.removeEventListener('change', resize)
        window.removeEventListener('resize', resize)
        subscriptions.forEach(sub => sub())
    })

    async function update() {
        updateEstimates(null)
        poolSwap = null

        if (fromTokenSymbol && toTokenSymbol && fromTokenSymbol !== 'Any' && toTokenSymbol !== 'Any') {
            abortController.abort()
            abortController = new AbortController()

            poolSwap = {
                tokenFrom: fromTokenSymbol,
                tokenTo: toTokenSymbol,
                amountFrom: amount || 1.0,
            }
            const response = await fetch(`/graph?poolswap=${amount} ${fromTokenSymbol} to ${toTokenSymbol}&blocks=${timeline.blocks}`, {
                signal: abortController.signal,
            })
            let newEstimates = await response.json()
            updateEstimates(newEstimates)
        }
    }

    const onTokenSelectionChanged = async selection => {
        fromTokenSymbol = selection.fromTokenSymbol
        toTokenSymbol = selection.toTokenSymbol
        await update()
    }

    const changeTimeline = async e => {
        timeline.blocks = +e.target.value
        await update()
    }

    onMount(async () => {
        screen.orientation.addEventListener('change', resize)
        window.addEventListener('resize', resize)

        await update()
    })
</script>

<form class="pure-form" on:submit|preventDefault>
    <fieldset>
        <FromToTokenFilter supportAnyToken={false}
                           {allTokens} {fromTokenSymbol} {toTokenSymbol} {onTokenSelectionChanged}/>
        <select class="pure-select" on:change={changeTimeline} bind:value={timeline.blocks}>
            {#each timelines as timeline}
                <option value={timeline.id}>{timeline.label}</option>
            {/each}
        </select>
    </fieldset>
</form>
{#if hasItems(estimates)}
    <TradeChart {estimates} {fromTokenSymbol} {toTokenSymbol} {resizeSeed}/>
{/if}

<style>
    form {
        padding: 0.2rem 0 0 0.2rem;
    }
</style>