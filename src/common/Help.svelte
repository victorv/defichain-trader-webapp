<svelte:options immutable/>
<script>
    export let whiteText
    export let help
    export let warning

    let active = false
</script>

<div class:white={whiteText} class:blue={!whiteText} class:warn={warning} class="tooltip" tabindex="0">{#if warning}[!]{:else}[?]{/if}
    <span class="tooltip-text">{@html help}</span>
</div>

<style>
    .tooltip {
        position: relative;
        font-weight: normal;
        display: inline-block;
    }

    .blue {
        border-bottom: 1px solid blue;
        color: blue;
    }

    .warn {
        color: red;
    }

    .white {
        border-bottom: 1px solid white;
        color: white;
    }

    .tooltip .tooltip-text {
        visibility: hidden;
        top: 5vh;
        left: calc(50% - 150px);
        width: 300px;
        height: 40vh;
        overflow: auto;
        padding: 1rem;
        background-color: black;
        color: #fff;
        text-align: center;
        border-radius: 6px;

        /* Position the tooltip */
        position: fixed;
        z-index: 1;
    }

    .tooltip:focus .tooltip-text, .tooltip:focus .tooltip-text {
        visibility: visible;
    }
</style>