<svelte:options immutable/>

<script>
    import {orderStore, swaps} from "../store";
    import Icon from "../common/Icon.svelte";
    import {hasItems} from "../common/common";
    import QuickGraph from "../history/QuickGraph.svelte";
    import WebSocketStatus from "../WebSocketStatus.svelte";
    import {onDestroy, onMount} from "svelte";
    import ProfitLoss from "../dex/ProfitLoss.svelte";
    import PoolSwapBreakdown from "../dex/PoolSwapBreakdown.svelte";
    import {removePoolswap, webSocketStore} from "../websocket";

    export let allTokens

    let poolSwaps = []
    let swap
    let subscriptions = []
    let webSocketStatus

    onMount(() => {
        subscriptions.push(orderStore.subscribe(newOrders => poolSwaps = newOrders))
        subscriptions.push(webSocketStore.subscribe(status => webSocketStatus = status))
    })

    onDestroy(() => subscriptions.forEach(s => s()))

    const toggleGraph = forIndex => {
        swap = poolSwaps[forIndex]

        swaps.update(poolSwaps =>
            poolSwaps.map((poolSwap, index) =>
                ({
                    ...poolSwap,
                    showBreakdown: false,
                    graph: index === forIndex ? !poolSwap.graph : false,
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

{#if webSocketStatus && (webSocketStatus.connecting || !webSocketStatus.connected)}
    <WebSocketStatus status={webSocketStatus}/>
{:else if hasItems(poolSwaps)}
    <table class="pure-table">
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
                            class:info={poolSwap.graph}
                            type="button"
                            class="pure-button">
                        <Icon icon="graph"/>
                    </button>
                    {poolSwap.estimate} = <ProfitLoss {poolSwap} estimate={poolSwap.estimate}/>
                </td>
            </tr>
            {#if poolSwap.graph && swap}
                <tr>
                    <td colspan="2">
                        <QuickGraph freezeTokens={true} {allTokens} amount={swap.fromAmount} fromTokenSymbol={swap.tokenFrom} toTokenSymbol={swap.tokenTo}/>
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

<div class="filler"></div>

<style>
    .filler {
        min-height: 100vh;
    }

    td[colspan="2"] {
        padding: 1rem;
    }

    .info-button {
        float: right;
    }
</style>