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

    function getRandomData(dateStr) {
        let date = luxon.DateTime.fromRFC2822(dateStr);
        const data = []
        for (const estimate of estimates) {
            date = date.plus({days: 1});
            data.push({
                x: date.valueOf(),
                o: estimate[2],
                h: Math.max(estimate[1], estimate[2]),
                l: Math.min(estimate[2], estimate[1]),
                c: estimate[1]
            });
        }
        return data;
    }

    $: if (chart && estimates) {
        chart.data.datasets[0].data = getRandomData('01 Apr 2017 00:00 Z')
        chart.update()
    }

    const data = {
        datasets: [
            {
                label: `${fromTokenSymbol} to ${toTokenSymbol}`,
                data: getRandomData('01 Apr 2017 00:00 Z'),
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
        <table class="pure-table">
            <tr>
                <td>Swap</td>
                <td>
                    Price Impact
                    <Help help="Only trades with a price impact of at least 0.05% are displayed here" />
                </td>
            </tr>
            {#each items as item}
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
                                <Percentage number={0.01}/>
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