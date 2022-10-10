<script>
    import FromToTokenFilter from "../dex/FromToTokenFilter.svelte";
    import PoolSwapGraph from "../dex/PoolSwapGraph.svelte";

    export let allTokens
    export let Chart

    let fromTokenSymbol
    let toTokenSymbol
    let poolSwap
    let estimates

    async function update() {
        if (fromTokenSymbol && toTokenSymbol && fromTokenSymbol !== 'Any' && toTokenSymbol !== 'Any') {
            poolSwap = {
                tokenFrom: fromTokenSymbol,
                tokenTo: toTokenSymbol,
                amountFrom: 1.0,
            }
            const response = await fetch(`/graph?poolswap=1.0 ${fromTokenSymbol} to ${toTokenSymbol}`)
            estimates = await response.json()
        }
    }

    const onTokenSelectionChanged = async selection => {
        fromTokenSymbol = selection.fromTokenSymbol
        toTokenSymbol = selection.toTokenSymbol
        await update()
    }
</script>

<FromToTokenFilter supportAnyToken={true}
                   {allTokens} {fromTokenSymbol} {toTokenSymbol} {onTokenSelectionChanged}/>
{#if estimates}
    <PoolSwapGraph {Chart} {estimates} {poolSwap}/>
{/if}