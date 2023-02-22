<script>

    const cryptoAndDUSD = ['DFI', 'DUSD', 'csETH', 'USDT', 'USDC', 'DOGE', 'BTC', 'BCH', 'LTC', 'ETH']

    export let allTokens
    export let onTokenSelected
    export let onTokenSelectionCancelled
    export let supportAnyToken
    export let supportPseudo
    export let isFrom = false
    export let isTo = false
    export let stockOnly

    let supportedTokens = stockOnly
        ? allTokens.filter(token => !cryptoAndDUSD.includes(token))
        : allTokens

    let tokens

    function getTokens() {
        let tokens = (supportPseudo ? [
            '#Crypto',
            '#Stock',
            '#DUSD or stock',
            '#USDT or USDC',
            '#is sold or bought',
        ] : []).concat(supportedTokens)
        tokens = supportAnyToken ? ['#Any'].concat(tokens) : tokens

        if (stockOnly) {
            return tokens
        }
        return ['DUSD', 'DFI'].concat(tokens)
    }

    $: {
        tokens = getTokens()
    }

    let fromTokenSymbol
    let toTokenSymbol

    let filterString
    let filterElement

    const selectToken = token => {
        onTokenSelected(token.replace('#', ''))
    }

    const focusFilterElement = e => {
        e.focus()
    }

    const filterTokenList = e => {
        if (e.which === 13 && tokens.length) {
            selectToken(tokens[0])
            return
        }

        if (!filterString) {
            tokens = getTokens()
            return
        }

        const test = filterString.toLowerCase()
        tokens = getTokens().filter(token => {
            return token && token.toLowerCase().indexOf(test) === 0
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
        {#each tokens as token}
            {#if !(isFrom && token == '#is sold or bought')}
                <li on:click={() => selectToken(token)}
                    class="pure-menu-item">
                    <a href="#" on:click|preventDefault class="pure-menu-link">
                        {#if token == '#is sold or bought'}
                            is <strong>#sold or bought</strong>
                        {:else}
                            {#if isTo}
                                is sold for
                            {/if}
                            <strong>{token}</strong>
                        {/if}
                    </a>
                </li>
            {/if}
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
