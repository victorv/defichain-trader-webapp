<script>
    import {asDollars} from "../common/common";

    export let items

    $: sortedItems = items.sort((a, b) => {
        return Math.abs(b["net_usd"]) - Math.abs(a["net_usd"])
    })
</script>

<table class="pure-table pure-table-striped">
    <thead>
    <tr>
        <th>Token</th>
        <th>Net</th>
        <th>Bought</th>
        <th>TX Count</th>
        <th>Sold</th>
        <th>TX Count</th>

    </tr>
    </thead>
    {#each sortedItems as item}
        <tr>
            <td>
                {item["token_symbol"]}
            </td>
            <td class:red={item["net_usd"] < 0.0} class:green={item["net_usd"] >= 0.0}
                title="{item['net']} {item['token_symbol']}">
                {asDollars(item["net_usd"])}
            </td>
            <td title="{item['bought']} {item['token_symbol']}">
                {asDollars(item["bought_usd"])}
            </td>
            <td>
                {item["bought_tx_count"]}
            </td>
            <td title="{item['sold']} {item['token_symbol']}">
                {asDollars(item["sold_usd"])}
            </td>
            <td>
                {item["sold_tx_count"]}
            </td>
        </tr>
    {/each}
</table>

<style>
    .green {
        color: green;
    }

    .red {
        color: red;
    }
</style>