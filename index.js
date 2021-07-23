const newman = require('newman');
const createCsvWriter = require('csv-writer').createObjectCsvWriter; 
const lineReader = require('line-reader');

require('dotenv').config();
const headers = new Promise(function(resolve, reject) {
    setTimeout(function() {
        lineReader.eachLine(
            process.env.DATA_PATH,
            function(line, last) {
                resolve(line.split(","));
                return false;
            }
        );
    }, 2000);
})

function csvWriter(headers){
    const dataHeaders = headers
    .map(h => h.trim())
    .map(col =>
        ({
            id: col,
            title: col
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
        iterationData: process.env.DATA_PATH
    }).on('test', (error, args) => {
        const result = args.executions[0].result
        const row = Object.entries(result.data);
        const responseCode = result.response.code;

        const record = Object.fromEntries([...row, ["code", responseCode]]);
        csvWriter.writeRecords([record])
    }
)
}

headers
    .then(csvWriter)
    .then(runCollection)