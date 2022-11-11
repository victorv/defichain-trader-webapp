<svelte:options immutable/>
<script>
    import {onDestroy, onMount} from "svelte";

    export let Chart
    export let poolSwap
    export let estimates

    let canvasElement
    let chart

    $: if (chart) {
        chart.data.datasets[0].data = estimates.map(e => ({x: e[2] * 1000, y: e[1]}))
        chart.update()
    }

    const data = {
        datasets: [
            {
                type: 'line',
                label: `${poolSwap.amountFrom} ${poolSwap.tokenFrom} to ${poolSwap.tokenTo}`,
                data: estimates.map(e => ({x: e[2] * 1000, y: e[1]})),
                fill: true,
                borderColor: 'rgb(75, 192, 192)',
            }
        ]
    }

    if(poolSwap.desiredResult) {
        data.datasets.push({
            label: 'Desired Result',
            data: estimates.map(e => ({x: e[2] * 1000, y: poolSwap.desiredResult})),
            fill: false,
            hoverRadius: 0,
            pointRadius: 0,
            borderColor: 'red',
        })
    }

    const config = {
        type: 'line',
        options: {
            hover: {
                intersect: false
            },
            pointBorderColor: 'rgba(0, 0, 0, 0)',
            pointBackgroundColor: 'rgba(0, 0, 0, 0)',
            pointHoverBackgroundColor: 'rgb(54, 162, 235)',
            pointHoverBorderColor: 'rgb(54, 162, 235)',
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: 'time',
                    distribution: 'series',
                    time: {
                        minUnit: 'day'
                    }
                }
            }
        },

        data,
    }

    onMount(() => {
        chart = new Chart(
            canvasElement,
            config
        )
    })

    onDestroy(() => {
        chart.destroy()
    })
</script>

<div>
    <canvas bind:this={canvasElement}></canvas>
</div>

<style>
    div {
        height: 80vh;
    }
</style>