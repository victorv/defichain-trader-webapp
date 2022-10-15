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

    let canvasElement
    let chart

    $: if (chart && estimates) {
        chart.data.datasets[0].data = createDataPoints()
        chart.update()
    }

    $: mempool = items.sort((a, b) => Math.abs(b.priceImpact) - Math.abs(a.priceImpact))

    function createDataPoints() {
        const data = []
        let prevDataPoint
        for (const estimate of estimates) {

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
        <table class="pure-table pure-table-striped">
            <tr>
                <td>Swap</td>
                <td>
                    Price Impact
                    <Help help="Only trades with a price impact of at least 0.05% are displayed here" />
                </td>
            </tr>
            {#each mempool as item}
                <tr>
                    <td>
                        <span>
                            {item.tokenFrom} to {item.tokenTo}
                        </span>
                        <span>

                        </span>
                    </td>
                    <td>
                        <div class="hover-toggle">
                            <div>
                                <Percentage number={item.priceImpact}/>
                            </div>
                            <span>{asDollars(item.amountFrom)}</span>
                        </div>
                    </td>
                </tr>
            {/each}
        </table>
    </div>
</div>

<style>
    table {
        table-layout: fixed;
    }

    td {
        width: 50%;
    }

    .hover-toggle:hover div {
        display: none;
    }

    .hover-toggle:hover span {
        display: inline;
    }

    .hover-toggle span {
        display: none;
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