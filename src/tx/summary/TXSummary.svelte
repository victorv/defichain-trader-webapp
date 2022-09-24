<svelte:options immutable/>

<script context="module">
    import PoolSwapSummary from "./PoolSwapSummary.svelte";

    const components = {
        "PoolSwap": PoolSwapSummary,
    }
</script>

<script>
    export let tx
</script>

{#if tx.customTX}
    <svelte:component this={components[tx.customTX.type]} tx={tx.customTX}/>
{/if}