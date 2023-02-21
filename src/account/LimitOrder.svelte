<script>
    import {round} from "../common/common";
    import FromToTokenFilter from "../dex/FromToTokenFilter.svelte";

    export let allTokens

    export let fromTokenSymbol
    export let toTokenSymbol
    export let cancel
    export let submit

    let amountFrom
    let amountFromElement

    let desiredResult
    let desiredResultElement
    let multiplier = 1.0

    const updateEstimate = async estimateMultiplier => {
        multiplier = estimateMultiplier
        if (fromTokenSymbol && toTokenSymbol) {
            desiredResult = null

            const amount = amountFrom
            const request = `${amount}+${fromTokenSymbol}+to+${toTokenSymbol}`
            const response = await fetch(`/estimate?poolswap=${request}`)
            const result = await response.json()

            desiredResult = round(result.estimate * multiplier)
        }
    }

    const onTokenSelectionChanged = selection => {
        fromTokenSymbol = selection.fromTokenSymbol
        toTokenSymbol = selection.toTokenSymbol
    }

    const focusAmountFrom = e => {
        e.focus()
    }

    const reset = () => {
        fromTokenSymbol = null
        toTokenSymbol = null
        amountFrom = null
        desiredResult = null
        multiplier = 1
    }

    const trackPoolSwap = async () => {
        const amountFromValid = amountFromElement.reportValidity()
        const desiredResultValid = desiredResultElement.reportValidity()
        if (!amountFromValid || !desiredResultValid) {
            return
        }

        submit({
            tokenFrom: fromTokenSymbol,
            tokenTo: toTokenSymbol,
            amountFrom: +amountFromElement.value,
            desiredResult: desiredResult,
        })

        reset()
    }
</script>

<form class="pure-form pure-form-stacked"
      on:submit|preventDefault>
    <fieldset>
        <FromToTokenFilter {allTokens}
                           freezeFromToken={true}
                           {fromTokenSymbol}
                           {toTokenSymbol}
                           {onTokenSelectionChanged}/>
        {#if fromTokenSymbol && toTokenSymbol}
            <div>
                <div>
                    <label for="from-amount"
                           on:click|preventDefault>
                        Amount
                    </label>
                    <input bind:value={amountFrom}
                           bind:this={amountFromElement}
                           use:focusAmountFrom
                           id="from-amount"
                           type="text">
                </div>
                <div>
                    <label for="desired-result"
                           on:click|preventDefault>
                        Max Price
                    </label>
                    <input bind:value={desiredResult}
                           bind:this={desiredResultElement}
                           disabled={!amountFrom}
                           id="desired-result"
                           type="text">
                </div>
                <div>
                    <button on:click={cancel}
                            class="pure-button"
                            type="button">Cancel
                    </button>
                    <button disabled={!fromTokenSymbol || !toTokenSymbol || !amountFrom || !desiredResult}
                            on:click={trackPoolSwap}
                            class="pure-button pure-button-primary"
                            type="button">Create limit order
                    </button>
                </div>
            </div>
        {/if}
    </fieldset>
</form>

<style>
    .multiplier > * {
        flex: 1;
    }
</style>
