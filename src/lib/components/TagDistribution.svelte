<script lang="ts">

    export let tagData;

</script>


<div class="grid grid-cols-1 mx-auto">
    <div class="mx-auto">
        <div class="card card-compact w-96 bg-base-100 shadow-xl">
            <figure><svg id="chart"></svg></figure>
            <div class="card-body">
              <h2 class="card-title text-secondary">Tag Distribution</h2>
              <!-- var tagPercentage = data.map(item => item.value);
              var labels = data.map(item => item.label); -->
              <div class="overflow-x-auto">
                <table class="table">
                  <tbody>
                    {#each tagData as item}
                        <!-- <div class="badge badge-outline">{item.label} {item.value}%</div> -->
                        <tr>
                            <td>{item.label}</td>
                            <td>{item.value}%</td>
                            <!-- <td>Blue</td> -->
                          </tr>
                        <!-- <p>{item.label} | {item.value}</p> -->
                    {/each}
                  </tbody>
                </table>
              </div>
            </div>
        </div>
    </div>
</div>