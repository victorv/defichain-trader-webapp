<script>
    import AddressFilter from "./AddressFilter.svelte";
    import DEX from "../dex/DEX.svelte";
    import Wallet from "./Wallet.svelte";

    export let allTokens
    export let Chart

    let componentType = DEX

    const options = [
        {label: 'Addresses', component: AddressFilter},
        {label: 'Swaps', component: DEX},
        {label: 'Wallet', component: Wallet},
    ]
</script>

<div class="pure-menu pure-menu-horizontal">
    <ul class="pure-menu-list">
        {#each options as option}
            <li class:pure-menu-selected={componentType === option.component} class="pure-menu-item">
                <a on:click|preventDefault={() => componentType = option.component}
                   href="#"
                   class="pure-menu-link">{option.label}</a>
            </li>
        {/each}
    </ul>
</div>

{#if componentType}
    <svelte:component {allTokens} {Chart} this={componentType}/>
{/if}