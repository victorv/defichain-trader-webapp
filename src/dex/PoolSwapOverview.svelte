<svelte:options immutable/>
<script context="module">
    const maxDataPoints = Math.round(window.innerWidth / 8)
    console.log(`max data points: ${maxDataPoints}`)
</script>
<script>
    import {removePoolswap, swaps} from "../store";
    import PoolSwapGraph from "./PoolSwapGraph.svelte";
    import ProfitLoss from "./ProfitLoss.svelte";
    import Icon from "../common/Icon.svelte";
    import PoolSwapBreakdown from "./PoolSwapBreakdown.svelte";
    import {hasItems} from "../common/common";

    export let Chart

    let poolSwaps = []

    swaps.subscribe(swaps => poolSwaps = swaps)

    const fetchEstimates = async swap => {
        const response = await fetch(`/graph?poolswap=${swap.amountFrom} ${swap.tokenFrom} to ${swap.tokenTo}`)
        return await response.json()
    }

    const toggleGraph = async forIndex => {
        const swap = poolSwaps[forIndex]
        const estimates = swap.graph ? null : await fetchEstimates(swap)

        swaps.update(poolSwaps =>
            poolSwaps.map((poolSwap, index) =>
                ({
                    ...poolSwap,
                    showBreakdown: false,
                    graph: index === forIndex ? !poolSwap.graph : false,
                    estimates,
                })
            )
        )
    }

    const toggleBreakdown = forIndex => {
        swaps.update(poolSwaps =>
            poolSwaps.map((poolSwap, index) =>
                ({
                    ...poolSwap,
                    showBreakdown: index === forIndex ? !poolSwap.showBreakdown : false,
                    graph: false
                })
            )
        )
    }
</script>

{#if hasItems(poolSwaps)}
    <table class="pure-table pure-table-striped">
        <thead>
        <tr>
            <th>Goal</th>
            <th>Profit / Loss</th>
        </tr>
        </thead>
        <tbody>
        {#each poolSwaps as poolSwap, index}
            <tr>
                <td>
                    <button on:click={() => removePoolswap(poolSwap)}
                            class="pure-button">
                        <Icon icon="remove"/>
                    </button>

                    {poolSwap.amountFrom} {poolSwap.tokenFrom} to
                    <strong>{poolSwap.desiredResult}</strong>
                    {poolSwap.tokenTo}

                    {#if poolSwap.breakdown}
                        <button on:click={() => toggleBreakdown(index)}
                                disabled={!hasItems(poolSwap.breakdown)}
                                class:info={poolSwap.showBreakdown}
                                type="button"
                                class="pure-button info-button">
                            <Icon icon="info"/>
                        </button>
                    {:else}
                        <div class="warning">
                            Something went wrong
                        </div>
                    {/if}
                </td>
                <td>
                    <button on:click={() => toggleGraph(index)}
                            disabled={!Chart}
                            class:info={poolSwap.graph}
                            type="button"
                            class="pure-button">
                        <Icon icon="graph"/>
                    </button>
                    <ProfitLoss {poolSwap} estimate={poolSwap.estimate}/>
                </td>
            </tr>
            {#if poolSwap.graph && hasItems(poolSwap.estimates)}
                <tr>
                    <td colspan="2">
                        <PoolSwapGraph {Chart} estimates={poolSwap.estimates} {poolSwap}/>
                    </td>
                </tr>
            {/if}
            {#if poolSwap.showBreakdown}
                <tr>
                    <td colspan="2">
                        <PoolSwapBreakdown {poolSwap}/>
                    </td>
                </tr>
            {/if}
        {/each}
        </tbody>
    </table>
{/if}

<style>
    td[colspan="2"] {
        padding: 1rem;
    }

    .info-button {
        float: right;
    }
</style>