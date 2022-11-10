<svelte:options immutable/>
<script>
    import {onDestroy, onMount} from "svelte";

    export let Chart
    export let poolSwap
    export let estimates

    let canvasElement
    let chart

    $: if (chart) {
        chart.data.labels = estimates.map(e => `height: ${e[0]}, estimate: ${e[1]}`)
        chart.data.datasets[0].data = estimates.map(e => e[1])

        const blocks = estimates[estimates.length - 1][0] - estimates[0][0]
        const days = (blocks / 120.0 / 24.0).toFixed(2)
        chart.options.plugins.title.text = `Days: ${days}`

        chart.update()
    }

    const data = {
        labels: estimates.map(e => `height: ${e[0]}, estimate: ${e[1]}`),
        datasets: [
            {
                type: 'line',
                label: `${poolSwap.amountFrom} ${poolSwap.tokenFrom} to ${poolSwap.tokenTo}`,
                data: estimates.map(e => e[1]),
                fill: true,
                borderColor: 'rgb(75, 192, 192)',
            },
            {
                label: 'Desired Result',
                data: new Array(estimates.length)
                    .fill(poolSwap.desiredResult),
                fill: false,
                pointRadius: 0,
                borderColor: 'red',
            }
        ]
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
                    display: false
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