<svelte:options immutable/>

<script context="module">
    import PoolSwapProperties from "./PoolSwapProperties.svelte";

    const components = {
        "PoolSwap": PoolSwapProperties,
    }
</script>

<script>
    export let tx

    let componentType
    $: if (tx && tx.customTX) {
        componentType = components[tx.customTX.type]
    }
</script>

{#if componentType}
    <svelte:component this={componentType} {tx} results={tx.customTX}/>
{:else}
    Details not available
{/if}