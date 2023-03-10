<svelte:options immutable/>

<script context="module">
    import TXHistory from "./history/TXHistory.svelte";
    import MixedMempool from "./mempool/MixedMempool.svelte";
    import Auctions from "./auction/Auctions.svelte";
    import StatusPage from "./menu/StatusPage.svelte";
    import QuickGraph from "./history/QuickGraph.svelte";
    import Account from "./account/Account.svelte";

    const selectComponentType = () => {
        const hash = location.hash
        if (!hash) {
            return TXHistory
        }
        if (hash.startsWith('#explore')) {
            return TXHistory
        }
        if (hash.startsWith('#graph')) {
            return QuickGraph
        }
        if (hash === '#mempool') {
            return MixedMempool
        }
        if (hash === '#auctions') {
            return Auctions
        }
        if (hash.includes('#account')) {
            return Account
        }
        if (hash === '#about') {
            return StatusPage
        }
        return TXHistory
    }
</script>

<script>
    import {onMount} from "svelte";
    import Menu from "./menu/Menu.svelte";
    import {setTokensByID} from "./store";

    let allTokens
    let error
    let mainElement
    let componentType = selectComponentType()

    const init = async () => {
        const tokensRequest = fetch(`/tokens`).then(res => res.json())
        const poolPairsRequest = fetch(`/poolpairs`).then(res => res.json())
        const [tokens, poolPairs] = await Promise.all([tokensRequest, poolPairsRequest])

        const tokenSymbolsById = {}
        for (const [tokenId, token] of Object.entries(tokens)) {
            tokenSymbolsById[tokenId] = token.symbol
        }


        const validTokens = {}
        const poolPairTokens = new Set()
        for (const poolPair of Object.values(poolPairs)) {
            poolPairTokens.add(tokenSymbolsById[poolPair.idTokenA])
            poolPairTokens.add(tokenSymbolsById[poolPair.idTokenB])
            validTokens[poolPair.idTokenA] = tokenSymbolsById[poolPair.idTokenA]
            validTokens[poolPair.idTokenB] = tokenSymbolsById[poolPair.idTokenB]
        }
        setTokensByID(validTokens)

        allTokens = Array.from(poolPairTokens).filter(token => token !== 'BURN').sort()
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

<main bind:this={mainElement} tabindex="1">
    {#if allTokens}
        <svelte:component this={componentType} {allTokens}/>
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