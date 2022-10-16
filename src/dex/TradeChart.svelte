<script>
    import {onMount} from "svelte";
    import {asDollars} from "../common/common";
    import Percentage from "./Percentage.svelte";
    import Help from "../common/Help.svelte";

    export let Chart
    export let items
    export let estimates
    export let fromTokenSymbol
    export let toTokenSymbol

    function getRecentEstimates() {
        return estimates.length < 120 ? estimates : estimates.slice(estimates.length - 119);
    }

    function getMempool() {
        return items.sort((a, b) => Math.abs(b.priceImpact) - Math.abs(a.priceImpact) || b.fromAmountUSD - a.fromAmountUSD);
    }

    function sum(values) {
        let summed = 0.0
        for (const value of values) {
            summed += value
        }
        return summed
    }

    let canvasElement
    let chart
    let recentEstimates = getRecentEstimates()
    let mempool = getMempool()
    let volume = 0.0
    let minImpact = 0.0
    let maxImpact = 0.0

    $: if (estimates) {
        recentEstimates = getRecentEstimates()
        if (chart) {
            chart.data.datasets[0].data = createDataPoints()
            chart.update()
        }
    }

    $: if (items) {
        mempool = getMempool()
        const negativeImpact = mempool.filter(item => item.priceImpact < 0.0)
        const positiveImpact = mempool.filter(item => item.priceImpact > 0.0)

        volume = sum(negativeImpact.map(item => item.fromAmountUSD)) + sum(positiveImpact.map(item => item.fromAmountUSD))

        minImpact = -sum(negativeImpact.map(item => Math.abs(item.priceImpact)))
        maxImpact = sum(positiveImpact.map(item => item.priceImpact))
    }

    function createDataPoints() {
        const data = []
        let prevDataPoint
        for (const estimate of recentEstimates) {

            const o = prevDataPoint ? prevDataPoint.c : estimate[1]
            const c = estimate[1]
            const dataPoint = {
                x: parseInt(estimate[2], 10) * 1000,
                o,
                h: Math.max(o, c),
                l: Math.min(o, c),
                c
            }

            data.push(dataPoint)
            prevDataPoint = dataPoint
        }
        return data;
    }

    const data = {
        datasets: [
            {
                label: `${fromTokenSymbol} to ${toTokenSymbol}`,
                data: createDataPoints(),
            }
        ]
    }

    const config = {
        type: 'candlestick',
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    display: false
                }
            }
        },
        data
    }

    onMount(async () => {
        chart = new Chart(
            canvasElement,
            config
        )
    })
</script>
<div class="container">
    <canvas bind:this={canvasElement}></canvas>
    <div>
        <header>
            <label>
                <strong>Simulating
                    <Help help="Price impact is calculated in relation to the swap below. This swap follows the rules set by a full node. If a direct path is available it takes precedence over any other paths."/>
                </strong>
                {asDollars(1000)} {fromTokenSymbol} to {toTokenSymbol}
            </label>
            <label>
                <strong>Impactful volume
                    <Help help="Total volume in USD of all impactful swaps in the mempool."/>
                </strong>
                {asDollars(volume)}
            </label>
            <label>
                <strong>Price impact
                    <Help help="The minimum number represents the case where only trades that make your trade more expensive go through. The maximum number represents the case where only trades that make your trade less expensive go through. N/A indicates that there are no impactful swaps in the mempool."/>
                </strong>
                {#if minImpact !== -0.0 && maxImpact !== 0}
                    <Percentage number={minImpact}/>
                    -
                    <Percentage number={maxImpact}/>
                {:else if minImpact !== -0}
                    <Percentage number={minImpact}/>
                {:else if maxImpact !== 0}
                    <Percentage number={maxImpact}/>
                {:else}
                    N/A
                {/if}
            </label>
        </header>
        <table class="pure-table pure-table-striped">
            <tr>
                <td>
                    Swap
                    <Help help="Represents a swap that is currently in the mempool."/>
                </td>
                <td>
                    Price Impact
                    <Help help="Negative percentage means your trade will be more expensive. Positive percentage means your trade will be cheaper. If only the volume in USD is displayed it means this trade won't impact your trade."/>
                </td>
            </tr>
            {#each mempool as item}
                <tr>
                    <td>
                        <span>
                            {item.tokenFrom} to {item.tokenTo}
                        </span>
                    </td>
                    <td>
                        <div class="hover-toggle">
                            {#if item.priceImpact !== 0.0}
                                <div>
                                    <Percentage number={item.priceImpact}/>
                                </div>
                            {/if}
                            <span>{asDollars(item.fromAmountUSD)}</span>
                        </div>
                    </td>
                </tr>
            {/each}
        </table>
    </div>
</div>

<style>
    header label {
        display: block;
    }

    header label strong {
        display: block;
    }

    table {
        table-layout: fixed;
    }

    td {
        width: 50%;
    }

    span {
        display: block;
    }

    .container {
        display: flex;
        flex-direction: row;
        height: 80vh;
    }

    .container div {
        width: 20%;
    }

    canvas {
        max-width: 80%;
    }
</style>