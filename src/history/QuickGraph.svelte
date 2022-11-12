<script context="module">
    const getDatasetLimit = () => Math.round(window.innerWidth / 7.0)

    function limitDataset(dataset, maxDataPoints) {
        return dataset.length < maxDataPoints ? dataset : dataset.slice(dataset.length - (maxDataPoints - 1));
    }
</script>

<script>
    import FromToTokenFilter from "../dex/FromToTokenFilter.svelte";
    import PoolSwapGraph from "../dex/PoolSwapGraph.svelte";
    import {onDestroy, onMount} from "svelte";
    import {hasItems} from "../common/common";
    import TradeChart from "../dex/TradeChart.svelte";
    import {graphStore, mempool, setGraph} from "../store";
    import Help from "../common/Help.svelte";

    export let allTokens
    export let Chart

    const timelines = [
        { id: 20160, label: '1 week'},
        { id: 5760, label: '2 days'},
        { id: 2880, label: '1 day'},
        { id: 1440, label: '12 hours'},
        { id: 120, label: '1 hour'}
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
    let graphType = 'trades'
    let pendingUpdate

    let items = []
    const subscriptions = []

    const updateEstimates = newEstimates => {
        estimates = newEstimates
        maxEstimates = estimates === null ? null : limitDataset(estimates, getDatasetLimit())
    }

    const applyDatasetLimit = () => {
        clearTimeout(pendingUpdate)
        pendingUpdate = setTimeout(() => updateEstimates(estimates), 500)
    }

    onDestroy(() => {
        clearTimeout(pendingUpdate)
        screen.orientation.removeEventListener('change', applyDatasetLimit)
        window.removeEventListener('resize', applyDatasetLimit)
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

    const changeGraph = newGraphType => {
        graphType = newGraphType
    }

    const changeTimeline = async e => {
        timeline.blocks = +e.target.value
        await update()
    }

    onMount(async () => {
        screen.orientation.addEventListener('change', applyDatasetLimit)
        window.addEventListener('resize', applyDatasetLimit)

        const unsubscribe1 = mempool.subscribe(mempoolItems => {
            items = mempoolItems
        })
        const unsubscribe2 = graphStore.subscribe(dataPoint => {
            const estimate = dataPoint.estimate
            if (dataPoint && estimates && estimates.length > 1) {
                const previousEstimate = estimates[estimates.length - 1][1]
                if (Math.abs(estimate - previousEstimate) > estimate * 0.0001) {
                    let newEstimates = estimates.slice(1)
                    newEstimates.push([0, estimate, new Date().getTime() / 1000])
                    updateEstimates(newEstimates)
                }
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
        <label>
            History
            <input on:click={() => changeGraph('history')} bind:group={graphType} value={'history'} type="radio"
                   name="graph-types"/>
        </label>
        <label>
            Recent Trades
            <input on:click={() => changeGraph('trades')} bind:group={graphType} value={'trades'} type="radio"
                   name="graph-types"/>
        </label>
        <Help help="Both graphs are live. Graphs are not updated until a price difference of at least 0.01% has occurred."/>
        <strong>
            Known issues
            <Help help="Live graph updates are not working correctly at the moment. The calculation for historic estimates and live estimates do not align."/>
        </strong>
        <select class="pure-select" on:change={changeTimeline} bind:value={timeline.blocks}>
            {#each timelines as timeline}
                <option value={timeline.id}>{timeline.label}</option>
            {/each}
        </select>
    </fieldset>
</form>
{#if hasItems(maxEstimates)}
    {#if graphType == 'trades'}
        <TradeChart {items} {Chart} estimates={maxEstimates} {fromTokenSymbol} {toTokenSymbol}/>
    {:else if graphType == 'history'}
        <PoolSwapGraph {Chart} estimates={maxEstimates} {poolSwap}/>
    {/if}
{/if}

<style>
    form {
        padding: 0.2rem 0 0 0.2rem;
    }
</style>