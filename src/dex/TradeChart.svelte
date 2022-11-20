<script>
    import {onMount} from "svelte";
    import {screenStore} from "../store";
    import MempoolImpact from "../chart/MempoolImpact.svelte";

    export let items
    export let estimates
    export let fromTokenSymbol
    export let toTokenSymbol
    export let resizeSeed

    let screen

    screenStore.subscribe(newScreen => screen = newScreen)

    let canvasElement
    let chart
    let series

    const createSeriesOptions = data => (
        {
            priceFormat: {
                type: 'price',
                minMove: data.find(e => e.low < 0.1) ? 0.00000001 : 0.1,
                precision: data.find(e => e.low < 0.1) ? 8 : 2
            },
        }
    )

    const createDataPoints = () => {
        const data = estimates.map(e => ({
            open: e[0],
            close: e[1],
            low: e[2],
            high: e[3],
            time: e[4] / 1000,
        }))
        return data
    }

    $: if (resizeSeed && chart) {
        chart.resize(window.innerWidth, window.innerHeight * 0.8)
        chart.timeScale().fitContent()
    }

    $: if (estimates) {
        if (chart) {
            const data = createDataPoints()
            series.applyOptions(createSeriesOptions(data))
            series.setData(data)
        }
    }

    onMount(async () => {
        chart = LightweightCharts.createChart(canvasElement);
        const data = createDataPoints()
        series = chart.addCandlestickSeries(createSeriesOptions(data))
        series.setData(data)
        chart.timeScale().applyOptions({
            timeVisible: true,
        })
        chart.timeScale().fitContent()
    })
</script>

<MempoolImpact mempool={items}/>
<div bind:this={canvasElement} class="container"></div>

<style>
    .container {
        display: flex;
        flex-direction: row;
        height: 80vh;
        overflow: hidden;
    }
</style>