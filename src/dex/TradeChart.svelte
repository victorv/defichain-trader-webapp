<script>
    import {onMount} from "svelte";
    import {screenStore} from "../store";
    import TXHistory from "../history/TXHistory.svelte";

    export let allTokens
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
    let filterOverrides
    let popup

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
        for (const e of estimates) {
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
            handleScroll: false,
            handleScale: {
                mouseWheel: false,
            },
        })

        function popupExplorer(param) {
            const data = createDataPoints()
            const estimateIndex = estimates.findIndex(e => e[4] === param.time * 1000)
            if (estimateIndex !== -1) {
                const dataPoint = data[estimateIndex]
                const estimate = estimates[estimateIndex]

                filterOverrides = {
                    fromTokenSymbol,
                    toTokenSymbol,
                    minBlock: estimate[5]
                }

                const endDate = luxon.DateTime.fromMillis(estimate[4]).toLocaleString(luxon.DateTime.DATETIME_SHORT)
                let startDate = 'now'

                const nextEstimate = estimates[estimateIndex + 1]
                if (nextEstimate) {
                    filterOverrides.maxBlock = nextEstimate[5]
                    startDate = luxon.DateTime.fromMillis(nextEstimate[4]).toLocaleString(luxon.DateTime.DATETIME_SHORT)
                }

                popup = {
                    timespan: `${startDate} - ${endDate}`,
                    ...dataPoint
                }
            }
        }

        chart.subscribeClick(popupExplorer)

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

{#if filterOverrides && popup}
    <div class="popup">
        <header>
            <button on:click={() => filterOverrides = null} class="pure-button" type="button">Close</button>
            <strong>{popup.timespan}</strong>, <strong>o:</strong> {popup.open} <strong>c:</strong> {popup.close}
            <strong>l:</strong> {popup.low} <strong>h:</strong> {popup.high}
        </header>
        <div class="content">
            <TXHistory {filterOverrides} {allTokens}/>
        </div>
    </div>
{/if}
<div bind:this={canvasElement} class="container"></div>

<style>
    header {
        max-height: 50px;
    }

    .content {
        overflow-y: auto;
        max-height: calc(95vh - 50px);
    }

    .popup {
        position: fixed;
        z-index: 10000;
        background: white;
        border: 1px solid black;
        left: 2.5vw;
        top: 2.5vh;
        width: 95vw;
        height: 95vh;
    }

    .container {
        display: flex;
        flex-direction: row;
        height: 80vh;
        overflow: hidden;
    }
</style>