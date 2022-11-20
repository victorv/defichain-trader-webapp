<script context="module">
    function sum(values) {
        let summed = 0.0
        for (const value of values) {
            summed += value
        }
        return summed
    }
</script>

<script>
    import Percentage from "../dex/Percentage.svelte";
    import {asDollars, roundTo} from "../common/common";

    export let mempool

    let negVol
    let posVol
    let neutralVol
    let negImpact
    let posImpact
    let impact

    $: if (mempool) {
        const negativeImpact = mempool.filter(item => item.priceImpact < 0.0)
        const positiveImpact = mempool.filter(item => item.priceImpact > 0.0)
        const noImpact = mempool.filter(item => item.priceImpact === 0.0)

        negVol = sum(negativeImpact.map(item => item.fromAmountUSD))
        posVol = sum(positiveImpact.map(item => item.fromAmountUSD))
        neutralVol = sum(noImpact.map(item => item.fromAmountUSD))

        negImpact = sum(negativeImpact.map(item => Math.abs(item.priceImpact)))
        posImpact = sum(positiveImpact.map(item => item.priceImpact))

        impact = roundTo(posImpact - negImpact, 4)
        negImpact = roundTo(-negImpact, 4)
        posImpact = roundTo(posImpact, 4)
    }
</script>

<div>
    <span>
        Net: <Percentage number={impact} />
    </span>
    <span>
        Neg: <Percentage number={negImpact} /> / {asDollars(negVol)}
    </span>
    <span>
        Pos: <Percentage number={posImpact} /> / {asDollars(posVol)}
    </span>
    <span>
        Neutral: {asDollars(neutralVol)}
    </span>
</div>

<style>
    div {
        display: flex;
        flex-direction: row;
        width: 100%;
    }

    span {
        text-align: center;
    }

    div span:nth-child(2) {
        flex-grow: 1;
    }

    div span:nth-child(3) {
        flex-grow: 1;
    }

    div span:nth-child(4) {
        flex-grow: 1;
    }
</style>