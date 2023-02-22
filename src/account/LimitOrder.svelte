<script>
    import {round} from "../common/common";
    import TokenFilter from "../dex/TokenFilter.svelte";

    export let allTokens
    export let dusdBalance
    export let cancel
    export let submit

    let token
    let quantity
    let quantityElement
    let price
    let targetPrice
    let targetPriceElement
    let selectToken = true

    const updateEstimate = async () => {
        if (token) {
            const request = `1.0+${token}+to+DUSD`
            const response = await fetch(`/estimate?poolswap=${request}`)
            const result = await response.json()

            price = round(result.estimate)
        }
    }

    const onTokenSelectionChanged = async selection => {
        selectToken = false
        token = selection
        await updateEstimate()
    }

    const focusAmountFrom = e => {
        e.focus()
    }

    const trackPoolSwap = async () => {
        const amountFromValid = quantityElement.reportValidity()
        const desiredResultValid = targetPriceElement.reportValidity()
        if (!amountFromValid || !desiredResultValid) {
            return
        }

        submit({
            token,
            quantity,
            targetPrice,
        })
    }
</script>

<form class="pure-form pure-form-stacked server"
      on:submit|preventDefault>
    <fieldset>
        <div>
            <button on:click={() => selectToken = true}
                    class:pure-button-primary={selectToken}
                    id="from-token-button"
                    class="pure-button"
                    type="button">
                {#if token}
                    {token}
                {:else}
                    Select token
                {/if}
            </button>
        </div>
        {#if selectToken}
            <TokenFilter
                    {allTokens}
                    stockOnly={true}
                    supportAnyToken={false}
                    supportPseudo={false}
                    onTokenSelected={onTokenSelectionChanged}
                    onTokenSelectionCancelled={cancel}
                    isFrom={true}
                    isTo={false}
            />
        {/if}
        {#if token}
            <div>
                <div>
                    <label for="from-amount"
                           on:click|preventDefault>
                        Quantity
                    </label>
                    <input bind:value={quantity}
                           bind:this={quantityElement}
                           use:focusAmountFrom
                           id="from-amount"
                           type="text">
                </div>
                <div>
                    <label for="desired-result"
                           on:click|preventDefault>
                        Maximum price per token
                        <br/>
                        <span class="avg">
                            Current price
                            <a on:click|preventDefault={() => targetPrice = price}
                               href="#">{price}</a>
                        </span>
                    </label>
                    <input bind:value={targetPrice}
                           bind:this={targetPriceElement}
                           id="desired-result"
                           type="text">
                </div>
                {#if quantity && targetPrice}
                    You pay
                    <span class="amount">{round(targetPrice * quantity)}</span>
                    <span class="token">DUSD</span>
                {/if}
                {#if targetPrice * quantity > dusdBalance}
                    <div class="error">
                        You don't have enough DUSD
                    </div>
                {/if}

                <div>
                    <button on:click={cancel}
                            class="pure-button"
                            type="button">Cancel
                    </button>
                    <button disabled={!token || !quantity || !targetPrice || targetPrice * quantity > dusdBalance}
                            on:click={trackPoolSwap}
                            class="pure-button pure-button-primary"
                            type="button">Submit buy-limit order
                    </button>
                </div>
            </div>
        {/if}
    </fieldset>
</form>

<style>
    .avg {
        font-size: 80%;
        color: gray;
    }

    .multiplier > * {
        flex: 1;
    }
</style>
