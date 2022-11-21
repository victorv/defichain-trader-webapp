<script>
    import Icon from "../../common/Icon.svelte";
    import {accountStore, updateAccount} from "../../store";

    let account
    let addressGroups
    let addressGroup
    let address = ''

    accountStore.subscribe(newAccount => account = newAccount)

    $: if (account) {
        addressGroups = account.addressGroups || []
    }

    const cancelWhitelist = () => addressGroup = null

    const newAddressGroup = () => {
        addressGroup = {
            name: '',
            addresses: [],
        }
    }

    const removeAddress = address => {
        addressGroup = {
            ...addressGroup,
            addresses: addressGroup.addresses.filter(v => v !== address),
        }
    }

    const addAddress = () => {
        addressGroup = {
            ...addressGroup,
            addresses: addressGroup.addresses.concat(address),
        }
        address = ''
    }

    const saveAddressGroup = () => {
        removeAddressGroup(addressGroup)
        addressGroups = addressGroups.concat(addressGroup)
        addressGroup = null
        updateAccount({addressGroups})
    }

    const removeAddressGroup = target => {
        addressGroups = addressGroups.filter(ag => ag.name !== target.name)
        updateAccount({addressGroups})
    }

    const editAddressGroup = target => {
        addressGroup = addressGroups.find(ag => ag.name === target.name)
    }
</script>

<form class="pure-form pure-form-stacked" on:submit|preventDefault>
    <fieldset>
        {#if addressGroup}
            <label>Name your group and add addresses
                <input bind:value={addressGroup.name} placeholder="Group name"/>
            </label>
            <table class="pure-table whitelist">
                <thead>
                <tr>
                    <td>
                        <button on:click={addAddress}
                                disabled={!address}
                                class="pure-button pure-button-primary"
                                type="submit">
                            Add Address
                        </button>
                    </td>
                    <td>
                        <input bind:value={address} placeholder="Address"/>
                    </td>
                </tr>
                </thead>
                <tbody>
                {#each addressGroup.addresses as address}
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
            <button disabled={!addressGroup.name || addressGroup.addresses.length === 0}
                    on:click={saveAddressGroup}
                    type="button"
                    class="pure-button pure-button-primary">Save group
            </button>
        {:else}
            <strong>My addresses</strong>
            <button on:click={newAddressGroup} class="pure-button pure-button-primary">
                New Address Group
            </button>
            {#if addressGroups.length > 0}
                <table class="pure-table">
                    <thead>
                    <tr>
                        <td></td>
                    </tr>
                    </thead>
                    <tbody>
                    {#each addressGroups as whitelist}
                        <tr class="pure-menu-item">
                            <td>
                                <button on:click={() => removeAddressGroup(whitelist)}
                                        class="pure-button icon">
                                    <Icon icon="remove"/>
                                </button>
                                <button on:click={() => editAddressGroup(whitelist)}
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