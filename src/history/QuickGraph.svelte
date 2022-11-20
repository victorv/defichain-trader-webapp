<script>
    import FromToTokenFilter from "../dex/FromToTokenFilter.svelte";
    import {onDestroy, onMount} from "svelte";
    import {hasItems} from "../common/common";
    import TradeChart from "../dex/TradeChart.svelte";
    import {graphStore, mempool, setGraph} from "../store";

    export let allTokens
    export let Chart

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
        blocks: timelines[0].id
    }

    let abortController = new AbortController()
    let fromTokenSymbol = 'DFI'
    let toTokenSymbol = 'BTC'
    let poolSwap
    let estimates
    let maxEstimates
    let pendingUpdate
    let resizeSeed

    let items = []
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
                amountFrom: 1.0,
            }
            const response = await fetch(`/graph?poolswap=1.0 ${fromTokenSymbol} to ${toTokenSymbol}&blocks=${timeline.blocks}`, {
                signal: abortController.signal,
            })
            let newEstimates = await response.json()
            updateEstimates(newEstimates)
        }
    }

    const onTokenSelectionChanged = async selection => {
        fromTokenSymbol = selection.fromTokenSymbol
        toTokenSymbol = selection.toTokenSymbol
        setGraph(fromTokenSymbol, toTokenSymbol)
        await update()
    }

    const changeTimeline = async e => {
        timeline.blocks = +e.target.value
        await update()
    }

    onMount(async () => {
        screen.orientation.addEventListener('change', resize)
        window.addEventListener('resize', resize)

        const unsubscribe1 = mempool.subscribe(mempoolItems => {
            items = mempoolItems
        })
        const unsubscribe2 = graphStore.subscribe(dataPoint => {
            const estimate = dataPoint.estimate
            if (dataPoint && estimates) {
                if (estimates.length > 0) {
                    const latestEstimate = estimates[estimates.length - 1][1]
                    if (estimate == latestEstimate) {
                        return
                    }
                }
                // estimates.push([0, estimate, new Date().getTime()])
                updateEstimates(estimates)
            }
        })
        subscriptions.push(unsubscribe1, unsubscribe2)

        await update()
        // WARNING an unidentified error occurs when setGraph() is called before update()
        setGraph(fromTokenSymbol, toTokenSymbol)
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
    <TradeChart {items} {Chart} {estimates} {fromTokenSymbol} {toTokenSymbol} {resizeSeed}/>
{/if}

<style>
    form {
        padding: 0.2rem 0 0 0.2rem;
    }
</style>