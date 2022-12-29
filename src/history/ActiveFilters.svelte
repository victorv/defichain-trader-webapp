<script>
    export let txID
    export let minBlock
    export let maxBlock
    export let fromTokenSymbol
    export let toTokenSymbol
    export let minInputAmount
    export let maxInputAmount
    export let minOutputAmount
    export let maxOutputAmount
    export let minFee
    export let maxFee
    export let fromAddressGroup
    export let fromAddress
    export let toAddressGroup
    export let toAddress
</script>
<div class="pure-menu-vertical pure-menu">
    <span class="pure-menu-heading">Notify me when</span>
    <ul class="pure-menu-list">
        {#if txID}
            <li class="pure-menu-item pure-menu-link">
                TX ID: <strong class="limited">ignored for Telegram notifications</strong>
            </li>
        {/if}
        {#if minBlock}
            <li class="pure-menu-item pure-menu-link">
                min block height: <strong>ignored for Telegram notifications</strong>
            </li>
        {/if}
        {#if maxBlock}
            <li class="pure-menu-item pure-menu-link">
                max block height: <strong>ignored for Telegram notifications</strong>
            </li>
        {/if}
        {#if fromTokenSymbol}
            <li class="pure-menu-item pure-menu-link">
                <em>AND</em> from token: <strong>{fromTokenSymbol}</strong>
            </li>
        {/if}
        {#if toTokenSymbol}
            <li class="pure-menu-item pure-menu-link">
                <em>AND</em> to token: <strong>{toTokenSymbol}</strong>
            </li>
        {/if}
        {#if minFee}
            <li class="pure-menu-item pure-menu-link">
                <em>AND</em> min fee: <strong>{minFee}</strong>
            </li>
        {/if}
        {#if maxFee}
            <li class="pure-menu-item pure-menu-link">
                <em>AND</em> max fee: <strong>{maxFee}</strong>
            </li>
        {/if}
        {#if minInputAmount}
            <li class="pure-menu-item  pure-menu-link">
                <em>AND</em> min input amount: <strong>${minInputAmount}</strong>
            </li>
        {/if}
        {#if maxInputAmount}
            <li class="pure-menu-item pure-menu-link">
                <em>AND</em> max input amount: <strong>${maxInputAmount}</strong>
            </li>
        {/if}
        {#if minOutputAmount}
            <li class="pure-menu-item pure-menu-link">
                <em>AND</em> min output amount: <strong>${minOutputAmount}</strong>
            </li>
        {/if}
        {#if maxOutputAmount}
            <li class="pure-menu-item pure-menu-link">
                <em>AND</em> max output amount: <strong>${maxOutputAmount}</strong>
            </li>
        {/if}
        {#if fromAddress}
            <li class="pure-menu-item pure-menu-link">
                <em>AND</em> From: <strong class="limited">{fromAddress}</strong>
            </li>
        {/if}
        {#if toAddress}
            <li class="pure-menu-item pure-menu-link">
                <em>AND</em> To: <strong class="limited">{toAddress}</strong>
            </li>
        {/if}
    </ul>
</div>