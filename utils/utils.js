exports.toString = (comment, data) => {
    const valuesArray = [];
    let value;

    for (let prop in data) {
        value = data[prop] === "" ? '""' : data[prop];
        valuesArray.push(`${prop}:${value}`);
    }

    return `${comment} { ${valuesArray.join(', ')} }`;
};

exports.parseData = (data) => {
    const {Username, Password} = data;

    let retData = {
        Auth: "Denied"
    };

    if (Username === 'User' && Password === 'Password')
        retData = {
            Auth: "Logged",
            Language: "EN"
        };

    return retData;
};