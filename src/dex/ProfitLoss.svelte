<svelte:options immutable/>
<script>
    import {calcProfitLoss} from "../common/common";
    import Percentage from "./Percentage.svelte";

    export let poolSwap
</script>

<Percentage number={calcProfitLoss(poolSwap)}/>