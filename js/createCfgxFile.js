export default function createCfgxFile(phonemeType, language, custom, params) {
    let name;
    let paramProgram;
    let paramFileExtension;
    //let stateMapOrAMFileName;
    //let alphabet;
    
    let languageLookup = {
        cz: ["cz48.abc", "cz.cmap"],
        sk: ["cz48.abc", "sk.cmap"],
        pl: ["pl42.abc", "pl.cmap"],
        hr: ["hr39.abc", "hr.cmap"],
    };

    let [alphabet, stateMapOrAMFileName] = languageLookup[language];

    if (phonemeType === 'mono') {
        name = 'DSNN200pack-mono.cfgx';
        paramProgram = 'd:\\WordSpotting\\manifest\\ntx4';
        stateMapOrAMFileName = 'CZ-CZ48-dsnnmono200pack.cmap';
        paramFileExtension = '.dsnnmono200pack';
    } else {
        name = 'DSNN200pack-tri.cfgx';
        paramProgram = 'd:\\WordSpotting\\manifest\\ntx4';
        stateMapOrAMFileName = custom ? stateMapOrAMFileName : 'CZ-CZ48-dsnntri200pack.cmap';
        paramFileExtension = custom ? '.dsnntri' : '.dsnntri200pack';
    }

    let lines = [
        `Language: ${language}`,
        `Alphabet:	${alphabet}`,
        `ParamProgram: ${paramProgram}`,
        `FlagsForParamProgram: ${language}`,
        `StateMapOrAMFileName: ${stateMapOrAMFileName}`,
        `ParamFileExtension:	${paramFileExtension}`,
        `NumHypotheses: ${params.numHypotheses}`,
        `PruneThreshold:	${params.pruneThreshold}`,
        `SpotThreshold:		${params.spotThreshold}`,
        `DispThreshold:		${params.dispThreshold}`,
        `ScaleFactor:      ${params.scaleFactor}`,
        `FrameShiftInSamples: ${params.frameShiftInSamples}`,
        `FrameOffsetDueParameterization: ${params.frameOffsetDueParametrization}`,
    ];
    let str = lines.join('\r\n');
    str = windows1250.encode(str);
    let encoder = new TextEncoder()

    return { name, data: encoder.encode(str).buffer };
    //new File([str], name);
}

/*
td = new TextDecoder('windows-1250');
td.decode(data.configFile.data)
*/

/*
file = createCfgxFile()
reader = new FileReader();
reader.onload = (e) => {
	console.log(e.target.result)
}
reader.readAsText(file, 'windows-1250')
*/