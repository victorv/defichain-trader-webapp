<script>
    import Icon from "../common/Icon.svelte";
</script>

<div class:pure-menu-horizontal={screen.large}
     class:pure-menu-vertical={screen.small}
     class:open
     class="pure-menu">
    <ul class="pure-menu-list">
        <li class="pure-menu-item">
            <a href="https://t.me/+gmg_XL0Nnpg3MjNk" target="_blank"
               class="pure-menu-link">
                <label>
                    Telegram
                    <Icon icon="telegram" />
                </label>
            </a>
        </li>
        <li class="pure-menu-item">
            <a href="https://twitter.com/DefichainTrader" target="_blank"
               class="pure-menu-link">
                <label>
                    Twitter
                    <Icon icon="twitter" />
                </label>
            </a>
        </li>
        <li class="pure-menu-item">
            <a href="https://gitlab.com/defichain-trader.com" target="_blank"
               class="pure-menu-link">
                <label>
                    Code repository
                    <Icon icon="code" />
                </label>
            </a>
        </li>
    </ul>
</div>