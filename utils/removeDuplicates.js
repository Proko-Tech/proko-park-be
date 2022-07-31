/**
 * Remove duplicates from an array of objects in javascript
 * @param arr - Array of objects
 * @param prop - Property of each object to compare
 * @returns {Array}
 */
function removeDuplicates(arr, prop) {
    const obj = {};
    return Object.keys(
        arr.reduce((prev, next) => {
            if (!obj[next[prop]]) obj[next[prop]] = next;
            return obj;
        }, obj),
    ).map((i) => obj[i]);
}

module.exports = removeDuplicates;
