<script>
    import FromToTokenFilter from "../dex/FromToTokenFilter.svelte";
    import PoolSwapGraph from "../dex/PoolSwapGraph.svelte";
    import {onDestroy, onMount} from "svelte";
    import {hasItems} from "../common/common";
    import TradeChart from "../dex/TradeChart.svelte";
    import {graphStore, mempool, setGraph} from "../store";
    import Help from "../common/Help.svelte";
    import Limit from "../common/Limit.svelte";

    export let allTokens
    export let Chart

    let abortController = new AbortController()
    let fromTokenSymbol = 'DFI'
    let toTokenSymbol = 'BTC'
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
    </fieldset>
</form>
{#if hasItems(estimates)}
    {#if graphType == 'trades'}
        <TradeChart {items} {Chart} {estimates} {fromTokenSymbol} {toTokenSymbol}/>
    {:else if graphType == 'history'}
        <PoolSwapGraph {Chart} {estimates} {poolSwap}/>
    {/if}
{/if}

<style>
    form {
        padding: 0.2rem 0 0 0.2rem;
    }
</style>