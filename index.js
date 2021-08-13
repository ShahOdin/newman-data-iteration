const newman = require('newman');
const createCsvWriter = require('csv-writer').createObjectCsvWriter; 
const lineReader = require('line-reader');

require('dotenv').config();

const overrideEnvs = () => {
    const overrideKeys = process.env.NEWMAN_OVERRIDE_ENVS.split(",");
    return Object.fromEntries(
        Object
            .entries(process.env)
            .filter(([key, value]) => overrideKeys.includes(key))
    );
}

const headers = new Promise(function(resolve, reject) {
    setTimeout(function() {
        lineReader.eachLine(
            process.env.DATA_PATH,
            (line, last) => {
                resolve(line.split(","));
                return false;
            }
        );
    }, 2000);
})

const csvWriter = headers => {
    const dataHeaders = headers
    .map(h => h.trim())
    .map(h =>
        ({
            id: h,
            title: h
        })
    )
    return createCsvWriter({
        path: process.env.RESULT_DATA_PATH,
        header: [...dataHeaders, ({
            id: "code",
            title: "code"
        })]
    });
}

const parseResult = result => {
    let extra = {
        "code": result.response.code
    };
    let data = result.data;
    return [{...data, ...extra}]
}

const runCollection = csvWriter => {
    const envs = Object
        .entries(overrideEnvs())
        .map( ([key, value]) =>
            (
                {
                    "key": key,
                    "value": value
                }
            )
        );

    newman.run({
        collection: process.env.COLLECTION_PATH,
        reporters: 'cli',
        iterationData: process.env.DATA_PATH,
        delayRequest: process.env.DELAY_REQUEST,
        environment: process.env.ENV_PATH,
        envVar: envs    
    }).on('test', (error, args) => {
            const result = args.executions[0].result
            const records = parseResult(result);
            csvWriter.writeRecords(records)
        }
    )
}

headers
    .then(csvWriter)
    .then(runCollection)
    