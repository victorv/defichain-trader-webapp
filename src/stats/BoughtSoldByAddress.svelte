<svelte:options immutable/>
<script>
    import FromToTokenFilter from "../dex/FromToTokenFilter.svelte";
    import {asDollars} from "../common/common";

    export let fromTokenSymbol
    export let toTokenSymbol
    export let allTokens
    export let items
    export let onTokenSelectionChanged
</script>

<form class="pure-form">
    <FromToTokenFilter supportAnyToken={true}
                       {allTokens} {fromTokenSymbol} {toTokenSymbol} {onTokenSelectionChanged}/>
</form>

<table class="pure-table pure-table-striped">
    <thead>
    <tr>
        <th>Address</th>
        <th>Total</th>
        <th>Net</th>
        <th>Bought</th>
        <th>Sold</th>
        <th>TX Count</th>
    </tr>
    </thead>
    {#each items as item}
        <tr>
            <td>
                {item["dc_address"]}
            </td>
            <td>
                {asDollars(item["total"])}
            </td>
            <td class:red={item["net_usd"] < 0.0} class:green={item["net_usd"] >= 0.0}
                title="{item['net']} {item['token_symbol']}">
                {asDollars(item["net_usd"])}
            </td>
            <td>
                {asDollars(item["bought_usd"])}
            </td>
            <td>
                {asDollars(item["sold_usd"])}
            </td>
            <td>
                {item["tx_count"]}
            </td>
        </tr>
    {/each}
</table>

<style>
    form {
        padding: 0.5rem;
    }
</style>