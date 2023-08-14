/**
 * This file is used to symbolicate the logs in the console.
 */

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import {
  observe as observeLogBoxLogs,
  symbolicateLogNow,
} from 'react-native/Libraries/LogBox/Data/LogBoxData'

// LogBox keeps all logs that you have not viewed yet.
// When a new log comes in, we only want to print out the new ones.
let lastCount = 0

observeLogBoxLogs((data) => {
  const logs = Array.from(data.logs)
  const symbolicatedLogs = logs.filter((log) => log.symbolicated.stack?.length)
  for (let i = lastCount; i < symbolicatedLogs.length; i++) {
    // use log instead of warn/error to prevent resending error to LogBox
    /* eslint-disable no-console */
    console.log(formatLog(symbolicatedLogs[i]))
  }

  lastCount = symbolicatedLogs.length

  // Trigger symbolication on remaining logs because
  // logs do not symbolicate until you click on LogBox
  logs.filter((log) => log.symbolicated.status === 'NONE').forEach((log) => symbolicateLogNow(log))
})

function formatLog(log) {
  const stackLines = (log.symbolicated.stack || [])
    .filter((line) => !line.collapse)
    .map((line) => `    at ${line.methodName} (${line.file}:${line.lineNumber}:${line.column})`)
    .join('\n')
  return `Error has been symbolicated\nError: ${log.message.content}\n${stackLines}`
}
