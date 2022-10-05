<script>
    import {onDestroy} from "svelte";
    import PoolSwapHistory from "../history/PoolSwapHistory.svelte";
    import {incomingMessages} from "../store";

    export let allTokens

    let items = []

    const unsubscribe = incomingMessages.subscribe(message => {
        if (!message.connected || !message.data || message.error) {
            items = []
            return
        }

        if (message.data.height) {
            items = []
        } else {
            items = items.concat(message.data)
        }
    })

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
