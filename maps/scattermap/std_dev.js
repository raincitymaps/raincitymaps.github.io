// By Harry
// Poorly translated to JS from:
// https://www.mathsisfun.com/data/standard-deviation-formulas.html
// myarr= [9, 2, 5, 4, 12, 7, 8, 11, 9, 3, 7, 4, 12, 999, 953]

// Take an array, return std_dev and average
function standard_dev(in_array){
    var better_array = [];
    for(i=0;i<in_array.length;i++){
        if(isFinite(in_array[i])){
            better_array.push(in_array[i]);
         } else{
            // skip others
            // console.log("skipped" + in_array[i]);
         };
    };
    function add(a, b){
        return a + b;
    };
    my_avg = (better_array.reduce(add, 0) / better_array.length)
    // get sum of mean difference squares
    myarr_prime = 0
    for(i=0;i<better_array.length;i++){
        myarr_prime += ((better_array[i] - my_avg) ** 2);
    };
    mean_sum_square_diff = (myarr_prime/better_array.length);

    // One standard deviation:
    std_dev = Math.sqrt(mean_sum_square_diff);
    return [std_dev, my_avg];
};

// take number and std_dev_output (above)
// return std deviations from mean of current residual
function classify_it(num, std_dev_output){
    std_dev = std_dev_output[0];
    avg = std_dev_output[1];
    return ((num - avg)/std_dev);
};
