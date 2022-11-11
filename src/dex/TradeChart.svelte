<script>
    import {onMount} from "svelte";
    import {screenStore} from "../store";

    export let Chart
    export let items
    export let estimates
    export let fromTokenSymbol
    export let toTokenSymbol

    let screen

    screenStore.subscribe(newScreen => screen = newScreen)

    function getRecentEstimates() {
        const max = Math.round(window.innerWidth / 20.0)
        return estimates.length < max ? estimates : estimates.slice(estimates.length - (max - 1));
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
            const x = estimate[2] * 1000

            const dataPoint = {
                x: prevDataPoint && prevDataPoint.x === x ? x + 1 : x,
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
</div>

<style>
    .container {
        display: flex;
        flex-direction: row;
        height: 80vh;
        overflow: hidden;
    }
</style>