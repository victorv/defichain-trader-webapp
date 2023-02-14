<script>
    import {onMount} from "svelte";
    import TimePastSince from "../common/TimePastSince.svelte";
    import Limit from "../common/Limit.svelte";
    import Icon from "../common/Icon.svelte";

    export let refresh
    export let items
    export let screen
    export let currentFilter

    let now = new Date().getTime()

    onMount(async () => {
        location.hash = `#explore/Loans`
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
                Amount
            </th>
            {#if screen.large}
                <th>
                    Vault
                </th>
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
                        <td></td>
                    {/if}
                </tr>
                <tr>
                    <td>
                        <span class="amount">{tx.amount}</span>
                        <span class="token">{tx.token}</span>
                    </td>
                    {#if screen.large}
                        <td>
                            <Limit text={tx.vault}/>
                        </td>
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


