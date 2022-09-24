<script>
    import TokenFilter from "./TokenFilter.svelte";

    export let allTokens
    export let onTokenSelectionChanged
    export let fromTokenSymbol
    export let toTokenSymbol
    export let supportAnyToken

    let onTokenSelected

    const fireUpdate = () => {
        onTokenSelected = null
        onTokenSelectionChanged(
            {
                fromTokenSymbol,
                toTokenSymbol
            }
        )
    }

    const onFromTokenSelected = token => {
        fromTokenSymbol = token
        fireUpdate()
    }

    const onToTokenSelected = token => {
        toTokenSymbol = token
        fireUpdate()
    }

    const onTokenSelectionCancelled = () => {
        onTokenSelected = null
    }
</script>

<div class="from-to">
    <div>
        <label for="from-token-button">From</label>
        <button on:click={() => onTokenSelected = onFromTokenSelected}
                class:pure-button-primary={onTokenSelected === onFromTokenSelected}
                disabled={onTokenSelected}
                id="from-token-button"
                class="pure-button"
                type="button">
            {#if fromTokenSymbol}
                {fromTokenSymbol}
            {:else if supportAnyToken}
                Any Token
            {:else}
                Select token
            {/if}
        </button>
    </div>
    <div>
        <label for="to-token-button">to</label>
        <button on:click={() => onTokenSelected = onToTokenSelected}
                class:pure-button-primary={onTokenSelected === onToTokenSelected}
                disabled={onTokenSelected}
                id="to-token-button"
                class="pure-button"
                type="button">
            {#if toTokenSymbol}
                {toTokenSymbol}
            {:else if supportAnyToken}
                Any Token
            {:else}
                Select token
            {/if}
        </button>
    </div>
</div>

{#if onTokenSelected}
    <TokenFilter {allTokens} {supportAnyToken} {onTokenSelected} {onTokenSelectionCancelled}/>
{/if}

<style>
    .from-to {
        display: flex;
        gap: 0.5rem;
    }

    .from-to label {
        display: inline;
    }
</style>