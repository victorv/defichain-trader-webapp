<script>
    import {addPoolSwap} from "../store";
    import Help from "../common/Help.svelte";
    import {round} from "../common/common";
    import FromToTokenFilter from "./FromToTokenFilter.svelte";

    export let allTokens

    let fromTokenSymbol
    let toTokenSymbol

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

        await addPoolSwap({
            tokenFrom: fromTokenSymbol,
            tokenTo: toTokenSymbol,
            amountFrom: +amountFromElement.value,
            desiredResult: desiredResult,
        })

        reset()
    }
</script>

<form class="pure-form pure-form-stacked" on:submit|preventDefault>
    <fieldset>
        <FromToTokenFilter {allTokens} {fromTokenSymbol} {toTokenSymbol} {onTokenSelectionChanged}/>
        {#if fromTokenSymbol && toTokenSymbol}
            <div>
                <div>
                    <label for="from-amount">
                        From Amount
                        <Help help="Example: if you want to swap 1 BTC to USDT. You would enter 1 here."/>
                    </label>
                    <input bind:value={amountFrom}
                           bind:this={amountFromElement}
                           use:focusAmountFrom
                           id="from-amount"
                           min="0.0005"
                           max="999999999"
                           step="any"
                           type="number">
                </div>
                <div>
                    <label for="desired-result">
                        Desired Result
                        <Help help="Used to calculate your profit or loss. If your desired result is 1 BTC. And the actual result is 0.9 BTC you have a loss of 10%. Set it accordingly to receive notifications at the right time. You can enter an exact value if you know your desired result."/>
                    </label>
                    <input bind:value={desiredResult}
                           bind:this={desiredResultElement}
                           disabled={!amountFrom}
                           id="desired-result"
                           min="0.00000001"
                           max="999999999"
                           step="any"
                           type="number">
                </div>
                <div>
                    <label>
                        Quick Desired Result
                        <Help help="Sets the desired result to the live result for your swap plus the selected percentage. Example: you are swapping 1 BTC to USDT when 1 BTC is worth 20k USDT. You select 10%. Then your desired result will now be 22k USDT."/>
                    </label>
                    <div class="quick-desired-result">
                        <button on:click={() => updateEstimate(1.0)} disabled={!amountFrom} class="pure-button">0%
                        </button>
                        <button on:click={() => updateEstimate(1.005)} disabled={!amountFrom} type="button"
                                class="pure-button">0.5%
                        </button>
                        <button on:click={() => updateEstimate(1.01)} disabled={!amountFrom} class="pure-button">1%
                        </button>
                        <button on:click={() => updateEstimate(1.015)} disabled={!amountFrom} class="pure-button">1.5%
                        </button>
                        <button on:click={() => updateEstimate(1.02)} disabled={!amountFrom} class="pure-button">2%
                        </button>
                        <button on:click={() => updateEstimate(1.025)} disabled={!amountFrom} class="pure-button">2.5%
                        </button>
                        <button on:click={() => updateEstimate(1.03)} disabled={!amountFrom} class="pure-button">3%
                        </button>
                        <button on:click={() => updateEstimate(1.035)} disabled={!amountFrom} class="pure-button">3.5%
                        </button>
                        <button on:click={() => updateEstimate(1.04)} disabled={!amountFrom} class="pure-button">4%
                        </button>
                        <button on:click={() => updateEstimate(1.045)} disabled={!amountFrom} class="pure-button">4.5%
                        </button>
                        <button on:click={() => updateEstimate(1.05)} disabled={!amountFrom} class="pure-button">5%
                        </button>
                        <button on:click={() => updateEstimate(1.1)} disabled={!amountFrom} class="pure-button">10%
                        </button>
                    </div>
                </div>
                <div>
                    <label for="desired-result-multiplier">
                        Advanced Desired Result
                        <Help help="Sets the desired result to the live result for your swap after multiplying it with your custom multiplier. Example: you are swapping 1 BTC to USDT when 1 BTC is worth 20k USDT. Your custom multiplier is 1.1. Then your desired result will now be 22k USDT."/>
                    </label>
                    <div class="multiplier">
                        <input bind:value={multiplier}
                               disabled={!amountFrom}
                               id="desired-result-multiplier"/>
                        <button on:click={() => updateEstimate(multiplier)}
                                disabled={!amountFrom}
                                class="pure-button"
                                type="button">
                            Update
                        </button>
                    </div>
                </div>
                <div>
                    <button on:click={reset}
                            class="pure-button"
                            type="button">Cancel
                    </button>
                    <button disabled={!fromTokenSymbol || !toTokenSymbol || !amountFrom || !desiredResult}
                            on:click={trackPoolSwap}
                            class="pure-button pure-button-primary"
                            type="button">Track Swap
                    </button>
                </div>
            </div>
        {/if}
    </fieldset>
</form>

<style>
    .quick-desired-result {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 0.5rem;
    }

    .multiplier {
        display: flex;
        gap: 0.5rem;
    }

    .multiplier > * {
        flex: 1;
    }
</style>
