<svelte:options immutable/>
<script>
    import TokenSymbol from "../../common/TokenSymbol.svelte";

    export let tx
    export let results
</script>

<table class="pure-table pure-table-striped">
    <tbody>
    <tr>
        <th role="rowheader">Fee</th>
        <td>{tx.fee}</td>
    </tr>
    <tr>
        <th role="rowheader">Valid</th>
        <td>{results.valid}</td>
    </tr>
    <tr>
        <th role="rowheader">From->To</th>
        <td>{results.results.fromAddress} to {results.results.toAddress}</td>
    </tr>
    <tr>
        <th role="rowheader">Swap</th>
        <td>
            {results.results.fromAmount}
            <TokenSymbol tokenId={results.results.fromToken}/>
            to
            <TokenSymbol tokenId={results.results.toToken}/>
        </td>
    </tr>
    <tr>
        <th role="rowheader">Max Price</th>
        <td>{results.results.maxPrice}</td>
    </tr>
    </tbody>
</table>