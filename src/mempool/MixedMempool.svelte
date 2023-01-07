<script>
    import {onDestroy, onMount} from "svelte";
    import PoolSwapHistory from "../history/PoolSwapHistory.svelte";
    import {mempool, mempoolBlacklistStore, updateMempoolBlacklist, webSocketStore} from "../store";
    import WebSocketStatus from "../WebSocketStatus.svelte";
    import TimePastSince from "../common/TimePastSince.svelte";

    export let allTokens

    let items = []
    let activeItems = []
    let blacklist = []

    let subscriptions = []
    let webSocketStatus
    let now = new Date().getTime()

    $: if (items) {
        now = new Date().getTime()
    }

    const filterItems = items => items.filter(item => blacklist.indexOf(item.type) === -1)

    onMount(() => {
        subscriptions.push(mempool.subscribe(mempoolItems => {
            items = mempoolItems
            activeItems = filterItems(items)
        }))
        subscriptions.push(webSocketStore.subscribe(status => webSocketStatus = status))
        subscriptions.push(mempoolBlacklistStore.subscribe(newList => {
            blacklist = newList.sort()
            activeItems = filterItems(items)
        }))
    })

    onDestroy(() => subscriptions.forEach(s => s()))

    const hide = txType => updateMempoolBlacklist(blacklist.concat(txType))
    const show = txType => updateMempoolBlacklist(blacklist.filter(item => item !== txType))
</script>

{#if webSocketStatus && (webSocketStatus.connecting || !webSocketStatus.connected)}
    <WebSocketStatus status={webSocketStatus}/>
{:else}
    {#if blacklist && blacklist.length}
        <form class="pure-form">
            {#each blacklist as item}
                <button on:click={() => show(item)} class="pure-button" type="button">
                    <strong class="red">X</strong> hiding <strong>{item}</strong>
                </button>
            {/each}
        </form>
        <br/>
    {/if}

    <table class:small={screen.small} class="pure-table pure-table-striped">
        <thead>
        <tr>
            <th>
                Type
            </th>
            <th>
                Details
            </th>
            <th>
                Time
            </th>

            <th>
                Fee
            </th>
        </tr>
        </thead>
        {#if activeItems && activeItems.length}
            <tbody>
            {#each activeItems as tx}
                <tr>
                    <td>
                        <button on:click={() => hide(tx.type)} class="pure-button icon">
                            <strong class="red">X</strong>
                        </button>
                        {tx.type}
                    </td>
                    <td>{tx.description}</td>
                    <td>
                        <TimePastSince start={tx.time} end={now}/>
                    </td>
                    <td>
                        {tx.fee}
                    </td>
                </tr>
            {/each}
            </tbody>
        {/if}
    </table>

    {#if !activeItems || !activeItems.length}
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

    .red {
        color: red;
    }
</style>
