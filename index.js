const newman = require('newman');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const lineReader = require('line-reader');

require('dotenv').config();

const overrideEnvs = () => {
    const overrideKeys = process.env.NEWMAN_OVERRIDE_ENVS ? process.env.NEWMAN_OVERRIDE_ENVS.split(",") : [];
    return Object.fromEntries(
        Object
        .entries(process.env)
        .filter(([key, value]) => overrideKeys.includes(key))
    );
}

const fieldsToBeParsed = process.env.FIELDS_TO_BE_PARSED_FROM_COLLECTION_VARIABLE ? process.env.FIELDS_TO_BE_PARSED_FROM_COLLECTION_VARIABLE.split(",") : [];

const dataLebels = new Promise(function(resolve, reject) {
    setTimeout(function() {
        if (process.env.DATA_PATH) {
            result = lineReader.eachLine(
                process.env.DATA_PATH,
                (line, last) => {
                    resolve(line.split(","));
                    return false;
                }
            );
        } else resolve([])
    }, 2000);
})

const csvWriter = dataHeaders => {
    const allHeaders = [...dataHeaders, ...fieldsToBeParsed]
        .map(h => h.trim())
        .map(h =>
            ({
                id: h,
                title: h
            })
        );
    return createCsvWriter({
        path: process.env.RESULT_DATA_PATH,
        header: allHeaders
    });
}

const parseResult = (env, data) => {
    let fields;

    switch (env.get("state")) {
        case "done":
            fields = [
                {
                    ...data,
                    ...Object.fromEntries(
                        fieldsToBeParsed.map(field => [field, env.get(field)])
                    )
                }
            ];
            break;
        case "started":
            fields = [];
            break;
        default:
            console.log("unexpected value for state collection varriable.")
            fields = [];
    };
    return fields;
}



const runCollection = csvWriter => {
    const envs = Object
        .entries(overrideEnvs())
        .map(([key, value]) =>
            ({
                "key": key,
                "value": value
            })
        );

    const params = {
        collection: process.env.COLLECTION_PATH,
        reporters: 'cli',
        delayRequest: process.env.DELAY_REQUEST,
        environment: process.env.ENV_PATH,
        envVar: envs
    };

    newman
        .run({
            ...params,
            ...(process.env.DATA_PATH && {
                iterationData: process.env.DATA_PATH
            })
        })
        .on('script', (_, args) => {
            if (args.item.name == "post-processing") {
                const collectionEnvVars = args.execution.collectionVariables;
                const data = args.execution.data;
                const records = parseResult(collectionEnvVars, data);
                if (records?.length) {
                    csvWriter.writeRecords(records);
                }
            }

        })
}

dataLebels
    .then(csvWriter)
    .then(runCollection)
