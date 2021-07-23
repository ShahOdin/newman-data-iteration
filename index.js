const newman = require('newman');
const createCsvWriter = require('csv-writer').createObjectCsvWriter; 
const lineReader = require('line-reader');

require('dotenv').config();

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

const runCollection = csvWriter => {
    newman.run({
        collection: process.env.COLLECTION_PATH,
        reporters: 'cli',
        iterationData: process.env.DATA_PATH,
        delayRequest: process.env.DELAY_REQUEST,
        environment: process.env.ENV_PATH
    }).on('test', (error, args) => {
        const result = args.executions[0].result
        let row = result.data;
        row.code = result.response.code;
        csvWriter.writeRecords([row])
    }
)
}

headers
    .then(csvWriter)
    .then(runCollection)