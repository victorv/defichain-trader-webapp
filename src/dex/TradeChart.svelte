<script>
    import {onMount} from "svelte";
    import {screenStore} from "../store";

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

    const calcPriceFormat = n => {
        if (n < 0.00000001) return [0.00000001, 8]
        if (n < 0.000001) return [0.000001, 7]
        if (n < 0.00001) return [0.00001, 6]
        if (n < 0.0001) return [0.0001, 5]
        if (n < 0.001) return [0.001, 4]
        if (n < 0.01) return [0.01, 3]
        if (n < 0.1) return [0.1, 2]
        return [1, 0]
    }

    const createSeriesOptions = data => {
        let n = Math.min(...data.map(e => e.low)) * 0.001
        let [minMove, precision] = calcPriceFormat(n)

        const options = {
            priceFormat: {
                type: 'price',
                minMove,
                precision
            },
        }
        return options
    }

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

            if (prevCandle) {
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
        }
    }

    onMount(async () => {
        chart = LightweightCharts.createChart(canvasElement, {
            handleScale: {
                mouseWheel: false,
            },
        });
        const data = createDataPoints()

        const options = createSeriesOptions(data)

        series = chart.addCandlestickSeries(options)
        series.setData(data)
        chart.timeScale().applyOptions({
            mouseWheel: false,
            timeVisible: true,
        })
        chart.timeScale().fitContent()
    })
</script>

<div bind:this={canvasElement} class="container"></div>

<style>
    .container {
        display: flex;
        flex-direction: row;
        height: 80vh;
        overflow: hidden;
    }
</style>