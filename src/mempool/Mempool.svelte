<script>
    import {onDestroy, onMount} from "svelte";
    import PoolSwapHistory from "../history/PoolSwapHistory.svelte";
    import {mempool, webSocketStore} from "../store";
    import WebSocketStatus from "../WebSocketStatus.svelte";
    import TimePastSince from "../common/TimePastSince.svelte";

    export let allTokens

    let items = []
    let subscriptions = []
    let webSocketStatus

    onMount(() => {
        subscriptions.push(mempool.subscribe(mempoolItems => {
            items = mempoolItems.filter(item => item.details).map(item => item.details)
        }))
        subscriptions.push(webSocketStore.subscribe(status => webSocketStatus = status))
    })

    onDestroy(() => subscriptions.forEach(s => s()))

    const refresh = () => {
        // disabled
    }
</script>

{#if webSocketStatus && (webSocketStatus.connecting || !webSocketStatus.connected)}
    <WebSocketStatus status={webSocketStatus}/>
{:else}
    <PoolSwapHistory filterState={() => {}} {allTokens} {items} {refresh} filter={false}
                     mempool={true}/>

    {#if !items || !items.length}
        <div class="container">
            <div>
                <span class="info">Keep open to receive transactions. Mempool resets when a block is minted and can be empty.</span>
            </div>
        </div>
    {/if}
{/if}

<style>
    span {
        padding: 1rem;
    }

    .container {
        padding-top: 1rem;
        display: flex;
        flex-direction: row;
        justify-content: center;
    }

    div > div {
        width: 50vw;
    }
</style>
