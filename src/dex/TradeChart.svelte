<script>
    import {onMount} from "svelte";
    import {screenStore} from "../store";

    export let allTokens
    export let series
    export let fromTokenSymbol
    export let toTokenSymbol
    export let resizeSeed

    let screen

    screenStore.subscribe(newScreen => screen = newScreen)

    let canvasElement
    let chart
    let lineSeries
    let path

    $: if(series) {
        const tokens = [fromTokenSymbol]
        for (const swap of series.swap.swaps) {
            tokens.push(swap.poolSymbol)
        }
        tokens.push(toTokenSymbol)
        path = tokens.join(' → ')
    }

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
        let n = Math.min(...data.map(e => e.value)) * 0.0001
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

    $: if (resizeSeed && chart) {
        chart.resize(window.innerWidth, window.innerHeight * 0.8)
        chart.timeScale().fitContent()
    }

    onMount(async () => {
        chart = LightweightCharts.createChart(canvasElement, {
            handleScroll: false,
            handleScale: {
                mouseWheel: false,
            },
        })
console.log(series)
        lineSeries = chart.addLineSeries(createSeriesOptions(series.points))
        lineSeries.setData(series.points)

        chart.timeScale().applyOptions({
            mouseWheel: false,
            timeVisible: true,
        })
        chart.timeScale().fitContent()
    })
</script>

<div bind:this={canvasElement} class="container">
    <div>{path}</div>
</div>

<style>
    .container {
        position: relative;
        display: flex;
        flex-direction: row;
        height: 80vh;
        overflow: hidden;
    }

    div > div {
        position: absolute;
        left: 12px;
        top: 12px;
        z-index: 10000;
        font-size: 14px;
        font-family: sans-serif;
        line-height: 18px;
        font-weight: 300;
    }
</style>