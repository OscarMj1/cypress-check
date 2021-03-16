import { MochawesomeOutput, TestSummary } from './types'

export function buildSummaryData(
    cypressOutput: MochawesomeOutput,
    videoUrls: string[],
    screenshotUrls: string[]
) {
    return cypressOutput.results.reduce<TestSummary[]>((accum, r) => {
        return [
            ...accum,
            ...r.suites.map<TestSummary>((s) => {
                const featureFileMatch = r.fullFile.match(
                    /([\w+\.*]+)\.feature/
                )
                const featureFile = featureFileMatch ? featureFileMatch[0] : ''
                return {
                    featureFile: featureFile,
                    videoUrl: videoUrls.find((url) =>
                        url.includes(featureFile)
                    ),
                    title: s.title,
                    pass: s.failures.length > 0 ? false : true,
                    duration: Math.round(s.duration / 1000),
                    steps: s.tests.map<TestSummary>((s) => ({
                        title: s.title,
                        pass: s.pass,
                        duration: Math.round(s.duration / 1000),
                        screenshotUrl: !s.pass
                            ? screenshotUrls.find((url) =>
                                  decodeURI(url).includes(s.title)
                              )
                            : '',
                    })),
                }
            }),
        ]
    }, [])
}

export function formatSummaryData(summaryData: TestSummary[]) {
    let document = '## Test Results\n'

    summaryData.forEach((d) => {
        document += `### 📃 ${d.featureFile} ${
            d.videoUrl ? `([screen recording](${d.videoUrl}))` : ''
        }\n`
        document += `#### ${d.pass ? `✅` : `❌`} ${d.title} (${
            d.duration
        }s ⏱️)\n`
        d.steps?.forEach((s) => {
            document += `- ${s.pass ? `✅` : `❌`} ${s.title} ${
                !s.pass ? `[(screenshot)](${s.screenshotUrl})` : ''
            }\n`
            document += !s.pass ? `![enter image description here](${s.screenshotUrl})\n` : ''
        })
    })

    return document
}
