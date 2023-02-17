<script>
    import {onDestroy, onMount} from "svelte";
    import {accountStore} from "../store";

    export let currentFilter
    export let updateSearch

    let account
    let minDate = currentFilter.minDateText
    let maxDate = currentFilter.maxDateText
    $: fromAddressGroup = currentFilter.fromAddressGroupText
    $: toAddressGroup = currentFilter.toAddressGroupText
    let sub

    const findAddresses = groupName => {
        const group = account.addressGroups.find(ag => ag.name === groupName)
        if (group) {
            return group.addresses
        }
        return undefined
    }

    const dateToMillis = (dateString, time) => {
        if (!dateString) {
            return undefined
        }
        try {
            return new Date(`${dateString}T${time}`).getTime()
        } catch (e) {
            console.log(e)
            return undefined
        }
    }

    const clearDates = () => {
        minDate = undefined
        maxDate = undefined
        update()
    }

    const update = () => {
        const newSearch = {}
        newSearch.minDateText = minDate
        newSearch.maxDateText = maxDate
        newSearch.fromAddressGroupText = fromAddressGroup
        newSearch.toAddressGroupText = toAddressGroup

        newSearch.minDate = dateToMillis(minDate, '00:00:00.000')
        newSearch.maxDate = dateToMillis(maxDate, '23:59:59.999')
        newSearch.fromAddressGroup = findAddresses(fromAddressGroup)
        newSearch.toAddressGroup = findAddresses(toAddressGroup)
        updateSearch(newSearch)
    }

    onMount(() => {
        sub = accountStore.subscribe(newAccount => {
            account = newAccount
        })
    })

    onDestroy(() => {
        sub && sub()
    })
</script>

{#if account}
    <section>
        <div class:block={screen.small}>
            <input type="date"
                   placeholder="dd-mm-yyyy"
                   bind:value={minDate}
                   on:change={update}/>
            -
            <input bind:value={maxDate}
                   placeholder="dd-mm-yyyy"
                   on:change={update}
                   type="date"/>
            <strong on:click={clearDates} class="red">X</strong>
        </div>

        <div class:block={screen.small}>
            <select class="pure-select address-group" bind:value={fromAddressGroup}
                    on:change={update}>
                <option value="">&lt;from address in group&gt;</option>
                {#each account.addressGroups as group}
                    <option value={group.name}>{group.name}</option>
                {/each}
            </select>

            <select class="pure-select address-group" bind:value={toAddressGroup}
                    on:change={update}>
                <option value="">&lt;to address in group&gt;</option>
                {#each account.addressGroups as group}
                    <option value={group.name}>{group.name}</option>
                {/each}
            </select>
        </div>
    </section>
{/if}

<style>
    .address-group {
        max-width: 8rem;
    }

    div, select, input {
        white-space: nowrap;
        display: inline-block;
    }
</style>