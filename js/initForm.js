export default function initForm() {
    const formElem = document.getElementById('kws-form');
    const vocabPicker = document.getElementById('vocab-picker');
    const datasetChoiceRadios = document.querySelectorAll('#dataset-choice input[type="radio"]');
    const languageChoiceRadios = document.querySelectorAll('#language-choice input[type="radio"]');
    const phonemesChoiceRadios = document.querySelectorAll('#phonemes-choice input[type="radio"]');
    const toggleAdvancedCheckbox = document.getElementById('toggle-advanced');
    const emailInput = document.getElementById('email');
    const languageChoiceDivs = document.querySelectorAll('#language-choice div');
    const languageChoiceRadioCZ = document.querySelector('#language-choice input[type="radio"][value="cz"]');

    //window.languageChoiceRadioCZ = languageChoiceRadioCZ

    const advancedDiv = formElem.querySelector('#kws-form .advanced');
    const numHypothesesInput = document.getElementById('num-hypotheses');
    const pruneThresholdInput = document.getElementById('prune-threshold');
    const spotThresholdInput = document.getElementById('spot-threshold');
    const dispThresholdInput = document.getElementById('disp-threshold');
    const scaleFactorInput = document.getElementById('scale-factor');
    const frameShiftInSamplesInput = document.getElementById('frame-shift-in-samples');
    const frameOffsetDueParametrizationInput = document.getElementById('frame-offset-due-parametrization');

    //const customDatasetRadio = document.querySelector('#dataset-choice input[type="radio"][value="custom"]');

    const customDatasetDiv = document.getElementById('custom-dataset');
    const customDatasetPicker = document.getElementById('custom-dataset-picker');
    const customDatasetProgressInfo = document.querySelector('#custom-dataset .progress-info');

    const submitBtn = document.querySelector('#kws-form button[type="submit"]');

    const form = {
        onSubmit: (data) => { },
        onError: (error) => { },
        // onWavFilesSelected: (wavFiles) => {},
        // wavFilesReady: () => {
        // submitBtn.disabled = false;
        // customDatasetProgressInfo.innerHTML = "";
        // }
    };

    let customDatasetEnabled = false;
    let readingVocabFile = false;
    let readingWavFiles = false;

    let wavFiles = [];
    let vocabFile = {};
    let datasetName;
    let language;
    let phonemeType;
    let email;
    let advanced;

    setDefaultTri();
    setCustomEnabled(true);
    //submitBtn.disabled = true;


    datasetChoiceRadios.forEach(radio => {
        radio.addEventListener('change', e => {
            if (e.target.value === 'custom') {
                setCustomEnabled(true);
            } else {
                setCustomEnabled(false);
            }
        });
    });

    vocabPicker.addEventListener('change', (e) => {
        let curFiles = e.target.files;
        if (curFiles.length !== 0) {
            readingVocabFile = true;
            disableSubmit();
            vocabFile.name = curFiles[0].name;
            let reader = new FileReader();
            reader.onload = (e) => {
                vocabFile.data = e.target.result;
                readingVocabFile = false;
                enableSubmitIfReady();
            }
            reader.readAsArrayBuffer(curFiles[0]);
        }
    });

    customDatasetPicker.addEventListener('change', (e) => {
        let curFiles = e.target.files;
        if (curFiles.length !== 0) {
            readingWavFiles = true;
            disableSubmit();
            customDatasetProgressInfo.innerHTML = "Soubory se načítají...";
            let promises = Array.from(curFiles).map(file => {
                return new Promise((resolve, reject) => {
                    let reader = new FileReader();
                    reader.onload = (e) => {
                        resolve({
                            name: file.name,
                            data: e.target.result
                        });
                    }
                    reader.onerror = (e) => {
                        reader.abort();
                        reject(new Error('Reading operation encountered an error'));
                    }
                    reader.readAsArrayBuffer(file);
                })
            });
            Promise.all(promises)
                .then(files => {
                    wavFiles = files;
                    readingWavFiles = false;
                    customDatasetProgressInfo.innerHTML = "";
                    enableSubmitIfReady();
                })
                .catch(error => {
                    alert('Při čtení wav souborů došlo k chybě.');
                });
        } else {
            customDatasetProgressInfo.innerHTML = "";
        }
    });

    // formElem.querySelector('#monophones').addEventListener('change', (e) => {
    //     setDefaultMono();
    // });
    formElem.querySelector('#triphones').addEventListener('change', (e) => {
        setDefaultTri();
    });

    toggleAdvancedCheckbox.addEventListener('click', (e) => {
        advancedDiv.style.display = e.target.checked ? 'grid' : 'none';
    });

    formElem.addEventListener('submit', (e) => {
        e.preventDefault();
        datasetChoiceRadios.forEach(radio => {
            if (radio.checked) {
                datasetName = radio.value;
            }
        });
        languageChoiceRadios.forEach(radio => {
            if (radio.checked) {
                language = radio.value;
            }
        });
        phonemesChoiceRadios.forEach(radio => {
            if (radio.checked) {
                phonemeType = radio.value;
            }
        });
        advanced = collectAdvaced();
        email = emailInput.value;
        if (!customDatasetEnabled) {
            wavFiles = null;
        }
        form.onSubmit({ vocabFile, datasetName, language, phonemeType, advanced, email, wavFiles });
    });

    function disableSubmit() {
        submitBtn.disabled = true;
    }

    function enableSubmitIfReady() {
        if (customDatasetEnabled && !readingVocabFile && !readingWavFiles) {
            submitBtn.disabled = false;
        } else if (!readingVocabFile) {
            submitBtn.disabled = false;
        }
    }

    function setCustomEnabled(value) {
        let display = value ? '' : 'none';
        languageChoiceDivs.forEach(div => {
            if (div.className !== 'language-cz') {
                div.style.display = display;
            }
        });

        if (value) {
            customDatasetPicker.value = null;

            customDatasetDiv.style.display = '';
            customDatasetEnabled = true;
            customDatasetPicker.required = true;
        } else {
            customDatasetDiv.style.display = 'none';
            customDatasetEnabled = false;
            customDatasetPicker.required = false;

            languageChoiceRadioCZ.checked = true;
        }
    }

    function setDefaultMono() {
        numHypothesesInput.value = 10;
        pruneThresholdInput.value = 80;
        spotThresholdInput.value = 50;
        dispThresholdInput.value = 50;
        scaleFactorInput.value = 300;
        frameShiftInSamplesInput.value = 200;
        frameOffsetDueParametrizationInput.value = 0;
    }

    function setDefaultTri() {
        numHypothesesInput.value = 10;
        pruneThresholdInput.value = 80;
        spotThresholdInput.value = 20;
        dispThresholdInput.value = 20;
        scaleFactorInput.value = 200;
        frameShiftInSamplesInput.value = 200;
        frameOffsetDueParametrizationInput.value = 0;
    }

    function collectAdvaced() {
        return {
            numHypotheses: parseInt(numHypothesesInput.value),
            pruneThreshold: parseInt(pruneThresholdInput.value),
            spotThreshold: parseInt(spotThresholdInput.value),
            dispThreshold: parseInt(dispThresholdInput.value),
            scaleFactor: parseInt(scaleFactorInput.value),
            frameShiftInSamples: parseInt(frameShiftInSamplesInput.value),
            frameOffsetDueParametrization: parseInt(frameOffsetDueParametrizationInput.value),
        }
    }

    return form;
}
