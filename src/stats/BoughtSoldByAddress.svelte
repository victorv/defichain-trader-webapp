<svelte:options immutable/>
<script>
    import FromToTokenFilter from "../dex/FromToTokenFilter.svelte";
    import {asDollars} from "../common/common";
    import {screenStore} from "../store";
    import Limit from "../common/Limit.svelte";

    export let fromTokenSymbol
    export let toTokenSymbol
    export let allTokens
    export let items
    export let onTokenSelectionChanged

    let screen

    screenStore.subscribe(newScreen => screen = newScreen)

</script>

<form class="pure-form">
    <FromToTokenFilter supportAnyToken={true}
                       {allTokens} {fromTokenSymbol} {toTokenSymbol} {onTokenSelectionChanged}/>
</form>

<table class="pure-table pure-table-striped">
    <thead>
    <tr>
        <th>Address</th>
        <th>Net</th>
        <th>Bought</th>
        <th>Sold</th>
        {#if screen.large}
            <th>Total</th>
            <th>TX Count</th>
        {/if}
    </tr>
    </thead>
    {#each items as item}
        <tr>
            <td>
                <Limit text={item["dc_address"]}/>
            </td>
            <td class:red={item["net_usd"] < 0.0} class:green={item["net_usd"] >= 0.0}>
                {asDollars(item["net_usd"])}
            </td>
            <td>
                {asDollars(item["bought_usd"])}
            </td>
            <td>
                {asDollars(item["sold_usd"])}
            </td>
            {#if screen.large}
                <td>
                    {asDollars(item["total"])}
                </td>
                <td>
                    {item["tx_count"]}
                </td>
            {/if}
        </tr>
    {/each}
</table>

<style>
    form {
        padding: 0.5rem;
    }
</style>