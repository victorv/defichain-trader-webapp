<script>
    import {onMount} from "svelte";
    import {screenStore} from "../store";
    import Percentage from "./Percentage.svelte";
    import BigNumber from "bignumber.js";

    export let allTokens
    export let graph
    export let breakdown
    export let fromTokenSymbol
    export let toTokenSymbol
    export let resizeSeed

    let screen

    screenStore.subscribe(newScreen => screen = newScreen)

    let canvasElement
    let chart
    let lineSeries
    let path
    let fees

    $: if (breakdown) {
        let newFees = new BigNumber(0.0)
        const tokens = []
        for (const swap of breakdown.swaps) {
            tokens.push(swap.poolSymbol)
            if (swap.commission) {
                newFees = newFees.plus(new BigNumber(swap.commission))
            }
            if (swap.inFeePct) {
                newFees = newFees.plus(new BigNumber(swap.inFeePct))
            }
            if (swap.outFeePct) {
                newFees = newFees.plus(new BigNumber(swap.outFeePct))
            }
        }

        path = tokens.join(' → ')
        fees = newFees.times(new BigNumber(100.0)).toPrecision(3)
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

    const createCandles = () => {
        const candles = []
        for (const candleEntry of graph) {
            candles.push({
                open: candleEntry[0],
                close: candleEntry[1],
                low: candleEntry[2],
                high: candleEntry[3],
                time: candleEntry[4],
            })
        }
        return candles
    }

    const createSeriesOptions = data => {
        let n = Math.min(...data.map(e => e.low)) * 0.0001
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

    function resize() {
        const bounds = canvasElement.getBoundingClientRect()
        chart.resize(bounds.width, window.innerHeight - bounds.y - 10)
        chart.timeScale().fitContent()
    }

    $: if (resizeSeed && chart) {
        resize()
    }

    onMount(async () => {
        chart = LightweightCharts.createChart(canvasElement, {
            handleScroll: false,
            handleScale: {
                mouseWheel: false,
            },
            grid: {
                vertLines: {
                    visible: false
                },
                horzLines: {
                    visible: false
                }
            },
            watermark: {
                visible: true,
                fontSize: 18,
                horzAlign: 'center',
                vertAlign: 'center',
                color: 'rgba(171, 71, 188, 0.5)',
                text: 'defichain-trader.com',
            }
        })

        const candles = createCandles(graph)
        lineSeries = chart.addCandlestickSeries(createSeriesOptions(candles))
        lineSeries.setData(candles)

        chart.timeScale().applyOptions({
            mouseWheel: false,
            timeVisible: true,
        })
        resize()
    })
</script>

<div bind:this={canvasElement} class="canvas">
    <div>
        {path}
        <br/>
        fees
        <Percentage number={fees} inverse={true}/>
    </div>
</div>

<style>
    .canvas {
        position: relative;
        width: 100%;
        overflow: hidden;
    }

    .canvas > div {
        position: absolute;
        left: 12px;
        top: 12px;
        z-index: 10000;
        font-size: 10px;
        font-family: sans-serif;
        line-height: 18px;
        font-weight: 300;
    }
</style>