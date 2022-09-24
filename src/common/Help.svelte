<svelte:options immutable/>
<script>
    export let whiteText
    export let help

    let active = false
</script>

<div class:white={whiteText} class:blue={!whiteText} class="tooltip" tabindex="0">[?]
    <span class="tooltip-text">{help}</span>
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

    .white {
        border-bottom: 1px solid white;
        color: white;
    }

    .tooltip .tooltip-text {
        visibility: hidden;
        width: 300px;
        padding: 1rem;
        background-color: black;
        color: #fff;
        text-align: center;
        border-radius: 6px;

        /* Position the tooltip */
        position: absolute;
        z-index: 1;
    }

    .tooltip:hover .tooltip-text, .tooltip:focus .tooltip-text {
        visibility: visible;
    }
</style>