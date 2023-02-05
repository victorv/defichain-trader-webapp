<script>
    export let currentFilter

    let query
    let minDate
    let maxDate
    let fromTokenSymbol
    let toTokenSymbol
    let minInputAmount
    let maxInputAmount
    let minOutputAmount
    let maxOutputAmount
    let fromAddressGroup
    let toAddressGroup

    $: if (currentFilter) {
        query = currentFilter.query
        minDate = currentFilter.minDate
        maxDate = currentFilter.maxDate
        fromTokenSymbol = currentFilter.fromTokenSymbol
        toTokenSymbol = currentFilter.toTokenSymbol
        minInputAmount = currentFilter.minInputAmount
        maxInputAmount = currentFilter.maxInputAmount
        minOutputAmount = currentFilter.minOutputAmount
        maxOutputAmount = currentFilter.maxOutputAmount
        fromAddressGroup = currentFilter.fromAddressGroup
        toAddressGroup = currentFilter.toAddressGroup
    }
</script>
<div class="pure-menu-vertical pure-menu">
    <span class="pure-menu-heading">Notify me when</span>
    <ul class="pure-menu-list">
        {#if query}
            <li class="pure-menu-item pure-menu-link">
                query {query}: <strong>ignored for Telegram notifications</strong>
            </li>
        {/if}
        {#if minDate}
            <li class="pure-menu-item pure-menu-link">
                min date: <strong>ignored for Telegram notifications</strong>
            </li>
        {/if}
        {#if maxDate}
            <li class="pure-menu-item pure-menu-link">
                max date: <strong>ignored for Telegram notifications</strong>
            </li>
        {/if}
        <li class="pure-menu-item pure-menu-link">
            from token: <strong>
            {#if fromTokenSymbol}
                {fromTokenSymbol}
            {:else}
                any
            {/if}
        </strong>
        </li>
        <li class="pure-menu-item pure-menu-link">
            <em>AND</em> to token: <strong>
            {#if toTokenSymbol}
                {toTokenSymbol}
            {:else}
                any
            {/if}
        </strong>
        </li>
        <li class="pure-menu-item pure-menu-link">
            <em>AND</em> From address in:
            <strong>
                {#if fromAddressGroup}
                    <ul>
                        {#each fromAddressGroup as address}
                            <li>{address}</li>
                        {/each}
                    </ul>
                {:else}
                    any
                {/if}
            </strong>
        </li>
        <li class="pure-menu-item pure-menu-link">
            <em>AND</em> To address in: <strong>
            {#if toAddressGroup}
                <ul>
                    {#each toAddressGroup as address}
                        <li>{address}</li>
                    {/each}
                </ul>
            {:else}
                any
            {/if}
        </strong>
        </li>
        {#if minInputAmount}
            <li class="pure-menu-item  pure-menu-link">
                <em>AND</em> min input amount: <strong>{minInputAmount} USDT</strong>
            </li>
        {/if}
        {#if maxInputAmount}
            <li class="pure-menu-item pure-menu-link">
                <em>AND</em> max input amount: <strong>{maxInputAmount} USDT</strong>
            </li>
        {/if}
        {#if minOutputAmount}
            <li class="pure-menu-item pure-menu-link">
                <em>AND</em> min output amount: <strong>{minOutputAmount} USDT</strong>
            </li>
        {/if}
        {#if maxOutputAmount}
            <li class="pure-menu-item pure-menu-link">
                <em>AND</em> max output amount: <strong>{maxOutputAmount} USDT</strong>
            </li>
        {/if}
    </ul>
</div>