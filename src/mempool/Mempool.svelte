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

<PoolSwapHistory filterState={() => {}} {allTokens} {items} {refresh} filter={false} mempool={true}/>
{#if !items || !items.length}
    <div class="container">
        <div>
            <p>Make a cup of tea, relax and watch transactions that were just announced come in. Maybe you will even see
                your own transaction here shortly after you have submitted it from your wallet.</p>
            <span class="info">Keep open to receive transactions. Mempool resets when a block is minted and can be empty.</span>
        </div>
    </div>
{/if}

<style>
    span {
        padding: 1rem;
    }

    .container {
        display: flex;
        flex-direction: row;
        justify-content: center;
    }

    div > div {
        width: 50vw;
    }
</style>
