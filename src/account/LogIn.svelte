<script>
    import {onMount} from "svelte";
    import {setAccount} from "../store";

    export let onLogin

    const progressMessage = 'Logging in...'
    const errorMessage = 'Failed to login'

    let accountId
    let loginCode
    let account
    let message = ''

    const login = async () => {
        message = progressMessage
        try {
            const response = await fetch(`/telegram-login`, {
                method: 'POST',
                body: JSON.stringify({
                    loginCode
                }),
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            })
            account = await response.json()
        } catch (e) {
            message = errorMessage
        }

        if (account) {
            setAccount(account)
            onLogin()
        }
    }

    onMount(async () => {
        const response = await fetch(`/generate-account-id`)
        accountId = await response.json()
    })
</script>

<form class="pure-form pure-form-stacked">
    <fieldset>
        <legend>Login</legend>
        <label for="login-code">Login Code</label>
        <input bind:value={loginCode} type="password" id="login-code"/>
        <span class="pure-form-message">{message}</span>
        <label>Get Login Code via
            <a href="https://telegram.me/DeFiChainTraderBot?start={accountId}"
               target="_blank"
               title="Join Telegram Bot">
                Telegram Bot
            </a>
        </label>
        <button on:click={login}
                disabled={!loginCode} type="button" class="pure-button pure-button-primary">Sign in</button>
    </fieldset>
</form>

<style>
    form {
        padding: 0.5rem;
    }
</style>