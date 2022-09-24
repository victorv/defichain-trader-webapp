<svelte:options immutable/>
<script>
    import TokenSymbol from "../../common/TokenSymbol.svelte";

    export let tx
</script>

{tx.results.fromAmount} <TokenSymbol tokenId={tx.results.fromToken}/> to <TokenSymbol tokenId={tx.results.toToken}/>