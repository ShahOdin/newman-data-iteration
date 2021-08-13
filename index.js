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

const dataLebels = new Promise(function(resolve, reject) {
    setTimeout(function() {
        if(process.env.DATA_PATH){
            result = lineReader.eachLine(
                process.env.DATA_PATH,
                (line, last) => {
                    resolve(line.split(","));
                    return false;
                }
            );
        }
        else resolve([])
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
    const fields = [
        {
            "code": result.response.code
        }
    ].map(obj =>
        ({...obj, ...result.data})
    );
    
    return fields;
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

    const params = {
        collection: process.env.COLLECTION_PATH,
        reporters: 'cli',
        delayRequest: process.env.DELAY_REQUEST,
        environment: process.env.ENV_PATH,
        envVar: envs
    }             
    newman
        .run({
                ...params,
                ...(process.env.DATA_PATH && {iterationData: process.env.DATA_PATH})
            })
        .on('test', (error, args) => {
            const result = args.executions[0].result
            const records = parseResult(result);
            csvWriter.writeRecords(records)
        }
    )
}

dataLebels
    .then(csvWriter)
    .then(runCollection)
