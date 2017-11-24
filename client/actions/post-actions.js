import * as TYPES from './types';

export function textImportedFromTable(str, format) {
    return {
        type: TYPES.TEXT_IMPORTED_FROM_TABLE,
        str,
        format
    };
}

export function textExportedToTable(data) {
    return {
        type: TYPES.TEXT_EXPORTED_TO_TABLE,
        data
    };
}

export function textEdited(str, format) {
    return {
        type: TYPES.TEXT_EDITED,
        str,
        format
    };
}

export function textParseFailed(str, format) {
    return {
        type: TYPES.TEXT_PARSE_FAILED,
        str,
        format
    };
}