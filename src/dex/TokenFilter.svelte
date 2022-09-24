<script>

    export let allTokens
    export let onTokenSelected
    export let onTokenSelectionCancelled
    export let supportAnyToken

    let tokens
    $: {
        tokens = allTokens
    }

    let fromTokenSymbol
    let toTokenSymbol

    let filterString
    let filterElement

    const focusFilterElement = e => {
        e.focus()
    }

    const filterTokenList = e => {
        if (e.which === 13 && tokens.length) {
            onTokenSelected(tokens[0])
            return
        }

        if (!filterString) {
            tokens = allTokens
            return
        }

        const test = filterString.toLowerCase()
        tokens = allTokens.filter(token => {
            return token.toLowerCase().indexOf(test) === 0
        })
    }

    const reset = () => {
        fromTokenSymbol = null
        toTokenSymbol = null
        filterString = ''
    }
</script>

<div class="search">
    <input bind:value={filterString}
           bind:this={filterElement}
           on:keyup={filterTokenList}
           use:focusFilterElement
           type="text"
           placeholder="Find a token"/>
    <button on:click={onTokenSelectionCancelled}
            type="button"
            class="pure-button">
        Cancel
    </button>
</div>
<div class="pure-menu">
    <ul class="pure-menu-list">
        {#if supportAnyToken}
            <li on:click={() => onTokenSelected('Any')}
                class="pure-menu-item">
                <a href="#" class="pure-menu-link">Any</a>
            </li>
        {/if}
        {#each tokens as token}
            <li on:click={() => onTokenSelected(token)}
                class="pure-menu-item">
                <a href="#" class="pure-menu-link">{token}</a>
            </li>
        {/each}
    </ul>
</div>

<style>
    ul li:first-child .pure-menu-link {
        background: #333;
        color: white;
    }

    .search input, .search div {
        display: inline;
    }
</style>
