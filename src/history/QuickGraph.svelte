<script>
    import FromToTokenFilter from "../dex/FromToTokenFilter.svelte";
    import PoolSwapGraph from "../dex/PoolSwapGraph.svelte";
    import {onMount} from "svelte";

    export let allTokens
    export let Chart

    let fromTokenSymbol = 'DFI'
    let toTokenSymbol = 'BTC'
    let poolSwap
    let estimates

    async function update() {
        estimates = null
        poolSwap = null

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

    onMount(async () => await update())
</script>

<FromToTokenFilter supportAnyToken={true}
                   {allTokens} {fromTokenSymbol} {toTokenSymbol} {onTokenSelectionChanged}/>
{#if estimates}
    <PoolSwapGraph {Chart} {estimates} {poolSwap}/>
{/if}