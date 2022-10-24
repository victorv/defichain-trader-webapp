<script>
    import {asDollars} from "../common/common";
    import {screenStore} from "../store";

    export let items

    $: sortedItems = items.sort((a, b) => {
        return Math.abs(b["net_usd"]) - Math.abs(a["net_usd"])
    })

    let screen

    screenStore.subscribe(newScreen => screen = newScreen)
</script>

<table class="pure-table pure-table-striped">
    <thead>
    <tr>
        <th>Token</th>
        <th>Net</th>
        <th>Bought</th>
        {#if screen.large}
            <th>TX Count</th>
        {/if}
        <th>Sold</th>
        {#if screen.large}
            <th>TX Count</th>
        {/if}

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
            {#if screen.large}
                <td>
                    {item["bought_tx_count"]}
                </td>
            {/if}
            <td title="{item['sold']} {item['token_symbol']}">
                {asDollars(item["sold_usd"])}
            </td>
            {#if screen.large}
                <td>
                    {item["sold_tx_count"]}
                </td>
            {/if}
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