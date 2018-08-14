const fs = require('fs')
const request = require('request')
const url = require('url')
const moment = require('moment')
const killProc = require('tree-kill')

const pURL = url.parse('http://localhost:8000/')
const COMPONENT_REPO_ROOT = '..'
const endTime = moment().add(10, 'm')

const serverProc = startServer()
pingServer()

function startServer() {
    return require('child_process').exec('npm run serve', {cwd: COMPONENT_REPO_ROOT})
}

function pingServer() {
    request(pURL.href, function (error) {
        if(!error) {
            console.log('Server is ready')
            startTests()
            return
        }
        const now = moment()
        if (endTime.isAfter(now)) {
            console.log(`Server is pending. Time remaining: ${moment.duration(endTime.diff(now)).asSeconds()} second(s)`)
            setTimeout(pingServer, 5000)
        } else {
            console.log('Server timeout out')
            killProc(serverProc.pid)
        }
    })
}

function startTests() {
    const wdLauncher = require(`webdriverio`).Launcher

    const specName = `${COMPONENT_REPO_ROOT}/uitests/scenarios.js`

    const params = {
        specs: specName,
        baseUrl: pURL.href
    }

    new wdLauncher('./testing/wdio.conf.js', params).run().then(
        errCode => {
            killProc(serverProc.pid)
            const resFile = JSON.parse(fs.readFileSync('./testResults/mochawesome/wdiomochawesome.json'))
            const reportParams = {
                reportDir: `${COMPONENT_REPO_ROOT}/report`,
                reportTitle: 'local test run',
                reportFilename: "index.html"
            }
            const rGenerator = require(`mochawesome-report-generator/lib/main`).createSync
            rGenerator(resFile, reportParams)
        },
        exc => {
            killProc(serverProc.pid)
        }
    )
}
