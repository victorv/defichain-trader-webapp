<script>
    import PoolSwapForm from "./PoolSwapForm.svelte";
    import PoolSwapOverview from "./PoolSwapOverview.svelte";
    import Help from "../common/Help.svelte";

    export let allTokens
    export let Chart
</script>

<div class="pool-swap-form">
    <PoolSwapForm {allTokens}/>
</div>
<div>
    <PoolSwapOverview {allTokens} {Chart}/>
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