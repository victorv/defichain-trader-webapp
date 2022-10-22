<script>
    export let items
</script>

<form class="pure-form">
    <select class="pure-select">
        <option>Pool Swap</option>
    </select>
</form>

<table class="pure-table pure-table-striped">
    <thead>
    <tr>
        <th>Address</th>
        <th>TX Count</th>
    </tr>
    </thead>
    {#each items as item}
        <tr>
            <td>
                <a href="#">{item["dc_address"]}</a>
            </td>
            <td>
                {item["amount"]}
            </td>
        </tr>
    {/each}
</table>

<style>
    form {
        padding: 0.5rem;
    }
</style>