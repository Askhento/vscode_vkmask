const mergeSorted = (key) => (a, b) => {
    var answer = new Array(a.length + b.length),
        i = 0,
        j = 0,
        k = 0;
    while (i < a.length && j < b.length) {
        if (a[i][key] < b[j][key]) {
            answer[k] = a[i];
            i++;
        } else {
            answer[k] = b[j];
            j++;
        }
        k++;
    }
    while (i < a.length) {
        answer[k] = a[i];
        i++;
        k++;
    }
    while (j < b.length) {
        answer[k] = b[j];
        j++;
        k++;
    }
    return answer;
};

export const mergeAll = (key, arrays: any[]) => arrays.reduce(mergeSorted(key));
