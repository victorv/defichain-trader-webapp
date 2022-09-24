<script>
    import PoolSwapForm from "./PoolSwapForm.svelte";
    import PoolSwapOverview from "./PoolSwapOverview.svelte";

    export let accountId
    export let allTokens
    export let Chart

    let lastUpdated = 'Never'

    const onUpdate = timestamp => lastUpdated = timestamp
</script>

<header>
    <strong>DEX</strong> - Last Updated: {lastUpdated}
</header>

<div class="pool-swap-form">
    <PoolSwapForm {allTokens}/>
</div>
<div>
    <PoolSwapOverview {Chart} {onUpdate}/>
</div>

<style>
    header {
        padding: 0.5rem;
    }

    .pool-swap-form {
        width: 100%;
        max-width: 800px;
        padding-left: 0.5rem;
    }
</style>