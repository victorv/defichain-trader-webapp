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
    {#each sortedItems as token}
        <tr>
            <td>
                {token["token_symbol"]}
            </td>
            <td class:red={token["net_usd"] < 0.0} class:green={token["net_usd"] >= 0.0}>
                {asDollars(token["net_usd"])}
            </td>
            <td>
                {asDollars(token["bought_usd"])}
            </td>
            <td>
                {token["bought_tx_count"]}
            </td>
            <td>
                {asDollars(token["sold_usd"])}
            </td>
            <td>
                {token["sold_tx_count"]}
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