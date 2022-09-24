<svelte:options immutable/>
<script>
    import {onDestroy, onMount} from "svelte";

    export let Chart
    export let poolSwap
    export let estimates

    let canvasElement
    let chart

    $: if (chart) {
        chart.data.labels = estimates.map(e => `${e.timestamp}, result: ${e.estimate}`)
        chart.data.datasets[0].data = estimates.map(e => e.estimate)

        let title = estimates[0].timestamp.toLocaleString()
        if (estimates.length > 1) {
            const mostRecent = estimates[estimates.length - 1].timestamp.toLocaleString()
            title = `${title} - ${mostRecent}`
        }
        chart.options.plugins.title.text = title

        chart.update()
    }

    const data = {
        labels: estimates.map(e => e.timestamp.toLocaleString()),
        datasets: [
            {
                type: 'line',
                label: `${poolSwap.amountFrom} ${poolSwap.tokenFrom} to ${poolSwap.tokenTo}`,
                data: estimates.map(e => e.estimate),
                fill: true,
                borderColor: 'rgb(75, 192, 192)',
            }
        ]
    }

    const config = {
        type: 'line',
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                autocolors: false,
                annotation: {
                    annotations: {
                        line1: {
                            type: 'line',
                            yMin: poolSwap.desiredResult,
                            yMax: poolSwap.desiredResult,
                            borderColor: 'rgb(255, 99, 132)',
                            borderWidth: 2,
                        }
                    }
                },
                title: {
                    display: true,
                    text: 'Chart'
                }
            },
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