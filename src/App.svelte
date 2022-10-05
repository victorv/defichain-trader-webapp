<svelte:options immutable/>
<script>
    import {onMount} from "svelte";
    import {store, updateStore} from "./store";
    import Menu from "./menu/Menu.svelte";
    import DEX from "./dex/DEX.svelte";
    import TXHistory from "./history/TXHistory.svelte";
    import WebSocket from "./WebSocket.svelte";

    let allTokens
    let error
    let Chart
    let mainElement
    let componentType = TXHistory

    window.fireChartJSLoad = chartConstructor => {
        Chart = chartConstructor
    }

    const onLogin = () => {
        componentType = DEX
    }

    const init = async () => {
        const tokensRequest = fetch(`/tokens`).then(res => res.json())
        const poolPairsRequest = fetch(`/poolpairs`).then(res => res.json())
        const [tokens, poolPairs] = await Promise.all([tokensRequest, poolPairsRequest])

        const tokenSymbolsById = {}
        for (const [tokenId, token] of Object.entries(tokens)) {
            tokenSymbolsById[tokenId] = token.symbol
        }

        const poolPairTokens = new Set()
        for (const poolPair of Object.values(poolPairs)) {
            poolPairTokens.add(tokenSymbolsById[poolPair.idTokenA])
            poolPairTokens.add(tokenSymbolsById[poolPair.idTokenB])
        }

        updateStore({tokenSymbolsById})
        allTokens = Array.from(poolPairTokens).sort()
    }

    onMount(async () => {
        try {
            await init()
        } catch (e) {
            error = `Unable to start application because of the following error: ${e.message}`
            throw e
        }
    })

    const updateComponentType = newComponentType => {
        componentType = newComponentType
        if (document.activeElement && document.activeElement.className.includes("pure-menu-link")) {
            mainElement.focus()
        }
    }
</script>

<Menu onChange={updateComponentType} {componentType}/>
<header>
    <WebSocket/>
</header>

<main bind:this={mainElement} tabindex="1">
    {#if allTokens}
        <svelte:component this={componentType} {allTokens} {Chart} {onLogin}/>
    {:else if error}
        <div class="message">
            <p class="error">{error}</p>
        </div>
    {:else}
        <div class="message">
            <p class="info">Loading application data...</p>
        </div>
    {/if}
</main>

<style>
    .message {
        display: flex;
        justify-content: center;
    }
</style>