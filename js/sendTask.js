

export default async function sendTask(apiPath, data) {
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
    res = await fetch(apiPath + vocabEndpoint, {
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
    res = await fetch(apiPath + `/${task.id}/config`, {
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
        let requests = await Promise.all(wavFiles.map(file => {
            console.log(file.name);

            let xhr = new XMLHttpRequest();

            return new Promise((resolve, reject) => {
                xhr.upload.onprogress = (ev) => file.onuploadprogress(ev);
                xhr.onloadend = (ev) => resolve(xhr);
                xhr.onerror = (ev) => reject(new Error(`Wav upload failed`));

                xhr.open("POST", apiPath + `/${task.id}/wav`);
                xhr.setRequestHeader('filename', file.name);
                xhr.setRequestHeader('Content-Type', 'application/octet-stream');
                xhr.send(file.data);
            });
        }));

        if (!requests.every(req => req.status === 200)) {
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
    res = await fetch(apiPath + `/task`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: taskJson
    });
    if (!res.ok) {
        throw new Error('Task post was not successful');
    }
    window.res = res

    console.log('success')
}