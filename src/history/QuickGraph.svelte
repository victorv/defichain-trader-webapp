<script context="module">
    const prefix = '#graph/swap/'

    const defaultTokenSymbols = {
        fromTokenSymbol: 'DUSD',
        toTokenSymbol: 'USDT'
    }
</script>

<script>
    import FromToTokenFilter from "../dex/FromToTokenFilter.svelte";
    import {onDestroy, onMount} from "svelte";
    import TradeChart from "../dex/TradeChart.svelte";
    import {getTokenSymbols} from "../common/common";
    import Request from "../Request.svelte";
    import BreakdownHeader from "../dex/BreakdownHeader.svelte";

    export let allTokens

    const tokenSymbols = getTokenSymbols(allTokens, defaultTokenSymbols, prefix)

    export let freezeTokens
    export let fromTokenSymbol = tokenSymbols.fromTokenSymbol
    export let toTokenSymbol = tokenSymbols.toTokenSymbol
    export let amount = 1.0

    const oneMilli = 1
    const oneMinute = 1000 * 60
    const fiveMinute = oneMinute * 5
    const fifteenMinutes = oneMinute * 15
    const oneHour = oneMinute * 60
    const twelveHours = oneHour * 12
    const oneDay = oneHour * 24
    const oneWeek = oneDay * 7

    const timelines = [
        {id: oneMilli, label: '1 block'},
        {id: fiveMinute, label: '5 minutes'},
        {id: fifteenMinutes, label: '15 minutes'},
        {id: oneHour, label: '1 hour'},
        {id: twelveHours, label: '12 hours'},
        {id: oneDay, label: '1 day'},
        {id: oneWeek, label: '1 week'},
    ]
    const timeline = {
        time: timelines[2].id
    }

    let abortController = new AbortController()
    let poolSwap
    let graph
    let pendingUpdate
    let resizeSeed
    let breakdownIndex = 0
    let request = {
        loading: false,
    }

    let breakdown
    let url = ''

    const subscriptions = []

    const setGraph = newGraph => {
        if (newGraph) {
            const tail = newGraph[newGraph.length - 1]
            const estimate = breakdown.estimate
            newGraph.push([
                tail[1],
                estimate,
                tail[1],
                estimate,
                new Date().getTime() / 1000,
            ])
        }
        graph = newGraph
    }

    const resize = () => {
        clearTimeout(pendingUpdate)
        pendingUpdate = setTimeout(() => resizeSeed = pendingUpdate, 500)
    }

    onDestroy(() => {
        clearTimeout(pendingUpdate)
        if (screen && screen.orientation && screen.orientation.removeEventListener) {
            screen.orientation.removeEventListener('change', resize)
        } else {
            removeEventListener('orientationchange', resize)
        }
        window.removeEventListener('resize', resize)
        subscriptions.forEach(sub => sub())
    })

    const setBreakdown = async index => {
        breakdown = poolSwap.breakdown[index]
        breakdownIndex = index
        await updateGraph()
    }

    async function updateBreakdowns() {
        if (!fromTokenSymbol || !toTokenSymbol) {
            return
        }

        request = {
            loading: true,
            error: null,
        }

        const amount = 1.0
        const params = `${amount}+${fromTokenSymbol}+to+${toTokenSymbol}`
        url = `/estimate?poolswap=${params}`
        const estimateResponse = await fetch(url)
        poolSwap = await estimateResponse.json()
        breakdown = poolSwap.breakdown[0]
        poolSwap.desiredResult = breakdown.estimate

        request = {
            loading: false,
            error: null,
        }
    }

    async function update() {
        request = {
            loading: true,
            error: null,
        }

        setGraph(null)

        if (fromTokenSymbol && toTokenSymbol && fromTokenSymbol !== 'Any' && toTokenSymbol !== 'Any') {
            const path = breakdown.path

            abortController.abort()
            abortController = new AbortController()


            const response = await fetch(`/graph?poolswap=${amount} ${fromTokenSymbol} to ${toTokenSymbol}&time=${timeline.time}&path=${path}`, {
                signal: abortController.signal,
            }).catch(e => {
                request = {
                    loading: false,
                    error: `Unable to fetch results: ${e.message}`,
                }
            })
            let newGraph = await response.json()
            setGraph(newGraph)

            request = {
                loading: false,
                error: null,
            }
        }
    }

    const updateGraph = async () => {
        location.hash = `#graph/PoolSwap/${fromTokenSymbol}+to+${toTokenSymbol}`
        await update().catch(e => {
            request = {
                loading: false,
                error: `Unable to load graph: ${e.message}`,
            }
        })
    }

    const updateBreakdownsGracefully = async () => {
        await updateBreakdowns().catch(e => {
            request = {
                loading: false,
                error: `Unable to load estimate: ${url} ${e.message} ${e.stack}`,
            }
            throw e
        })
        breakdownIndex = 0
    }

    const onTokenSelectionChanged = async selection => {
        fromTokenSymbol = selection.fromTokenSymbol
        toTokenSymbol = selection.toTokenSymbol

        await updateBreakdownsGracefully()
        await updateGraph()
    }

    const changeTimeline = async e => {
        timeline.time = +e.target.value
        await updateGraph()
    }

    onMount(async () => {
        if (screen && screen.orientation && screen.orientation.addEventListener) {
            screen.orientation.addEventListener('change', resize)
        } else {
            addEventListener('orientationchange', resize)
        }
        window.addEventListener('resize', resize)

        await updateBreakdownsGracefully()
        await updateGraph()
    })
</script>

<form class="pure-form" on:submit|preventDefault>
    <fieldset>
        <FromToTokenFilter supportAnyToken={false}
                           {freezeTokens}
                           {allTokens} {fromTokenSymbol} {toTokenSymbol} {onTokenSelectionChanged}/>
        <select disabled={!fromTokenSymbol || !toTokenSymbol}
                class="pure-select" on:change={changeTimeline} bind:value={timeline.time}>
            {#each timelines as timeline}
                <option value={timeline.id}>{timeline.label}</option>
            {/each}
        </select>

        {#if poolSwap}
            <BreakdownHeader {breakdownIndex} {poolSwap} {setBreakdown} disabled={request.loading}/>
        {/if}
    </fieldset>
</form>

{#if graph && poolSwap}
    <TradeChart {breakdown} {allTokens} {graph} {fromTokenSymbol} {toTokenSymbol}
                {resizeSeed}/>
{/if}
<Request {request}/>

<style>
    form {
        padding: 0.2rem 0 0 0.2rem;
    }

    ul {
        padding: 0;
        margin: 0;
        list-style-type: none;
        display: inline-flex;
        gap: 0.5rem;
    }
</style>