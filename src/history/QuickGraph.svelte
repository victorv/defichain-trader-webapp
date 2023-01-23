<script>
    import FromToTokenFilter from "../dex/FromToTokenFilter.svelte";
    import {onDestroy, onMount} from "svelte";
    import TradeChart from "../dex/TradeChart.svelte";
    import Icon from "../common/Icon.svelte";
    import {hasItems} from "../common/common";
    import Request from "../Request.svelte";

    export let allTokens
    export let freezeTokens
    export let fromTokenSymbol = 'DUSD'
    export let toTokenSymbol = 'USDT'
    export let amount = 1.0

    const oneMinute = 1000 * 60
    const fiveMinute = oneMinute * 5
    const fifteenMinutes = oneMinute * 15
    const oneHour = oneMinute * 60
    const twelveHours = oneHour * 12
    const oneDay = oneHour * 24
    const oneWeek = oneDay * 7

    const timelines = [
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
    let request = {
        loading: false,
    }

    let breakdowns
    let breakdownIndex = 0
    let url = ''

    const subscriptions = []

    const setGraph = newGraph => {
        if (newGraph) {
            const tail = newGraph[newGraph.length - 1]
            const breakdown = breakdowns[breakdownIndex]
            if(breakdown) {
                const estimate = breakdown.estimate
                newGraph.push([
                    tail[1],
                    estimate,
                    tail[1],
                    estimate,
                    new Date().getTime() / 1000,
                ])
            } else {
                alert(`${breakdownIndex} ${url} ${JSON.stringify(breakdown)}`)
            }
        }
        graph = newGraph
    }

    const resize = () => {
        clearTimeout(pendingUpdate)
        pendingUpdate = setTimeout(() => resizeSeed = pendingUpdate, 500)
    }

    onDestroy(() => {
        clearTimeout(pendingUpdate)
        screen.orientation.removeEventListener('change', resize)
        window.removeEventListener('resize', resize)
        subscriptions.forEach(sub => sub())
    })

    const setBreakdown = async index => {
        breakdownIndex = index
        await updateGraph()
    }

    async function updateBreakdowns() {
        if (!fromTokenSymbol || !toTokenSymbol) {
            alert(`${fromTokenSymbol} ${toTokenSymbol}`)
            return
        }

        const amount = 1.0
        const params = `${amount}+${fromTokenSymbol}+to+${toTokenSymbol}`
        url = `/estimate?poolswap=${params}`
        const estimateResponse = await fetch(url)
        const estimate = await estimateResponse.json()
        breakdownIndex = 0
        breakdowns = estimate.breakdown.sort((a, b) => a.estimate > b.estimate ? -1 : 1)
    }

    async function update() {
        request = {
            loading: true,
            error: null,
        }

        setGraph(null)
        poolSwap = null

        if (fromTokenSymbol && toTokenSymbol && fromTokenSymbol !== 'Any' && toTokenSymbol !== 'Any') {
            poolSwap = {
                tokenFrom: fromTokenSymbol,
                tokenTo: toTokenSymbol,
                amountFrom: amount || 1.0,
            }

            const path = breakdowns[breakdownIndex].path

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
        await update().catch(e => {
            request = {
                loading: false,
                error: `Unable to load graph: ${e.message}`,
            }
        })
    }

    const onTokenSelectionChanged = async selection => {
        fromTokenSymbol = selection.fromTokenSymbol
        toTokenSymbol = selection.toTokenSymbol

        await updateBreakdowns()
        await updateGraph()
    }

    const changeTimeline = async e => {
        timeline.time = +e.target.value
        await updateGraph()
    }

    onMount(async () => {
        screen.orientation.addEventListener('change', resize)
        window.addEventListener('resize', resize)

        await updateBreakdowns()
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

        {#if hasItems(breakdowns)}
            <ul>
                {#each breakdowns as breakdown, index}
                    <li>
                        <button class="pure-button"
                                disabled={request.loading}
                                on:click={() => setBreakdown(index)}
                                class:info={index === breakdownIndex}>
                            {index + 1}.
                            {#if index === 0}
                                <Icon icon="best"/>
                            {:else if index !== 0 && breakdown.swaps.length === 1}
                                <Icon icon="danger"/>
                            {:else}
                                <Icon icon="warning"/>
                            {/if}
                        </button>
                    </li>
                {/each}
            </ul>
        {/if}
    </fieldset>
</form>

{#if graph && breakdowns}
    <TradeChart breakdown={breakdowns[breakdownIndex]} {allTokens} {graph} {fromTokenSymbol} {toTokenSymbol}
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