<script>
    export let tx
</script>

<table class="pure-table">
    <tbody>
    <tr>
        <th role="rowheader" class="banner">Swap</th>
        <td></td>
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
            {tx.amountTo} {tx.tokenTo}
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
            <a href="https://defiscan.live/address/{tx.from}" target="_blank">
                {tx.from}
            </a>
        </td>
    </tr>
    <tr>
        <th role="rowheader">To</th>
        <td>
            {#if tx.from != tx.to}
                <a href="https://defiscan.live/address/{tx.to}" target="_blank">
                    {tx.to}
                </a>
            {:else}
                &lt;from address&gt;
            {/if}
        </td>
    </tr>

    <tr>
        <th role="rowheader" class="banner">Confirmed</th>
        <td>
            Yes
        </td>
    </tr>
    <tr>
        <th role="rowheader">Block Height</th>
        <td>
            {tx.blockHeight}
        </td>
    </tr>
    <tr>
        <th role="rowheader">Position in block</th>
        <td>
            {tx.ordinal}
        </td>
    </tr>
    <tr>
        <th role="rowheader">Fee</th>
        <td>
            {tx.fee}
        </td>
    </tr>
    <tr>
        <th role="rowheader" class="banner">First seen</th>
        <td>
        </td>
    </tr>
    <tr>
        <th role="rowheader">Block Height</th>
        <td>
            {tx.blockHeightReceived}
        </td>
    </tr>
    <tr>
        <th role="rowheader">Position</th>
        <td>
            {tx.txnReceived}
        </td>
    </tr>
    </tbody>
</table>