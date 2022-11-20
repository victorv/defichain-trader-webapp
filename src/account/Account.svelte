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

<style>
    .pure-menu-heading {
        font-weight: bold;
    }
</style>