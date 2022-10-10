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

        let title = estimates[0][0]
        if (estimates.length > 1) {
            const mostRecent = estimates[estimates.length - 1][0]
            title = `Blocks: ${title} - ${mostRecent}`
        }
        chart.options.plugins.title.text = title

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