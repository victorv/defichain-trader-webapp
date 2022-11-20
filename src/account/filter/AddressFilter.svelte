<script>
    import Icon from "../../common/Icon.svelte";

    let whitelists = []
    let whitelist
    let address = ''

    const cancelWhitelist = () => whitelist = null

    const newWhitelist = () => {
        whitelist = {
            name: '',
            addresses: [],
        }
    }

    const removeAddress = address => {
        whitelist = {
            ...whitelist,
            addresses: whitelist.addresses.filter(v => v !== address),
        }
    }

    const addAddress = () => {
        whitelist = {
            ...whitelist,
            addresses: whitelist.addresses.concat(address),
        }
        address = ''
    }

    const saveWhitelist = () => {
        whitelists = whitelists.concat(whitelist)
        whitelist = null
    }

    const removeWhitelist = w => {
        whitelists = whitelists.filter(v => v.name !== w.name)
    }

    const editWhitelist = w => {
        whitelist = whitelists.find(v => v.name === w.name)
    }
</script>

<a href="#" on:click|preventDefault>Back</a>
<form class="pure-form pure-form-stacked" on:submit|preventDefault>
    <fieldset>

        <h1>Addresses</h1>

        {#if whitelist}
            <label>Create new address group
                <input bind:value={whitelist.name} placeholder="Group name"/>
            </label>
            <table class="pure-table whitelist">
                <thead>
                <tr>
                    <td>
                        <button on:click={addAddress}
                                disabled={!address}
                                class="pure-button pure-button-primary"
                                type="submit">
                            Add
                        </button>
                    </td>
                    <td>
                        <input bind:value={address} placeholder="Address"/>
                    </td>
                </tr>
                </thead>
                <tbody>
                {#each whitelist.addresses as address}
                    <tr class="pure-menu-item">
                        <td>
                            <button on:click={() => removeAddress(address)}
                                    class="pure-button icon">
                                <Icon icon="remove"/>
                            </button>
                        </td>
                        <td>
                            {address}
                        </td>
                    </tr>
                {/each}
                </tbody>
            </table>

            <button on:click={cancelWhitelist}
                    type="button"
                    class="pure-button">Cancel
            </button>
            <button disabled={!whitelist.name || whitelist.addresses.length === 0}
                    on:click={saveWhitelist}
                    type="button"
                    class="pure-button pure-button-primary">Save group
            </button>
        {:else}
            <strong>My addresses</strong>
            <button on:click={newWhitelist} class="pure-button pure-button-primary">
                New
            </button>
            {#if whitelists.length > 0}
                <table class="pure-table">
                    <thead>
                    <tr>
                        <td></td>
                    </tr>
                    </thead>
                    <tbody>
                    {#each whitelists as whitelist}
                        <tr class="pure-menu-item">
                            <td>
                                <button on:click={() => removeWhitelist(whitelist)}
                                        class="pure-button icon">
                                    <Icon icon="remove"/>
                                </button>
                                <button on:click={() => editWhitelist(whitelist)}
                                        class="pure-button icon">
                                    <Icon icon="edit"/>
                                </button>
                                {whitelist.name}
                            </td>
                        </tr>
                    {/each}
                    </tbody>
                </table>
            {/if}
        {/if}
    </fieldset>
</form>

<style>

    form {
        padding: 0.5rem;
    }

    hr {
        color: blue;
        margin: 0.5rem 0;
    }

    table {
        margin: 0.5rem 0;
    }

    label input {
        display: inline;
    }

    input {
        width: 100%;
    }
</style>