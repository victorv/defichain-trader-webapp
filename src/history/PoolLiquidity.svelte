<script>
    import {onMount} from "svelte";
    import TimePastSince from "../common/TimePastSince.svelte";
    import Limit from "../common/Limit.svelte";
    import Icon from "../common/Icon.svelte";

    export let refresh
    export let items
    export let currentFilter
    export let screen

    let minInputAmount = currentFilter.minInputAmount
    let maxInputAmount = currentFilter.maxInputAmount
    let minOutputAmount = currentFilter.minOutputAmount
    let maxOutputAmount = currentFilter.maxOutputAmount

    let now = new Date().getTime()

    const isRemoved = result => result.amountA > 0 || result.amountB > 0

    async function update() {
        await refresh(createSearch())
    }

    const clearInputAmount = async () => {
        minInputAmount = undefined
        maxInputAmount = undefined
        await update()
    }

    const clearOutputAmount = async () => {
        minOutputAmount = undefined
        maxOutputAmount = undefined
        await update()
    }

    const createSearch = () => {
        const newSearch = {
            minInputAmount: minInputAmount || undefined,
            maxInputAmount: maxInputAmount || undefined,
            minOutputAmount: minOutputAmount || undefined,
            maxOutputAmount: maxOutputAmount || undefined,
        }
        return newSearch
    }

    onMount(async () => {
        location.hash = `#explore/PoolLiquidity`
        await refresh({})
    })
</script>

{#if items}
    <table class:small={screen.small}
           class:large={screen.large}
           class="pure-table server">
        <thead>
        <tr>
            <th>
                Amounts
            </th>
            {#if screen.large}
                <th>
                    From
                </th>
            {/if}
            <th>Type</th>
        </tr>
        </thead>
        {#if items && items.length}
            <tbody>
            {#each items as tx}
                <tr class="header">
                    <td>
                        <TimePastSince start={tx.time * 1000}
                                       end={now}/>
                        <strong>{tx.blockHeight}</strong>
                    </td>
                    <td>
                        <button disabled="disabled"
                                type="button"
                                class="pure-button icon">
                            <Icon icon="info"/>
                        </button>
                        <button disabled="disabled"
                                type="button"
                                class="pure-button icon">
                            <Icon icon="graph"/>
                        </button>
                    </td>
                    {#if screen.large}
                        <td></td>
                    {/if}
                </tr>
                <tr>
                    <td>
                        <span class="amount">{tx.amountA}</span>
                        <span class="token">{tx.tokenA}</span>
                        <br/>
                        <span class="amount">{tx.amountB}</span>
                        <span class="token">{tx.tokenB}</span>
                        <br/>
                        <span class="avg">{tx.shares}
                            <span class="token">shares</span>
                        </span>
                    </td>
                    {#if screen.large}
                        <td>
                            <Limit text={tx.owner}/>
                        </td>
                    {/if}
                    <td>
                        {tx.type}
                    </td>
                </tr>
            {/each}
            </tbody>
        {/if}
    </table>
{/if}

<style>
    table.large {
        table-layout: fixed;
    }

    .header td {
        border: 0;
        background-color: rgb(240, 240, 240);
    }

    table.small thead th {
        width: 50%;
    }

    table.small thead th:nth-child(1) {
        width: 1ch;
    }

    table.large th:nth-child(3) {
        width: 16ch;
    }

    .avg {
        font-size: 80%;
    }

    .avg .token {
        color: gray;
    }
</style>


