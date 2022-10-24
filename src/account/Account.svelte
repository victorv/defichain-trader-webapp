<script>
    const options = [
        {label: 'Pool Swaps'},
        {label: 'Liquidity'},
        {label: 'Loans'},
        {label: 'Collateral'},
    ]
</script>

<div class="pure-menu">
    <span class="pure-menu-heading">My strategy</span>
    <ul class="pure-menu-list">
        <li class="pure-menu-item">
            <a href="#poolswaphistory" class="pure-menu-link">Limit orders</a>
        </li>
    </ul>
</div>

<div class="pure-menu">
    <span class="pure-menu-heading">My filters</span>
    <ul class="pure-menu-list">
        {#each options as option}
            <li class="pure-menu-item">
                <a href="#poolswaphistory" class="pure-menu-link">{option.label}</a>
            </li>
        {/each}
    </ul>
</div>

<div class="pure-menu">
    <span class="pure-menu-heading">My notifications</span>
    <ul class="pure-menu-list">

        <li class="pure-menu-item">
            {#each options as option}
                <li class="pure-menu-item">
                    <a href="#poolswaphistory" class="pure-menu-link">{option.label}</a>
                </li>
            {/each}
        </li>
    </ul>
</div>

<style>
    .pure-menu-heading {
        font-weight: bold;
    }
</style>