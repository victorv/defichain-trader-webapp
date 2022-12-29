<script>
    import Icon from "../common/Icon.svelte";
</script>

<p>
    The issues you have all experienced in the 4th week of December have been resolved. Both the website and Telegram
    notifications are fully functional again.
</p>

<div class="pure-menu-horizontal">
    <ul class="pure-menu-list">
        <li class="pure-menu-item">
            <a href="https://gitlab.com/defichain-trader.com/webapp/-/commit/{window.commitHash}"
               class="pure-menu-link">
                <label>
                    App version: {window.commitHash}
                </label>
            </a>
        </li>
        <li class="pure-menu-item">
            <a href="https://t.me/+gmg_XL0Nnpg3MjNk" target="_blank"
               class="pure-menu-link">
                <label>
                    Questions & Feedback
                </label>
            </a>
        </li>
        <li class="pure-menu-item">
            <a href="https://twitter.com/DefichainTrader" target="_blank"
               class="pure-menu-link">
                <label>
                    Twitter
                </label>
            </a>
        </li>
        <li class="pure-menu-item">
            <a href="https://gitlab.com/defichain-trader.com" target="_blank"
               class="pure-menu-link">
                <label>
                    GitLab
                </label>
            </a>
        </li>
    </ul>
</div>