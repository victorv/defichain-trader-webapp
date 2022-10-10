<script>
    import {onDestroy} from "svelte";
    import PoolSwapHistory from "../history/PoolSwapHistory.svelte";
    import {mempool} from "../store";

    export let allTokens

    let items = []

    const unsubscribe = mempool.subscribe(mempoolItems => items = mempoolItems)

    onDestroy(unsubscribe)

    const refresh = () => {
        // disabled
    }
</script>

{#if items && items.length}
    <PoolSwapHistory {allTokens} {items} {refresh} filter={false}/>
{:else}
    <div>
    <span class="info">
        Keep open to receive transactions...
    </span>
    </div>
{/if}

<style>
    div {
        display: flex;
        justify-content: center;
    }
</style>
