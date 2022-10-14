<script>
    import FromToTokenFilter from "../dex/FromToTokenFilter.svelte";
    import PoolSwapGraph from "../dex/PoolSwapGraph.svelte";
    import {onDestroy, onMount} from "svelte";
    import {hasItems} from "../common/common";
    import TradeChart from "../dex/TradeChart.svelte";
    import {mempool} from "../store";
    import Help from "../common/Help.svelte";

    export let allTokens
    export let Chart

    let abortController = new AbortController()
    let fromTokenSymbol = 'DFI'
    let toTokenSymbol = 'BTC'
    let poolSwap
    let estimates
    let graphType = 'trades'

    let items = []

    const unsubscribe = mempool.subscribe(mempoolItems => items = mempoolItems)

    onDestroy(unsubscribe)

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
        await update()
    }

    const changeGraph = newGraphType => {
        graphType = newGraphType
    }

    onMount(async () => await update())
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