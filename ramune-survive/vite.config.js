import {viteObfuscateFile} from 'vite-plugin-obfuscator'

export default {
  plugins: [
    viteObfuscateFile({
        compact: false,
        controlFlowFlattening: true,
        controlFlowFlatteningThreshold: 1,
        numbersToExpressions: true,
        simplify: true,
        stringArrayShuffle: true,
        splitStrings: true,
        stringArrayThreshold: 1
    })
  ]
}