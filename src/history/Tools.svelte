<script>

    import {hasItems} from "../common/common";
    import Icon from "../common/Icon.svelte";
    import Popup from "../Popup.svelte";
    import Stats from "../stats/Stats.svelte";
    import ActiveFilters from "./ActiveFilters.svelte";

    export let tools
    export let items
    export let setRemoteFilter
    export let uuid
    export let currentFilter

    let stats
    let notificationURL
    let notificationTitle
    let createNotification
    let notificationError
    let csvReady

    $: if (items) {
        csvReady = false
    }

    const loadStats = () => {
        stats = true
    }

    const createTelegramNotification = async () => {
        const response = await fetch(`/notification?uuid=${uuid}&description=${encodeURIComponent(notificationTitle)}`, {
            method: 'POST',
            body: JSON.stringify({
                ...currentFilter,
                minDateText: undefined,
                maxDateText: undefined,
                fromAddressGroupText: undefined,
                toAddressGroupText: undefined
            }),
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        })
        if (response.ok) {
            const bot = window.location.hostname === 'localhost' ? 'DeFiChainTraderTestBot' : 'DeFiChainTraderBot'
            notificationURL = `https://telegram.me/${bot}?start=${uuid}`
        } else {
            notificationError = 'Sorry we are unable to create this notification: ' + response.statusText
        }
    }

    const newTelegramNotification = () => {
        createNotification = true
        notificationError = null
        notificationURL = null
    }

    const download = async () => {
        csvReady = false
        csvReady = await setRemoteFilter()
    }
</script>

<button disabled={!tools.stats || !hasItems(items)} on:click={loadStats}
        class="pure-button icon" type="button">
    <Icon icon="info"/>
</button>

<button disabled={!tools.telegram || !hasItems(items)} on:click={newTelegramNotification}
        class="pure-button icon" type="button">
    <Icon icon="telegram"/>
</button>
<button disabled={!tools.download || !hasItems(items) || !uuid}
        on:click={download}
        class="pure-button icon" type="button">
    <Icon icon="download"/>
</button>
{#if csvReady}
    <a on:click={() => csvReady = false} href="/download?uuid={uuid}" target="_blank">
        download CSV
    </a>
{/if}

{#if createNotification}
    <Popup onClose={() => createNotification = false}>
        <form class="pure-form notification-form" slot="header" on:submit|preventDefault={createTelegramNotification}>
            {#if notificationError}
                <p class="error">
                    {notificationError}
                </p>
            {:else}
                <input on:keydown={() => notificationURL = null} type="text" bind:value={notificationTitle}
                       placeholder="Title"/>
                <button disabled={!notificationTitle || notificationTitle.length > 75 || notificationURL}
                        class="pure-button pure-button-primary" type="submit">
                    Submit notification
                </button>
            {/if}
        </form>
        <div slot="content">
            <br/>
            <p>
                {#if notificationURL}
                    You can now approve your notification <a href={notificationURL} target="_blank">in
                    Telegram</a>. While you do so you need to keep this tab open or it won't work. Click the link to get
                    started.
                {:else}
                    <em>Submit your notification with a title of your choice.</em>
                {/if}
            </p>
            <ActiveFilters {currentFilter}/>
        </div>
    </Popup>
{/if}

{#if stats}
    <Popup onClose={() => stats = false}>
        <div slot="header">
        </div>
        <div slot="content">
            <Stats request={currentFilter}/>
        </div>
    </Popup>
{/if}

<style>
    .notification-form {
        display: flex;
        flex-direction: row;
        gap: 1rem;
    }
</style>