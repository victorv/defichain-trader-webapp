<script>
    export let number

    $: rounded = (number / 10000).toFixed(8)
</script>

{rounded}