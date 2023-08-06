<script lang="ts">

    export let tagData: any;
    // export let tagTime: any;

    // convert time to hours, minutes
    function convertData(time: number){
    
      let mins = 0;
      let hours = 0;
      
      // if less than 1 hour
      if (time < 60 * 60){
        mins = Math.round(time / 60);
      } else{

        hours = Math.floor(time / (60 * 60));
        mins = Math.floor(time / 60) - (hours * 60);
      }

      return [mins, hours]
    }

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
                        <tr>
                            <td >{item.label}</td>
                            <td>{item.value}%</td>
                            <td>
                              {#if convertData(item.time_focused)[1] === 0}
                                {convertData(item.time_focused)[0]} M
                              {:else}
                                {convertData(item.time_focused)[1]} H {convertData(item.time_focused)[0]} M
                              {/if}
                            </td>
                        </tr>
                    {/each}
                  </tbody>
                </table>
              </div>
            </div>
        </div>
    </div>
</div>