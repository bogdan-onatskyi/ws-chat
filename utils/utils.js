exports.toString = (comment, data) => {
    const valuesArray = [];
    let value;

    for (let prop in data) {
        value = data[prop] === "" ? '""' : data[prop];
        valuesArray.push(`${prop}:${value}`);
    }

    return `${comment} { ${valuesArray.join(', ')} }`;
};