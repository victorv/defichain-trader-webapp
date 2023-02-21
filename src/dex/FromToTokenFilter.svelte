<script>
    import TokenFilter from "./TokenFilter.svelte";
    import Icon from "../common/Icon.svelte";

    export let allTokens
    export let onTokenSelectionChanged
    export let fromTokenSymbol
    export let toTokenSymbol
    export let supportAnyToken
    export let supportPseudo
    export let freezeTokens
    export let freezeFromToken

    let onTokenSelected

    const fireUpdate = () => {
        onTokenSelected = null
        onTokenSelectionChanged(
            {
                fromTokenSymbol: fromTokenSymbol && fromTokenSymbol.replaceAll(' ', '_'),
                toTokenSymbol: toTokenSymbol && toTokenSymbol.replaceAll(' ', '_'),
            }
        )
    }

    const swapTokenSelection = () => {
        if (fromTokenSymbol === toTokenSymbol) {
            return
        }
        const from = toTokenSymbol
        const to = fromTokenSymbol
        fromTokenSymbol = from
        toTokenSymbol = to
        fireUpdate()
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
        <button on:click={() => onTokenSelected = onFromTokenSelected}
                class:pure-button-primary={onTokenSelected === onFromTokenSelected}
                disabled={onTokenSelected || freezeTokens || freezeFromToken}
                id="from-token-button"
                class="pure-button"
                type="button">
            {#if fromTokenSymbol}
                {fromTokenSymbol.replaceAll('_', ' ')}
            {:else if supportAnyToken}
                Any token
            {:else}
                Select token
            {/if}
        </button>
    </div>
    <a disabled={freezeFromToken}
       href="#"
       on:click|preventDefault={() => swapTokenSelection()}
       title="to - click to swap 'from' and 'to' symbols">
        <Icon icon="exchange"/>
    </a>
    <div>
        <button on:click={() => onTokenSelected = onToTokenSelected}
                class:pure-button-primary={onTokenSelected === onToTokenSelected}
                disabled={onTokenSelected || freezeTokens}
                id="to-token-button"
                class="pure-button"
                type="button">
            {#if toTokenSymbol}
                {toTokenSymbol.replaceAll('_', ' ')}
            {:else if supportAnyToken}
                Any token
            {:else}
                Select token
            {/if}
        </button>
    </div>
</div>

{#if onTokenSelected}
    <TokenFilter
            {allTokens}
            {supportAnyToken}
            {supportPseudo}
            {onTokenSelected}
            {onTokenSelectionCancelled}
            isFrom={onTokenSelected == onFromTokenSelected}
            isTo={onTokenSelected == onToTokenSelected}
    />
{/if}

<style>
    .from-to {
        display: inline-flex;
        gap: 0.5rem;
    }

    .from-to label {
        display: inline;
    }

    a:hover {
        color: blue;
    }
</style>