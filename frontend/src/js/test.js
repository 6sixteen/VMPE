import * as d3 from "d3"
function drawCircle(that){
    // console.log(app)
     const svg = d3.select('#test');
     svg.append("g")
         .append("circle")
         .attr("cx","500px")
         .attr("cy","500px")
         .attr("r","20px")
         .attr("fill","black")
         .on("click",()=>{
             console.log("click")
             // userSearchTreeChange.value = "333333"
             that.$emit('update:userSearchTree', 333333)
         })
}

export {drawCircle}