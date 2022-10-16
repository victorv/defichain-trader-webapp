<svelte:options immutable/>
<script>
    import {calcProfitLoss} from "../common/common";
    import Percentage from "./Percentage.svelte";

    export let poolSwap
    export let estimate
</script>

<Percentage number={calcProfitLoss(poolSwap.desiredResult, estimate)}/>