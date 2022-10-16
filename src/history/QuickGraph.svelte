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

    let abortController = new AbortController()
    let fromTokenSymbol = 'USDT'
    let toTokenSymbol = 'USDC'
    let poolSwap
    let estimates
    let graphType = 'trades'

    let items = []
    const subscriptions = []

    onDestroy(() => {
        subscriptions.forEach(sub => sub())
    })

    async function update() {
        estimates = null
        poolSwap = null

        if (fromTokenSymbol && toTokenSymbol && fromTokenSymbol !== 'Any' && toTokenSymbol !== 'Any') {
            abortController.abort()
            abortController = new AbortController()

            poolSwap = {
                tokenFrom: fromTokenSymbol,
                tokenTo: toTokenSymbol,
                amountFrom: 1.0,
            }
            const response = await fetch(`/graph?poolswap=1.0 ${fromTokenSymbol} to ${toTokenSymbol}`, {
                signal: abortController.signal,
            })
            estimates = await response.json()
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

    onMount(async () => {
        const unsubscribe1 = mempool.subscribe(mempoolItems => items = mempoolItems)
        const unsubscribe2 = graphStore.subscribe(dataPoint => {
            const estimate = dataPoint.estimate
            if (dataPoint && estimates && estimates.length > 1) {
                const previousEstimate = estimates[estimates.length - 1][1]
                if (Math.abs(estimate - previousEstimate) > estimate * 0.0001) {
                    let newEstimates = estimates.slice(1)
                    newEstimates.push([0, estimate, new Date().getTime() / 1000])
                    estimates = newEstimates
                }
            }
        })
        subscriptions.push(unsubscribe1, unsubscribe2)

        await update()
        // WARNING an unidentified error occurs when setGraph() is called before update()
        setGraph(fromTokenSymbol, toTokenSymbol)
    })
</script>

<form on:submit|preventDefault>
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
</form>
{#if hasItems(estimates)}
    {#if graphType == 'trades'}
        <TradeChart {items} {Chart} {estimates} {fromTokenSymbol} {toTokenSymbol}/>
    {:else if graphType == 'history'}
        <PoolSwapGraph {Chart} {estimates} {poolSwap}/>
    {/if}
{/if}