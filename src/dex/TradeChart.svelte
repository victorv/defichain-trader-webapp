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
    let areaSeries

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
        const data = []

        let prevCandle
        for(const e of estimates) {
            const candle = {
                open: e[0],
                close: e[1],
                low: e[2],
                high: e[3],
                time: e[4] / 1000,
            }

            if (prevCandle && candle.open === candle.close) {
                candle.open = prevCandle.close
            }
            prevCandle = candle
            data.push(candle)
        }
        return data
    }

    $: if (resizeSeed && chart) {
        chart.resize(window.innerWidth, window.innerHeight * 0.8)
        chart.timeScale().fitContent()
    }

    $: if (estimates) {
        if (chart) {
            const data = createDataPoints()
            const options = createSeriesOptions(data)
            series.applyOptions(options)
            series.setData(data)
            areaSeries.setData(data.map(e => ({
                time: e.time,
                value: (e.open + e.close) / 2.0
            })))
        }
    }

    onMount(async () => {
        chart = LightweightCharts.createChart(canvasElement);
        const data = createDataPoints()

        const options = createSeriesOptions(data)
        areaSeries = chart.addAreaSeries(options)
        areaSeries.setData(data.map(e => ({
            time: e.time,
            value: (e.open + e.close) / 2.0
        })))

        series = chart.addCandlestickSeries(options)
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