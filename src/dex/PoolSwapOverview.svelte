<svelte:options immutable/>
<script context="module">
    import {calcProfitLoss, describePoolSwap} from "../common/common";

    const maxDataPoints = Math.round(window.innerWidth / 8)
    console.log(`max data points: ${maxDataPoints}`)

    function notifyUser(oldPoolSwaps, poolSwaps) {
        for (let i = 0; i < poolSwaps.length; i++) {
            const oldPoolSwap = oldPoolSwaps[i]
            const poolSwap = poolSwaps[i]
            if (oldPoolSwap.estimate < oldPoolSwap.desiredResult && poolSwap.estimate >= poolSwap.desiredResult) {

                const title = describePoolSwap(poolSwap)

                const desiredResult = `desired result: ${poolSwap.desiredResult}`
                const estimate = `estimate: ${poolSwap.estimate}`
                const profit = `profit: +${calcProfitLoss(poolSwap)}%`
                const body = `${desiredResult}\n${estimate}\n${profit}`

                new Notification(title, {
                    body,
                })
            }
        }
    }
</script>
<script>
    import {removePoolSwap, store, updateStore} from "../store";
    import PoolSwapGraph from "./PoolSwapGraph.svelte";
    import ProfitLoss from "./ProfitLoss.svelte";
    import {onDestroy} from "svelte";
    import Icon from "../common/Icon.svelte";
    import PoolSwapBreakdown from "./PoolSwapBreakdown.svelte";
    import {hasItems} from "../common/common";

    export let Chart
    export let onUpdate

    let poolSwaps = []
    let evtSource
    let desktopNotifications
    let connected
    let request

    const poolSwapHandler = e => {
        const updates = JSON.parse(e.data)
        console.log(updates)
        const oldPoolSwaps = poolSwaps
        const timestamp = new Date().toLocaleString()

        const newPoolSwaps = poolSwaps.map((poolSwap, index) => {
            const update = updates[index]
            if (!update) {
                return poolSwap
            }

            const estimate = update.estimate
            if (estimate === poolSwap.estimate) {
                return {
                    ...poolSwap,
                    ...update,
                    timestamp,
                }
            }

            let estimates = (poolSwap.estimates || []).concat({
                estimate,
                timestamp
            })

            while (estimates.length > maxDataPoints) {
                estimates = estimates.slice(1)
            }

            return {
                ...poolSwap,
                ...update,
                timestamp,
                estimate,
                estimates
            }
        })
        updateStore({poolSwaps: newPoolSwaps})

        if (desktopNotifications) {
            notifyUser(oldPoolSwaps, newPoolSwaps)
        }
        onUpdate(timestamp)

        console.log(newPoolSwaps)
    }

    const toggleGraph = forIndex => {
        const newPoolSwaps = poolSwaps.map((poolSwap, index) => ({
            ...poolSwap,
            showBreakdown: false,
            graph: index === forIndex ? !poolSwap.graph : false
        }))
        updateStore({poolSwaps: newPoolSwaps})
    }

    const toggleBreakdown = forIndex => {
        const newPoolSwaps = poolSwaps.map((poolSwap, index) => ({
            ...poolSwap,
            showBreakdown: index === forIndex ? !poolSwap.showBreakdown : false,
            graph: false
        }))
        updateStore({poolSwaps: newPoolSwaps})
    }

    store.subscribe(state => {
        desktopNotifications = state.desktopNotifications

        poolSwaps = state.poolSwaps.map(poolSwap => ({
            timestamp: poolSwap.timestamp || 'Never',
            ...poolSwap
        }))
        if (!hasItems(poolSwaps)) {
            if (evtSource) {
                evtSource.close()
            }
            return
        }

        const newRequest = poolSwaps.map(swap => `${swap.amountFrom}+${swap.tokenFrom}+to+${swap.tokenTo}+desiredResult+${swap.desiredResult}`).join(',')
        if (evtSource && connected) {
            if (request === newRequest) {
                return
            }
            connected = false
            evtSource.close()
        }
        request = newRequest

        evtSource = new EventSource(`/dex?poolswaps=${newRequest}`)
        evtSource.addEventListener('poolswap', poolSwapHandler)
        evtSource.onopen = () => connected = true
        evtSource.onerror = e => {
            console.log(e)
            connected = false
        }
    })

    onDestroy(() => {
        if (evtSource) {
            evtSource.close()
        }
    })
</script>

{#if !connected && hasItems(poolSwaps)}
    <div class="disconnected">
        <div>
            <h1>You are not connected to the server</h1>
            <p>
                Reload the page to retry if you have not been automatically reconnected within 40 seconds.
            </p>
        </div>
    </div>
{/if}
{#if hasItems(poolSwaps)}
    <table class="pure-table pure-table-striped">
        <thead>
        <tr>
            <th>Goal</th>
            <th>Profit / Loss</th>
        </tr>
        </thead>
        <tbody>
        {#each poolSwaps as poolSwap, index}
            <tr>
                <td>
                    <button on:click={async() => await removePoolSwap(index)}
                            class="pure-button">
                        <Icon icon="remove"/>
                    </button>

                    {poolSwap.amountFrom} {poolSwap.tokenFrom} to
                    <strong>{poolSwap.desiredResult}</strong>
                    {poolSwap.tokenTo}

                    {#if poolSwap.breakdown}
                        <button on:click={() => toggleBreakdown(index)}
                                disabled={!hasItems(poolSwap.breakdown)}
                                class:info={poolSwap.showBreakdown}
                                type="button"
                                class="pure-button info-button">
                            <Icon icon="info"/>
                        </button>
                    {:else}
                        <div class="warning">
                            Something went wrong
                        </div>
                    {/if}
                </td>
                <td>
                    <button on:click={() => toggleGraph(index)}
                            disabled={!Chart || !hasItems(poolSwap.estimates)}
                            class:info={poolSwap.graph}
                            type="button"
                            class="pure-button">
                        <Icon icon="graph"/>
                    </button>
                    <ProfitLoss {poolSwap}/>
                </td>
            </tr>
            {#if poolSwap.graph}
                <tr>
                    <td colspan="2">
                        <PoolSwapGraph {Chart} estimates={poolSwap.estimates} {poolSwap}/>
                    </td>
                </tr>
            {/if}
            {#if poolSwap.showBreakdown}
                <tr>
                    <td colspan="2">
                        <PoolSwapBreakdown {poolSwap}/>
                    </td>
                </tr>
            {/if}
        {/each}
        </tbody>
    </table>
{/if}

<style>
    .disconnected {
        display: flex;
        justify-content: center;
    }

    td[colspan="2"] {
        padding: 1rem;
    }

    .info-button {
        float: right;
    }
</style>