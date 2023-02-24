<script>
    import {onDestroy, onMount} from "svelte";
    import {mempool, mempoolBlacklistStore, updateMempoolBlacklist, webSocketStore} from "../store";
    import WebSocketStatus from "../WebSocketStatus.svelte";
    import TimePastSince from "../common/TimePastSince.svelte";
    import Help from "../common/Help.svelte";
    import {asDollars} from "../common/common";
    import Icon from "../common/Icon.svelte";

    export let allTokens

    let minUSDT = 0.0
    let items = []
    let activeItems = []
    let blacklist = []
    let showBlacklist = false

    let subscriptions = []
    let webSocketStatus
    let now = new Date().getTime()

    $: if (items) {
        now = new Date().getTime()
    }

    const filterItems = items =>
        items.filter(item => item.usdtAmount >= (minUSDT || 0.0) && blacklist.indexOf(item.type) === -1)

    const updateActiveItems = () => activeItems = filterItems(items)

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
        <form class="pure-form" on:submit|preventDefault>
            <button on:click={() => showBlacklist = !showBlacklist}
                    class:pure-button-primary={showBlacklist}
                    type="button"
                    class="icon pure-button">
                {blacklist.length}
                <Icon icon="filter"/>
            </button>
            {#if showBlacklist}
                {#each blacklist as item}
                    <button on:click={() => show(item)}
                            class="pure-button"
                            type="button">
                        <strong class="red">X</strong>
                        hiding
                        <strong>{item}</strong>
                    </button>
                {/each}
            {/if}
        </form>
        <br/>
    {/if}


    <table class:small={screen.small}
           class="pure-table">
        <thead>
        <tr>
            <th>
                Type
            </th>
            <th>
                Details |
                <input on:keyup={updateActiveItems}
                       bind:value={minUSDT}
                       type="number"/>
                <Help help="Hide TXs where the total USDT value of all amounts is less than the specified number. TXs that don't involve quantifiable amounts are always valued at 0 USDT."/>
            </th>
            <th>
                Owner
            </th>
        </tr>
        </thead>
        {#if activeItems && activeItems.length}
            <tbody>
            {#each activeItems as tx}
                <tr>
                    <td>
                        <button on:click={() => hide(tx.type)}
                                class="pure-button icon">
                            <strong class="red">X</strong>
                        </button>
                        <strong>{tx.type}</strong>
                        <br/>
                        <TimePastSince start={tx.time}
                                       end={now}/>
                    </td>
                    <td class="server">
                        {@html tx.description}
                        <br/>
                        <span class="brown">{asDollars(tx.usdtAmount)}</span>
                    </td>
                    <td>
                        {tx.owner}
                        <br/>
                    </td>
                </tr>
            {/each}
            </tbody>
        {/if}
    </table>
{/if}

{#if !activeItems || !activeItems.length}
    <div class="container">
        <div>
            <span class="info">Keep open to receive transactions. Mempool resets when a block is minted and can be
                               empty.
            </span>
        </div>
    </div>
{/if}

<style>
    .container span {
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

    .brown {
        color: saddlebrown;
    }

    .red {
        color: red;
    }
</style>
