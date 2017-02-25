levenshtein = (a, b) => {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;
    let tmp, i, j, prev, val;
    // swap to save some memory O(min(a,b)) instead of O(a)
    if (a.length > b.length) {
        tmp = a
        a = b
        b = tmp
    }

    row = Array(a.length + 1);
    // init the row
    for (i = 0; i <= a.length; i++) {
        row[i] = i
    }

    // fill in the rest
    for (i = 1; i <= b.length; i++) {
        prev = i;
        for (j = 1; j <= a.length; j++) {
            if (b[i-1] === a[j-1]) {
                val = row[j-1]; // match
            } else {
                val = Math.min(row[j-1] + 1, // substitution
                    Math.min(prev + 1,     // insertion
                        row[j] + 1));  // deletion
            }
            row[j - 1] = prev;
            prev = val
        }
        row[a.length] = prev
    }
    return row[a.length]
};

parseCrappyTime = function(currentTime, crappyTime) {
    const curDateOnly = currentTime.toString().split(':')[0];
    curDateOnly.substring(0, curDateOnly.lastIndexOf(' '));
    return new Date(curDateOnly + ' ' + crappyTime);
};


// function interpolateBetweenCoords() {
//     a = sin((1−f)⋅δ) / sin δ
//     b = sin(f⋅δ) / sin δ
//     x = a ⋅ cos φ1 ⋅ cos λ1 + b ⋅ cos φ2 ⋅ cos λ2
//     y = a ⋅ cos φ1 ⋅ sin λ1 + b ⋅ cos φ2 ⋅ sin λ2
//     z = a ⋅ sin φ1 + b ⋅ sin φ2
//     φi = atan2(z, √x² + y²)
//     λi = atan2(y, x)
// }
