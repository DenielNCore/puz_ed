import { log2 } from '@pixi/utils';


const Parser = (data) => {
    const { type, size, matrix, words, blanks, cellTypes, cellSizes } = data;


    const config = {
        ...data,
        matrix: getMatrix(data),
        defaultCell: { ...cellTypes.default, cellSizes },
        emptyCell: { ...cellTypes.empty, cellSizes },

    };
    // console.log(getMatrix(data));
    // console.log(config);
    return config;
};

const getMatrix = (data) => {
    const { size: { w, h }, matrix } = data;
    let blankMatrix                  = null;
    // const matrix = Array.from({ length : h }, () => Array.from({ length : w }, () => null));

    // matrix.map((row) => {
    //
    // })

    if (validateMatrix(data)) {
        blankMatrix = matrix;
    } else {
        blankMatrix = fillEmptyCells(data);
    }
    // console.log(blankMatrix);
    blankMatrix = fillStyles(data, blankMatrix);
    return fillWords(data, blankMatrix);
};

const fillEmptyCells = (data) => {
    const { size: { w, h }, matrix } = data;
    return Array.from({ length: h }, () => Array.from({ length: w }, () => null))
        .map((row, i) => {
            return row.map((_, j) => {
                //todo if cell not valid ->> update it's content
                if (matrix && matrix[ i ] && matrix[ i ][ j ]) {
                    return matrix[ i ][ j ];
                }
                return { i, j, type: 'default' };
            });
        });
};

const fillStyles = (data, mx) => {
    const { size: { w, h }, cellTypes, cellSizes } = data;
    return mx.map((row, i) => {
        return row.map((cell, j) => {
            const { type } = cell;
            if (!cellTypes.default) {
                return { ...cell, cellSizes };
            }
            return { ...cell, ...cellTypes.default, cellSizes };
        });
    });
};

const fillWords = (data, mx) => {
    const { size: { w, h }, matrix } = data;
    return mx;
};

const validateMatrix = (data) => {
    // todo make cell validation
    const { size: { w, h }, matrix } = data;
    return w * h === matrix.flat(2).length;
};

export { Parser };
