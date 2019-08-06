

export default async function sendTask(apiRoute, data) {
    const { vocabFile, configFile, datasetName, email, language, wavFiles } = data;

    // Vocab type finding
    let vocabEndpoint;
    if (vocabFile.name.endsWith('.voc')) {
        vocabEndpoint = '/voc';
    } else if (vocabFile.name.endsWith('.lex')) {
        vocabEndpoint = '/lex';
    } else {
        throw new Error('Invalid vocab file extension');
    }
    
    let res;

    // Vocab POST
    //console.log(apiRoute + vocabEndpoint)
    res = await fetch(apiRoute + vocabEndpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/octet-stream'
        },
        body: vocabFile.data
    });
    if (!res.ok) {
        throw new Error('Vocab post was not successful');
    }
    
    let task = await res.json();
    
    // Config POST
    //console.log(apiRoute + `/${task.id}/config`)
    res = await fetch(apiRoute + `/${task.id}/config`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/octet-stream'
        },
        body: configFile.data
    });
    if (!res.ok) {
        throw new Error('Config post was not successful');
    }

    if (Array.isArray(wavFiles)) {
        //console.log(apiRoute + `/${task.id}/wav`)
        console.log(wavFiles[0].name)
        let resArr = await Promise.all(wavFiles.map(file => {
            return fetch(apiRoute + `/${task.id}/wav`, {
                method: 'POST',
                //mode: 'cors',
                headers: {
                    'filename': file.name,
                    'Content-Type': 'application/octet-stream'
                },
                body: file.data
            });
        }));

        if (!resArr.every(res => res.ok)) {
            throw new Error('Wav files upload was not successful');
        }
    }
    
    task.dataset = datasetName;
    task.email = email;
    task.language = language;
    let taskJson = JSON.stringify(task);
    console.log(taskJson);

    // Task POST
    //console.log(apiRoute + `/task`)
    res = await fetch(apiRoute + `/task`, {
        method:'POST',
        headers: { 'Content-Type': 'application/json' }, 
        body: taskJson
    });
    if (!res.ok) {
        throw new Error('Task post was not successful');
    }
    window.res = res

    console.log('success')
}