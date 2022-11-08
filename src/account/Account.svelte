<script>
    import AddressFilter from "./filter/AddressFilter.svelte";

    let componentType = AddressFilter

    const options = [
        {label: 'Addresses', component: AddressFilter},
        {label: 'Pool Swaps'},
        {label: 'Liquidity', disabled: true},
        {label: 'Loans', disabled: true},
        {label: 'Collateral', disabled: true},
        {label: 'Auction Bid', disabled: true}
    ]
</script>

<!--<div class="pure-menu">-->
<!--    <span class="pure-menu-heading">My strategy</span>-->
<!--    <ul class="pure-menu-list">-->
<!--        <li class="pure-menu-item">-->
<!--            <a href="#poolswaphistory" class="pure-menu-link">Limit orders</a>-->
<!--        </li>-->
<!--    </ul>-->
<!--</div>-->

{#if !componentType}
    <div class="pure-menu">
        <span class="pure-menu-heading">My filters</span>
        <ul class="pure-menu-list">
            {#each options as option}
                {#if !option.disabled}
                    <li class="pure-menu-item">
                        <a on:click|preventDefault={() => componentType = option.component}
                           href="#"
                           class="pure-menu-link">{option.label}</a>
                    </li>
                {/if}
            {/each}
        </ul>
    </div>
{/if}

{#if componentType}
    <svelte:component this={componentType}/>
{/if}

<!--<div class="pure-menu">-->
<!--    <span class="pure-menu-heading">My notifications</span>-->
<!--    <ul class="pure-menu-list">-->

<!--        <li class="pure-menu-item">-->
<!--            {#each options as option}-->
<!--                <li class="pure-menu-item">-->
<!--                    <a href="#poolswaphistory" class="pure-menu-link">{option.label}</a>-->
<!--                </li>-->
<!--            {/each}-->
<!--        </li>-->
<!--    </ul>-->
<!--</div>-->

<style>
    .pure-menu-heading {
        font-weight: bold;
    }
</style>