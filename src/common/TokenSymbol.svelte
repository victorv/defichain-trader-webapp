<script>
    import {store} from "../store";

    export let tokenId

    let tokenSymbolsById
    let tokenSymbol

    $: if (tokenId && tokenSymbolsById) {
        tokenSymbol = tokenSymbolsById[tokenId] || tokenId
    }

    store.subscribe(state => {
        tokenSymbolsById = state.tokenSymbolsById
    })
</script>

{tokenSymbol}