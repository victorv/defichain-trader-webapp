<script>
    export let tx
</script>

<table class="pure-table">
    <tbody>
    <tr>
        <th role="rowheader" class="banner">Swap</th>
        <td>{tx.txID}</td>
    </tr>
    <tr>
        <th role="rowheader">Input amount</th>
        <td>
            {tx.amountFrom} {tx.tokenFrom}
        </td>
    </tr>
    <tr>
        <th role="rowheader">Output amount</th>
        <td>
            {#if tx.amountTo}
                {tx.amountTo} {tx.tokenTo}
            {:else}
                N/A {tx.tokenTo}
            {/if}
        </td>
    </tr>
    <tr>
        <th role="rowheader">Max Price</th>
        <td>
            {tx.maxPrice}
        </td>
    </tr>
    <tr>
        <th role="rowheader">From</th>
        <td>
            {tx.from}
        </td>
    </tr>
    <tr>
        <th role="rowheader">To</th>
        <td>
            {#if tx.from !== tx.to}
                {tx.to}
            {:else}
                &lt;from address&gt;
            {/if}
        </td>
    </tr>

    {#if tx.block}
        <tr>
            <th role="rowheader" class="banner">Confirmed</th>
            <td>
                Yes
            </td>
        </tr>
        <tr>
            <th role="rowheader">Median Time</th>
            <td>
                {new Date(tx.block.medianTime * 1000).toString()}
            </td>
        </tr>
        <tr>
            <th role="rowheader">Block Height</th>
            <td>
                {tx.block.blockHeight}
            </td>
        </tr>
        <tr>
            <th role="rowheader">Position in block</th>
            <td>
                {tx.block.txn}
            </td>
        </tr>
        <tr>
            <th role="rowheader">Fee</th>
            <td>
                {tx.fee}
            </td>
        </tr>
    {/if}
    <tr>
        <th role="rowheader" class="banner">First seen</th>
        <td>
            {#if tx.mempool}
                {new Date(tx.mempool.time).toString()}
            {:else}
                Never
            {/if}
        </td>
    </tr>
    {#if tx.mempool}
        {#if !tx.block}
            <tr>
                <th role="rowheader">Confirmed</th>
                <td>
                    No
                </td>
            </tr>
            <tr>
                <th role="rowheader">Fee</th>
                <td>
                    {tx.fee}
                </td>
            </tr>
        {/if}
        <tr>
            <th role="rowheader">Block Height</th>
            <td>
                {tx.mempool.blockHeight}
            </td>
        </tr>
        <tr>
            <th role="rowheader">Position</th>
            <td>
                {tx.mempool.txn}
            </td>
        </tr>
    {/if}
    </tbody>
</table>

<style>
    td {
        word-break: break-all;
    }
</style>