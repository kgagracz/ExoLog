import _ from 'lodash';

const removeUndefined = (obj: any) => {
    return _.pickBy(obj, (value: any) => value !== undefined);
};

// Funkcja usuwająca undefined rekurencyjnie (głęboko zagnieżdżone obiekty)
const removeUndefinedDeep = (obj: any): any => {
    if (_.isArray(obj)) {
        return _.map(obj, removeUndefinedDeep);
    }

    if (_.isObject(obj)) {
        return _.pickBy(
            _.mapValues(obj, removeUndefinedDeep),
            value => value !== undefined
        );
    }

    return obj;
};


export {
    removeUndefined,
    removeUndefinedDeep
}