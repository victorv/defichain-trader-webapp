<script>
    import FromToTokenFilter from "../dex/FromToTokenFilter.svelte";
    import {onDestroy, onMount} from "svelte";
    import TradeChart from "../dex/TradeChart.svelte";
    import Icon from "../common/Icon.svelte";
    import Help from "../common/Help.svelte";
    import {hasItems} from "../common/common";

    export let allTokens
    export let fromTokenSymbol = 'DUSD'
    export let toTokenSymbol = 'USDT'
    export let amount = 1.0

    const oneHour = 120
    const twelveHours = 120 * 12
    const oneDay = oneHour * 24
    const twoDays = oneDay * 2
    const threeDays = oneDay * 3
    const fourDays = oneDay * 4
    const fiveDays = oneDay * 5
    const oneMonth = oneDay * 31
    const twoMonths = oneMonth * 2
    const threeMonths = oneMonth * 3
    const timelines = [
        {id: twelveHours, label: '12 hours'},
        {id: oneDay, label: '1 day'},
        {id: twoDays, label: '2 days'},
        {id: threeDays, label: '3 days'},
        {id: fourDays, label: '4 days'},
        {id: fiveDays, label: '5 days'},
        {id: oneMonth, label: '1 month'},
        {id: twoMonths, label: '2 months'},
        {id: threeMonths, label: '3 months'},
    ]
    const timeline = {
        blocks: timelines[3].id
    }

    let abortController = new AbortController()
    let poolSwap
    let graph
    let series
    let seriesIndex = 0
    let maxEstimates
    let pendingUpdate
    let resizeSeed

    const subscriptions = []

    const setGraph = newEstimates => {
        graph = newEstimates
        if (graph) {
            seriesIndex = 0
            series = graph.series[0]
        }
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
        setGraph(null)
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
            let newGraph = await response.json()
            setGraph(newGraph)
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

        {#if graph && graph.swap.breakdown.length > 1}
            <ul>
                {#each graph.swap.breakdown as option, index}
                    <li>
                        <button class="pure-button"
                                on:click={() => {seriesIndex = index; series = graph.series[seriesIndex]}}
                                class:info={index === seriesIndex}>
                            {index + 1}.
                            {#if index === 0}
                                <Icon icon="best"/>
                            {:else if index !== 0 && option.swaps.length === 1}
                                <Icon icon="danger"/>
                            {:else}
                                <Icon icon="warning"/>
                            {/if}
                        </button>
                        {#if index !== 0 && option.swaps.length === 1}
                            &larr;
                            <Help warning={true}
                                  help="Careful! A swap from {poolSwap.tokenFrom} to {poolSwap.tokenTo} will always go through this pool!"/>
                        {/if}
                    </li>
                {/each}
            </ul>
        {/if}
    </fieldset>
</form>

{#if series && hasItems(series.points)}
    {#key series}
        <TradeChart {allTokens} {series} {fromTokenSymbol} {toTokenSymbol} {resizeSeed}/>
    {/key}
{/if}

<style>
    form {
        padding: 0.2rem 0 0 0.2rem;
    }

    ul {
        padding: 0;
        margin: 0;
        list-style-type: none;
        display: inline-flex;
        gap: 0.5rem;
    }
</style>